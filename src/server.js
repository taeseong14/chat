const http = require('http');
const socketio = require('socket.io');
const { mail } = require('./config/email');
const mailConfirm = {};
const express = require('express');

const app = express();

app.use(express.json());

app.use(express.static(__dirname));
app.use('/node_modules', express.static(__dirname.split('\\').slice(0, -1).join('\\') + '\\node_modules'));
app.get('/', (req, res) => res.sendFile(__dirname + '/views/index.html'));

app.get('/signup', (req, res) => res.sendFile(__dirname + '/views/signup.html'));
app.post('/send-mail', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).send({error: true, message: 'Please enter your email'});
    mail.sendMail({
        to: email,
        subject: 'bpchat signup',
        html: `[${new Date().getHours()}:${new Date().getMinutes()}]\nplease enter this code to signup: <b>${mailConfirm.code = Math.floor(Math.random() * 900000 + 100000)}</b>`
    }, (err, info) => {
        console.log(err || `sent email to ${email}, ${info.response}`);
    })
    
});
app.post('/create-account', (req, res) => {
    const { body } = req;
    if (!body.email || !body.password || !body.username || !body.code) return res.status(400).send({error: true, message: 'missing fields'});
    if (!body.email.match(/[a-zA-Z0-9]{3,20}\@[a-zA-Z0-9]{2,10}\.[a-zA-Z0-9\.]{2,10}/)) return res.send({error: true, message:'email not valid'});
    if (body.password.length < 6) return res.send({error: true, message:'password must be at least 6 characters'});
    if (body.username.length < 3) return res.send({error: true, message:'username must be at least 3 characters'});
    if (body.code !== mailConfirm.code) return res.send({error: true, message:'code is not correct'});
    console.log('create an account', body);
    res.send({
        error: false,
        message: 'account created'
    });
});

app.get('/signin', (req, res) => res.sendFile(__dirname + '/views/signin.html'));

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




