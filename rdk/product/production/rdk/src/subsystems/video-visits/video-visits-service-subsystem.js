'use strict';

var _ = require('lodash');
var rdk = require('../../core/rdk');
var http = rdk.utils.http;

function getSubsystemConfig(app, logger) {
    return {
        healthcheck: {
            name: 'video-visits-service',
            interval: 100000,
            check: function(callback) {
                var config = _.extend({}, _.get(app, 'config.videoVisit.vvService'), {
                    uri: '',
                    logger: logger,
                    timeout: 5000
                });

                http.get(config, function(err) {
                    if (err) {
                        return callback(false);
                    }
                    callback(true);
                });
            }
        }
    };
}

module.exports.getSubsystemConfig = getSubsystemConfig;
