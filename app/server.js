'use strict';

const express = require('express');
const https = require('https');
var bodyParser = require('body-parser');

const PORT = 8080;

const teams = {
    "pdev": {
        url: "/services/T18CYMQSU/B2YB01JSF/jQJx96Q0UO1ieGbwVpH2OvR3"
    }
}

const defaults = {
    url: teams.pdev.url,
    channel: "#github-hook-example",
    username: "biw-cpd-github-bot",
    icon_emoji: ":bulb:",
    mrkdwn: true,
    fields: []
}

const dataStore = {
    "TSG-FED/demo-docs": {
        url: teams.pdev.url
    },
    "TSG-Product-Development/penta-g": {
        url: teams.pdev.url,
        _channel: "#g6-dev"  
    },
    "goalquest/goalquest": {
        url: teams.pdev.url,
        _channel: "#gq-builds"
    }
}

const eventParsers = {
    push: function( request ) {
        let returnArray = [];
        if( request.head_commit.added.length > 0 ){
            returnArray.push({
                title: "Files added",
                value: "-\t"+request.head_commit.added.join('\n-\t'),
                short: false
            });
        }
        if( request.head_commit.modified.length > 0 ){
            returnArray.push({
                title: "Files modified",
                value: "-\t"+request.head_commit.modified.join('\n-\t'),
                short: false
            });
        }
        if( request.head_commit.removed.length > 0 ){
            returnArray.push({
                title: "Files removed",
                value: "-\t"+request.head_commit.removed.join('\n-\t'),
                short: false
            });
        }
        if( request.commits.length > 0 ){
            var commitMessages = request.commits.map((commit) => {
                return commit.message
            })            
            returnArray.push({
                "title": "Commit Messages",
                "value": "-\t"+commitMessages.join('\n-\t'),
                "short": false
            })
        }

        return returnArray;
    }
}

const app = express();

function errorHandler (err, req, res, next) {
  res.status(500)
  res.render('error', { error: err })
}

app.use(bodyParser.json());
app.use(errorHandler)

app.post('/event', function (req, res, next) {

    var eventType = req.headers['x-github-event'];
    var notification = Object.assign({},defaults, dataStore[req.body.repository.full_name]);
    var payload = req.body;

    if( eventParsers[eventType] ){
        notification.fields = eventParsers[eventType](req.body);
    }

    if( !req.body.head_commit.author ){
        console.log('------------------------------------------------------');
        console.log('No head commit');
        // console.log(req.body);
        res.status(400).send('Need head_commit!').end();
        return {};
    }

    notification.attachments = [{
        "fallback": `GitHub ${eventType} notification for ${req.body.repository.full_name}`,
        "color": "#36a64f",
        "pretext": `A *${eventType}* event on <${req.body.repository.html_url}|${req.body.repository.full_name}> triggered this notification`,
        "author_name": payload.head_commit.author.name,
        "author_link": payload.sender.html_url,
        "title": payload.head_commit.message,
        "title_link": payload.head_commit.url,
        "fields": notification.fields,
        "footer": "BIW CPD GitHub Notifier",
        "footer_icon": "https://avatars2.githubusercontent.com/u/22757997?v=3&s=60",
        "ts": payload.repository.pushed_at,
        "mrkdwn_in": ["pretext"]
    }];

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

});

var server = app.listen(3000, function () {
  var port = server.address().port;
  console.log('Example app listening at port %s', port);
});
module.exports = server;