'use strict';

var _ = require('lodash');

var resourceDirectoryInterceptors = {
    authentication: false,
    operationalDataCheck: false,
    synchronize: false
};

module.exports.getResourceConfig = function() {
    return [
        {
            name: 'resource-directory',
            path: '',
            get: getResourceDirectory,
            interceptors: resourceDirectoryInterceptors,
            requiredPermissions: [],
            isPatientCentric: false,
            bypassCsrf: true
        }
    ];
};

function getResourceDirectory(req, res) {
    req.audit.logCategory = 'RESOURCEDIRECTORY';
    var baseUrl = null;
    var serializedResources = req.app.resourceRegistry.getDirectory(
        baseUrl,
        _.get(req, 'app.config.rootPath'));
    return res.rdkSend(serializedResources);
}
