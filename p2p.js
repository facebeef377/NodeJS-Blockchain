'use strict';
const WebSocketServer = require('ws').Server;
const WebSocket = require('ws');
const { createGenesisBlock, getBlockchain, getLatestBlock, createBlock } = require('./BWchain');

const sockets = [];   // Keep all peers connected to our server
const addresses = []; // Keep addresses of servers
var   blockchain = [];

// Keep record of all messages send over the network
const messages = [];

const initServer = (port) => {
  console.log('P2P server: ', port);
  const server = new WebSocketServer({ port });
  server.on('connection', (ws) => {
    initConnection(ws);
  });
};

const initConnection = (ws, url = null) => {
  sockets.push(ws);
  console.log('Initializing...');
  
  blockchain = getBlockchain(); //TODO

  handleMessages(ws);
  handleErrors(ws);
  // send information about another servers
  send(ws, { type: 'SOCKETS', addresses });
  send(ws, { type: 'BLOCKCHAIN', blockchain });
  if (url) addresses.push(url);
};

const handleMessages = (ws) => {

  ws.on('message', (data) => {
    const message = JSON.parse(data);

    switch(message.type) {
      case 'MESSAGE':
        messages.push(message.data);
        console.log('New message');
        break;
      case 'SOCKETS':
        const newConnections = message.addresses.filter(add => !addresses.includes(add));
        newConnections.forEach((con) => {
          addNewConnection(con);
        });
        break;
      case 'BLOCKCHAIN':
        const allBlocks = message.blockchain.filter(add => !blockchain.includes(add));
        allBlocks.forEach((block) => {
          blockchain.push(block);
        });
        break;
      case 'BLOCK':
        blockchain.push(message.data);
        console.log('New message');
        break;
      default:
        break;
    }
  });
};

const handleErrors = (ws) => {
  ws.on('close', () => removeConnection(ws));
  ws.on('error', () => removeConnection(ws));
};

// Helper functions
const send = (ws, message) => ws.send(JSON.stringify(message));
const broadcast = (message) => sockets.forEach((socket) => send(socket, message));
const removeConnection = (ws) => sockets.splice(sockets.indexOf(ws), 1);

const addNewConnection = (url) => {
  const ws = new WebSocket(url);
  console.log('Adding new connection with', url);
  ws.on('open', () => initConnection(ws, url));
  ws.on('error', () => console.log('Connection failed. Addr: ', url));
};

const addNewMessage = (msg) => {
  console.log(msg);
  messages.push(msg);
  broadcast({ type: 'MESSAGE', data: msg });
};

const addNewBlock = (block) => {
  broadcast({ type: 'BLOCK', data: block });
};

const getSockets = () => sockets;
const getMessages = () => messages;

module.exports = { addNewConnection, addNewMessage, initServer, getSockets, getMessages, addNewBlock };
