# GitHub Slack Notifier

This is a pretty simple app that receives github event payloads and translates them into a Slack notification.

## Data Flow

Nothing too fancy here.  First you'd setup your github repo to push to `githooks.biw-labs.com/event`.  Then all your events (or the ones you noted anyway) get pushed to that application. For each event that comes to the application we go through a series of checks to see how we should handle it:

1. Lookup the git org to see if it's been configured with a Slack URL.  If it hasn't we return 

```json
{
    "code": "00003",
    "message": "No configuration found for this event (org: ${notification.org}, repo: ${notification.repo}, branch: ${notification.branch}, eventType: ${eventType})"
}
```

2. Assuming we find the org then we go through our custom parsers to find one very specifically setup for the combination of incoming org, repo and branch.  
3. If that doesn't match then we broaden a bit and look for a match on just org and repo.
4. If that doesn't match then we broaden once more to just an org parser.
5. If that doesn't match then we use the default parser. Note: if any of the above find a match but fail for some reason we will _not_ go through to other options.
6. The parser's job is to take the event type and payload information and process it into a message that can be sent to Slack's API.  The parser can also perform the checks that may result in no message being sent with more granular controls than GitHub allows (branch names, specific users, etc).

## Custom Parsers

This application was built to handle custom parsers at multiple levels (see Data Flow section above) so that each team can determine it's own messaging needs.  The parsers just need to follow a few basic inputs and outputs to interact properly with the application.

### Directory Structures

Inside the `/app` directory there is an `/event-parsers` directory.  Everything within this directory is meant to handle the same input and output parameters and will be pulled in as needed to meet the users needs.  The subdirectories are to group the "level" of granularity at which the parser has been specified:

1. `org-repo-branch` for parsers specific to a branch of a repo for an org.
2. `org-repo` for parsers specific to just a repo of an org. Please note these **can** have branch-specific logic in them still, it just is receiving events for _all_ branches and would need to have that logic within the parser.
3. `org` for parsers that handle everything for a given repo. Same note applies here except at a broader level.  

### Naming

To keep things consistent the naming convention for the files themselves should match the org name, org-repo name or org-repo-branch name (after being put through a `.toLowerCase()`).  Underscores are fine.  Spaces are not (but orgs, repos and branches shouldn't have those anyway since git doesn't like that).  Between org and repo and between repo and branch we should have a double hyphen.  So a parser for the org `TSG-Product-Development` for the repo `penta-g` and the branch `G6-Noms` that has a custom parser would be put in the `/app/event-parsers/org-repo-branch` directory and be named `tsg-product-development--penta-g--g6-noms.js`.

### File Details

The code inside the parser file doesn't matter too much aside from needing to export an object with properties (or class with methods for you ES6 kids out there) for whatever eventTypes it's meant to handle.

### Inputs

For each parser the inputs will be the `notification` object and the event `payload`.  The `notification` object contains some default values to (try to) make sure we have the required values before we send to Slack.  Here is that current set of defaults:

```javascript
const defaults = {
    channel: "#github-webhook",
    username: "biw-github-bot",
    icon_emoji: ":bulb:",
    mrkdwn: true,
    fields: [],
    send: false
}
```

This `notification` object should be appended to and/or modified as needed and then returned back to the master parser for usage as the outgoing request to Slack.  The `send` boolean defaults to `false` which means that this application will not send that request off to Slack unless something in the parser changes that boolean to `true`.  This is the job of the parser and will not be done within the application core.

The event `payload` can differ a fair amount depending on which GitHub event we're processing so detailing that is outside the scope of this readme but can be found here: [https://developer.github.com/v3/activity/events/types/](https://developer.github.com/v3/activity/events/types/).

### Processing and Message Details

Basically at this point the parser can take in that `notification` and `payload` and do whatever they want with it.  Documentation on what exactly can be achieved with Slack messages can be found on the [Slack API Docs](https://api.slack.com). You can also refer to the `/app/event-parsers/**/*` files of this repo for ideas or further details.

### Return Object

Really the return object should be the original incoming `notification` object with adjustments being made and specifically the `send` boolean being set appropriately.  If there is an error or message that should be returned please use the `return` key of the `notification` object and assign that an object that has `code` and `message` keys.  This will be passed back to github for reporting in the admin panel of the appropriate repo.

