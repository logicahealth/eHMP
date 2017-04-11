'use strict';

var _ = require('underscore');
var moment = require('moment');
var request = require('request');
var nullUtil = require(global.VX_UTILS + '/null-utils');
var pidUtils = require(global.VX_UTILS + '/patient-identifier-utils');
var async = require('async');
var format = require('util').format;

function process(log, config, environment, items, callback) {
    log.debug('largePatientRecord-rule.process: applying large-patient-rule for patients, count: %j', items.length);

    var patientTotalSizeLimit = config.unsync.rules.largePatientRecord.patientTotalSizeLimit; // in bytes

    var filteredItems = [];

    // for each patient, check size of documents
    async.each(items, function(item, callback) {
        var statusUrl = format('%s://%s:%s%s', config.unsync.vxsync.protocol, config.unsync.vxsync.host, config.unsync.vxsync.port, "/sync/status?");
        if (pidUtils.isIcn(item.patientIdentifiers[0])) {
            statusUrl = statusUrl + 'icn=' + item.patientIdentifiers[0] + '&docStatus=true';
        } else {
            statusUrl = statusUrl + 'pid=' + item.patientIdentifiers[0] + '&docStatus=true';
        }

        request.get(statusUrl, function(error, response, body) {
            if (error || (nullUtil.isNullish(response) === false && ( response.statusCode !== 200 && response.statusCode !== 202))) {
                log.debug('largePatientRecord-rule.process : error in getPatientStatus: %j', error);
                return callback(error);
            }

            var sites = _.keys(config.vistaSites);
            var aveEventSize = config.unsync.rules.largePatientRecord.avgSizePerEvent;

            var docSize = JSON.parse(body).identifierDocSizes.totalSize;
            var eventCount = calculateTotalEventCount(JSON.parse(body).syncStatus.completedStamp.sourceMetaStamp, sites, log);

            //if doc size + events size is greater than config value, eligible for unsync
            if ( (docSize + eventCount * aveEventSize) > patientTotalSizeLimit) {
                filteredItems.push(item);
            }
            return callback(null, filteredItems);
        });
    }, function(err){
        if( err ) {
            log.warn('largePatientRecord-rule.process: error in large patient rule: %j', err);
            return callback(err);
        } else {
            log.debug('largePatientRecord-rule.process: return from large patient rule, count %j', filteredItems.length);
            return callback(null, filteredItems);
        }
    });
}

function calculateTotalEventCount(metaData, sites, log) {
    var total = 0;
    _.each(sites, function (site) {
        if(metaData[site] !== undefined) {
            var domains = metaData[site].domainMetaStamp;
            _.each(domains, function (domain) {
                total = total + domain.eventCount;
            });
        }
    });
    return total;
}

function loadRule() {
    return process;
}

module.exports = loadRule;