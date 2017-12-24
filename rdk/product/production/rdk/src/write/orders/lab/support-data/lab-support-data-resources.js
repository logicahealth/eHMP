'use strict';

var _ = require('lodash');
var getDefaultImmediateCollectTime = require('./lab-default-immediate-collect-time').getDefaultImmediateCollectTime;
var getLabCollectTimes = require('./lab-collect-times').getLabCollectTimes;
var isValidImmediateCollectTime = require('./lab-valid-immediate-collect-time').isValidImmediateCollectTime;
var getFutureLabCollects = require('./lab-future-lab-collects').getFutureLabCollects;
var getDiscontinueReason = require('./lab-discontinue-reason').getDiscontinueReason;
var getLabSpecimens = require('./lab-specimens').getLabSpecimens;
var getCurrentTime = require('./lab-current-time').getCurrentTime;
var nullUtil = require('../../../core/null-utils');

module.exports.getResourceConfig = function(app) {
    return [{
        name: 'lab-support-data',
        path: '',
        interceptors: {
            operationalDataCheck: true,
            synchronize: false
        },
        requiredPermissions: ['read-patient-record'],
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
    var log = req.logger;
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
        verifyCode: req.session.user.verifyCode,
        // RDK configs have site division arrays. RPCs have a configuration property of the same name. Setting
        // to null otherwise the RPC calls will attempt to set division context to it (an Array) and fail.
        division: null
    });

    var serverSend = function(error, json) {
        if (error) {
            return res.status(500).rdkSend(error);
        }
        return res.status(200).rdkSend(json);
    };

    switch (type) {
        case 'lab-default-immediate-collect-time':
            getDefaultImmediateCollectTime(log, configuration, serverSend);
            break;
        case 'lab-collect-times':
            // pass the logged user's division so the validation is done for the correct division
            getLabCollectTimes(log, configuration, req.param('dateSelected'), req.param('location'), req.session.user.division, serverSend);
            break;
        case 'lab-valid-immediate-collect-time':
            // pass the logged user's division so the validation is done for the correct division
            isValidImmediateCollectTime(log, configuration, req.param('timestamp'), req.session.user.division, serverSend);
            break;
        case 'lab-future-lab-collects':
            // pass the logged user's division to get the values for the correct division
            getFutureLabCollects(log, configuration, req.param('location'), req.session.user.division, serverSend);
            break;
        case 'discontinue-reason':
            getDiscontinueReason(log, configuration, serverSend);
            break;
        case 'lab-specimens':
            getLabSpecimens(log, configuration, serverSend);
            break;
        case 'lab-current-time':
            getCurrentTime(log, configuration, serverSend);
            break;
        default:
            serverSend('Not yet implemented');
    }
}
