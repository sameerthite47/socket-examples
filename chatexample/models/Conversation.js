const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const ConversationSchema = new Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
      }],
      channelName: {
        type: String
      }
});

module.exports = Conversation = mongoose.model('conversations', ConversationSchema);