const __path = __dirname.includes("/") ? __dirname.split("/").slice(0, -1).join("/") : __dirname.split("\\").slice(0, -1).join("\\");

const glob = require('glob');

const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static(__path));
app.get('/', (req, res) => res.sendFile(__path + '/views/main.html'));

app.post('/emoji-list', (req, res) => {
    glob('**/emoji/*/*', (err, files) => {
        if (err) {
            console.log(err);
            res.send([]);
        } else {
            res.send(files.map(file => {
                const path = file.split('/');
                return {
                    path: path[4],
                    type: path.pop().split(".")[1],
                    name: path.pop().split(".")[0],
                }
            }));
        }
    });
});

app.get('/profile', (req, res) => {
    res.sendFile(__path + '/views/profile.html');
});

module.exports = app;