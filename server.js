'use strict';

const restify = require('restify');
const configuration = require('./config.js');
const bitbucket = require('./src/bitbucket.js')(configuration.BITBUCKET_CREDENTIALS, configuration.REPOSITORIES);

const server = restify.createServer();
server.get('/repositories', function getRepositoriesHandler(req, res, next) {
    bitbucket.getRepositories((err, repositories) => {
        if (err) {
            return next(new restify.errors.InternalServerError(err));
        }

        res.send(repositories);
        return next();
    });
});
server.get('/pull-requests', function pullRequestsHandler(req, res, next) {
    bitbucket.getPullRequests((err, pullRequests) => {
        if (err) {
            return next(new restify.errors.InternalServerError(err));
        }

        res.send(pullRequests);
        return next();
    });
});

server.listen(configuration.PORT, () => {
    console.log(`🌎 Server is listening on port ${configuration.PORT}`);
});