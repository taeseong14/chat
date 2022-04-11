const socket = io();

const emojiList = ["내", "앱"]

const msgList = document.querySelector('#messages');

const addChat = (message) => {
    console.log('msg', `[${message.type}] ${message.nick}: ${message.message}`);
    const div = document.createElement('div');
    const p = document.createElement('p');
    p.innerText = (function(){
        switch(message.type) {
            case 0:
            div.classList.add('system');
            return `${message.message}`;
            
            case undefined: case null: case 1:
            const nick = message.nick;
            div.classList.add(nick? 'msg-other' : 'msg-self');
            return `${nick?nick+': ':''}${message.message}`;
        }
    })();
    p.innerHTML = p.innerHTML.replace(/\([가-힣]{1,2}\)/g, m => {
        const emoji = m.slice(1, -1);
        if (emojiList.includes(emoji)) {
            return `<img src=/views/imgs/emoji/${emoji}.png>`;
        } else {
            return m;
        }
    });

    if (!p.innerHTML.replace(/<img src=.*>/g, '').trim()) p.classList.add('only-emoji');

    
    div.appendChild(p);
    msgList.appendChild(div);
    msgList.scrollTop = msgList.scrollHeight;
}


const nickForm = document.querySelector('form#nickForm');
const msgForm = document.querySelector('form#msgForm');

const lastNick = localStorage.getItem('nickname');
if (lastNick !== null) { 
    socket.emit('nickname', lastNick);
    socket.emit('chat', `${lastNick}님이 입장하였습니다.`, 0);
    nickForm.hidden = true;
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


const txtarea = msgForm[0];
const sendButton = msgForm[1];
sendButton.style.color = '#E2C23D';
function sendMessageEvent(e) {
    e.preventDefault();
    const message = txtarea.value;
    if (!message) return;
    socket.emit('chat', message);
    addChat({
        type: 1,
        message: message
    });
    txtarea.value = '';
}

msgForm.addEventListener('submit', sendMessageEvent);

txtarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && txtarea.value.trim()) {
        sendMessageEvent(e);
    }
    setTimeout(()=>sendButton.style.color = txtarea.value.trim()? '#0E0E0E' : '#E2C23D');
});



//socket events

socket.on('chat', addChat)

socket.on('disconnect', () => {
    document.title = 'Reloading...';
    location.reload();
})


//get previous messages

post('/previous-messages')
.then(arr => {
    arr.length && addChat({ type: 0, message: '이전 메시지 복원댐' });
    arr.forEach(message => {
        addChat({ type: message.type, message: message.message, nick: message.nick === lastNick ? '' : message.nick });
    });
    addChat({ type: 0, message: '입장하셨어여.' });
    msgList.scrollTop = 0;
});


//google login

const googleLoginBtn = document.querySelector('div.g-signin2');
const profileImg = document.querySelector('img');
profileImg.hidden = true;
const profileMenu = document.querySelector('#profile-menu');
profileMenu.hidden = true;

function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    var pfUrl = profile.getImageUrl();
    console.log('Name:', profile.getName(), '\nImage URL:', pfUrl);
    profileImg.src = pfUrl;
    localStorage.setItem('profileImg', pfUrl);
    socket.emit('profileImg', pfUrl);
    profileImg.hidden = false;
    googleLoginBtn.hidden = true;
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
        googleLoginBtn.hidden = false;
    });
}

profileImg.addEventListener('mouseover', () => {
    profileMenu.hidden = false;
});
profileImg.addEventListener('mouseout', () => {
    setTimeout(()=>profileMenu.hidden = true, 2000);
});