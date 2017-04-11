'use strict';

var rdk = require('../../core/rdk');
var fs = require('fs');
var _ = require('lodash');
var http = rdk.utils.http;

var vixServerConfigured = false;

module.exports.getSubsystemConfig = getSubsystemConfig;
module.exports.getVIXStudyQueryConfig = getVIXStudyQueryConfig;

module.exports.fetchBseToken = require('./vix-fetch-bse-token');
module.exports.fetchStudyQuery = require('./vix-fetch-study-query');
module.exports.addImagesToDocument = require('./vix-enrichment').addImagesToDocument;

//note that subsystems must be registered in app-factory to be registered with rdk

function init(app, logger) {
    logger.debug('beginning vix subsystem configuration...');
    // check if vix server is configured
    // config object may exist but the server ip, etc may not be

    var vixConfigBaseUrlSet = !_.isEmpty(_.get(app, 'config.vix.baseUrl'));
    vixServerConfigured = vixConfigBaseUrlSet;
}

function getSubsystemConfig(app, logger) {
    init(app, logger);
    return {
        healthcheck: {
            name: 'vix',
            interval: 100000,
            check: function(callback) {
                var httpConfig = _.extend({}, app.config.vix, {
                    logger: logger,
                    url: '/ping'
                });

                http.get(httpConfig, function(err) {
                    if (err) {
                        return callback(false);
                    }
                    callback(true);
                });
            }
        }
    };
}

function getVIXStudyQueryConfig(appConfig, logger) {
    if (!vixServerConfigured) {
        return null;
    }
    var httpConfig = _.extend({}, appConfig.vix, {
        logger: logger,
        uri: appConfig.vix.api.studyQuery,
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    });
    return httpConfig;
}
