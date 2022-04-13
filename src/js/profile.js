const nick = localStorage.getItem('nickname');
const profileImg = localStorage.getItem('profileImg');
const id = localStorage.getItem('id');

console.log(nick, profileImg, id);
document.querySelector('#nick').innerText = nick;
document.querySelector('#profileImg').src = profileImg;
document.querySelector('#nickChange').addEventListener('click', () => {
    const input = prompt('닉네임을 입력해주세요.');
    if (!input) return;
    localStorage.setItem('nickname', input);
    document.querySelector('#nick').innerText = input;
});