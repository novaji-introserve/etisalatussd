var unirest = require('unirest');
var obj = {
    commandID: 132,
    msisdn: '2347066192100',
    serviceCode: '372',
    content: '*372#'
};
var result;
unirest.post('http://localhost/ussd/etisalat/send')
        .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        .send(obj)
        .end(function (response) {
            //console.log(response.body);
            result = response.body;
            //console.log(result.reply);
        });
