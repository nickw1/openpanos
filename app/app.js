const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const db = require('./db');
const opRouter = require('./routes/op');


app.enable('trust proxy');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));


app.use('/op', opRouter);

app.set('view engine', 'pug');

app.get('/', (req,res)=> {
    res.render('index', { title: 'OpenPanos demo application' });
});

app.listen(3000);
