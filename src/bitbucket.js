'use strict';

const request = require('request');
const async = require('async');

module.exports = function bitbucketFactory(credentials, repositories) {
    const authHeader = 'Basic ' + new Buffer(`${credentials.LOGIN}:${credentials.PASSWORD}`).toString('base64');
    repositories = repositories || [];

    return {
        getRepositories(req, res, next) {
            res.send(repositories);
            return next();
        },

        getPullRequests(req, res, next) {
            getRepositoryPullRequests(repositories[0], function(err, r, body) {
                if (err) {
                    return next(err);
                }

                let json = null;
                try {
                    json = JSON.parse(body);
                } catch (err) {
                    return next(err);
                }

                const response = json.values.map(function(pullRequest) {
                    return {
                        title: pullRequest.title,
                        link: pullRequest.links.html.href
                    };
                });
                res.send(response);
                return next();        
            });
        }
    };

    function getRepositoryPullRequests(repository, callback) {
        makeRequest(`https://bitbucket.org/api/2.0/repositories/${repository.owner}/${repository.name}/pullrequests?state=OPEN`, callback);
    }

    function makeRequest(url, callback) {
        return request({
            url: url,
            method: 'GET',
            headers: {
                'Authorization': authHeader
            }
        }, callback);
    }
};
