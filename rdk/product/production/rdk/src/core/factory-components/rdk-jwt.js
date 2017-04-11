'use strict';

var csrf = require('csrf');
var jwt = require('jsonwebtoken');
var _ = require('lodash');

var rdkJWT = {};
var tokens = new csrf();
var publicEndpoints = {};

rdkJWT.addJwtHeader = function(req, res) {
    processCsrfToken(req);
    var jwtToken = getJWTToken(req);
    setJWTToken(res, jwtToken);
};

rdkJWT.enableJwt = function(app) {
    app.use(csrfMiddleware);
};

rdkJWT.updatePublicRoutes = function(app, configItem) {
    if (configItem.bypassCsrf) {
        addRoute(app, configItem);
    }
    return publicEndpoints;
};

function addRoute(app, configItem) {
    var relToMethod = {
        'vha.create': 'POST',
        'vha.read': 'GET',
        'vha.update': 'PUT',
        'vha.delete': 'DELETE'
    };
    var method = relToMethod[configItem.rel];
    var publicMethods = publicEndpoints[method] || [];
    var path = _.isString(configItem.path) ? app.config.rootPath + configItem.path : configItem.path;
    publicMethods.push(path);
    publicEndpoints[method] = publicMethods;
    return publicEndpoints;
}

function checkJwt(req, res, next) {
    var bearer = getBearer(req);
    var session = req.session;
    var jwtSecret = _.result(session, 'jwt.secret', '');
    var jwtToken;

    try {
        jwtToken = jwt.verify(bearer, jwtSecret, {
            subject: session._id
        });
    } catch (ex) {
        return res.status(401).rdkSend({
            error: 'Web Token could not be verified. Log out, clear browser cookies and log in again.'
        });
    }
    if (!tokens.verify(_.result(session, 'csrf.secret', ''), jwtToken.csrf)) {
        return res.status(401).rdkSend({
            error: 'The csrf security token is invalid. Log out, clear browser cookies and log in again.'
        });
    }
    return next();
}

function csrfMiddleware(req, res, next) {
    if (canSkipCSRFCheck(req)) {
        return next();
    }
    return checkJwt(req, res, next);
}

function getBearer(req) {
    var authorization = req.headers.authorization;
    if (!/^Bearer /.test(authorization)) {
        return null;
    }
    return authorization.substring('Bearer '.length);
}

function canSkipCSRFCheck(req) {
    var canSkip = !!_.find(publicEndpoints[req.method], function(path) {
        return path === req.path || (_.isRegExp(path) && path.test(req.path));
    });
    req.logger.trace('JWT: The check %s %s as a public endpoints returns %s', req.method, req.path, canSkip);
    return canSkip;
}

function processCsrfToken(req) {
    req.session.csrf = {secret: tokens.secretSync()};
    req.session.jwt = {secret: tokens.secretSync()};
}

function getJWTToken(req){
    var jwtSecret = req.session.jwt.secret;
    var jwtToken = jwt.sign({
        csrf: tokens.create(req.session.csrf.secret)
    }, jwtSecret, {subject: req.session._id});
    req.logger.trace('JWT has been created as %s', jwtToken);
    return jwtToken;
}

function setJWTToken(res, token) {
    res.set('X-Set-JWT', token);
}

module.exports = rdkJWT;
module.exports._internal = {
    _addRoute: addRoute,
    _checkJwt: checkJwt,
    _csrfMiddleware: csrfMiddleware,
    _getBearer: getBearer,
    _canSkipCSRFCheck: canSkipCSRFCheck,
    _getJWTToken: getJWTToken,
    _processCsrfToken: processCsrfToken
};