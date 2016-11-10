/*******************************************
  This is the "master" event parser that is called from the express route and handles:
    - getting config data
    - creating the base notification object
    - finding the appropriate child parser searching in the following order:
      - org/repo/branch
      - org/repo
      - org
      - default
    - passing the results of that parser back to the express route for delivery

    INPUTS: 
    - eventType: the event type that is passed in from github (ie push, commit, etc)
    - payload: this is the entire github hook payload

    OUTPUT:
    - object that will be sent to Slack for delivery 
      OR
    - false to indicate there should be no notification sent for this message

********************************************/
const getConfig         = require('./config');
const defaultParser     = require('./event-parsers/default')
const orgParsers        = require('./event-parsers/org');

const defaults = {
    channel: "#github-hook-example",
    username: "biw-github-bot",
    icon_emoji: ":bulb:",
    mrkdwn: true,
    fields: [],
    send: false
}

function eventParse( eventType, payload ) {

    if( !eventType ){
        return {
            send: false,
            return: {
                code: "00005",
                message: `No event type in the headers`
            }
        };
    }
    if( !payload.repository ){
        return {
            send: false,
            return: {
                code: "00004",
                message: `No repository key in the payload`                
            }
        };
    }

    const config = getConfig( payload.repository.full_name, payload );
    let notification = Object.assign({},defaults, config);

    /***************************************
       CONFIG
     ***************************************/
    if( !config ){
        notification.return = {
            code: "00003",
            message: `No configuration found for this event (org: ${notification.org}, repo: ${notification.repo}, branch: ${notification.branch}, eventType: ${eventType})`
        }
        return notification;
    }

    /***************************************
       ORG-REPO-BRANCH
     ***************************************/

    /***************************************
       ORG-REPO
     ***************************************/

    /***************************************
       ORG
     ***************************************/
    if( orgParsers[config.org] && orgParsers[config.org][eventType] ){
        notification = orgParsers[config.org][eventType]( notification, payload );
        return notification;
    }

    /***************************************
       DEFAULT
     ***************************************/
    if( defaultParser[eventType] ){
        notification = defaultParser[eventType]( notification, payload );
        return notification;
    }else{
        notification.return = {
            code: "00002",
            message: `No parser found for this event (org: ${notification.org}, repo: ${notification.repo}, branch: ${notification.branch}, eventType: ${eventType})`
        };
        return notification;        
    }

}

module.exports = eventParse;