const __path = __dirname.split("\\").slice(0, -1).join("\\");

const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static(__path));
app.get('/', (req, res) => res.sendFile(__path + '/views/main.html'));

module.exports = app;