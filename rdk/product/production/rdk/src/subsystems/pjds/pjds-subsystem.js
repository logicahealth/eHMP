'use strict';

var _ = require('lodash');
var rdk = require('../../core/rdk');
var http = rdk.utils.http;

module.exports.getSubsystemConfig = getSubsystemConfig;

function getSubsystemConfig(app) {
    return {
        healthcheck: {
            name: 'pjds',
            interval: 100000,
            check: function(callback) {
                var pjdsOptions = _.extend({}, app.config.generalPurposeJdsServer, {
                    url: '/ping',
                    timeout: 5000,
                    logger: app.logger
                });

                http.get(pjdsOptions, function(err) {
                    if(err) {
                        return callback(false);
                    }
                    callback(true);
                });
            }
        }
    };
}