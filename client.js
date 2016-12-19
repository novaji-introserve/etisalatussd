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

var net = require('net-socket');
 
var socket = net.connect(9000, 'localhost');
 
socket.setEncoding('utf8');
socket.on('connect', function () {
    // connected 
    
    socket.end('hey');
    socket.destroy();
});

function handleConnection(){
    
}
// testing pull
