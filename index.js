const PORT = 3000;
const express = require('express');
const server = express();
const apiRouter = require('./api');

const bodyParser = require('body-parser');
server.use(bodyParser.json());

const morgan = require('morgan');
server.use(morgan('dev'));

server.use('/api', apiRouter);

const { client } = require('./db');
client.connect();


server.listen(PORT, () => {
    console.log('The server is up on Port', PORT)
});



server.use((req, res, next) => {
    console.log("<___Body Logger START___>");
    console.log(req.body);
    console.log("<___Body Logger END___>");

    next();
});

