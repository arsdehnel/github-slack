const eventParsers = {
    push: function( request ) {
        let returnArray = [];
        returnArray.push({
            title: "Branch",
            value: request.ref.split('/')[2],
            short: false
        })
        if( request.commits.length > 0 ){
            var commitMessages = request.commits.map((commit) => {
                return commit.message
            })            
            returnArray.push({
                title: "Commit Messages",
                value: "-\t"+commitMessages.join('\n-\t'),
                short: false
            })
        }
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

        return returnArray;
    }
};

module.exports = eventParsers;