'use strict';

var util = require('util');
var errorUtil = require(global.VX_UTILS + 'error');
var rpcUtil = require(global.VX_UTILS + '/rpc-util');
var _ = require('underscore');
//var inspect = require(global.VX_UTILS + 'inspect');



function handle(log, config, environment, job, handlerCallback) {
    log.debug('operational-data-subscription-handler.handle : received request to operational subscriber (Site: %s) Job: %j', job.site, job);
    var configCopy = util.inspect(config);
    configCopy = configCopy.replace(/accessCode:\s'.*',|verifyCode:\s'.*',/g, '');
    log.debug('operational-data-subscription-handler.handle : received config:', configCopy);

    // Handle message processing here
    log.info('operational-data-subscription-handler.handle : operational subscriber handled job.  Job: %j', job);

    var server = config['hmp.server.id'];
    var command = 'startOperationalDataExtract';
    if (job.site && config.vistaSites[job.site]) {
        var siteConfig = config.vistaSites[job.site];
        var rpcConfig = _.clone(siteConfig);
        rpcConfig.context = 'HMP SYNCHRONIZATION CONTEXT';

        var params = {
            'command': command,
            'server': server
        };

        log.debug('operational-data-subscription-handler.handle : invoking Operational Sync RPC');
        rpcUtil.standardRPCCall(log, rpcConfig, 'HMPDJFS API', {
                '"command"': command,
                '"server"': server
            }, null, function(error, result) {
            /** Expected Result
                { apiVersion: '1.0',
                    location: '/vpr/subscription/hmp-development-box/patient/' }
            **/
            log.debug('operational-data-subscription-handler.handle : Received response from Vista RPC call: ' + util.inspect(result));
            if (result && result.error) {
                error = errorUtil.createTransient(result.error.message, result.error);
            }
            if (error) {
                if (!error.type) {
                    error = errorUtil.createTransient('Operational Sync rejected', error);
                }
                log.error('operational-data-subscription-handler.handle : Unable to request synchronization ' + error);
            } else {
                log.info('operational-data-subscription-handler.handle : Operational Sync request submitted');
            }
            handlerCallback(error, result);
        });
    } else {
        log.error('operational-data-subscription-handler.handle : Unable to request operational data sync');
        handlerCallback(errorUtil.createTransient('operational-data-subscription-handler.handle : Unable to request operational data sync - required information unavailable', job));
    }
}

module.exports = handle;