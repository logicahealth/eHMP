'use strict';

var rdk = require('../../core/rdk');
var pjds = rdk.utils.pjdsStore;
var _ = require('lodash');

module.exports = setEhmpUserPreferences;

function setEhmpUserPreferences(req, res) {
    req.logger.trace('setEhmpUserPreferences resource called');

    var preferences = _.get(req, 'body.preferences', {});
    var origPreferences = _.get(req, 'session.user.preferences', {});
    req.session.user.preferences = preferences;

    var uid = _.get(req, 'session.user.uid');
    if (_.isEmpty(uid)) {
        return res.status(rdk.httpstatus.internal_server_error).rdkSend('Missing required User Session uid');
    }

    var pjdsOptions = {
        store: 'ehmpusers',
        key: uid
    };

    pjds.get(req, res, pjdsOptions, function(error, response) {
        if (error) {
            req.session.user.preferences = origPreferences;
            return res.status(rdk.httpstatus.bad_request).rdkSend(error.message);
        }

        if (!_.result(response, 'data')) {
            req.session.user.preferences = origPreferences;
            return res.status(rdk.httpstatus.internal_server_error).rdkSend('Not found a matching data from ehmpusers');
        }

        pjdsOptions.data = response.data;
        pjdsOptions.data.preferences = preferences;
        pjds.put(req, res, pjdsOptions, function(error, response) {
            if (error) {
                req.session.user.preferences = origPreferences;
                res.status(rdk.httpstatus.bad_request).rdkSend(error.message);
            } else {
                var resultObj = {
                    message: 'Success',
                    status: _.result(response, 'statusCode.val')
                };
                res.status(rdk.httpstatus.ok).rdkSend(resultObj);
            }
        });
    });
}
