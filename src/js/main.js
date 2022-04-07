const socket = io();




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


const addChat = (message, sender) => {
    const p = document.createElement('p');
    p.textContent = `${sender || '너님'}: ${message}`;
    document.querySelector('#messages').appendChild(p);
}

msgForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = msgForm[0];
    const message = input.value;
    if (!message) return;
    socket.emit('chat', message);
    addChat(message, null);
    input.value = '';
    input.focus();
});




//socket events

socket.on('chat', addChat)

socket.on('disconnect', () => {
    document.title = 'Reloading...';
    location.reload();
})