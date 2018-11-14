const socketio = require('socket.io');
const mongoose = require('mongoose');
const events = require('events');
const _ = require('lodash');
const eventEmitter = new events.EventEmitter();


exports = module.exports = function(io) {

    io.on('connection', function(socket) {
        console.log("NEW USER CONNECTED...");

        socket.on('enter channel', (channel, username) => {
            if (username) {
              socket.join(channel);
              io.sockets.in(channel).emit('user joined', `${username} has joined the channel`)
              console.log('user has joined channel' , channel, username)
            } else {
              return false
            }
          });

        socket.on('leave channel', (channel, username) => {
            socket.leave(channel);
            io.sockets.in(channel).emit('user left', `${username} has left the channel`);
            console.log('user has left channel', channel, username)
        });

        socket.on('new_message', (socketMsg) => {
            io.sockets.in(socketMsg.channel).emit('refresh_messages', socketMsg);
            console.log('new message received in channel', socketMsg)
        });

        socket.on('enter privateMessage', (conversationId) => {
            console.log('enter privateMessage', conversationId);
            socket.join(conversationId);
        });

        socket.on('new privateMessage', (socketMsg) => {
            io.sockets.in(socketMsg.conversationId).emit('refresh privateMessages', socketMsg);
        });

        socket.on('disconnect', () => {
            console.log('USER DISCONNECTED...');
        });
    }); 

}