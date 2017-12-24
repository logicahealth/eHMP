'use strict';

//--------------------------------------------------------------------------------------------------------
// This is a utility that can be used to retrieve details about an allocation that is currently
// in the Vista-Sync allocation table.
//
// @Author: Les Westberg
//--------------------------------------------------------------------------------------------------------

require('../../env-setup');
var _ = require('underscore');
var fs = require('fs');
var inspect = require('util').inspect;

var config = require(global.VX_ROOT + 'worker-config');

// If running from local dev machine - there is no /var/log/vxsync directory.  Fix the logging path so that it
// will log any errors to the local directory if the config version does not exist.  This will enable this to
// be able to run from the VM or from the local dev box.
//------------------------------------------------------------------------------------------------------------------
if ((config) && (_.isArray(config.loggers))) {
    _.each(config.loggers, function (logger) {
        if (_.isArray(logger.streams)) {
            _.each(logger.streams, function(stream) {
                if ((stream.path) && (!fs.existsSync(stream.path))) {
                    stream.path = './update-allocation-status.log';
                }
            });
        }
    });
}

var logUtil = require(global.VX_UTILS + 'log');
logUtil.initialize(config);
var logger = logUtil.get('update-allocation-status');

var objUtil = require(global.VX_UTILS + 'object-utils');

var VistaClient = require(global.VX_SUBSYSTEMS + 'vista/vista-client');
var vistaClient = new VistaClient(logger, logger, config);

var argv = require('yargs')
    .usage('Usage: $0 [options...]')
    .demand(['site','allocation-token'])
    .string('site')
    .string('allocationToken')
    .describe('site', 'Site hash of the VistA site where the request is being directed.')
    .describe('allocation-token', 'It is the allocation token for a reservation that has ' +
        'been previously retrieved.')
    .argv;

// Make sure the site is valid.
//------------------------------
var site;
if ((_.isString(argv.site)) && (_.isObject(config.vistaSites[argv.site]))) {
    site = argv.site;
} else {
    console.log('Site: %s is not a valid site.  Verify the existence of this site in worker-config.json.', argv.site);
    process.exit();
}

// Make sure that the site being requested is configured for multiple poller mode.
//---------------------------------------------------------------------------------
var multipleMode = objUtil.getProperty(config, 'vistaSites', site, 'multipleMode');
if (!multipleMode) {
    console.log('Site: %s is not configured as a multi-poller-mode site.  This utility is only valid for sites running in multiple-poller-mode.', site);
    process.exit();
}

var allocationToken;
if ((_.isString(argv['allocation-token'])) || (_.isFinite(argv['allocation-token']))) {
    allocationToken = String(argv['allocation-token']);
}

var allocationStatus = 'getDetails';

console.log('Calling API with the following parameters: ');
console.log('   site: %s', site);
console.log('   allocationToken: %s', (allocationToken) ? allocationToken : '');
console.log('   allocationStatus: %s', (allocationStatus) ? allocationStatus: '');
console.log('');

vistaClient.multiplePollerModeApi(site, null, allocationToken, allocationStatus, null, null, function (error, response) {
    logger.debug('Completed calling Vista-Sync getDetails. result: %j', response);
    if (error) {
        console.log('Error calling API');
        console.log(error);
        if (response) {
            console.log(response);
        }
        process.exit(1);
    }

    console.log('Raw Response: %s', response);
    console.log('');

    console.log('Response:');
    try {
        var jsonResponse = JSON.parse(response);
        console.log('JSON string: %j', jsonResponse);
        console.log('');
        console.log('Formatted:');
        console.log(inspect(jsonResponse, {
            depth: null
        }));
    } catch (err) {
        console.log(response);
    }
    process.exit(0);
});