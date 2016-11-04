'use strict';
// user name, organization name, repo name, branch name, time, link to git event, message, event type, files changed?


const express = require('express');
const https = require('https');
var bodyParser = require('body-parser');

// Constants
const PORT = 8080;

const config = {
	"TSG-FED/demo-docs": {
		"url": "<slack endpoint here>",
		"channel": "github-hook-example"
	}
}

// App
const app = express();
app.use(bodyParser.json()); // for parsing application/json

app.post('/event', function (req, res) {

	var notifier = config[req.body.repository.full_name];
	var notification = {
		"channel": notifier.channel
	};

    notification.attachments = [
        {
            "fallback": "GitHub push notification for "+req.body.repository.full_name,
            "color": "#36a64f",
            "pretext": "An event on github.biworldwide.com triggered this notification",
            "author_name": req.body.head_commit.author.name,
            "author_link": "mailto:"+req.body.head_commit.author.email,
            "title": req.body.head_commit.message,
            "title_link": req.body.head_commit.url,
            "fields": [
                {
                    "title": "Author",
                    "value": req.body.head_commit.author.name,
                    "short": false
                }
            ],
            "footer": "BIW CPD GitHub Notifier",
            "footer_icon": "https://avatars2.githubusercontent.com/u/22757997?v=3&s=60",
            "ts": 123456789
        }
    ]

    notification = JSON.stringify(notification);

    var options = {
        hostname: 'hooks.slack.com',
        path: notifier.url,
        port: 443,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(notification)
        }
    };	

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

  	res.json(notifier);

});


app.listen(PORT);
console.log('Running on http://localhost:' + PORT);

    

