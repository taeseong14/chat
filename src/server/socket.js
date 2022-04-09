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
    socket.to('hello').emit('chat', '누군가가 입장하였어여', '', 0);

    socket.on('chat', message => {
        msgHistory.push({message: message, nick: socket.nick});
        socket.to('hello').emit('chat', message, socket.nick);
    });
    socket.on('nickname', nickname => {
        socket.nick = nickname;
    });
    socket.on('disconnect', () => {
        socket.to('hello').emit('chat', `${socket.nick}님이 나갔습니다.`, null, 0);
    });
});

module.exports = server;    