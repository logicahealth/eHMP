'use strict';

var rdk = require('../core/rdk');
var _ = require('lodash');
var http = rdk.utils.http;

function getSubsystemConfig(app, logger) {
    return {
        healthcheck: {
            name: 'mvi',
            interval: 100000,
            check: function(callback) {
                var httpConfig = getMVIHttpConfig(app.config, logger);
                http.post(httpConfig, function(err) {
                    if(err) {
                        return callback(false);
                    }
                    callback(true);
                });
            }
        }
    };
}

function getMVIHttpConfig(appConfig, logger){
    var httpConfig = _.extend({}, appConfig.mvi, {
        url: appConfig.mvi.search.path, // search.path and sync.path are the same in config, but refactor this
        logger: logger,
        headers: {
            'Content-Type': 'text/xml; charset=utf-8'
        }
    });
    return httpConfig;
}

module.exports.getSubsystemConfig = getSubsystemConfig;
module.exports.getMVIHttpConfig = getMVIHttpConfig;
