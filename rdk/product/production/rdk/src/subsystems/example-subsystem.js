'use strict';

var rdk = require('../core/rdk');

module.exports.getSubsystemConfig = getSubsystemConfig;
module.exports.fetchExternalData = fetchExternalData;

//note that subsystems must be registered in app-factory to be registered with rdk

function getSubsystemConfig(app, logger) {
    return {
        healthcheck: {
            name: 'jds',
            interval: 5000,
            check: function(callback) {
                var localConfig = {
                    timeout: 4000,
                    baseUrl: 'http://127.0.0.1:PORT',
                    url: '/ping',
                    logger: logger
                };
                rdk.utils.http.get(localConfig, function(err) {
                    if(err) {
                        return callback(false);
                    }
                    return callback(true);
                });
            }
        }
    };
}

function fetchExternalData(logger, callback) {
    logger.info('Fetching some external data');
    var pretendExternalData = {
        data: 'external'
    };
    var error = null;
    callback(error, pretendExternalData);
}
