'use strict';

var _ = require('underscore');
var async = require('async');

var pidUtils = require(global.VX_UTILS + '/patient-identifier-utils');
var nullUtil = require(global.VX_UTILS + '/null-utils');
var UnSyncRulesEngine = require(global.VX_UNSYNCRULES + '/rules-engine');
var request = require('request');
var moment = require('moment');
var format = require('util').format;

//--------------------------------------------------------------------------------------------------------
// Using the given identifiers, this routine creates jobs to un-sync patients
// callback: This is the callback handler that is called when it is done.
//--------------------------------------------------------------------------------------------------------
function handle(log, config, environment, handlerCallback) {
    var engine = new UnSyncRulesEngine(log, config, environment);

    var lastAccessDays = moment().subtract(config.unsync.lastAccessed, 'days').format('YYYYMMDDHHmmss');
    log.debug('unsync-handler.handle(): lastAccessDays: %j', lastAccessDays);

    environment.jds.getPatientList(lastAccessDays, function(error, response, result) {
        if (error) {
            log.error('unsync-handler.handle(): Got error from JDS: %j', error);
            return handlerCallback('error');
        }
        var items = result.items;
        if(items !== undefined && items.length > 0) {
            log.debug('unsync-handler.handle(): Number of patients from JDS : %j', items.length);
        } else {
            log.debug('unsync-handler.handle(): There are no patients eligible for unsync');
            return handlerCallback();
        }

        engine.processUnSyncRules(items, function (err, items) {
            if (items !== undefined && !_.isEmpty(items) && !_.isEmpty(items[0])) {
                log.debug('unsync-handler.handle(): patientIdentifiers to un sync: %j', items);
                return createUnsyncRequest(log, items, config, handlerCallback);
            }
        });
    });
}

function createUnsyncRequest(log, items, config, handlerCallback) {
    async.each(items, function(item, callBack) {
        var url = format('%s://%s:%s%s', config.unsync.vxsync.protocol, config.unsync.vxsync.host, config.unsync.vxsync.port, '/sync/clearPatient?');
        if (pidUtils.isIcn(item.patientIdentifiers[0])) {
            url = url + 'icn=' + item.patientIdentifiers[0];
        } else {
            url = url + 'pid=' + item.patientIdentifiers[0];
        }

        unSyncPatient(log, url, item.patientIdentifiers[0], function(err) {
            if (err) {
                return callBack(err);
            }
        });
        log.debug('unsync-handler.createUnsyncRequest unsync done for patient ', item.patientIdentifiers[0]);
        return callBack;
    }, function(err){
        if( err ) {
            return handlerCallback(err);
        } else {
            log.info('unsync-handler.createUnsyncRequest un-sync complete for all patients');

            return handlerCallback(null);
        }
    });
}


/**
 * Un-Syncs a patient with vxsync.
 *
 * @param log The logger.
 * @param url The url to append the ien to for un-syncing this patient.
 */
function unSyncPatient(log, url, pid, callback) {
    request.post(url, function(error, response) {
        if (error) {
            log.warn('unsync-handler.unSyncPatient error in unSyncPatient: %j',  error);
            return callback(error);
        }

        if (validateSync(log, response, pid, callback) === false) {
            return callback('unsync-handler.unSyncPatient patient unsync failed');
        }

        log.debug('unsync-handler.unSyncPatient unsync-complete for patient ', pid );
        callback(null);
    }).on('error', function(error) {
        log.warn('unsync-handler.unSyncPatient, error: ' + error, callback);
    });
}

/**
 * Validates that the response received from vxsync is a 202 status code.
 *
 * @param log The logger.
 * @param response The response to validate received a 202 status code.
 * @returns {boolean} True if no errors exist with config.
 */
function validateSync(log, response, pid) {
    if (nullUtil.isNullish(response) === false && ( response.statusCode !== 200 && response.statusCode !== 202)) {
        log.warn('unsync-handler.unSyncPatient unsync failed for patient ', pid + ' , vx-sync response: %j',  response.body);
        return false;
    }

    return true;
}

module.exports = handle;
module.exports.handle = handle;