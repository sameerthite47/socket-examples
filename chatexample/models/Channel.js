const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const ChannelSchema = new Schema({
    channelName: {
        type: String,
        required: true
    },
});

module.exports = Channel = mongoose.model('channels', ChannelSchema);