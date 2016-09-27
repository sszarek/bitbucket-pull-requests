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
            async.map(repositories, getRepositoryPullRequests, function(err, results) {
                if (err) {
                    return res.send(500, err);
                }

                res.send(results);
                return next();
            });
        }
    };

    function getRepositoryPullRequests(repository, callback) {
        makeRequest(`https://bitbucket.org/api/2.0/repositories/${repository.owner}/${repository.name}/pullrequests?state=OPEN`, function(err, response, body) {
            if (err) {
                return callback(err);
            }

            if (response.statusCode !== 200) {
                return callback(new Error(`Error while requesting pull request. Http status code: ${response.statusCode}`));
            }

            let json = null;
            try {
                json = JSON.parse(body);
            } catch (err) {
                return callback(err);
            }

            callback(null, {
                repository: repository.name,
                pullRequests: json.values.map(function(pullRequest) {
                    return {
                        title: pullRequest.title,
                        link: pullRequest.links.html.href
                    };
                })
            });
        });
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
