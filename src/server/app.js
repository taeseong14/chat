const __path = __dirname.includes("/") ? __dirname.split("/").slice(0, -1).join("/") : __dirname.split("\\").slice(0, -1).join("\\");

const glob = require('glob');
const { get } = require('axios');

const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static(__path));
glob('**/emoji/*', (err, files) => {
    files.forEach(file => {
        // app.use(`/views/imgs/emoji/${}`)
        app.use(express.static(`${__path}/${file.split("/").slice(1).join("/")}`))
    });
})

app.get('/', (req, res) => res.sendFile(__path + '/views/main.html'));

app.post('/emoji-list', (req, res) => {
    glob('**/emoji/*/*', (err, files) => {
        if (err) {
            console.log(err);
            res.send([]);
        } else {
            res.send(files.map(file => {
                const path = file.split('/');
                const index = path.indexOf('emoji');
                return {
                    path: path[index + 1],
                    type: path[index + 2].split(".").pop(),
                    name: path[index + 2].split(".").slice(0, -1).join("."),
                };
            }));
        }
    });
});

app.get('/profile', (req, res) => {
    res.sendFile(__path + '/views/profile.html');
});

app.get('/commits', async (req, res) => {
    res.sendFile(__path + '/views/commits.html');
});

module.exports = app;