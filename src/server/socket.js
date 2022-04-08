const http = require('http');
const socketio = require('socket.io');
const app = require('./app');

const server = http.createServer(app);
const io = socketio(server);


io.on('connection', (socket) => {
    socket.nick = 'Anonymous';
    socket.join('hello');
    console.log('someone joinned:', socket);
    
    socket.on('chat', message => {
        socket.to('hello').emit('chat', message, socket.nick);
    });
    socket.on('nickname', nickname => {
        socket.nick = nickname;
    });
});

module.exports = server;    