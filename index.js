const server = require('http').createServer();
const express = require('express');
const app = express();
const { initServer, addNewConnection, addNewMessage, getSockets, getMessages, addNewBlock } = require('./p2p');
const { createGenesisBlock, getBlockchain, getLatestBlock, createBlock } = require('./BWchain');

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

app.get('/block/all', (req, res) => {
  const blockchain = getBlockchain();
  res.send(blockchain);
});

app.get('/block/init', (req, res) => {
  initChain()
  res.redirect('/block/all');
});

app.get('/block/add', (req, res) => {
  const data = req.query.msg;
  console.log(req.query.msg);
  const block = createBlock(data);
  addNewBlock(block);
  res.redirect('/block/all');
});

const initChain = () => {
  const data = {
    transactions: [
      {data: "Init blockchain!"}
    ]
  }
  createGenesisBlock(data);
}

initServer(parseInt(process.argv[2]) + 1);
app.listen(process.argv[2], () => console.log('Listening on http://localhost:' + process.argv[2]));

