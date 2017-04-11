'use strict';

var rdk = require('../../core/rdk');
var util = require('util');
var auditUtil = require('../../utils/audit');
var _ = require('lodash');

var XUPROG_STRING = 'XUPROG';
var XUPROGMODE_STRING = 'XUPROGMODE';
var VISTAKEYS = 'vistaKeys';

/**
 * When accessing VistA, users with XUPROG or XUPROGMODE global keys need to be audited.
 */
module.exports = function(req, res, next) {
    var authInfo = req.session.user;
    initializeRequestAudit(req, authInfo);
    handleProgrammerModeCase(req, authInfo);
    registerEvents(req, res);
    return next();
};

function initializeRequestAudit(req, authInfo) {
    req.audit = {};
    req.audit.remoteHost = req.ip;

    if (_.isObject(authInfo) && _.has(authInfo, 'duz') && _.has(authInfo, 'site')) {
        var authDuz = authInfo.duz;
        var authSite = authInfo.site;
        req.audit.authuser = authDuz;
        req.audit.siteCode = authSite;
        req.audit.authUserId = authDuz[authSite];
    }

    if (_.has(authInfo, 'facility')) {
        req.audit.facility = authInfo.facility;
    }

    if (_.has(authInfo, 'systemName')) {
        req.audit.authUserId = authInfo.systemName;
    }

    req.audit.request = util.format('%s %s HTTP/%s', req.method, req.originalUrl, req.httpVersion);
    req.audit.patientId = req.query.pid;
    req.audit.sensitive = 'false';
}

function handleProgrammerModeCase(req, authInfo) {
    if (!existVistaKeys(authInfo)) {
        return;
    }

    var xuprogIndex = authInfo.vistaKeys.indexOf(XUPROG_STRING);
    var xuprogModeIndex = authInfo.vistaKeys.indexOf(XUPROGMODE_STRING);

    if (xuprogIndex !== -1 && xuprogIndex !== xuprogModeIndex) {
        auditUtil.addAdditionalMessage(req, VISTAKEYS, XUPROG_STRING);
    }

    // Appends to additional messages if programmer mode is found
    if (xuprogModeIndex !== -1) {
        auditUtil.addAdditionalMessage(req, VISTAKEYS, XUPROGMODE_STRING);
    }
}

function existVistaKeys(authInfo) {
    return !_.isUndefined(authInfo) && !_.isUndefined(authInfo.vistaKeys);
}

function registerEvents(req, res) {
    res.on('finish', onFinish);

    res.on('close', onClose);

    res.on('timeout', function onTimeout(err) {
        req.logger.error(err, 'response timeout when calling middleware');
        return res.status(rdk.httpstatus.internal_server_error).rdkSend('There was an error processing your request. The error has been logged.');
    });

    function onFinish() {
        finalizeAudit();
    }

    function onClose() {
        finalizeAudit();
    }

    function finalizeAudit() {
        req.audit.status = res.statusCode;
        res.removeListener('finish', onFinish);
        res.removeListener('close', onClose);

        req.app.auditer.save(req.audit);
    }
}
