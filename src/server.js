const http = require('http');
const socketio = require('socket.io');
const express = require('express');

const app = express();

app.use(express.static(__dirname));
app.get('/', (req, res) => res.sendFile(__dirname + '/views/index.html'));

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

server.listen(3000, () => console.log('listening on port 3000'));
