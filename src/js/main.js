const socket = io();

const emojiList = ["내", "앱", "앱2"];


// 칭구 / 챗 화면 전환

const friendTab = document.querySelector('#friend-tab');
const chatTab = document.querySelector('#chat-tab');
friendTab.hidden = true;

const menu = document.querySelector('#menu');
const friendBtn = menu.querySelector('#friend img');
const chatBtn = menu.querySelector('#chat img');

friendBtn.addEventListener('click', () => {
    friendBtn.src = '/views/imgs/friend-focus.png';
    chatBtn.src = '/views/imgs/chat.png';
    chatTab.hidden = true;
    friendTab.hidden = false;
});
chatBtn.addEventListener('click', () => {
    friendBtn.src = '/views/imgs/friend.png';
    chatBtn.src = '/views/imgs/chat-focus.png';
    chatTab.hidden = false;
    friendTab.hidden = true;
});


// 채팅관련?

const msgList = document.querySelector('#messages');
const viewMsgList = chatTab.querySelector('#view-messages');
let lastMsgTime = 0;

const addChat = (message) => {
    console.log('msg', `[${message.type}] ${message.nick}: ${message.message} - ${message.timestamp}`);
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
    p.innerHTML = p.innerHTML.replace(/\([가-힣0-9]{1,2}\)/g, m => {
        const emoji = m.slice(1, -1);
        if (emojiList.includes(emoji)) {
            return `<img src=/views/imgs/emoji/${emoji}.png>`;
        } else {
            return m;
        }
    });
    
    if (!p.innerHTML.replace(/<img src=[^>]+>/, '')) p.classList.add('only-emoji');
    
    if (message.type === 1) { //add timestamp
        const parentSpan = document.createElement('span');
        const span = document.createElement('span');
        const time = new Date(message.timestamp);
        span.innerText = `${time.getHours()}:${time.getMinutes()}`;
        parentSpan.appendChild(span);
        if (message.nick) {
            div.appendChild(p);
            div.appendChild(parentSpan);
        } else {
            div.appendChild(parentSpan);
            div.appendChild(p);
        }
    } else div.appendChild(p);

    // add context menu
    p.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        console.log(e);
        const contextElement = document.getElementById("context-menu");
        contextElement.style.top = e.offsetY + "px";
        contextElement.style.left = e.offsetX + "px";
        contextElement.classList.add('active');
    });
    

    msgList.appendChild(div);
    viewMsgList.scrollTop = viewMsgList.scrollHeight;
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
sendButton.style.cursor = 'not-allowed';
function sendMessageEvent(e) {
    e.preventDefault();
    const message = txtarea.value;
    if (!message) return;
    socket.emit('chat', message, 1, Date.now());
    addChat({
        type: 1,
        message: message,
        timestamp: Date.now()
    });
    txtarea.value = '';
}

msgForm.addEventListener('submit', sendMessageEvent);

txtarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && txtarea.value.trim()) {
        sendMessageEvent(e);
    }
    setTimeout(()=>{
        sendButton.style.color = txtarea.value.trim()? '#0E0E0E' : '#E2C23D'
        if (txtarea.value.trim()) sendButton.style.cursor = 'pointer';
        else sendButton.style.cursor = 'not-allowed';
    });
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
        addChat({ type: message.type, message: message.message, nick: message.nick === lastNick ? '' : message.nick, timestamp: message.timestamp });
    });
    addChat({ type: 0, message: '입장하셨어여.' });
    msgList.scrollTop = 0;
});


//google login

const googleLoginBtn = document.querySelector('div.g-signin2');
// const profileImg = document.querySelector('img');
// profileImg.hidden = true;
// const profileMenu = document.querySelector('#profile-menu');
// profileMenu.hidden = true;
const myProfile = document.querySelector('#my-profile');
const myProfileImg = myProfile.querySelector('img');
const myName = myProfile.querySelector('span');

function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    var pfUrl = profile.getImageUrl();
    console.log('Name:', profile.getName(), '\nImage URL:', pfUrl);
    myName.innerText = profile.getName();
    // profileImg.src = pfUrl;
    myProfileImg.src = pfUrl;
    socket.emit('profileImg', pfUrl);
    // profileImg.hidden = false;
    googleLoginBtn.hidden = true;
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
        googleLoginBtn.hidden = false;
    });
}

// profileImg.addEventListener('mouseover', () => {
//     profileMenu.hidden = false;
// });
// profileImg.addEventListener('mouseout', () => {
//     setTimeout(()=>profileMenu.hidden = true, 2000);
// });

myProfileImg.addEventListener('click', () => {
    open('/profile');
})



if (localStorage.getItem('id')) {
    socket.emit('id', localStorage.getItem('id'));
}



// context menu

window.addEventListener("click", () => {
    const contextElement = document.getElementById("context-menu");
    contextElement.classList.remove('active');
});

document.querySelector('#wa').addEventListener('click', () => {
    console.log('wa')
});