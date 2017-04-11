'use strict';
var _ = require('lodash');
var moment = require('moment');

function isNamedResource(req, regex) {
    var authenticateResourceRegex = regex || /^authentication-(.*)$/;
    return (authenticateResourceRegex.test(req._resourceConfigItem.title) && req._resourceConfigItem.rel === 'vha.create');
}

function isAuthenticationResource(req) {
    var authenticateResourceRegex = /^authentication-(.*)$/;
    return isNamedResource(req, authenticateResourceRegex);
}

function isLoginResource(req) {
    var userLoginRegex = /^authentication(.*)authenticat(e|ion)$/;
    return isNamedResource(req, userLoginRegex);
}

function isSystemLoginResource(req) {
    var authenticateResourceRegex = /^authentication-(internal|external)-systems-authenticate$/;
    return isNamedResource(req, authenticateResourceRegex);
}

function hasValidSession(req) {
    return _.has(req, 'session.user.consumerType');
}

function isInterceptorEnabled(req) {
    //authentication should generally be enabled
    //ie. disabled is false and bit flipped to be true
    return !_.get(req, 'app.config.interceptors.authentication.disabled', false);
}

function isInterceptorReadOnly(req) {
    //this configuration option used to be used to overcome a
    //shortfall in transitioning from r1.2 to r1.3
    //it could be used to make the entire system read only (read-access)
    //as it no longer serves a purpose
    return _.get(req, 'app.config.interceptors.authentication.readOnly', false);
}

function auditLoginResult(req, error) {
    //Adding to RDK audit.log
    if (error) {
        req.audit.error = error;
        req.audit.msg = 'Unsuccessful Login';
        req.audit.status = _.get(error, 'status', '');
        req.audit.lastUnsuccessfulLogin = moment(_.get(req, 'session.expires')).utc().format();
    } else {
        req.audit.lastSuccessfulLogin = moment(_.get(req, 'session.expires')).utc().format();
        req.audit.msg = 'Successful Login';
        req.audit.status = req.statusCode;
    }
}

module.exports = {
    hasValidSession: hasValidSession,
    isLoginResource: isLoginResource,
    auditLoginResult: auditLoginResult,
    isNamedResource: isNamedResource,
    isAuthenticationResource: isAuthenticationResource,
    isInterceptorEnabled: isInterceptorEnabled,
    isInterceptorReadOnly: isInterceptorReadOnly,
    isSystemLoginResource: isSystemLoginResource
};
