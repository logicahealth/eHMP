'use strict';


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
        isPatientCentric: false,
        bypassCsrf: true
    }];
}

function facilityMonikerResource(req, res) {
    return res.status(200).rdkSend(require('./vha-sites.json'));
}

module.exports.getResourceConfig = getResourceConfig;
module.exports._facilityMonikerResource = facilityMonikerResource;
