'use strict';

var _ = require('lodash');
var rdk = require('../../core/rdk');
var RdkError = rdk.utils.RdkError;

module.exports.getResourceConfig = getResourceConfig;
module.exports._postTracker = postTracker;

function getResourceConfig(app) {
    return [{
        name: 'tracker',
        path: '',
        post: postTracker,
        isPatientCentric: false,
        requiredPermissions: [],
    }];
}

function extractTrackerInformation(body) {
    return _.pick(body, [
        'screenName',
        'hash',
        'hostname',
        'url',
        'appCodeName',
        'appName',
        'appVersion',
        'platform',
        'ehmp_app_version',
        'facility',
        'duz',
        'site',
        'title',
        'pid',
        'icn',
        'history',
        'historyTimes'
    ]);
}

function logTrackerInfoToRdk(req) {
    req.logger.info({
        tracker: extractTrackerInformation(req.body)
    });
}

function postTracker(req, res) {
    if (!req.app.config.UAtracker.baseUrl) {
        logTrackerInfoToRdk(req);
        return res.status(200).rdkSend({
            status: 200
        });
    }
    var options = _.extend({}, req.app.config.UAtracker, {
        logger: req.logger,
        body: extractTrackerInformation(req.body)
    });
    rdk.utils.http.post(options, function(error, response, body) {
        if (error) {
            logTrackerInfoToRdk(req);
            req.logger.error({
                    error: error
                },
                'Could not save tracker information to external server');
            var rdkError = new RdkError({
                'code': 'rdk.500.1006'
            });
            return res.status(rdkError.status).rdkSend(rdkError);
        }
        return res.status(response.statusCode).rdkSend({
            status: response.statusCode
        });
    });
}
