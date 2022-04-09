const socket = io();

const addChat = (message, sender, type) => {
    const p = document.createElement('p');
    p.textContent = (function(){
        switch(type) {
            case 0:
            return `[${message}]`;
            
            case undefined: case null: case 1:
            return `${sender || '너님'}: ${message}`;
        }
    })();
    document.querySelector('#messages').appendChild(p);
}


const nickForm = document.querySelector('form#nickForm');
const msgForm = document.querySelector('form#msgForm');

const lastNick = localStorage.getItem('nickname');
if (lastNick !== null) { 
    socket.emit('nickname', lastNick);
    nickForm.hidden = true;
    msgForm[0].focus();
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
    addChat(message);
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
    arr.length && addChat('이전 메시지 복원댐', null, 0);
    arr.forEach(message => {
        addChat(message.message, message.nick)
    });
    addChat('입장하였어여', null, 0);
});
