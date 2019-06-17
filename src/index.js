const express = require('express');

const app = express();

app.use('/public', express.static(__dirname + '/../public'));

app.listen(3000, () => {
    console.log('server started');
});