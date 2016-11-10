const eventParsers = {

    push: function( notification, payload ) {

        notification.attachments = [{
            fallback: `GitHub push on the ${payload.ref.split('/')[2]} branch in ${payload.repository.full_name}`,
            color: "#36a64f",
            pretext: `A *push* on the <${payload.repository.branches_url.split('{')[0]}/${payload.ref.split('/')[2]}|${payload.ref.split('/')[2]}> branch in <${payload.repository.html_url}|${payload.repository.full_name}> triggered this notification`,
            author_name: payload.head_commit.author.name,
            author_link: payload.sender.html_url,
            title: payload.head_commit.message,
            title_link: payload.head_commit.url,
            fields: [],
            footer: "BIW GitHub Notifier",
            footer_icon: "https://avatars2.githubusercontent.com/u/22757997?v=3&s=60",
            ts: payload.repository.pushed_at,
            mrkdwn_in: ["pretext"]
        }];

        if( payload.commits.length > 0 ){
            var commitMessages = payload.commits.map((commit) => {
                return commit.message
            })            
            notification.attachments[0].fields.push({
                title: "Commit Messages",
                value: "-\t"+commitMessages.join('\n-\t'),
                short: false
            })
        }

        notification.channel = '#gq-dev';

        notification.send = true;

        return notification;
    }
};

module.exports = eventParsers;