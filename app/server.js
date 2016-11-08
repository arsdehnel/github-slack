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
                value: request.head_commit.added.join('<br>'),
                short: false
            });
        }
        if( request.head_commit.modified.length > 0 ){
            returnArray.push({
                title: "Files modified",
                value: request.head_commit.modified.join('<br>'),
                short: false
            });
        }
        if( request.head_commit.removed.length > 0 ){
            returnArray.push({
                title: "Files removed",
                value: request.head_commit.removed.join('<br>'),
                short: false
            });
        }
        if( request.commits.length > 0 ){
            var commitMessages = request.commits.map((commit) => {
                return commit.message
            })            
            returnArray.push({
                "title": "Commit Messages",
                "value": commitMessages.join('<br>'),
                "short": false
            })
        }

        return returnArray;
    }
}

const app = express();
app.use(bodyParser.json());

var notification = Object.assign({},defaults, dataStore[req.body.repository.full_name]);

app.post('/event', function (req, res) {

    var eventType = req.headers['x-github-event'];

    if( eventParsers[eventType] ){
        notification.fields = eventParsers[eventType](req.body);
    }

    console.log(JSON.stringify(req.body.head_commit));

    notification.fields.push({
        "title": "GitHub Event",
        "value": eventType,
        "short": false
    })

    notification.attachments = [
        {
            "fallback": `GitHub ${eventType} notification for ${req.body.repository.full_name}`,
            "color": "#36a64f",
            "pretext": `A _*${eventType}*_ event on <${req.body.repository.html_url}|${req.body.repository.full_name}> triggered this notification`,
            "author_name": req.body.head_commit.author.name,
            "author_link": req.body.sender.html_url,
            "title": req.body.head_commit.message,
            "title_link": req.body.head_commit.url,
            "fields": notification.fields,
            "footer": "BIW CPD GitHub Notifier",
            "footer_icon": "https://avatars2.githubusercontent.com/u/22757997?v=3&s=60",
            "ts": req.body.repository.pushed_at
        }
    ]

    notification = JSON.stringify(notification);

    var options = {
        hostname: 'hooks.slack.com',
        path: notification.url,
        port: 443,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(notification)
        }
    };  

    console.log(notification);

    var req = https.request(options, (res) => {
        console.log(options);       
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
    
    req.write(notification);
    req.end();

    res.json(notification);

});


app.listen(PORT);
console.log('Running on http://localhost:' + PORT);

    

