'use strict';

var _ = require('lodash');
var getDefaultImmediateCollectTime = require('./lab-default-immediate-collect-time').getDefaultImmediateCollectTime;
var getLabCollectTimes = require('./lab-collect-times').getLabCollectTimes;
var isValidImmediateCollectTime = require('./lab-valid-immediate-collect-time').isValidImmediateCollectTime;
var getFutureLabCollects = require('./lab-future-lab-collects').getFutureLabCollects;
var getDiscontinueReason = require('./lab-discontinue-reason').getDiscontinueReason;
var nullUtil = require('../../../core/null-utils');

module.exports.getResourceConfig = function(app) {
    return [{
        name: 'lab-support-data',
        path: '',
        interceptors: {
            operationalDataCheck: true,
            synchronize: true
        },
        requiredPermissions: [],  // TODO set permissions. See https://wiki.vistacore.us/display/VACORE/Writeback+Edition+Permissions
        isPatientCentric: false,
        get: fetchSupportData
    }];
};

/**
 * Retrieve lab order support data from VistA
 * Based on input type, different RPC is invoked.
 * Parsed RPC response is returned.
 */
function fetchSupportData(req, res) {
    var log = req.app.logger;
    var type = req.param('type');
    var site = req.param('site');

    if (nullUtil.isNullish(type) || _.isEmpty(type)) {
        res.status(500).rdkSend('Parameter \'type\' cannot be null or empty');
        return;
    }
    if (nullUtil.isNullish(site) || _.isEmpty(site)) {
        res.status(500).rdkSend('Parameter \'site\' cannot be null or empty');
        return;
    }
    site = site.toUpperCase();
    type = type.toLowerCase();

    var configuration = _.extend({}, req.app.config.vistaSites[site], {
        context: 'OR CPRS GUI CHART',
        accessCode: req.session.user.accessCode,
        verifyCode: req.session.user.verifyCode
    });

    var serverSend = function(error, json) {
        if (error) {
            res.status(500).rdkSend(error);
        }
        else {
            res.status(200).rdkSend(json);
        }
    };

    if (type.toLowerCase() === 'lab-default-immediate-collect-time'){
        getDefaultImmediateCollectTime(log,configuration, serverSend);
        return;
    }
    if (type.toLowerCase() === 'lab-collect-times'){
        getLabCollectTimes(log,configuration, req.param('dateSelected'), req.param('location'), serverSend);
        return;
    }
    if (type.toLowerCase() === 'lab-valid-immediate-collect-time'){
        isValidImmediateCollectTime(log,configuration, req.param('timestamp'), serverSend);
        return;
    }
    if (type.toLowerCase() === 'lab-future-lab-collects') {
        getFutureLabCollects(log, configuration, req.param('location'), serverSend);
        return;
    }
    if (type.toLowerCase() === 'discontinue-reason') {
        getDiscontinueReason(log, configuration, serverSend);
        return;
    }
    serverSend('Not yet implemented');
    return;
}
