const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const MessageSchema = new Schema({
    conversationId: {
      type: Schema.Types.ObjectId,
      required: true
    },
    body: {
      type: String
    },
    author: [{
      kind: String,
      item: {
        type: String, refPath: 'author.kind'
      }
    }],
    channelName: {
      type: String
    },
    guestPost: {
      type: String
    }
  },
  {
    timestamps: true
  });

module.exports = Message = mongoose.model('messages', MessageSchema);