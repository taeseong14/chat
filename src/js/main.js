const socket = io();

const msgList = document.querySelector('#messages');

const addChat = (message) => {
    console.log(JSON.stringify(message, null, 4));
    const p = document.createElement('p');
    p.textContent = (function(){
        switch(message.type) {
            case 0:
            return `[${message.message}]`;
            
            case undefined: case null: case 1:
            return `${message.nick || '너님'}: ${message.message}`;
        }
    })();
    msgList.appendChild(p);
    msgList.scrollTop = msgList.scrollHeight;
}


const nickForm = document.querySelector('form#nickForm');
const msgForm = document.querySelector('form#msgForm');

const lastNick = localStorage.getItem('nickname');
if (lastNick !== null) { 
    socket.emit('nickname', lastNick);
    socket.emit('chat', `${lastNick}님이 입장하였습니다.`, 0);
    nickForm.hidden = true;
    msgForm[0].focus();
} else {
    socket.emit('chat', '누군가가 입장하였어여', 0);
}

nickForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = nickForm[0];
    const nick = input.value;
    if (!nick) return;
    socket.emit('nickname', nick);
    localStorage.setItem('nickname', nick);
    input.value = '';
    msgForm[0].focus();
    nickForm.hidden = true;
});



msgForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = msgForm[0];
    const message = input.value;
    if (!message) return;
    socket.emit('chat', message);
    addChat({
        message: message
    });
    input.value = '';
    input.focus();
});




//socket events

socket.on('chat', addChat)

socket.on('disconnect', () => {
    document.title = 'Reloading...';
    location.reload();
})

post('/previous-messages')
.then(arr => {
    arr.length && addChat({ type: 0, message: '이전 메시지 복원댐' });
    arr.forEach(message => {
        addChat({ message: message.message, nick: message.nick === lastNick ? '너님' : message.nick });
    });
    addChat({ type: 0, message: '입장하였어여.' });
    msgList.scrollTop = 0;
});
