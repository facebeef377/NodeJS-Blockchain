const server = require('http').createServer();
const express = require('express');
const app = express();

const {
  returnStatus, getTransactions, addNewTransaction, clearTransactions,
  initServer,
  addNewConnection,
  getSockets,
  addNewBlock,
  getAdresses,
  getLatestBlock,
  getBlockchain,
  check_mining,
  getChainSize,
  IfMaster,
  initMaster,
  getLogin,
  changeLogin,
  changePermission
} = require('./p2p');

const {
  createGenesisBlock,
  createBlock,
  checkNewChainIsValid,
  checkNewBlockIsValid
} = require('./BWchain');



////////////////////////////////
//
//  TX - API
//
////////////////////////////////

app.get('/tx/add', (req, res) => {
  const tx = {
    msg: req.query.msg,
    from: getLogin()
  }
  addNewTransaction(tx);
  res.send(returnStatus("OK"));
});

app.get('/tx/pending', (req, res) => {
  res.send(getTransactions());
});

////////////////////////////////
//
//  Blocks - API
//
////////////////////////////////

app.get('/block/all', (req, res) => {
  const blockchain = getBlockchain();
  res.send(blockchain);
});

app.get('/block/add', (req, res) => {
  const tx_list = getTransactions();
  const block = createBlock(tx_list, getLatestBlock(), "test");
  if (checkNewBlockIsValid(block, getLatestBlock()))
    addNewBlock(block);
  res.send(returnStatus("OK"));
});

app.get('/block/start_mining', (req, res) => {
check_mining();
});

////////////////////////////////
//
//  Others - API
//
////////////////////////////////


app.get('/', (req, res) => {
  res.sendfile('wallet.html');
});
app.get('/blocks', (req, res) => {
  res.sendfile('blocks.html');
});

app.get('/sockets', (req, res) => {
  var r = {sockets: getSockets().length}
  res.send(r);
});

app.get('/getlogin',(req,res)=>{
  res.send({login:getLogin()});
})

app.get('/getmaster',(req,res)=>{
  res.send({master:IfMaster()});
})

app.get('/changelogin',(req,res)=>{
  const login=req.query.login;
  changeLogin(login);
  res.send(returnStatus("OK"));
})

app.get('/changepermission',(req,res)=>{
  const perm=req.query.perm;
  changePermission(perm);
  res.send(returnStatus("OK"));
})

app.get('/adresses', function (request, response) {
  const adr = getAdresses();
  console.log(adr);
  response.send(adr);
});

// Add new connection
app.get('/add', (req, res) => {
  const addr = req.query.address;
  addNewConnection(addr);
  res.redirect('/');
});


var master=process.argv[3];
initMaster(master);
console.log(IfMaster());
initServer(parseInt(process.argv[2]) + 1);
app.listen(process.argv[2], () => console.log('Listening on http://localhost:' + process.argv[2]));
