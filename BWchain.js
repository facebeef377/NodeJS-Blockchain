'use strict';
var CryptoJS = require("crypto-js");

const blockchain = [];

const createGenesisBlock = (data) => {
  console.log("Creating Genesis Block!");
  var current_time = new Date();
  var hash = calculateHash(0,0,current_time,data.toString());
  var block = {
      index: 0,
      hash: hash,
      data: data,
      previousHash: 0,
      timestamp: current_time
  }
  blockchain.push(block);
};

const createBlock = (data) => {
  console.log("Creating Block!");
  var index = blockchain.length;
  var current_time = new Date();
  var previousHash = blockchain[index - 1].hash;
  var hash = calculateHash(index,previousHash,current_time,data.toString());
  var block = {
      index: index,
      hash: hash,
      data: data,
      previousHash: previousHash,
      timestamp: current_time
  }
  blockchain.push(block);
  return block;
}

const getBlockchain = () => blockchain;
const getLatestBlock = () => blockchain[blockchain.length - 1];
const getChainSize = () => blockchain.length;

var calculateHash = (index, previousHash, timestamp, data) => {
    return CryptoJS.SHA256(index + previousHash + timestamp + data).toString();
};

module.exports = { createGenesisBlock, getBlockchain, getLatestBlock, createBlock, getChainSize };

