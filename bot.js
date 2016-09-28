'use strict';

const RtmClient = require('@slack/client').RtmClient;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const configuration = require('./config.js');
const bitbucket = require('./src/bitbucket.js')(configuration.BITBUCKET_CREDENTIALS, configuration.REPOSITORIES);

const token = configuration.SLACK_API_TOKEN || '';

const rtm = new RtmClient(token, {logLevel: 'warning'});
rtm.start();
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
    console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});

rtm.on(RTM_EVENTS.MESSAGE, function(message) {
    const user = rtm.dataStore.getUserById(message.user);
    const dm = rtm.dataStore.getDMByName(user.name);

    bitbucket.getPullRequests(function(err, results) {
        if (err) {
            return console.log(err);
        }

        if (results.length > 0) {
            rtm.sendMessage('Pull requests waiting!!', dm.id);
            results.forEach(pullRequest => {
                rtm.sendMessage(`${pullRequest.repository} has ${pullRequest.pullRequests.length} pull request(s) waiting`, dm.id);
            });
        } else {
            rtm.sendMessage('Yay! No waiting pull requests!', dm.id);
        }
    });
});