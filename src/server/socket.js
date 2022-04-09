const http = require('http');
const socketio = require('socket.io');
const app = require('./app');

const server = http.createServer(app);
const io = socketio(server);

const msgHistory = [];

app.post('/previous-messages', (req, res) => { // get previous messages
    res.send(msgHistory);
});


io.on('connection', (socket) => {
    socket.nick = 'Anonymous';
    socket.join('hello');

    socket.on('chat', (message, type) => {
        msgHistory.push({message: message, nick: socket.nick});
        if (type !== undefined)
        socket.to('hello').emit('chat', { type: type, message: message });
        else
        socket.to('hello').emit('chat', { message: message, nick: socket.nick });
    });
    socket.on('nickname', nickname => {
        socket.nick = nickname;
    });
    socket.on('disconnect', () => {
        socket.to('hello').emit('chat', { message: `${socket.nick}님이 나갔습니다.`, type: 0});
    });
});

module.exports = server;    