const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const ChatSchema = new Schema({
    messageFrom: {
        type: String,
        required:true,
        default:""
    },
    messageTo: {
        type: String,
        required: true,
        default:""
    },
    message: {
        type: String,
        required: true,
        default:""
    },
    room: {
        type: String,
        required: true,
        default:""
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
});

module.exports = Chat = mongoose.model('chats', ChatSchema);