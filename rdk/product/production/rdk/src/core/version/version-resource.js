'use strict';

var _ = require('lodash');

function getResourceConfig(app) {
    return [{
        name: 'version',
        path: '',
        get: getVersion(app),
        interceptors: {
            authentication: false,
            convertPid: false,
            synchronize: false,
            operationalDataCheck: false
        },
        requiredPermissions: [],
        isPatientCentric: false,
        bypassCsrf: true
    }];
}

function getVersion(app) {
    // Prevent version of app from being changed due to possible configuration reload by only reading the version once
    var version = _.get(app, 'config.version', 'DEVELOPMENT');

    return function(req, res) {
        return res.rdkSend({
            version: version
        });
    };
}

module.exports.getResourceConfig = getResourceConfig;
module.exports._getVersion = getVersion;
