'use strict';

var _ = require('underscore');
var moment = require('moment');
var request = require('request');
var nullUtil = require(global.VX_UTILS + '/null-utils');
var pidUtils = require(global.VX_UTILS + '/patient-identifier-utils');
var async = require('async');
var format = require('util').format;
var inspect = require('util').inspect;
var val = require(global.VX_UTILS + 'object-utils').getProperty;

function process(log, config, environment, items, callback) {
    log.debug('largePatientRecord-rule.process: applying large-patient-rule for patients, count: %j', items.length);

    var patientTotalSizeLimit = config.recordRetirement.rules.largePatientRecord.patientTotalSizeLimit; // in bytes

    var filteredItems = [];

    // for each patient, check size of documents
    async.each(items, function(item, callback) {
        var statusUrl = format('%s://%s:%s%s', config.syncRequestApi.protocol, config.syncRequestApi.host, config.syncRequestApi.port, '/sync/status?');

        var id = item.patientIdentifiers[0];

        if (pidUtils.isIcn(id)) {
            statusUrl = statusUrl + 'icn=' + id + '&docStatus=true';
        } else {
            statusUrl = statusUrl + 'pid=' + id + '&docStatus=true';
        }

        request.get(statusUrl, function(error, response, body) {
            var errorMessage;
            if (error) {
                errorMessage = format('largePatientRecord-rule: received error from sync status endpoint when attempting to syncStatus for %s, error: %s', id, inspect(error));
                log.error(errorMessage);
                return callback(errorMessage);
            }
            if (!response || (response.statusCode !== 200 && response.statusCode !== 202) || !body)  {
                errorMessage = format('largePatientRecord-rule: unexpected response from sync status endpoint when attempting to syncStatus for %s, response: %s', id, inspect((response) ? response.body : null));
                log.error(errorMessage);
                return callback(errorMessage);
            }

            var parsedBody = JSON.parse(body);

            var sites = _.keys(config.vistaSites);
            var aveEventSize = config.recordRetirement.rules.largePatientRecord.avgSizePerEvent;

            var docSize = val(parsedBody, ['identifierDocSizes', 'totalSize']);
            var sourceMetaStamp = val(parsedBody, ['syncStatus', 'completedStamp', 'sourceMetaStamp']);

            if(_.isNull(docSize) || _.isUndefined(docSize) || !sourceMetaStamp){
                log.debug('largePatientRecord-rule: no docSize or sourceMetaStamp found. Sync for id %s is in progress; docSize: %s, sourceMetaStamp %s', id, docSize, sourceMetaStamp);
                return callback();
            }

            var eventCount = calculateTotalEventCount(sourceMetaStamp, sites, log);

            //if doc size + events size is smaller than config value, eligible for unsync
            if ((docSize + eventCount * aveEventSize) < patientTotalSizeLimit) {
                filteredItems.push(item);
            }
            return callback(null, filteredItems);
        });
    }, function(err) {
        if (err) {
            log.warn('largePatientRecord-rule.process: error in large patient rule: %s', inspect(err));
            return callback(err);
        } else {
            log.debug('largePatientRecord-rule.process: return from large patient rule, count %j', filteredItems.length);
            return callback(null, filteredItems);
        }
    });
}

function calculateTotalEventCount(metaData, sites, log) {
    var total = 0;
    _.each(sites, function(site) {
        if (metaData[site] !== undefined) {
            var domains = metaData[site].domainMetaStamp;
            _.each(domains, function(domain) {
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