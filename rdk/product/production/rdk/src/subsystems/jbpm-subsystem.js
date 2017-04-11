'use strict';

var rdk = require('../core/rdk');
var http = rdk.utils.http;
//var _ = require('lodash');
//var fs = require('fs');

function getSubsystemConfig(app) {
    return {
        healthcheck: {
            name: 'jbpm',
            interval: 100000,
            check: function(callback) {
                var httpConfig = getJBPMHttpConfig(app.config, app.logger);

                // [GET] /history/instances
                // Gets a list of ProcessInstanceLog instances
                // Returns a JaxbHistoryLogList instance that contains a list of JaxbProcessInstanceLog instances
                // This operation responds to pagination parameters

                httpConfig.url += app.config.jbpm.healthcheckEndpoint;

                //Add BASIC auth header to rest call
                if (app.config.jbpm.adminUser.username && app.config.jbpm.adminUser.password) {
                    httpConfig = addAuthToConfig(app.config.jbpm.adminUser.username, app.config.jbpm.adminUser.password, httpConfig);
                }
                httpConfig.json = true;

                http.get(httpConfig, function(err, response, data) {
                    if (!data || !data.historyLogList) {
                        err = true;
                    }

                    if (err) {
                        return callback(false);
                    }
                    callback(true);
                });
            }
        }
    };
}

function addAuthToConfig(username, password, config) {
    config.headers.Authorization = createBasicAuth(username, password);
    return config;
}

function getJBPMHttpConfig(config, logger) {
    var httpConfig = {
        baseUrl: config.jbpm.baseUrl,
        logger: logger,
        url: config.jbpm.apiPath,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'application/json'
        }
    };

    // if certs are needed for communication in the future, this should be uncommented
    // var path;
    // if (config.jbpm.options) {
    //     _.extend(httpConfig, config.jbpm.options);
    // }
    // try {
    //     if (config.jbpm.options.key) {
    //         path = config.jbpm.options.key;
    //         httpConfig.key = fs.readFileSync(path);
    //     }
    //     if (config.jbpm.options.cert) {
    //         path = config.jbpm.options.cert;
    //         httpConfig.cert = fs.readFileSync(path);
    //     }
    // } catch (e) {
    //     if (logger) {
    //         logger.error('Error reading certificate for JBPM');
    //     } else {
    //         console.log('Error reading certificate information for JBPM');
    //     }
    // }

    return httpConfig;
}

function createBasicAuth(username, password) {
    return 'Basic ' + new Buffer(username + ':' + password).toString('base64');
}

module.exports.getSubsystemConfig = getSubsystemConfig;
module.exports.getJBPMHttpConfig = getJBPMHttpConfig;
module.exports.addAuthToConfig = addAuthToConfig;
