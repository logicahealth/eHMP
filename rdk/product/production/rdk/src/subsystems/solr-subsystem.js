'use strict';

var solrSmartClient = require('solr-smart-client');
var ForeverAgent = require('forever-agent');

function getSubsystemConfig(app, logger) {
    var foreverAgent = new ForeverAgent();
    var solrClient = solrSmartClient.createClient(logger, app.config.solrClient, foreverAgent);

    return {
        healthcheck: {
            name: 'solr',
            interval: 100000,
            check: function(callback) {
                solrClient.get('admin/ping', function(error, solrResult) {
                    if (error) {
                        return callback(false);
                    }
                    var status = solrResult.status === 'OK';
                    return callback(status);
                });
            }
        }
    };
}

module.exports.getSubsystemConfig = getSubsystemConfig;
