'use strict';

//--------------------------------------------------------------------------------------------------------
// This is a utility that can be used to reserve a batch of records from Vista when running in multiple
// poller mode.
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
    .string('allocationToken')
    .describe('site', 'Site hash of the VistA site where the request is being directed.')
    .describe('allocation-size', 'This is the requested number of batch messages requested in the reservation.  ' +
        'If this is not passed it will default to 1000.   The number of messages may be larger than this number ' +
        'because unsolicited update messages come as a triple message (syncStart, data, and syncComplete).')
    .describe('allocation-token', 'If this is passed, then it is the allocation token for a reservation that has ' +
        'been previously retrieved.')
    .describe('allocation-status', 'This informs VistA what to do about the allocation previously received as ' +
        'identified by the value in allocation-token.  It can be set to one of the following: complete, rejected, ' +
        'reduce, or replay. ')
    .describe('max', 'This is the maximum number of messages that can be received in the batch.  If the batch of ' +
        'messages requested grows larger than the requested amount due to unsolicited updates, then this is the ' +
        'absolute maximum amount of messages that can be in a batch.  If this is not passed, the default value is: ' +
        '99999.')
    .describe('max-size', 'This is the maximum bite size allowed in the batch.   If this is not passed, the default ' +
        'value is: 99999.')
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

var allocationSize;
if ((_.isString(argv['allocation-size'])) || (_.isFinite(argv['allocation-size']))) {
    allocationSize = String(argv['allocation-size']);
} else {
    allocationSize = '1000';
}

var allocationToken;
if ((_.isString(argv['allocation-token'])) || (_.isFinite(argv['allocation-token']))) {
    allocationToken = String(argv['allocation-token']);
}

var allocationStatus;
if (_.isString(argv['allocation-status'])) {
    allocationStatus = argv['allocation-status'];
}

// Make sure that if there is an allocationStatus that it is a valid value.
//-------------------------------------------------------------------------
var validStatusValues = ['complete', 'rejected', 'timeout', 'reduce', 'replay'];
if ((allocationStatus) && (validStatusValues.indexOf(allocationStatus) < 0)) {
    console.log('allocation-status: \'%s\' was not a valid status.  Valid values are: %j', allocationStatus, validStatusValues);
    process.exit();
}

var max;
if ((_.isString(argv.max)) || (_.isFinite(argv.max))) {
    max = String(argv.max);
}

var maxSize;
if ((_.isString(argv['max-size'])) || (_.isFinite(argv['max-size']))) {
    maxSize = argv['max-size'];
}

console.log('Calling API with the following parameters: ');
console.log('   site: %s', site);
console.log('   allocationSize: %s,', (allocationSize)? allocationSize : '');
console.log('   allocationToken: %s', (allocationToken) ? allocationToken : '');
console.log('   allocationStatus: %s', (allocationStatus) ? allocationStatus: '');
console.log('   max: %s', (max) ? max : '');
console.log('   maxSize: %s', (maxSize) ? maxSize : '');
console.log('');

vistaClient.multiplePollerModeApi(site, allocationSize, allocationToken, allocationStatus, max, maxSize, function (error, response) {
    logger.debug('Completed calling Fetch RPC for dfn: %s; result: %j', argv.dfn, response);
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