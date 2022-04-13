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

app.get('/profile/:id', (req, res) => { // get specific profile
    const id = req.params.id;
    let foundSocket = sockets.map(socket => {
        return { 
            id: socket.id_,
            nick: socket.nick,
            profileImg: socket.profileImg,
        };
    }).find(socket => socket.id === id);
    foundSocket ||= { id: id, nick: 'Not found', profileImg: '/views/imgs/friend.png' };
    res.send(`<html><head>
    <link rel="stylesheet" href="/css/profile.css">
    <link rel="shortcut icon" href="/views/imgs/friend.png" type="image/x-icon">
    <title>Profile: ${foundSocket.nick}</title>
    </head><body><h1>Profile</h1>
    <div><img id="profileImg" src="${foundSocket.profileImg}">
    <p><span id="nick">${foundSocket.nick}</span><span id="id">#${foundSocket.id}</span>
    </p></div>
    </body></html>
    `);
});


io.on('connection', (socket) => {
    socket.nick = 'Anonymous';
    socket.id_ = socket.id.replace(/[^A-Z0-9]/gi, '').slice(0, 10);
    socket.join('hello');
    sockets.push(socket);
    
    socket.on('chat', ({ message, type, timestamp, ip, img }) => {
        switch(type) {
            case 0: //system message
            msgHistory.push({ type, message, timestamp, ip });
            return socket.to('hello').emit('chat', { type, message, nick: null, timestamp, ip });
            case 1: //normal message
            msgHistory.push({ type: 1, message, nick: socket.nick, profile: socket.profileImg, timestamp, ip });
            return socket.to('hello').emit('chat', { type: 1, message, nick: socket.nick, profile: socket.profileImg, timestamp, ip });
            case 2: //image
            msgHistory.push({ type: 2, img, nick: socket.nick, profile: socket.profileImg, timestamp, ip });
            return socket.to('hello').emit('chat', { type: 2, img, nick: socket.nick, profile: socket.profileImg, timestamp, ip });
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
        .filter(s=>s.id !== socket.id) // 자신 빼기
        .filter(socket => socket.profileImg) // 유령계 제외
        .filter(socket => socket.nick.toLowerCase().includes(search.toLowerCase()) || socket.id_.includes(search)) // 검색어 포함
        .map(socket => ({ id: socket.id_, nick: socket.nick, profileImg: socket.profileImg })));
    });
    
    socket.on('a', () => {
        
    })
    
    socket.on('disconnect', () => {
        sockets.splice(sockets.indexOf(socket), 1);
        if (!socket.profileImg) return;
        msgHistory.push({type: 0, message: `${socket.nick}님이 나갔습니다.`});
        socket.to('hello').emit('chat', { message: `${socket.nick}님이 나갔습니다.`, type: 0});
    });
});

module.exports = server;    