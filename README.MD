USAGE:
node index.js PORT_NUMBER MASTERNODE_STATUS(0 or 1)

It creates servers:
WebSocket: PORT_NUMBER+1
Http: PORT_NUMBER

e.g.
WebSocket: 4444
Http: 4443

In browser:
Connect peer
e.g. http://localhost:4443/add?address=http://localhost:4446
