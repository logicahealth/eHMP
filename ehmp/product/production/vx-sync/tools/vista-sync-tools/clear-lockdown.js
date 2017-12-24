'use strict';

//--------------------------------------------------------------------------------------------------------
// This is a utility that can be used to clear the lockdown mode on a Vista system that is running
// in poller mode and has gone into lockdown mode.  This utility will verify that the system is truly
// in lockdown mode before it will send the message to resume.
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
                    stream.path = './reserve-batch.log';
                }
            });
        }
    });
}

var logUtil = require(global.VX_UTILS + 'log');
logUtil.initialize(config);
var logger = logUtil.get('reserve-batch');

var objUtil = require(global.VX_UTILS + 'object-utils');

var VistaClient = require(global.VX_SUBSYSTEMS + 'vista/vista-client');
var vistaClient = new VistaClient(logger, logger, config);

var argv = require('yargs')
    .usage('Usage: $0 [options...]')
    .demand(['site'])
    .string('site')
    .describe('site', 'Site hash of the VistA site where the request is being directed.')
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

// First we need to see if the site is truly in lock down mode.  We can do that by pulling the list of allocations
// and checking the error message.
//-----------------------------------------------------------------------------------------------------------------
vistaClient.multiplePollerModeApi(site, null, null, 'list', null, null, function (error, response) {
    logger.debug('Completed calling Fetch RPC for dfn: %s; result: %j', argv.dfn, response);
    if (error) {
        console.log('Error calling API');
        console.log(error);
        if (response) {
            console.log(response);
        }
        process.exit(1);
    }

    var jsonResponse;
    try {
        jsonResponse = JSON.parse(response);
    } catch (err) {
        console.log(response);
    }

    var message = objUtil.getProperty(jsonResponse, 'data', 'error', 'message');
    if (message !== 'VistA Allocations Locked') {
        console.log('');
        console.log('Vista does not appear to be in lock down mode.  The response did not contain "VistA Allocations Locked" message.  Response: %s', response);
        console.log('');
        process.exit(1);
    }

    // If we got here - then we know we are in lock down mode.  Lets tell it to release the lock.
    //--------------------------------------------------------------------------------------------
    var allocationStatus = 'resumeProcessing';

    console.log('Calling API with the following parameters: ');
    console.log('   site: %s', site);
    console.log('   allocationStatus: %s', (allocationStatus) ? allocationStatus: '');
    console.log('');

    vistaClient.multiplePollerModeApi(site, null, null, allocationStatus, null, null, function (error, response) {
        logger.debug('Completed calling message to release lockdown mode: %s; result: %j', argv.dfn, response);
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
});

