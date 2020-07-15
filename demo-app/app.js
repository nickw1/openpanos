const express = require('express');
const app = express();
require('dotenv').config();
const op = require('openpanos-server');


app.enable('trust proxy');

app.use(express.static('public'));


app.use('/op', op.router);

app.set('view engine', 'pug');

app.get('/', (req,res)=> {
    res.render('index', { title: 'OpenPanos demo application' });
});

app.get('/upload', (req, res)=> {
	res.render('upload', { title: 'Upload a panorama'});
});

app.listen(3000);
