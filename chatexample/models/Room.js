const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const RoomSchema = new Schema({
    name1: {
        type: String,
        required:true,
        default:""
    },
    name2: {
        type: String,
        required: true,
        default:""
    },
    members:[],
    lastActive: {
        type: Date,
        default: Date.now
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
});

module.exports = Room = mongoose.model('rooms', RoomSchema);