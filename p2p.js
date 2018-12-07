'use strict';
const WebSocketServer = require('ws').Server;
const WebSocket = require('ws');
const { createGenesisBlock, createBlock,checkNewChainIsValid,checkNewBlockIsValid, generateStackDifficulty } = require('./BWchain');

var sockets = [];     // Keep all peers connected to our server
const addresses = [];   // Keep addresses of servers
var   blockchain = [];  // Keep record of all messages send over the network
var   tx_list = [];

var login = 'komp1';
var master ;

var the_interval = 30000;  //20sek
var mining_started = false;

////////////////////////////////
//
//  Statuses
//
////////////////////////////////

const returnStatus = (status) => {
  return {
    status: status
  }
}

////////////////////////////////
//
//  Blockchain - Functions
//
////////////////////////////////

const addNewBlock = (block) => {
  blockchain.push(block);
  broadcast({ type: 'BLOCK', data: block });
};

const start_mining = () => {
  setInterval(function() {
    var diff = generateStackDifficulty();
    var diff_time = diff * 1000;
    console.log("Trying to mine block! Diff: " + diff);
    var tx_list = getTransactions();
    clearTransactions();
    var latest=getLatestBlock();
    setTimeout(function () {
      var latest2=getLatestBlock();
      var block = createBlock(tx_list, getLatestBlock(), login);
      if(latest.hash==latest2.hash)
      {
      if (checkNewBlockIsValid(block, getLatestBlock())){
        addNewBlock(block);
        console.log("Block created!");
      } else {
        console.log("Hash fail!");
      }
    }
    else
    {
      console.log("Too late 2 hash");
    }
    }, diff_time)
  }, the_interval);
}

const check_mining = () => {
  if(master!=0){
  if(!mining_started) {
    mining_started = true;
    start_mining();
  } 
}
}


////////////////////////////////
//
//  TX - Functions
//
////////////////////////////////

/*
TODO LIST: 
-send tx to all nodes
-push tx to blockchain
-clear tx on all nodes
*/

const getTransactions = () => tx_list;

const addNewTransaction = (tx) => {
  tx_list.push(tx);
  broadcast({ type: 'NEW_TX', data: tx });
};

const clearTransactions = () => {
  tx_list = [];
};



////////////////////////////////
//
//  Connection Functions
//
////////////////////////////////

const initServer = (port) => {
  blockchain.push(createGenesisBlock());
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
  send(ws,{ type: 'BLOCK', data: getLatestBlock()});
  // send information about another servers
  send(ws, { type: 'SOCKETS', addresses });
  if (url) addresses.push(url);
  
};

const handleMessages = (ws) => {

  ws.on('message', (data) => {
    const message = JSON.parse(data);

    switch(message.type) {

      case 'NEW_TX':
      if(master!=0){
        tx_list.push(message.data);
      }
      break;
      case 'SOCKETS':
      console.log(message.addresses);
        const newConnections = message.addresses.filter(add => !addresses.includes(add));
        newConnections.forEach((con) => {
          console.log(con);
          addNewConnection(con);
        });
        break;
      case 'BLOCKCHAIN':
        const allBlocks = message.blockchain.filter(add => !blockchain.includes(add));
        allBlocks.forEach((block) => {
          blockchain.push(block);
        });
        break;
      case 'PERM':
        if(message.data==login)
        {
          master=true;
        console.log("I am Masternode now");
        }
          break;
      case 'REQUEST_CHAIN':
        ws.send(JSON.stringify({ type: 'CHAIN', data: blockchain}))    
        break;
      case 'CHAIN':
        processedRecievedChain(message.data);
        break;  
      case 'BLOCK':
        processedRecievedBlock(message.data);
        break;
      case 'REQUEST_BLOCK':
        ws.send(JSON.stringify({ type: 'BLOCK', data: getLatestBlock()}))
        break; 
      case 'CONNECTION':
      addNewConnection(message.data);
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

const processedRecievedChain = (blocks) => {
  let newChain = blocks.sort((block1, block2) => (block1.index - block2.index))

  if(newChain.length > getChainSize() && checkNewChainIsValid(blocks)){
    blockchain=newChain;
    console.log('chain replaced');
  }
  
}




const processedRecievedBlock = (block) => {

  let currentTopBlock = getLatestBlock();

  // Is the same or older?
  if(block.index <= currentTopBlock.index){
    console.log('No update needed');
    return;
  }

  //Is claiming to be the next in the chain
  if(block.previousHash == currentTopBlock.hash){
    //Attempt the top block to our chain
    blockchain.push(block);
    clearTransactions();
    check_mining();
    console.log('New block added');
    console.log(getLatestBlock());
  }else{
    // It is ahead.. we are therefore a few behind, request the whole chain
    console.log('requesting chain');
    broadcast({ type: 'REQUEST_CHAIN', data: "" });
  }
}
const changeLogin=(newlogin)=>{
login=newlogin;
}
const changePermission=(login)=>{
  broadcast({type:'PERM',data:login});
}
const initMaster=(init)=>{
master=init;
}
const getLogin=()=> login;
const IfMaster=()=>master;
const getAdresses = () => addresses;
const getSockets = () => sockets;

const getLogins = () =>logins;
const getBlockchain = () => blockchain;
const getLatestBlock = () => blockchain[blockchain.length - 1];
const getChainSize = () => blockchain.length;

module.exports = { returnStatus, getTransactions, initMaster,addNewTransaction, clearTransactions,changeLogin,changePermission, addNewConnection,check_mining,IfMaster, initServer, getSockets,getLogin, addNewBlock,getAdresses,getLogins,getLatestBlock,getBlockchain,getChainSize };
