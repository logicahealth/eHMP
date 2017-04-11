'use strict';

var fs = require('fs');

function getResourceConfig() {
    return [{
        name: 'locations-facility-monikers',
        path: '',
        get: facilityMonikerResource,
        interceptors: {
            authentication: false,
            synchronize: false
        },
        requiredPermissions: [],
        isPatientCentric: false
    }];
}

function facilityMonikerResource(req, res) {
    res.type('json');
    res.status(200);
    return fs.createReadStream(__dirname + '/vha-sites.json').pipe(res);
}

module.exports.getResourceConfig = getResourceConfig;
module.exports._facilityMonikerResource = facilityMonikerResource;
