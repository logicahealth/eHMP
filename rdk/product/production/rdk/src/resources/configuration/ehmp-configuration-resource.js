'use strict';
var _ = require('lodash');
var rdk = require('../../core/rdk');
var RdkError = rdk.utils.RdkError;


/**
 * Returns the configuration for the configuration resources
 *
 * @return {Array} - an array containing the objects needed to configure the configuration resource
 *
 */
function getResourceConfig() {
    return [{
        name: 'ehmp-config',
        path: '/ehmp-config',
        get: get,
        interceptors: {
            authentication: false
        },
        requiredPermissions: [],
        isPatientCentric: false,
        bypassCsrf: true
    }];
}

function get(req, res) {
    //getting this config per request to allow the file to be modified without deployment
    var config = _.get(req, 'app.ehmpConfig');
    if (_.isEmpty(config)) {
        var error = new RdkError({
            'code': 'rdk.500.1005',
            'logger': req.logger
        });
        return res.status(error.status).rdkSend(error);
    }
    return res.status(rdk.httpstatus.ok).rdkSend(config);
}

module.exports.getResourceConfig = getResourceConfig;
module.exports.test = {
    _get: get
};
