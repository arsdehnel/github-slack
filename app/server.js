'use strict';

// user name, organization name, repo name, branch name, time, link to git event, message, event type, files changed?

const express = require('express');
const https = require('https');
var bodyParser = require('body-parser');

const PORT = 8080;

const teams = {
    "pdev": {
        "url": "/services/T18CYMQSU/B2YB01JSF/jQJx96Q0UO1ieGbwVpH2OvR3"
    }
}

const config = {
	"TSG-FED/demo-docs": {
		"url": teams.pdev.url,
		"channel": "#github-hook-example"
	},
    "TSG-Product-Development/penta-g": {
        "url": teams.pdev.url,
        "channel": "#g6-dev"  
    },
    "goalquest/goalquest": {
        "url": teams.pdev.url,
        "channel": "#gq-builds"
    }
}

const app = express();
app.use(bodyParser.json());

app.post('/event', function (req, res) {

	var notifier = config[req.body.repository.full_name];
	// var notification = {
	// 	"channel": notifier.channel
	// };
    //     "username": "ghost-bot",
    // "icon_emoji": ":ghost:",
    var notification = {};

    var fileChanges = {
        "added": [],
        "removed": [],
        "modified": []
    }

    var commitMessages = req.body.commits.map((commit) => {
        return commit.message
    })

    console.log(commitMessages);

    notification.attachments = [
        {
            "fallback": "GitHub push notification for "+req.body.repository.full_name,
            "color": "#36a64f",
            "pretext": "A _*"+req.headers['X-GitHub-Event']+"*_ event on <"+req.body.repository.html_url+"|"+req.body.repository.full_name+"> triggered this notification",
            "author_name": req.body.head_commit.author.name,
            "author_link": req.body.sender.html_url,
            "title": req.body.head_commit.message,
            "title_link": req.body.head_commit.url,
            "fields": [
                {
                    "title": "Event type",
                    "value": req.headers['X-GitHub-Event'],
                    "short": false
                },
                {
                    "title": "Files added",
                    "value": req.body.head_commit.added.join(','),
                    "short": false
                },
                {
                    "title": "Files removed",
                    "value": req.body.head_commit.removed.join(','),
                    "short": false
                },
                {
                    "title": "Files modified",
                    "value": req.body.head_commit.modified.join(','),
                    "short": false
                },
                {
                    "title": "Commit Messages",
                    "value": commitMessages.join(','),
                    "short": false
                }
            ],
            "footer": "BIW CPD GitHub Notifier",
            "footer_icon": "https://avatars2.githubusercontent.com/u/22757997?v=3&s=60",
            "ts": req.body.repository.pushed_at
        }
    ]

    notification = JSON.stringify(notification);

    var options = {
        hostname: 'hooks.slack.com',
        path: notifier.url,
        port: 443,
        method: 'POST',
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

    

