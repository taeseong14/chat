const socket = io();

let emojiList = []; // get emoji list before get previous messages


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
let lastMsgTime = '';

let lastMsg;

const addChat = (message) => {
    console.log('msg', `[${message.type}] ${message.nick}: ${message.message} - ${message.timestamp}`);
    const time = new Date(message.timestamp);
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
    
    // 링크 하이라이트
    p.innerHTML = p.innerHTML.replace(/(https?:(\/\/)?)?[a-zA-Z0-9가-힣\.\-]+\.[a-zA-Z0-9가-힣]{2,}(\/[a-zA-Z0-9가-힣\.\/]+)?/g, e => `<a href="${e.startsWith("http")?e:"//"+e}">${e}</a>`);
    
    // 이모지 표현
    p.innerHTML = p.innerHTML.replace(/\([가-힣0-9]{1,2}\)/g, m => {
        const emoji = m.slice(1, -1);
        if (emojiList.includes(emoji)) {
            return `<img src=/views/imgs/emoji/${emoji}.png>`;
        } else {
            return m;
        }
    });
    
    if (!p.innerHTML.replace(/<img src=[^>]+>/, '')) p.classList.add('only-emoji');
    
    const timeFormat = `${time.getHours()}:${time.getMinutes()}`;
    
    if (message.type === 1 && timeFormat !== lastMsgTime) { //add timestamp
        const parentSpan = document.createElement('span');
        const span = document.createElement('span');
        span.innerText = timeFormat;
        lastMsgTime = timeFormat;
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

// 채팅 전송
function sendMessageEvent(e) {
    e.preventDefault();
    let message = txtarea.value;
    if (!message) return;
    
    // 이스터에그(??)
    message = message.replace(/^eval\: .*/, e => {
        const code = e.replace(/eval\: /, '');
        try {
            var result = eval(code);
        } catch (e) {
            return `result:\n${e}`;
        }
        return `result:\n${result}`;
    });
    
    
    socket.emit('chat', message, 1, Date.now());
    addChat({
        type: 1,
        message: message,
        timestamp: Date.now()
    });
    txtarea.value = '';
}

msgForm.addEventListener('submit', sendMessageEvent);

const checkSendable = (e) => {
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        txtarea.value = lastMsg;
        const msgLength = txtarea.value.length;
        txtarea.setSelectionRange(msgLength, msgLength);
        txtarea.focus()
        return;
    }
    if (e.key === 'Enter' && !e.shiftKey && txtarea.value.trim()) {
        sendMessageEvent(e);
    }
    setTimeout(()=>{
        sendButton.style.color = txtarea.value.trim()? '#0E0E0E' : '#E2C23D'
        if (txtarea.value.trim()) sendButton.style.cursor = 'pointer';
        else sendButton.style.cursor = 'not-allowed';
    });
}

txtarea.addEventListener('keydown', checkSendable);



//socket events

socket.on('chat', addChat)

socket.on('disconnect', () => {
    document.title = 'Reloading...';
    location.reload();
})


//get previous messages

post('/previous-messages')
.then(async arr => {
    emojiList = await post('/emoji-list'); //get emoji list
    arr.length && addChat({ type: 0, message: '이전 메시지 복원댐' });
    arr.forEach(message => {
        addChat({ type: message.type, message: message.message, nick: message.nick === lastNick ? '' : message.nick, timestamp: message.timestamp });
    });
    addChat({ type: 0, message: '입장하셨어여.' });
    viewMsgList.scrollTop = 0;
});


//google login

const googleLoginBtn = document.querySelector('div.g-signin2');
const myProfile = document.querySelector('#my-profile');
const myProfileImg = myProfile.querySelector('img');
const myName = myProfile.querySelector('span');

function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    var pfUrl = profile.getImageUrl();
    console.log('Name:', profile.getName(), '\nImage URL:', pfUrl);
    if (localStorage.getItem('nickname') === null) 
    localStorage.setItem('nickname', profile.getName());
    myName.innerText = localStorage.getItem('nickname');
    myProfileImg.src = pfUrl;
    socket.emit('profileImg', pfUrl);
    localStorage.setItem('profileImg', pfUrl);
    googleLoginBtn.hidden = true;
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
        googleLoginBtn.hidden = false;
    });
}

myProfileImg.addEventListener('click', () => {
    open('/profile');
})

// if (localStorage.getItem('id')) {
//     socket.emit('id', localStorage.getItem('id'));
// }



// context menu

window.addEventListener("click", () => {
    const contextElement = document.getElementById("context-menu");
    contextElement.classList.remove('active');
});

// document.querySelector('#wa').addEventListener('click', () => {
//     console.log('wa')
// });


// msgform menus

const emojiBtn = msgForm.querySelector('#emoji');
emojiBtn.addEventListener('click', () => {
    txtarea.value += emojiList.map(e => `(${e})`).join(' ');
    checkSendable({});
});