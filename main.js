const express = require('express');
const ws = require('ws');

const app = express();
const wsServer = new ws.Server({ noServer: true });

var list = [];
// Set up a headless websocket server that prints any
// events that come in.
//
function coolFunction(message) {
	list.push(message);
	fetch();
}

function fetch(){
	wsServer.clients.forEach((client) => {
		if(client.readyState === ws.OPEN){
			client.send(JSON.stringify(list));
		}
	})
}

wsServer.on('connection', socket => {
  socket.on('message', message => {
	if (message[0] === "0"){
		coolFunction(message.slice(1));
	}else if(message[0] === "1"){
		fetch();
	}
  });
});

// `server` is a vanilla Node.js HTTP server, so use
// the same ws upgrade process described here:
// https://www.npmjs.com/package/ws#multiple-servers-sharing-a-single-https-server
const server = app.listen(3000);
server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    wsServer.emit('connection', socket, request);
  });
});


