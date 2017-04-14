'use strict';

var _ = require('underscore');
var moment = require('moment');
var inspect = require(global.VX_UTILS + 'inspect');
var patientUtil = require(global.VX_UTILS + 'patient-identifier-utils');
var jobUtil = require(global.VX_UTILS + 'job-utils');

//Use simple sync status to determine if there was an error at a site.  If there was an error at a site before its
//corresponding cool down ends and the current time is before the end of the cool down then patient identifier associated
//with that site is removed from this a patient identifiers returned from this function.
function errorCooldown(log, config, environment, patientIdentifiers, exceptions, callback) {
    log.debug('Running error-cooldown-rule on ' + inspect(patientIdentifiers));
    log.debug('Getting job state for %s', patientIdentifiers[0].value);

    var currentTime = moment().valueOf();

    environment.jds.getJobStatus({ 'jpid': patientIdentifiers[0] }, { 'filter': '?filter=ilike(\"type\",\"%25request%25\")' },
        function(error, response, result) {
            if (error) {
                log.error('error-cooldown-rule.errorCooldown: Error occurred retrieving simple sync status for pid: %s; error: %s', patientIdentifiers[0].value, error);
                return callback(error, patientIdentifiers);
            }

            if (response.statusCode !== 200) {
                log.error('error-cooldown-rule.errorCooldown: Error occurred retrieving simple sync status for pid: %s; error: %s', patientIdentifiers[0].value, result);
                return callback(error, patientIdentifiers);
            }

            processJobStatus(log, config, currentTime, patientIdentifiers, result.items, exceptions, callback);
        }
    );
}

function processJobStatus(log, config, currentTime, patientIdentifiers, statusResult, exceptions, callback) {
    var ruleConfig = config.rules['error-cooldown'];

    if (_.isUndefined(ruleConfig)) {
        log.warn('error-cooldown-rule.processJobStatus: error-cooldown: Configuration not found. No processing done.');
        return callback(null, patientIdentifiers);
    }

    if (_.isUndefined(statusResult)) {
        log.warn('error-cooldown-rule.processJobStatus: Job status items not found.  No processing done.');
        return callback(null, patientIdentifiers);
    }

    var erroredJobsCoolingDown = _.filter(statusResult, function(job) {
        var siteHash = patientUtil.extractPiecesFromPid(job.patientIdentifier.value).site;
        var siteCoolDownDuration = getSiteCooldown(log, ruleConfig, siteHash);
        return jobUtil.isSyncJobType(job) && job.status === 'error' && 
                siteUnderCoolDown(currentTime, job.timestamp, siteHash, siteCoolDownDuration);
    });

    var erroredPidsCoolingDown = _.pluck(_.pluck(erroredJobsCoolingDown, 'patientIdentifier'), 'value');

    var remainPatientIdentifiers = _.reject(patientIdentifiers, function(patientIdentifier) {
        var siteHash = patientUtil.extractPiecesFromPid(patientIdentifier.value).site;
        return _.contains(erroredPidsCoolingDown, patientIdentifier.value) && !_.contains(exceptions, siteHash.toLowerCase());
    });

    return callback(null, remainPatientIdentifiers);
}

//Site is under cool down if the follow condition is NOT met.
function siteUnderCoolDown(currentTime, latestJobTimestamp, site, siteCoolDownDuration) {
    return siteCoolDownDuration !== 0 && currentTime < latestJobTimestamp + siteCoolDownDuration;
}

//A site can be forced by setting its cool down time to zero. All cool down times durations are in milliseconds.
function getSiteCooldown(log, ruleConfig, site) {
    var cooldown = 0;

    if (ruleConfig && site) {
        var newCooldown = ruleConfig[site] || ruleConfig.default || cooldown;

        if (_.isNumber(newCooldown)) {
            cooldown = newCooldown;
        }
    }

    log.debug('error-cooldown-rule.getSiteCooldown: Configured cool down for site %s. is %s', site, cooldown);
    return cooldown;
}

function loadRule() {
    return errorCooldown;
}

module.exports = loadRule;
module.exports._getSiteCooldown = getSiteCooldown;
module.exports._processJobStatus = processJobStatus;
module.exports._siteUnderCoolDown = siteUnderCoolDown;
