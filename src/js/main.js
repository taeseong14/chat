const socket = io();

let ip;
post("//api.ipify.org", { method: 'GET' }, "text")
.then(res => ip = res);

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
let lastMsgTime = {
    time: '',
    nick: ''
}

let lastMsg;

let script = () => {};

const addChat = (message) => {
    const { type, message: msg, nick, timestamp } = message;
    console.log('msg', `[${type}] ${nick || (type ? nick + " (너님" : 'System') }: ${msg} - ${timestamp} { ${message.ip} }`);
    const time = new Date(timestamp);
    const div = document.createElement('div');
    const p = document.createElement('p');
    p.innerText = (function(){
        switch(type) {
            case 0:
            div.classList.add('system');
            return `${msg}`;
            
            case undefined: case null: case 1:
            div.classList.add(nick? 'msg-other' : 'msg-self');
            return `${nick?nick+': ':''}${msg}`;
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
    
    if (type === 1 && (timeFormat !== lastMsgTime.time || nick !== lastMsgTime.nick)) { //add timestamp
        const parentSpan = document.createElement('span');
        const span = document.createElement('span');
        span.innerText = timeFormat;
        lastMsgTime.time = timeFormat;
        lastMsgTime.nick = nick;
        parentSpan.appendChild(span);
        if (nick) {
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
            return `${message}\nresult:\n${e}`;
        }
        return `result:\n${result}`;
    });
    
    
    socket.emit('chat', message, 1, Date.now(), ip);
    addChat({
        type: 1,
        message: message,
        timestamp: Date.now(),
        nick: null,
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
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (txtarea.value.trim()) sendMessageEvent(e);
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
    arr.length && addChat({ type: 0, message: '이전 메시지 복원댐', nick: null });
    arr.forEach(message => {
        addChat({ type: message.type, message: message.message, nick: message.nick === lastNick ? null : message.nick, timestamp: message.timestamp, ip: message.ip });
    });
    addChat({ type: 0, message: '입장하셨어여.', nick: null });
    viewMsgList.scrollTop = 0;
});


//google login

const googleLoginBtn = document.querySelector('div.g-signin2');
const myProfile = document.querySelector('#my-profile');
const myProfileImg = myProfile.querySelector('img');
const myName = myProfile.querySelector('#my-name');

function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    var pfUrl = profile.getImageUrl();
    console.log('Name:', profile.getName(), '\nImage URL:', pfUrl);
    
    if (localStorage.getItem('nickname') === null) 
    localStorage.setItem('nickname', profile.getName());
    myName.innerText = localStorage.getItem('nickname');
    
    localStorage.setItem('profileImg', pfUrl);
    myProfileImg.src = localStorage.getItem('profileImg');
    socket.emit('profileImg', localStorage.getItem('profileImg'));
    
    if (localStorage.getItem('id') === null) {
        const email = profile.getEmail();
        const id = email.split('@')[0];
        socket.emit('setId', id);
        localStorage.setItem('id', id);
    }
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


// id, profile

const myId = myProfile.querySelector('#my-id');

if (localStorage.getItem('id')) {
    socket.emit('setId', localStorage.getItem('id'));
    myId.innerText = '#' + localStorage.getItem('id');
} else {
    socket.emit('getId');
    socket.on('getId', id => {
        localStorage.setItem('id', id);
        myId.innerText = '#' + id;
    });
}

if (localStorage.getItem('profileImg')) {
    socket.emit('profileImg', localStorage.getItem('profileImg'));
    myProfileImg.src = localStorage.getItem('profileImg');
} else {
    socket.emit('profileImg', '/views/imgs/friend.png');
    localStorage.setItem('profileImg', '/views/imgs/friend.png');
    myProfileImg.src = '/views/imgs/friend.png';
}





// context menu

window.addEventListener("click", () => {
    const contextElement = document.getElementById("context-menu");
    contextElement.classList.remove('active');
});

// document.querySelector('#wa').addEventListener('click', () => {
//     console.log('wa')
// });


const emojiBtn = msgForm.querySelector('#emoji');
emojiBtn.addEventListener('click', () => {
    txtarea.value += emojiList.map(e => `(${e})`).join(' ');
    txtarea.focus();
    checkSendable({});
});



// friends

const friends = [];

function setFriends(friends) {
    const friendList = document.querySelector('#friend-list');
    friendList.innerHTML = '';
    document.querySelector('#friend-len > span').innerText = friends.length;
    friends.forEach(friend => {
        const friendElement = document.createElement('div');
        friendElement.innerText = friend.nick;
        friendList.appendChild(friendElement);
    })
}

const searchFriendBtn = document.querySelector('#search-friend');
const addFriendBtn = document.querySelector('#add-friend');
const addFriendTab = document.querySelector('#add-friend-tab');

addFriendBtn.addEventListener('click', () => {
    addFriendTab.classList.toggle('hidden');
});

const addFriend_searchForm = addFriendTab.querySelector('form');
addFriend_searchForm.addEventListener('submit', e => {
    e.preventDefault();
    const searchInput = addFriend_searchForm.querySelector('input');
    const search = searchInput.value;
    if (!search) return;
    socket.emit('searchFriend', search);
});
socket.on('searchFriend', (result) => {
    const searchResult = addFriendTab.querySelector('#search-result');
    searchResult.innerHTML = '';
    if (!result.length) 
    return searchResult.innerHTML = '<p>검색 결과 없음</p>';
    if (typeof result === 'string') 
    return alert(result);
    
    result.forEach(user => {
        const userCard = document.createElement('div');
        userCard.classList.add('user-card');
        userCard.innerHTML = `
        <img src="${user.profileImg}" alt="">
        <div id="user-card-info-text">
        <div>
        <span id="user-card-name">${user.nick}</span>
        <span id="user-card-id">#${user.id}</span>
        </div>
        <div>
        <button id="user-card-add-btn">+</button>
        </div>
        </div>
        `;
        searchResult.appendChild(userCard);
    });
    const friendPlusBtns = document.querySelectorAll('#user-card-add-btn');
    console.log(friendPlusBtns);
    friendPlusBtns.forEach(btn => {
        const newFriendProfile = btn.parentElement.parentElement.parentElement;
        const newFriendId = newFriendProfile.querySelector('#user-card-id').innerText.slice(1);
        if (friends.find(user => user.id === newFriendId)) {
            btn.innerText = '추가됨';
            btn.disabled = true;
            btn.style.fontSize = '12px';
            btn.style.width = '50px';
            return;
        }
        btn.addEventListener('click', (e) => {
            friends.push({
                id: newFriendId,
                profileImg: newFriendProfile.querySelector('img').src,
                nick: newFriendProfile.querySelector('#user-card-name').innerText
            });
            console.log('칭구추가뮤ㅠㅠㅠㅠ\n칭구: ', friends);
            btn.innerText = '추가됨';
            btn.disabled = true;
            btn.style.fontSize = '12px';
            btn.style.width = '50px';
            setFriends(friends);
        });
    });
});


addFriendTab.querySelector('#add-friend-tab-title > span:last-child').addEventListener('click', () => {
    addFriendTab.classList.add('hidden');
});




// friendBtn.click();
// addFriendBtn.click();