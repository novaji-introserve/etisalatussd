var net = require('net-socket');
var pad = require('pad');

//var conn = net.connect(9000, 'localhost' );
var conn = net.connect(4850, '10.71.83.55');

conn.setEncoding('utf8');

conn.on('data', onConnData);
conn.once('close', onConnClose);
conn.on('error', onConnError);


conn.on('connect', function () {
    console.log('Connected');
    Bind(conn);
    //Handshake(conn);

});



function Bind(conn) {
    console.log('Initiating bind..');
    //buf2 = Buffer.alloc(57, 1);
    buffer = new Buffer(57);
    buffer.writeInt8(57, 0);
    //buffer.writeInt8(101, 4);
    buffer.writeInt8(0x65, 4);
    //buffer.writeInt8(0x00000065, 4);
    buffer.writeInt8(0, 8);
    //0xFFFFFFFF
    buffer.writeDoubleBE(0xFF, 12);
    //buffer.writeInt8(0, 16);
    buffer.writeDoubleBE(0xFF, 16);
    buffer.write('Novaji', 20);
    buffer.write('Novaji', 31);
    buffer.write('USSD', 40);
    //buffer.writeInt8(16, 53);
    //buffer.writeInt8(0x00000010, 53);
    buffer.writeInt8(0x10, 53);
    conn.write(buffer);
    console.log('Done');
}

function Handshake(conn) {
    console.log('Handshaking..');
    buffer = new Buffer(20);
    buffer.writeUInt8(20, 0);
    buffer.writeDoubleBE(0x85, 4);
    //buffer.writeInt8(131, 4);
    buffer.writeUInt8(0, 8);
    buffer.writeUInt8(0, 12);
    buffer.writeUInt8(0, 16);
    conn.write(buffer);
    console.log('Handshake message sent');

}
function UnBind(conn) {

    console.log('Unbinding..');
    buffer = new Buffer(20);
    buffer.writeInt8(20, 0);
    buffer.writeInt8(0x00000066, 4);
    buffer.writeInt8(0, 8);
    buffer.writeInt8(0, 12);
    buffer.writeInt8(0, 16);
    conn.write(buffer);
}

function onConnData(d) {
    console.log('Server said: %s', d.toString());
     var len = d.length;
    console.log(l);
    //Handshake(conn);
    //console.log(str.length);
    // get the first 
    //var str = d.toString();
    //var status = res.substr(12,1);
    //console.log(d);
    //socket.destroy();
    //console.log(d)


}

function onConnClose() {
    console.log('Connection closed');
}

function onConnError(err) {
    console.log('Connection error: %s', err.message);
    //Bind(conn);
    //Handshake(conn);
}
/*
 
 
 //Handshake(conn);
 
 
 */
// testing pull
