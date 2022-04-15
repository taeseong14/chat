const socket = io();

let ip;
const banned_user = ["8.38.149.6", "175.223.19.142"];
if (localStorage.getItem('banned') === 'true') {
    document.body.hidden = true;
    setTimeout(() => {
        console.log('기기밴 ㅊㅊ');
        location.href = '//ck.b-p.kro.kr/';
    }, 10);
}
post("//api.ipify.org", { method: 'GET' }, "text")
.then(res => ip = res)
.then(() => {
    socket.emit("ip", ip);
    if (banned_user.includes(ip)) {
        document.body.hidden = true;
        setTimeout(() => {
            alert(`ip 밴먹음.\n${banned_user.length}명 밴먹었는데ㅋㅋㅋ\nㅂㅂ`);
            localStorage.setItem('banned', 'true');
            location.href = '//ck.b-p.kro.kr/';
        }, 10);
    }
})

let emojiList = []; // get emoji list before get previous messages
const people = []; // 머였는지 까먹음

// 칭구 / 챗 화면 전환

const friendTab = document.querySelector('#friend-tab');
const chatTab = document.querySelector('#chat-tab');

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
    txtarea.focus();
});


/**
 * 채팅관련?
 */

const msgList = document.querySelector('#messages');
const viewMsgList = chatTab.querySelector('#view-messages');

// 자동스크롤
const godown = document.querySelector('#godown');
godown.addEventListener('click', () => {
    viewMsgList.scrollTop = viewMsgList.scrollHeight;
});
let is_scrolled_to_bottom = true;

viewMsgList.addEventListener('scroll', () => {
    const scroll = viewMsgList.scrollTop + viewMsgList.clientHeight + 100;
    if (scroll > viewMsgList.scrollHeight) {
        is_scrolled_to_bottom = true;
        godown.hidden = true;
    } else {
        is_scrolled_to_bottom = false;
        godown.hidden = false;
    }
});

let lastMsgTime = {
    time: '',
    nick: ''
}

let lastMsg;
let lastPerson;

let script = () => {};

const previousMsgs = []; // 전메들 담아둔거
let returnedPreviousMsg = false;

