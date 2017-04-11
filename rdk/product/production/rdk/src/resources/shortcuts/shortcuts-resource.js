'use strict';

var rdk = require('../../core/rdk');
var shortcutsList =  require('./shortcuts-resource-data.json');

function getResourceConfig(app) {
    return [{
        name: 'shortcuts-get-list',
        path: '',
        get: getShortcuts,
        //permissions need to be set once scope is figured out for this applet
        requiredPermissions: [],
        isPatientCentric: false,
        subsystems: []
    }];
}

function getShortcuts(req, res) {
    req.logger.debug('sample shortcuts resource GET called');

    if(!shortcutsList) {
        req.logger.info('shortcutsList not provided');
        return res.status(rdk.httpstatus.bad_request).rdkSend('No Shortcuts found');
    }

    return res.rdkSend({
        data: {
            items: shortcutsList
        }
    });
}

module.exports.getResourceConfig = getResourceConfig;
module.exports.getShortcuts = getShortcuts;
