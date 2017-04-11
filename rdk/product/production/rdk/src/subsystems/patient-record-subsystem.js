'use strict';

var _ = require('lodash');
var rdk = require('../core/rdk');
var http = rdk.utils.http;

function getSubsystemConfig(app) {
    return {
        healthcheck: {
            name: 'jds',
            interval: 100000,
            check: function(callback) {
                var patientrecordOptions = _.extend({}, app.config.jdsServer, {
                    url: '/ping',
                    logger: app.logger,
                    timeout: 5000
                });

                http.get(patientrecordOptions, function(err) {
                    if (err) {
                        // do stuff to handle error or pass it up
                        return callback(false);
                    }
                    // do stuff to handle success
                    callback(true);
                });
            },
            dependencies: ['authorization']
        }
    };
}

module.exports.getSubsystemConfig = getSubsystemConfig;
