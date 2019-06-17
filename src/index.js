const fs = require('fs');
const path = require('path');

const express = require('express');

const app = express();

app.use('/public', express.static(__dirname + '/../public'));

app.get('/midiakits', (req, res) => {
    fs.readdir(path.join(__dirname, '../', 'public', 'imgs', 'midiakit'), (err, files) => {
        console.log(files);
        res.json(files);
    });
})

app.listen(3000, () => {
    console.log('server started');
});
