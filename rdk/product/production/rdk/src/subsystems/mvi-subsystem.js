'use strict';

var rdk = require('../core/rdk');
var _ = require('lodash');
var dd = require('drilldown');
var fs = require('fs');
var http = rdk.utils.http;

function getSubsystemConfig(app) {
    return {
        healthcheck: {
            name: 'mvi',
            interval: 100000,
            check: function(callback) {
                var httpConfig = getMVIHttpConfig(app.config, app.logger);
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
    var key = dd(httpConfig)('agentOptions')('key').val;
    var cert = dd(httpConfig)('agentOptions')('cert').val;
    var ca = dd(httpConfig)('agentOptions')('ca').val;
    var certificateHeader = /^-+BEGIN.*?(KEY|CERTIFICATE)-+/;
    try {
        if (_.isString(key) && !certificateHeader.test(key)) {
            httpConfig.agentOptions.key = fs.readFileSync(key);  // TODO: remove sync
        }
        if (_.isString(cert) && !certificateHeader.test(cert)) {
            httpConfig.agentOptions.cert = fs.readFileSync(cert);  // TODO: remove sync
        }
        if (_.isString(ca) && !certificateHeader.test(ca)) {
            httpConfig.agentOptions.ca = fs.readFileSync(ca);  // TODO: remove sync
        }
        if (_.isArray(ca)) {
            httpConfig.agentOptions.ca = _.map(ca, function (item) {
                if (_.isString(item) && !certificateHeader.test(item)) {
                    return fs.readFileSync(item);
                }
                return item;
            });
        }
    } catch (ex) {
        if (logger) {
            logger.error('Error reading certificate for MVI');
            logger.error(ex);
            logger.error(httpConfig);
        } else {
            console.error('Error reading certificate for MVI');
            console.error(ex);
            console.error(httpConfig);
        }
        process.exit(1);
    }
    return httpConfig;
}

module.exports.getSubsystemConfig = getSubsystemConfig;
module.exports.getMVIHttpConfig = getMVIHttpConfig;
