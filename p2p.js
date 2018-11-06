'use strict';
const WebSocketServer = require('ws').Server;
const WebSocket = require('ws');

// GLOBALS

// Keep all peers connected to our server
const sockets = [];
// Keep addresses of servers
const addresses = [];

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

  handleMessages(ws);
  handleErrors(ws);
  // send information about another servers
  send(ws, { type: 'SOCKETS', addresses });
  send(ws, { type: 'MESSAGES', messages });
  if (url) addresses.push(url);
};

const handleMessages = (ws) => {
  /*
  { type: 'MESSAGE', data: string }
  { type: 'SOCKETS', addresses: array }
  */
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
      case 'MESSAGES':
        const newMessages = message.messages.filter(add => !messages.includes(add));
        newMessages.forEach((mes) => {
          messages.push(mes);
        });
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

const getSockets = () => sockets;
const getMessages = () => messages;

module.exports = { addNewConnection, addNewMessage, initServer, getSockets, getMessages };
