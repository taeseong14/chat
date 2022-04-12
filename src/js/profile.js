const nick = localStorage.getItem('nickname');
const profileImg = localStorage.getItem('profileImg');
const id = localStorage.getItem('id');

if (!nick && !profileImg && !id) {
    alert('로그인을 먼저 해주세요.');
    location.href = '/';
}
console.log('로그인대잇음');
console.log(nick, profileImg, id);
document.querySelector('#nick').innerText = nick;
document.querySelector('#profileImg').src = profileImg;
document.querySelector('#nickChange').addEventListener('click', () => {
    const input = prompt('닉네임을 입력해주세요.');
    if (!input) return;
    localStorage.setItem('nickname', input);
    document.querySelector('#nick').innerText = input;
});