const addChat = (message) => {
    const { type, id, nick, profileImg, timestamp, img } = message;
    let msg = message.message;
    img && console.log('이미지: ' + img);
    if (message.previous) {
        previousMsgs.push(message);
        if (!returnedPreviousMsg) {
            returnedPreviousMsg = true;
            console.log('[!] 전메 복원댐: previousMsgs로 확인');
        }
    }
    else console.log(`[${type}] ${nick || (type ? '너님' : 'System') }: ${msg} - ${timestamp}${message.ip ? ` { ${message.ip} }` : ''}`);
    const time = new Date(timestamp);
    const div = document.createElement('div');
    const p = document.createElement('p');
    p.innerHTML = (function(){
        
        switch(type) {
            case 0:
            div.classList.add('system');
            if (msg.endsWith('입장하였습니다.')) people.push(id);
            lastPerson = null;
            return `${msg}`;
            
            case 1:
            msg = msg.replace(/</g, '&lt;').replace(/>/g, '&gt;'); // 태그 제거
            msg = msg.replace(/\n/g, '<br>'); // 줄바꿈
            div.classList.add(nick? 'msg-other' : 'msg-self');
            
            // 링크 하이라이트
            msg = msg.replace(/(https?:(\/\/)?)?[A-Z0-9가-힣\.\-]+\.[A-Z0-9가-힣]{1,4}(\/[A-Z0-9가-힣\.\/\?\=]+)?/gi, e => {
                if (e.endsWith('.png')) return e;
                return `<a target="blank" href="${e.startsWith("http")?e:"//"+e}">${e}</a>`;
            });
            
            // 이모지 표현
            msg = msg.replace(/\([가-힣ㄱ-ㅎㅏ-ㅣ0-9_A-Z]{1,3}\)/gi, m => {
                const emoji = m.slice(1, -1);
                if (emojiList.filter(e => e.type === "png").map(e => e.name).includes(emoji)) {
                    
                    return `<img src="/views/imgs/emoji/${emoji}.png">`;
                } else  if (emojiList.filter(e => e.type === "webp").map(e => e.name).includes(emoji)) {
                    return `<img src="/views/imgs/emoji/${emoji}.webp?${Date.now()}">`;
                } else {
                    return m;
                }
            });
            if (!msg.replace(/<img src=[^>]+>/, '')) p.classList.add('only-emoji');
            
            // id 하이라이트
            msg = msg.replace(/(#[A-Z0-9_]{6,20})/gi, e => {
                return `<a target="blank" href="/profile/${e.slice(1)}">${e}</a>`; 
            });

            // 프사/닉
            // setTimeout(() => {
            //     lastPerson = nick;
            // }, 0);
            if (nick && lastPerson !== nick) {
                lastPerson = nick;
                const div = document.createElement('div');
                div.classList.add('profile-box');
                const img = document.createElement('img');
                img.src = profileImg;
                div.appendChild(img);
                const p = document.createElement('p');
                p.innerText = nick;
                div.appendChild(p);
                msgList.appendChild(div);
            }

            return `${msg}`;
            
            
            case 2:
            div.classList.add('image');
            return `바풀: <img src="${img}">`;
            
            default:
            console.log(`unknown type\n${message}`);
        }
    })();
    
    
    
    const timeFormat = `${time.getHours()}:${time.getMinutes()}`;
    
    if ([1, 2].includes(type) && (timeFormat !== lastMsgTime.time || nick !== lastMsgTime.nick)) { //add timestamp
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
    
    // 이모지 클릭시 새로고침
    const emojis = Array.from(document.querySelectorAll('.only-emoji > img')).filter(e=>e.src.includes(".webp")).slice(-1);
    if (emojis.length && type === 1 && p.innerHTML.includes('<img src=')) {
        const emoji = Array.from(emojis)[0];
        emoji.addEventListener('click', () => {
            emoji.src = emoji.src.split("?")[0] + "?" + Date.now();
        });
    }
    
    if (is_scrolled_to_bottom)
    viewMsgList.scrollTop = viewMsgList.scrollHeight;
}


const nickForm = document.querySelector('form#nickForm');
const msgForm = document.querySelector('form#msgForm');

const lastNick = localStorage.getItem('nickname');
if (lastNick !== null) {
    socket.emit('nickname', lastNick);
    socket.emit('message', { message: `${lastNick}님이 입장하였습니다.`, type: 0, timestamp: Date.now(), ip });
    nickForm.hidden = true;
} else {
    socket.emit('message', { message: '누군가가 입장하였습니다.', type: 0, timestamp: Date.now(), ip });
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

let loaded;

function sendMessageEvent(e) {
    e.preventDefault();
    if (!loaded) return;
    let message = txtarea.value;
    if (!message) return;
    
    lastMsg = message;
    
    // 이스터에그(??)
    message = message.replace(/^ev\: .*/, e => {
        const code = e.replace(/ev\: /, '');
        try {
            var result = eval(code);
        } catch (e) {
            localStorage.setItem('banned', 'true'); // 오류나면 기기밴 ^^7
            location.reload();
            return `이발하려다 오류냈어여! ${message}`;
        }
        return `result:\n${result}`;
    });
    
    
    socket.emit('message', { message, type: 1, timestamp: Date.now(), ip });
    addChat({
        type: 1,
        message: message,
        timestamp: Date.now(),
        nick: null,
    });
    txtarea.value = '';
    viewMsgList.scrollTop = viewMsgList.scrollHeight;
}

msgForm.addEventListener('submit', sendMessageEvent);

const checkSendable = (e) => {
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!lastMsg) return;
        txtarea.value = lastMsg;
        const msgLength = txtarea.value.length;
        txtarea.setSelectionRange(msgLength, msgLength);
        txtarea.focus();
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

socket.on('chat', addChat);

socket.on('disconnect', () => {
    document.title = 'Reloading...';
    location.reload();
});


//get previous messages

post('/previous-messages')
.then(async arr => {
    emojiList = await post('/emoji-list') //get emoji list
    // .then(emoji => { // 임티탭 만들던..
    //     const img = document.createElement('img');
    //     img.src = `/views/imgs/emoji/${emoji.name}.${emoji.type || "png"}`;
    //     emojiTab.appendChild(img);
    // })
    const maxLength = 10;
    if (arr.length) {
        const msgs = arr.slice(-maxLength);
        addChat({ type: 0, message: `이전 메시지 복원댐 (${msgs.length})${msgs.length !== arr.length ? ' <span class="loadable" title="추가 로딩">(+' + (arr.length - msgs.length) + ')</span>' : ''}`, nick: null });
        msgs.forEach(message => {
            addChat({ type: message.type, profileImg: message.profileImg, message: message.message, nick: message.nick === lastNick ? null : message.nick, timestamp: message.timestamp, ip: message.ip, previous: true });
        });
    }
    addChat({ type: 0, message: '입장하셨어여.', nick: null });
    viewMsgList.scrollTop = 0; // 전메 보고와라(?)
    loaded = true;
});


//google login

const googleLoginBtn = document.querySelector('div.g-signin2');
const myProfile = document.querySelector('#my-profile');
const myProfileImg = myProfile.querySelector('img');
const myName = myProfile.querySelector('#my-name');

function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    var pfUrl = profile.getImageUrl();
    const email = profile.getEmail();
    
    console.log('[Google Logined]\nName:', profile.getName(), '\nImage URL:', pfUrl);
    
    if (localStorage.getItem('nickname') === null) 
    localStorage.setItem('nickname', profile.getName());
    myName.innerText = localStorage.getItem('nickname');
    
    localStorage.setItem('profileImg', pfUrl);
    myProfileImg.src = localStorage.getItem('profileImg');
    socket.emit('profileImg', localStorage.getItem('profileImg'));
    
    googleLoginBtn.hidden = true;
    
    if (localStorage.getItem('googleLogin') === null) {
        localStorage.setItem('googleLogin', 'true');
        const id = email.split('@')[0];
        socket.emit('setId', id);
        localStorage.setItem('id', id);
        location.reload();
    }
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
});


