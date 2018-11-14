const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const UserSchema = new Schema({
    userId: {
        type: String,
        required:true,
        default:""
    },
    username: {
        type: String,
        required: true,
        default:""
    },
    email: {
        type: String,
        required: true,
        default:""
    },
    usersChannels: {
        type: Array,
        default: ['Public-Main']
    },
    password: {
        type: String,
        required: true,
        default:""
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    updatedOn: {
        type: Date,
        default: Date.now
    }
});

module.exports = User = mongoose.model('User', UserSchema);