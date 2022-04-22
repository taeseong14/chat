const nick = localStorage.getItem('nickname');
const profileImg = localStorage.getItem('profileImg');
const id = localStorage.getItem('id');

console.log(nick, profileImg, id);
document.querySelector('#nick').innerText = nick;
document.querySelector('img').src = profileImg;
document.querySelector('#id').innerText = `#${id}`;
const btn = document.querySelector('button');
btn && btn.addEventListener('click', () => {
    const input = prompt('닉네임을 입력해주세요.');
    if (!input) return;
    if (input.length > 20) return alert('닉네임은 20자 이내로 입력해주세요.');
    if (input.includes('<') || input.includes('>')) return alert('<> 특수문자는 사용할 수 없습니다.');
    if (input.includes('\n')) return alert('줄바꿈 특수문자는 사용할 수 없습니다.');
    localStorage.setItem('nickname', input);
    document.querySelector('#nick').innerText = input;
});

const idBtn = document.querySelector('button[hidden]');
if (localStorage.getItem('idChanged') !== 'true') {
    idBtn.hidden = false;
    idBtn.addEventListener('click', () => {
        const input = prompt('아이디를 입력해주세요.');
        if (input) {
            if (input.match(/[^A-Z0-9_]/gi)) return alert('아이디는 영문자, 숫자, _만 가능합니다.');
            if (input.length < 4 || input.length > 16) return alert('아이디는 4자 이상 16자 이하로 입력해주세요.');
            const check = prompt(`${input}로 저장하시겠습니까?\n'예'를 입력하시면 저장됩니다.`);
            if (check === '예') {
                localStorage.setItem('idChanged', 'true');
                localStorage.setItem('id', input);
                idBtn.hidden = true;
                document.querySelector('#id').innerText = `#${input}`;
            }
        }
    });
}