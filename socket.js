/* Socket IO */
const socket = require('socket.io');

module.exports = function(server) {
    const io = socket(server);

    console.log('Open socket server');

    io.on('connection', function(socket){
        socket.on('chat', function(data){
            // insert chatting message in DB

            socket.emit('chat', data);
        });
    });
};