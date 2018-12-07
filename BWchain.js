'use strict';
var CryptoJS = require("crypto-js");

const createGenesisBlock = () => {
  console.log("Creating Genesis Block!");
  var block = {
    index: 0,
    data: {msg:'I am Genesis Block',from:'root'},
    previousHash: 0,
    timestamp: 0
  }
  var hash = calculateHash(block);
  block.hash = hash;
  return block;
};

const createBlock = (data, previousBlock, login) => {
  var index = previousBlock.index + 1;
  var current_time = new Date();
  var previousHash = previousBlock.hash;
  var block = {
    index: index,
    data: data,
    previousHash: previousHash,
    timestamp: current_time,
    created_by: login
  }
  var hash = calculateHash(block);
  block.hash = hash;
  return block;
}

function checkNewChainIsValid(newChain) {
  //Is the first block the genesis block?
  if (calculateHash(newChain[0]) !== createGenesisBlock().hash) {
    return false;
  }
  let previousBlock = newChain[0];
  let blockIndex = 1;

  while (blockIndex < newChain.length) {
    let block = newChain[blockIndex];

    if (block.previousHash != previousBlock.hash) {
      console.log(blockIndex);
      return false;
    }
    previousBlock = block;
    blockIndex++;
  }

  return true;
}

function hashIsValid(block) {
  return (calculateHash(block) == block.hash);
}

function generateStackDifficulty() {
  return Math.random()*10;
}

function checkNewBlockIsValid(block, previousBlock) {
  if (previousBlock.index + 1 !== block.index) {
    //Invalid index
    return false;
  } else if (previousBlock.hash !== block.previousHash) {
    //The previous hash is incorrect
    return false;
  } else if (!hashIsValid(block)) {
    //The hash isn't correct
    return false;
  }

  return true;
}



var calculateHash = (block) => {
  return CryptoJS.SHA256(block.index + block.previousHash + block.timestamp + block.data.toString()).toString();
};

module.exports = {
  createGenesisBlock,
  createBlock,
  checkNewChainIsValid,
  checkNewBlockIsValid,
  generateStackDifficulty
};
