'use strict';

var versionsFile = __dirname + '/../../../config/ehmp-versions.json';
var rdk = require('../../core/rdk');
var RdkError = rdk.utils.RdkError;
var _ = require('lodash');
var fs = require('fs');

function getResourceConfig() {
    return [{
        name: 'ehmp-versions-list',
        path: '',
        get: getVersions,
        interceptors: {},
        requiredPermissions: [],
        isPatientCentric: false,
        subsystems: []
    }];
}

function getVersions(req, res) {
    readVersionsFile(function(err, versions) {
        if (err) {
            var errorObj = new RdkError({
                code: 'rdk.500.1021',
                logger: req.logger
            });
            return res.status(errorObj.status).rdkSend(errorObj);
        }
        var versionsCollection = [];
        _.each(versions.versions, function(id) {
            versionsCollection.push({
                id: id
            });
        });
        return res.rdkSend({
            versions: versionsCollection
        });
    });
}

function readVersionsFile(callback) {
    fs.readFile(versionsFile, 'utf8', function(err, result) {
        if (err) {
            return callback(err);
        }
        try {
            result = JSON.parse(result);
        } catch (ex) {
            return callback(ex);
        }
        return callback(null, result);
    });
}
module.exports.getResourceConfig = getResourceConfig;
module.exports._getVersions = getVersions;