// id, profile

const myId = myProfile.querySelector('#my-id');

myId.addEventListener('click', () => {
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.value = `${myId.innerText}`;
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
    const copied = document.querySelector('#copied');
    copied.hidden = false;
    setTimeout(() => copied.hidden = true, 500);
});

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
const emojiTab = msgForm.querySelector('#emoji-tab');
emojiBtn.addEventListener('click', () => {
    emojiTab.hidden = !emojiTab.hidden;
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
    });
}

const searchFriendBtn = document.querySelector('#search-friend');
const addFriendBtn = document.querySelector('#add-friend');
const addFriendTab = document.querySelector('#add-friend-tab');

addFriendTab.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        e.preventDefault();
        addFriendTab.querySelector('input').value = '';
        addFriendTab.classList.add('hidden');
    }
})

const searchResult = addFriendTab.querySelector('#search-result');

addFriendBtn.addEventListener('click', () => {
    addFriendTab.hidden = !addFriendTab.hidden;
    addFriendTab.querySelector('input').value = '';
    searchResult.innerHTML = '';
    addFriendTab.querySelector('input').focus();
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
    result = result.filter(pf => pf.profileImg); // 유령계점;
    searchResult.innerHTML = '';
    if (!result.length) 
    return searchResult.innerHTML = '<p>검색 결과 없음</p>';
    if (typeof result === 'string') 
    return alert(result);
    
    result.forEach(user => {
        const userCard = document.createElement('div');
        userCard.classList.add('user-card');
        const id = localStorage.getItem('id');
        userCard.innerHTML = `
        <img src="${user.profileImg}" alt="">
        <div id="user-card-info-text">
        <div>
        <span id="user-card-name">${user.nick}</span>
        <span id="user-card-id">#${user.id}</span>
        </div>
        <div>
        <button id="user-card-add-btn${id==user.id?'-me':''}">${id==user.id?'나임':'+'}</button>
        </div>
        </div>
        `;
        searchResult.appendChild(userCard);
    });
    const friendPlusBtns = document.querySelectorAll('#user-card-add-btn'); //테스트중!!!!
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
            btn.id = 'user-card-add-btn-added';
            btn.innerText = '추가됨';
            btn.disabled = true;
            btn.style.width = '50px';
            setFriends(friends);
        });
    });
});


addFriendTab.querySelector('#add-friend-tab-title > span:last-child').addEventListener('click', () => {
    addFriendTab.hidden = true;
});




// friendBtn.click();
// addFriendBtn.click();

txtarea.focus();