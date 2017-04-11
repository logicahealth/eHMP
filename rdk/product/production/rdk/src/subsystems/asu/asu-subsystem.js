'use strict';

var _ = require('lodash');
var url = require('url');
var asuProcess = require('./asu-process');
var rdk = require('../../core/rdk');
var nullchecker = rdk.utils.nullchecker;

function evaluateProcessor(req, res, next) {
    var logger = req.logger;
    logger.debug('asu-subsystem.evaluateProcessor: Got to evaluate processor');
    var jsonParams = req.body;
    var httpConfig = _.clone(req.app.config.asu.evaluateRuleService);
    var baseUrl = url.parse(req.app.config.vxSyncServer.baseUrl);
    baseUrl.port = httpConfig.port;
    //baseUrl.port = '8888';
    httpConfig.baseUrl = url.format(baseUrl);
    asuProcess.evaluate(jsonParams, req.app.config, httpConfig, res, logger);
}

function evaluateWithActionNames(req, res, next) {
    var logger = req.app.logger;
    var jsonParams = req.body;
    logger.debug('asu-subsystem.evaluateWithActionNames: jsonParams %j ', jsonParams);

    asuProcess.getAsuPermissionForActionNames(req, jsonParams, function (asuError, asuResult) {
        if (!nullchecker.isNullish(asuError) || _.isNull(asuResult)) {
            req.logger.error('asu-subsystem.evaluateWithActionNames: Error %j ', asuError);
            return res.status(500).rdkSend(asuError);
        }
        logger.debug('asu-subsystem.evaluateWithActionNames: permissions %j ', asuResult);
        return res.status(res.statusCode).rdkSend(asuResult);
    });
}


function testProcessor(req, res, next) {
    req.app.logger.info('Inside mocked asu rules endpoint');
    res.rdkSend({
        isAuthorized: true
    });
}

function getSubsystemConfig() {
    return {
        healthcheck: function () {
            return true;
        }
    };
}

module.exports.getSubsystemConfig = getSubsystemConfig;
module.exports.evaluate = evaluateProcessor;
module.exports.test = testProcessor;
module.exports.evaluateWithActionNames = evaluateWithActionNames;

