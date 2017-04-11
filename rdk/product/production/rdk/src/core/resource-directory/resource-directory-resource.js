'use strict';

var _ = require('lodash');
var dd = require('drilldown');
var path = require('path');

var resourceDirectoryInterceptors = {
    authentication: false,
    operationalDataCheck: false,
    synchronize: false
};

module.exports.getResourceConfig = function() {
    return _.flatten(_.map(['', 'cors'], function(path) {
        return [
            {
                name: path ? 'resource-directory-' + path : 'resource-directory',
                path: path,
                get: getResourceDirectory.bind(null, path),
                interceptors: resourceDirectoryInterceptors,
                requiredPermissions: [],
                isPatientCentric: false
            }
        ];
    }));
};

function getResourceDirectory(path, req, res) {
    req.audit.logCategory = 'RESOURCEDIRECTORY';

    var baseUrl = null;
    if(path === 'cors') {
        baseUrl = (dd(req.app)('config')('externalProtocol').val || req.protocol) + '://' + req.get('Host');
    }

    var serializedResources = req.app.resourceRegistry.getDirectory(
        baseUrl,
        dd(req.app)('config')('rootPath').val);
    res.rdkSend(serializedResources);
}
