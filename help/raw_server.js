var net = require('net');

var server = net.createServer();
server.on('connection', handleConnection);

server.listen(9000, function () {
    console.log('server listening to %j', server.address());
    startBind();
});


function handleConnection(serv) {

    var remoteAddress = conn.remoteAddress + ':' + conn.remotePort;
    console.log('new client connection from %s', remoteAddress);


    startBind();


    serv.setEncoding('utf8');

    serv.on('data', onConnData);
    serv.once('close', onConnClose);
    serv.on('error', onConnError);

    function onConnData(d) {
        console.log('connection data from %s: %j', remoteAddress, d);
        //conn.write(d.toUpperCase());
    }

    function onConnClose() {
        console.log('connection from %s closed', remoteAddress);
    }

    function onConnError(err) {
        console.log('Connection %s error: %s', remoteAddress, err.message);
    }


}

function startBind() {
    var conn = net.connect(4850, '10.71.83.55');
    conn.setKeepAlive(true, 1000);
    //conn.setEncoding('utf8');
    conn.on('data', onConnData);
    conn.once('close', onConnClose);
    conn.on('error', onConnError);


    conn.on('connect', function () {

        //console.log('Connected');
        Bind(conn);
        Handshake(conn);

    });

    /*
     setInterval(function () {
     //Bind(conn);
     buf2 = Buffer.alloc(10, 1);
     
     conn.write(buf2);
     }, 1000);
     
     
     **/


    function Bind(conn) {
        console.log('Binding..');
        //buf2 = Buffer.alloc(57, 1);
        buffer = new Buffer(57);
        buffer.writeUInt8(57, 0);
        //buffer.writeUInt8(0x00000065, 4);
        buffer.writeUInt8(0x00000065, 4);
        buffer.writeUInt8(0, 8);
        //0xFFFFFFFF
        buffer.writeUInt8(0, 12);
        //buffer.writeInt8(0, 16);
        buffer.writeUInt8(0, 16);
        buffer.write('Novaji', 20);
        buffer.write('Novaji', 31);
        buffer.write('USSD', 40);
        //buffer.writeInt8(16, 53);
        buffer.writeUInt8(0x00000010, 53);
        //buffer.writeInt8(0x10, 53);
        conn.write(buffer);
        //console.log('Done');
    }

    function Handshake(conn) {
        console.log('Handshaking..');
        buffer = new Buffer(20);
        buffer.writeUInt8(20, 0);
        buffer.writeUInt8(0x83, 4);
        //buffer.writeInt8(131, 4);
        buffer.writeUInt8(0, 8);
        buffer.writeUInt8(0, 12);
        buffer.writeUInt8(0, 16);
        conn.write(buffer);
        //console.log('Handshake message sent');

    }
    function UnBind(conn) {

        console.log('Unbinding..');
        buffer = new Buffer(20);
        buffer.writeInt8(20, 0);
        buffer.writeInt8(0x00000071, 4);
        buffer.writeInt8(0, 8);
        buffer.writeInt8(0, 12);
        buffer.writeInt8(0, 16);
        conn.write(buffer);
    }

    function Continue(conn) {
        console.log('Continue Message..');
        buffer = Buffer(174);
        buffer.writeUInt8(174, 0);
        //buffer.writeUInt8(0x83, 4);
        buffer.writeUInt8(0x00000070, 4);
        //buffer.writeInt8(131, 4);
        // command Status
        buffer.writeUInt8(0, 8);
        // SenderID
        buffer.writeUInt8(0xFF, 12);
        // Receiver ID
        buffer.writeUInt8(0xFF, 16);
        // USSD version
        buffer.writeUInt8(0x20, 20);
        // USSD op type
        buffer.writeUInt8(0x01, 21);
        // MSISDN
        buffer.write('2348174568959', 22);
        // Service Code
        buffer.write('372', 43);
        // Code Scheme
        buffer.writeUInt8(0x0F, 64);
        // content
        buffer.write('Welcome to NIID USSD', 65);
        conn.write(buffer);
        //console.log('Handshake message sent');
    }

    function End(conn) {
        console.log('Ending session..');
        var sessid = random.integer(100000, 999999).toString();
        buffer = new Buffer(122);
        buffer.writeUInt8(122, 0);
        //buffer.writeUInt8(0x83, 4);
        buffer.writeUInt8(0x00000071, 4);
        //buffer.writeInt8(131, 4);
        // command Status
        buffer.writeUInt8(0, 8);
        // SenderID
        buffer.write(0xFF, 12);
        // Receiver ID
        buffer.writeUInt8(0xFF, 16);
        // USSD version
        buffer.writeUInt8(0x20, 20);
        // USSD op type
        buffer.writeUInt8(0x03, 21);
        // MSISDN
        buffer.write('2348174568959', 22);
        // Service Code
        buffer.write('372', 43);
        // Code Scheme
        buffer.writeUInt8(0x44, 64);
        // content
        buffer.write('Welcome to NIID USSD', 65);
        conn.write(buffer);
        console.log('End message sent');
    }

    function onConnData(d) {
        //console.log('Server said: %s', d.toString());
        var len = d.length;
        var buf = Buffer.from(d, 'utf8');
        var str = d.toString();
        //console.log(len);
        //console.log(buf);
        //console.log(buf.readInt8(0));
        //console.log(buf.readInt8(12));
        //get the commnand id
        var cmd = String.fromCharCode(buf.readUInt8(4));
        var status = String.fromCharCode(buf.readUInt8(8));
        var senderID = String.fromCharCode(buf.readUInt8(12));
        //console.log('Command ID (%s). Status (%s), SenderID(%s)', cmd, status, senderID);
        /*
         for (value of buf.values()) {
         console.log(value);
         }
         */
        if (len === 31) {
            console.log('Received (bind) response..%s(%d)', d.toString(), len);
            Handshake(conn);
        } else if (len === 20) {
            console.log('Received (handshake) response (%d): %s', len, d.toString());
        } else if (len === 70) {

            console.log('Received (begin) request (%d): %s', len, d.toString());
            var msisdn = buf.toString('utf8', 22, 35);
            var serviceCode = buf.toString('utf8', 44, 47);
            var content = buf.toString('utf8', 65, len);
            var json = {
                'msisdn': msisdn, 'serviceCode': serviceCode, 'content': content
            };
            console.log(json);
            /* send this to a REST end point and get content */
            //End(conn);
            Continue(conn);
        } else {
            console.log('Received (continue) request (%d): %s', len, d.toString());
            var msisdn = buf.toString('utf8', 23, 37);
            var serviceCode = buf.toString('utf8', 45, 48);
            var content = buf.toString('utf8', len - 3, len);
            var json = {
                'msisdn': msisdn, 'serviceCode': serviceCode, 'content': content
            };

            console.log('Received (continue) message (%d): %s', len, d.toString());
            console.log(json);
        }
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
        //net.connect(4850, '10.71.83.55');
    }

    function onConnError(err) {
        console.log('Connection %s', err.message);

    }
    /*
     
     
     //Handshake(conn);
     
     
     */
// testing pull

}