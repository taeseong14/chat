const makeBtn = document.querySelector('#content > button');

const pw_incorrect = document.querySelector('#pw-incorrect');
pw_incorrect.hidden = true;

const [enteredEmail, code, pw, pw2, username] = 
[document.querySelector('#email'), 
document.querySelector('#code'),
document.querySelector('#password'), 
document.querySelector('#password2'), 
document.querySelector('#username')];
code.hidden = true;

const email = {
    regex: /[a-zA-Z0-9]{3,20}\@[a-zA-Z0-9]{2,10}\.[a-zA-Z0-9\.]{2,10}/,
    time: 0,
}

const sendBtn = document.querySelector('#sendmail');
sendBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (Date.now() - email.time < 1000 * 30) return alert('Please wait 30 seconds');
    if (!enteredEmail.value) return alert('Please enter your email');
    if (!enteredEmail.value.match(email.regex)) return alert('Email not valid');
    email.time = Date.now();
    code.hidden = false;
    post('send-mail', {
        email: enteredEmail.value
    });
})


makeBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const enteredCode = code.querySelector("input").value;
    if (pw.value !== pw2.value) return pw_incorrect.hidden = false;
    if (!email.regex.test(enteredEmail.value)) return alert('email not valid');
    if (code.hidden) return alert('Please confirm your email');
    if (!enteredCode) return alert('Please enter your code');
    if (pw.value.length < 6) return alert('password must be at least 6 characters');
    if (username.value.length < 3) return alert('username must be at least 3 characters');
    let json = false;
    await post("/create-account", {
        email: enteredEmail.value,
        password: pw.value,
        username: username.value,
        code: +enteredCode
    }).then(msg=>{
        console.log(msg)
        json = msg;
    })
    if (!json.error) location.href = "/";
    else alert(`error in backend: ${json.message}`);
});

pw2.addEventListener('keydown', (e) => {
    setTimeout(()=>pw_incorrect.hidden = pw.value === pw2.value);
});