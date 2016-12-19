/*
 var net = require('net-socket');
 
 var client = new net.Socket();
 client.connect(9000, '127.0.0.1', function () {
 console.log('Connected');
 client.write('Hello, server! Love, Client.');
 });
 
 client.on('data', function (data) {
 console.log('Received: ' + data);
 client.destroy(); // kill client after server's response
 });
 
 client.on('close', function () {
 console.log('Connection closed');
 });
 */
var net = require('net-socket');

var socket = net.connect(9000, 'localhost');

socket.setEncoding('utf8');
//
socket.write('Hello');
socket.on('data', onConnData);
socket.once('close', onConnClose);
socket.on('error', onConnError);

function onConnData(d) {
    console.log('Server said: %s', d);
    //socket.destroy();

}

function onConnClose() {
    console.log('Server closed');
}

function onConnError(err) {
    console.log('Connection error: %s', err.message);
}

// testing pull
