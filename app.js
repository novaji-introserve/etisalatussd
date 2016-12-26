'use strict';
require('dotenv').config();
var net = require('net-socket');
var format = require('string-format');
var unirest = require('unirest');


var conn = net.connect(parseInt(process.env.PORT), process.env.HOST);
conn.setKeepAlive(true, 10000);
// conn.setEncoding('utf8');
conn.on('data', onConnData);
conn.once('close', onConnClose);
conn.on('error', onConnError);

conn.on('connect', function () {
    console.log('[CONNECTED]');
    Bind(conn);
});



function Continue(conn, obj, buf) {
    // default reply is continue
    console.log('[CONTINUE]');
    console.log(obj);
    console.log(buf);
    var buffer = Buffer.alloc(65).fill(0);
    // command length
    //buffer.writeUInt8(174, 0);
    //commend id
    buffer.writeInt32LE(0x00000070, 4);
    // command Status
    buffer.writeInt32LE(0, 8);
    /* like problem is from sender ID and receiver ID */
    // SenderID, needs to be receiver ID from begin
    buf.copy(buffer, 12, 16, 20);

    //buffer.writeInt32LE(0x01000005, 12);
    // Receiver ID
    buf.copy(buffer, 16, 12, 16);
    //buffer.writeInt32LE(0x2900AB12, 16, 4);
    // USSD version
    buffer.writeInt32LE(0x20, 20);
    // USSD op type
    buffer.writeInt32LE(0x01, 21);
    // MSISDN
    buffer.write(obj.msisdn, 22);
    // Service Code
    buffer.write(obj.serviceCode, 43);
    // Code Scheme
    buffer.writeUInt8(0x0F, 64);
    // content
    var msg = Buffer.from(obj.reply);
    // total return
    var len = buffer.length + msg.length;
    var ret = Buffer.concat([buffer, msg], len);
    // command length
    ret.writeInt32LE(len, 0);
    console.log(ret);
    conn.write(ret);
}



function End(conn, obj, buf) {
    // default reply is continue
    console.log('[END]');
    console.log(obj);
    console.log(buf);
    var buffer = Buffer.alloc(65).fill(0);
    // command length
    //buffer.writeUInt8(174, 0);
    //commend id
    buffer.writeInt32LE(0x00000071, 4);
    // command Status
    buffer.writeInt32LE(0, 8);
    /* like problem is from sender ID and receiver ID */
    // SenderID, needs to be receiver ID from begin
    buf.copy(buffer, 12, 16, 20);

    //buffer.writeInt32LE(0x01000005, 12);
    // Receiver ID
    buf.copy(buffer, 16, 12, 16);
    //buffer.writeInt32LE(0x2900AB12, 16, 4);
    // USSD version
    buffer.writeInt32LE(0x20, 20);
    // USSD op type
    buffer.writeInt32LE(0x03, 21);
    // MSISDN
    buffer.write(obj.msisdn, 22);
    // Service Code
    buffer.write(obj.serviceCode, 43);
    // Code Scheme
    buffer.writeUInt8(0x0F, 64);
    // content
    var msg = Buffer.from(obj.reply);
    // total return
    var len = buffer.length + msg.length;
    var ret = Buffer.concat([buffer, msg], len);
    // command length
    ret.writeInt32LE(len, 0);
    console.log(ret);
    conn.write(ret);
}



function onConnData(d) {
    console.log('[Incoming data..]');
    //console.log(d);
    var len = d.length;
    var buf = Buffer.from(d);
    var command = buf[4];
    //console.log('CommandID: %s',buf[4]);
    //console.log(buf);
    if (len === 31) {
        console.log('CommandID(%d)[BIND] %s(%d)', command, d.toString(), len);
        Handshake(conn);
    }
    else if (len === 20) {
        console.log('CommandID(%d)[SHAKE] %s(%d)', command, d.toString(), len);
        //Begin(conn);
    }
    else {
        // Begin , Continue or End message
        console.log('CommandID(%d)[BEGIN|CONTINUE] %s(%d)', command, d.toString(), len);

        var obj = {
            commandID: command,
            msisdn: buf.toString('utf8', 22, 35),
            serviceCode: buf.toString('utf8', 44, 47),
            content: buf.toString('utf8', 65, len)
        };

        //console.log(obj);
        /* 
         * 
         *  send to dlr and return reply , request and respone are in json
         */
        unirest.post(process.env.DLR)
                .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
                .send(obj)
                .end(function (response) {
                    //console.log(response.body);
                    var result = response.body;
                    /* Either end the session or continue */
                    switch (result.action) {
                        case 'Continue':
                            Continue(conn, result, buf);
                            break
                        case 'End':
                            End(conn, result, buf);
                            break;
                        default:
                            End(conn, result, buf);
                    }
                  
                });

    }
}

function onConnClose() {
    console.log('Connection closed');

}

function onConnError(err) {
    console.log('Connection [%s]', err.message);
    //console.log('Connection %s', err.stack);
    //console.log(err);
    //sys.log("ignoring exception: " + err);

}

function Bind(conn) {
    console.log('[BIND RESPONSE]');
    var buffer = Buffer.alloc(57).fill(0);
    buffer.writeInt32LE(57, 0);
    //buffer.writeUInt8(0x00000065, 4);
    buffer.writeInt32LE(0x00000065, 4);
    buffer.writeUInt8(0, 8);
    //0xFFFFFFFF sender id
    buffer.writeInt32LE(0xFFFFFFFF, 12, 'hex');
    //buffer.writeUInt8(0, 12);
    // receiver id
    //buffer.writeUInt8(0, 16);
    buffer.writeInt32LE(0xFFFFFFFF, 16, 'hex');
    // username
    buffer.write(process.env.USERNAME, 20);
    // password
    buffer.write(process.env.PASSWORD, 31);
    // system type
    buffer.write(process.env.SYSTEM_TYPE, 40);
    //buffer.writeInt8(16, 53);
    // interface version
    buffer.writeInt32LE(0x00000010, 53);
    //console.log(buffer);
    conn.write(buffer);
    //buffer.writeInt8(0x10, 53);

}

function Handshake(conn) {
    console.log('[SHAKE RESPONSE]');
    var buffer = Buffer.alloc(20).fill(0);
    buffer.writeInt32LE(20, 0);
    // command id
    buffer.writeInt32LE(0x00000083, 4);
    //buffer.writeUInt8(0x83, 4);
    //command status
    buffer.writeInt32LE(0, 8);
    buffer.writeInt32LE(0xFFFFFFFF, 12, 'hex');
    //buffer.writeUInt8(0, 12);
    // receiver id
    //buffer.writeUInt8(0, 16);
    buffer.writeInt32LE(0xFFFFFFFF, 16, 'hex');
    conn.write(buffer);
    //console.log(buffer);
}


function UnBind(conn) {

    console.log('Unbinding..');
    var cmd_len = Buffer.alloc(4, 0);
    cmd_len.writeUInt8(20, 0);
    var cmd_id = Buffer.from('00000066', 'hex');
    var cmd_status = Buffer.alloc(4, 0);
    var sender_id = Buffer.from('FFFFFFFF', 'hex');
    var receiver_id = Buffer.from('FFFFFFFF', 'hex');
    var total_len = cmd_len.length + cmd_id.length + cmd_status.length + sender_id.length +
            receiver_id.length;
    var buf = Buffer.concat([cmd_len, cmd_id, cmd_status, sender_id, receiver_id], total_len);
    console.log(buf);
    console.log('Buffer length: %d', total_len);
    conn.write(buf);
    console.log('Handshake request sent..');
}
