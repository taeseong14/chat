const form = document.querySelector('form');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log(`signing in: ${form[0].value}, ${form[1].value}`);
});