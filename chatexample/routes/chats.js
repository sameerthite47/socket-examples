const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

//Load message model
const Message = require('../models/Message');
const Channel = require('../models/Channel');
const User = require('../models/User');
const Conversation = require('../models/Conversation');

router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  const username = req.user.username;

  // Show recent message from each conversation
  Conversation.find({ participants: req.user._id })
    .sort('_id')
    .populate({
      path: 'participants',
      select: 'username'
    })
    .exec((err, conversations) => {
      if (err) {
        res.send({ error: err });
        return next(err);
      }

      if (conversations.length === 0) {
        return res.status(200).json({
          message: 'No conversations yet'
        })
      }

      const conversationList = [];
      conversations.forEach((conversation) => {
        const conversationWith = conversation.participants.filter(item => {
          return item.username !== username
        });

        conversationList.push(conversationWith[0]);
        if (conversationList.length === conversations.length) {
          return res.status(200).json({
            conversationsWith: conversationList
          })
        }   
      });
    });
});

router.get('/privatemessages/:recipientId', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  const userId = req.user._id;
  const recipientId = req.params.recipientId;

  Conversation.findOne({ participants: {$all: [ userId, recipientId]}}, function(err, foundConversation) {
    if (err) {
      res.send({
        error: err
      });
      return next(err);
    }

    if (!foundConversation) {
      return res.status(200).json({
        message: 'Could not find conversation'
      })
    }

    Message.find({ conversationId: foundConversation._id })
    .select('createdAt body author')
    .sort('-createdAt')
    .populate('author.item')
    .exec(function(err, message) {
      if (err) {
        res.send({
          error: err
        });
        return next();
      }

      // Reverse to show most recent messages
      const sortedMessage = message.reverse();

      res.status(200).json({
        conversation: sortedMessage,
        conversationId: foundConversation._id
      });
    });
  });
});

router.post('/reply', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  const privateMessage = req.body.privateMessageInput;
  const recipientId = req.body.recipientId;
  const userId = req.user._id;

  Conversation.findOne({ participants: {$all: [ userId, recipientId]} }, function(err, foundConversation) {
    if (err) {
      res.send({
        errror: err
      });
      return next(err);
    }

    if (!foundConversation) {
      return res.status(200).json({
        message: 'Could not find conversation'
      })
    }

    const reply = new Message({
      conversationId: foundConversation._id,
      body: privateMessage,
      author: {
        kind: 'User',
        item: req.user._id
      }
    })

   reply.save(function(err, sentReply) {
    if (err) {
      res.send({
        error: err
      });
      return next(err);
    }

    res.status(200).json({
      message: 'Reply sent.'
    });
    return next();
    });
  });
})

router.get('/channel/:channel_name', (req, res, next) => {
    const channelName = req.params.channel_name;

  Message.find({ channelName })
    .select('createdAt body author')
    .sort('-createdAt')
    .populate('author.item')
    .exec((err, messages) => {
      if (err) {
        res.send({ error: err });
        return next(err);
      }
      // Reversed the array so you get most recent messages on the button
      const getRecent = messages.reverse();

      return res.status(200).json({
        channelMessages: getRecent
      })
    });
});

router.post('/postchannel/:channel_name', passport.authenticate('jwt', { session: false }), (req, res) => {
    const channelName = req.params.channel_name;
    const composedMessage = req.body.composedMessage;

    if (!channelName) {
      res.status(422).json({
        error: 'Enter a valid channel name.'
      });
      return next();
    }

    if (!composedMessage) {
      res.status(422).json({
        error: 'Please enter a message.'
      });
    }

    const channel = new Channel({
      channelName
    });
  
    channel.save(function(err, channelPost) {
      if (err) {
        res.send({ error: err });
        return next(err);
      }
  
    // Tells mongodb which schema to reference, a guest or user collection to display the correct author for messages.
     const checkAuthor = () => {
        let author = {
          kind: 'User',
          item: req.user._id
        }
        return author;
      };
  
      const post = new Message({
        conversationId: channelPost._id,
        body: composedMessage,
        author: [ checkAuthor() ],
        channelName
      });
  
      post.save(function(err, newPost) {
        if (err) { 
          res.send({ error: err })
          return next(err);
        }
  
        res.status(200).json({
          message: `Posted to channel ${channelName}`,
          conversationId: newPost._id,
          postedMessage: composedMessage
        })
      });
    })
});

router.post('/new', passport.authenticate('jwt', { session: false }), (req, res) => {
  const recipient = req.body.startDmInput;
  const userId = req.user._id;

  if (!recipient) {
    res.status(422).send({
      error: "Enter a valid recipient."
    });
    return next();
  }

  User.findOne({ username: recipient }, function(err, foundRecipient) {
    if (err) {
      res.send({
        error: err
      });
      return next(err);
    }

    if (!foundRecipient) {
      return res.status(422).send({
        error: 'Could not find recipient.'
      });
    }

    // Adds both user id and recipient id to a participants array
    const conversation = new Conversation({
      participants: [ req.user._id , foundRecipient._id ]
    })

    conversation.save(function(err, newConversation) {
      if (err) {
        res.send({
          error: err
        });
        return next(err);
      }

      res.status(200).json({
        message: `Started conversation with ${foundRecipient.username}`,
        recipientId: foundRecipient._id,
        recipient: foundRecipient.username,
      })

    });

  });
});

module.exports = router;