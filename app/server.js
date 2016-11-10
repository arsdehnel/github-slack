const express = require('express');
const https = require('https');
const eventParse = require('./event-parse');
// const defaultEventParsers = require('./event-parsers/default')
const bodyParser = require('body-parser');

const PORT = 8080;



const app = express();
app.use(bodyParser.json());

app.post('/event', function (req, res, next) {

    // a couple things universal to the application logic
    var eventType = req.headers['x-github-event'];
    var payload = req.body;

    // call our parser processor that does all the magic
    //  - this controls if we even have a matching setup to handle this event and may return false if it doesn't fine one
    //  - it also controls the formatting of the notification and really the entire data flow of the payload through to notification
    const notification = eventParse( eventType, payload );

    if( notification.send ){

        var requestOptions = {
            hostname: 'hooks.slack.com',
            path: notification.url,
            port: 443,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(JSON.stringify(notification))
            }
        };  

        console.log('Event received: '+JSON.stringify(payload));
        console.log('Notification to be sent: '+JSON.stringify(notification))

        var req = https.request(requestOptions, (res) => {
            console.log(`STATUS: ${res.statusCode}`);       
            console.log(`HEADERS: ${JSON.stringify(res.headers)}`);     
            res.setEncoding('utf8');
            res.on('data', (chunk) => {     
                console.log(`BODY: ${chunk}`);      
            });     
            res.on('end', () => {       
                console.log('No more data in response.');       
            });
        });
        
        req.on('error', (e) => {
            console.log(`problem with request: ${e.message}`);
        });
        
        req.write(JSON.stringify(notification));
        req.end();

        res.json(notification);

    }else{

        if( notification.hasOwnProperty('return') ){
            res.status(400).json(notification.return)
        }else{
            res.status(500).json({
                "code": "00001",
                "message": "Something seems to have gone wrong in processing your request."
            })
        }


    }

});

var server = app.listen(3000, function () {
  var port = server.address().port;
  console.log('App listening at port %s', port);
});
module.exports = server;