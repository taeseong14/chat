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
    socket.id_ = socket.id;
    socket.join('hello');

    socket.on('chat', (message, type, timestamp) => {
        if (type === 0) {
            msgHistory.push({ type, message });
            socket.to('hello').emit('chat', { type, message });
        } else {
            msgHistory.push({ type: 1, message, nick: socket.nick, profile: socket.profileImg, timestamp });
            socket.to('hello').emit('chat', { type: 1, message, nick: socket.nick, profile: socket.profileImg, timestamp });
        }
    });
    socket.on('nickname', nickname => {
        socket.nick = nickname;
    });
    socket.on('profileImg', url => socket.profileImg = url);
    socket.on('id', id => socket.id_ = id);
    socket.on('disconnect', () => {
        msgHistory.push({type: 0, message: `${socket.nick}님이 나갔습니다.`});
        socket.to('hello').emit('chat', { message: `${socket.nick}님이 나갔습니다.`, type: 0});
    });
});

module.exports = server;    