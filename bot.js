'use strict';

const async = require('async');
const request = require('request');
const bunyan = require('bunyan');
const logger = bunyan.createLogger({
    name: 'slack-bot',
    stream: process.stdout
});
const configuration = require('./config.js');
const bitbucket = require('./src/bitbucket.js')(configuration.BITBUCKET_CREDENTIALS, configuration.REPOSITORIES);
const webhookUrl = configuration.SLACK.WEBHOOK_URL;
const channel = configuration.SLACK.CHANNEL;
const updateInterval = configuration.UPDATE_INTERVAL_SECS * 1000;

function getPullRequests(callback) {
    logger.info('getPullRequests');
    bitbucket.getPullRequests(callback);            
}

function sendPullRequests(results, callback) {
    const pullRequests = results.getPullRequests;
    logger.info('sendPullRequests', pullRequests);

    if (pullRequests.length === 0) {
        return callback(null);
    }

    async.each(pullRequests, function(pullRequestsForRepository, cb) {
        const payload = {
            channel: channel,
            text: `${pullRequestsForRepository.repository} has ${pullRequestsForRepository.pullRequests.length} waiting pull request(s)`,
            attachments: pullRequestsForRepository.pullRequests.map(pr => {
                return {
                    title: pr.title,
                    title_link: pr.link,
                    color: 'warning'
                };
            })
        };

        request.post({
            url: webhookUrl,
            json: payload
        }, function(err, response) {
            if (err) {
                return cb(err);
            }

            if (response.statusCode !== 200) {
                logger.error(response);
                return cb(new Error('Error while sending message to the channel'));
            }

            cb(null);
        }, callback);
    });
}

function wait(results, callback) {
    setTimeout(callback, updateInterval);
}

logger.info('Starting bitbucket polling...', configuration.REPOSITORIES);
async.forever(function(next) {
    async.auto({
        getPullRequests: getPullRequests,
        sendPullRequests: ['getPullRequests', sendPullRequests],
        wait: ['sendPullRequests', wait] 
    }, next);
}, function(err) {
    logger.error('Error occured while refreshing', err);
    return process.exit(1);
});
