/* Socket IO */
const socket    = require('socket.io');
const dbChat    = require('./db/chat');

module.exports = function(server, db) {
    const io = socket(server);

    console.log('Open socket server');

    io.on('connection', (socket) => {
        socket.on('chat', (data) => {
            dbChat.insertChattingMessage(db, data);
            socket.emit('chat', data);
        });
    });
};