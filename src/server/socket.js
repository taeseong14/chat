const http = require('http');
const socketio = require('socket.io');
const app = require('./app');

const server = http.createServer(app);
const io = socketio(server);

const msgHistory = [];

app.post('/previous-messages', (req, res) => { // get previous messages
    res.send(msgHistory);
});

const sockets = [];

io.on('connection', (socket) => {
    socket.nick = 'Anonymous';
    socket.id_ = socket.id.slice(0, 10);
    socket.join('hello');
    sockets.push(socket);
    
    socket.on('chat', (message, type, timestamp) => {
        if (type === 0) {
            msgHistory.push({ type, message });
            socket.to('hello').emit('chat', { type, message });
        } else {
            msgHistory.push({ type: 1, message, nick: socket.nick, profile: socket.profileImg, timestamp });
            socket.to('hello').emit('chat', { type: 1, message, nick: socket.nick, profile: socket.profileImg, timestamp });
        }
    });
    socket.on('nickname', nickname => socket.nick = nickname);
    socket.on('profileImg', url => socket.profileImg = url);
    socket.on('setId', id => socket.id_ = id);
    socket.on('getId', () => socket.emit('getId', socket.id_));
    
    socket.on('searchFriend', (search) => {
        if (search === socket.id_)
        return socket.emit('searchFriend', '나 자신은 영원한 인생의 친구입니다.');
        if (search === '칭구') 
        return socket.emit('searchFriend', '칭구 없으시구나...');

        if (search === 'all')
        return socket.emit('searchFriend', sockets.map(socket => ({ id: socket.id_, nick: socket.nick, profileImg: socket.profileImg })));

        socket.emit('searchFriend', sockets
        // .filter(searchSocket => socket.nick !== searchSocket.nick && searchSocket.id !== socket.id_)
        .filter(socket => socket.nick.toLowerCase().includes(search.toLowerCase()) || socket.id_.includes(search))
        .map(socket => ({ id: socket.id_, nick: socket.nick, profileImg: socket.profileImg })));
    });
    
    socket.on('disconnect', () => {
        msgHistory.push({type: 0, message: `${socket.nick}님이 나갔습니다.`});
        socket.to('hello').emit('chat', { message: `${socket.nick}님이 나갔습니다.`, type: 0});
        sockets.splice(sockets.indexOf(socket), 1);
    });
});

module.exports = server;    