'use strict';
var http = require('http');
var https = require('https');
var fs= require('fs');
var express = require('express');
var WebSocket = require('ws');

var server = {
  key: fs.readFileSync('/etc/letsencrypt/live/s1.essung.dev/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/s1.essung.dev/fullchain.pem')
};

var web = express();
var verySecretKey = 'alvearenpotatis';

var httpsServer = https.createServer(server, web);
var wss = new WebSocket.Server({ server: httpsServer });

var whiteList = [];
var list = [];

function coolFunction(message) {                                                
	try {
		var parsedJson = JSON.parse(message);
		if ("text" in parsedJson && "id" in parsedJson) {
			list.push(parsedJson)
		}else {
			throw(TypeError("message does not match criteria"));
		}
	} catch (error) {
		console.error(error)
	}
    wss.broadcast(JSON.stringify(list))                                                            
}                                                                               
									    
function fetch(){                                                               
	wss.broadcast(JSON.stringify(list));                      
} 

function removeItem(id){
	console.log(id);
	for (var i = 0; i < list.length; i++) {
		if (list[i].id === id){
			list.splice(i, 1)
		}
	}
	fetch();
}

wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
};

wss.on('connection', function connection(ws, request, client) {
    ws.on('message', function incoming(message) {
	if (whiteList.includes(request.socket)){
		if (message[0] === "0"){                                                
			coolFunction(message.slice(1));                                 
		}else if(message[0] === "1"){                                           
			fetch();                                                        
		}else if(message[0] === "2"){
			removeItem(message.slice(1))
		}
	}else if (message[0] === "3"){
		if (message.slice(1) === verySecretKey){
			whiteList.push(request.socket)
			console.log(`whitelisted ${request.socket.remoteAddress}`)
		}else {
			request.socket.close(); //stänger ner alla
		}
	}

    });
});


//Server initializations

httpsServer.listen(3000, function listen(connection) {});
