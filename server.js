'use strict';

const restify = require('restify');
const configuration = require('./config.js');
const bitbucket = require('./src/bitbucket.js');

const server = restify.createServer();
server.get('/repositories', bitbucket.getRepositories);
server.get('/pull-requests', bitbucket.getPullRequests);

server.listen(configuration.PORT, () => {
    console.log(`Server is listening on port ${configuration.PORT}`);
});