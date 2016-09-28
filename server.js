'use strict';

const restify = require('restify');
const bunyan = require('bunyan');
const logger = bunyan.createLogger({
    name: 'server',
    stream: process.stdout
});
const configuration = require('./config.js');
const bitbucket = require('./src/bitbucket.js')(configuration.BITBUCKET_CREDENTIALS, configuration.REPOSITORIES);

const server = restify.createServer();
server.get('/repositories', function getRepositoriesHandler(req, res, next) {
    bitbucket.getRepositories((err, repositories) => {
        if (err) {
            logger.error(err);
            return next(new restify.errors.InternalServerError(err.message));
        }

        res.send(repositories);
        return next();
    });
});
server.get('/pull-requests', function pullRequestsHandler(req, res, next) {
    bitbucket.getPullRequests((err, pullRequests) => {
        if (err) {
            logger.error(err);
            return next(new restify.errors.InternalServerError(err.message));
        }

        res.send(pullRequests);
        return next();
    });
});

server.on('after', restify.auditLogger({
    log: bunyan.createLogger({
        name: 'audit',
        stream: process.stdout
    })
}));

server.listen(configuration.PORT, () => {
    logger.info(`🌎 Server is listening on port ${configuration.PORT}`);
});