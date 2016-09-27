'use strict';

module.exports.getRepositories = function getRepositories(req, res, next) {
    res.send('get repositories');
    return next();
};

module.exports.getPullRequests = function getPullRequests(req, res, next) {
    res.send('get pull requests');
    return next();
};