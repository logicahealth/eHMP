'use strict';
var httpstatus = require('../../core/rdk').httpstatus;
var _ = require('lodash');
var vix = require('../../subsystems/vix/vix-subsystem');

module.exports.getResourceConfig = function() {
    return [{
        name: 'vix-image',
        path: 'single',
        get: getDocumentImages,
        interceptors: {},
        requiredPermissions: ['read-patient-record'],
        isPatientCentric: true,
        outerceptors: {},
        subsystems: ['vix']
    }];
};

function getDocumentImages(req, res) {
    var vixSubsystemPresent = _.get(req, 'app.subsystems.vix');

    if (!vixSubsystemPresent) {
        var systemError = new Error('Error - The VIX Subsystem is not present or configured properly.');
        return res.status(httpstatus.bad_request).rdkSend(systemError);
    }
    vix.getImagesForDocument(req, function(error, response) {
        if (error) {
            var imageError = new Error(error);
            return res.status(httpstatus.bad_request).rdkSend(imageError);
        }
        return res.status(httpstatus.ok).rdkSend(response);
    });
}

module.exports._getDocumentImages = getDocumentImages;
