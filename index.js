const server = require('http').createServer();
const express = require('express');
const app = express();
const { initServer, addNewConnection, addNewMessage, getSockets, getMessages } = require('./p2p');

app.get('/', (req, res) => {
  const msg = `No. sockets ${getSockets().length}`;
  const msg1 = `${getMessages()}`;

  const whole = `${msg}<br>${msg1}`;
  res.send(whole);
});

// Add new connection
app.get('/add', (req, res) => {
  const addr = req.query.address;
  addNewConnection(addr);
  res.redirect('/');
});

// Add new message
app.get('/commit', (req, res) => {
  const msg = req.query.msg;
  addNewMessage(msg);
  res.redirect('/');
});

initServer(parseInt(process.argv[2]) + 1);
app.listen(process.argv[2], () => console.log('Listening on http://localhost:' + process.argv[2]));

/*
USAGE:
node index.js PORT_NUMBER

In browser:
Connect peer
e.g. http://localhost:4443/add?address=http://localhost:4446

Send message:
e.g. http://localhost:4443/commit?msg=%22Hello%22
*/
