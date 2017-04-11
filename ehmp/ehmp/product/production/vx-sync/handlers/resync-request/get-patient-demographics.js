'use strict';

var _ = require('underscore');
var idUtil = require(global.VX_UTILS + 'patient-identifier-utils');

//Demographics are needed for jobs that are synced by icn or dod pid because
//they should be synced using the /sync/demographicsSync endpoint.
function loadDemographics(environment, logger, job, callback) {
    var patientIdentifier = job.patientIdentifier;

    logger.debug('get-patient-demographics.loadDemographics: Loading demographics for patient identifier %j.', patientIdentifier);

    var jdsMethod = idUtil.isIcn(patientIdentifier.value) ? 'getPtDemographicsByIcn' : 'getPtDemographicsByPid';

    environment.jds[jdsMethod](patientIdentifier.value, function( error, response, result ) {
        if (error) {
            logger.error('get-patient-demographics.loadDemographics: Error: ' + error);
            return callback('Error getting patient demographics for identifier ' + patientIdentifier.value);
        }
        if (response.statusCode !== 200){
            logger.error('get-patient-demographics.loadDemographics: Error returned from JDS with status code %d and result = %j', response.statusCode, result);
            return callback('Unable to retrieve patient demographics.  JDS returned a status code of ' + response.statusCode);
        }

        job.demographics = getDemographics(patientIdentifier, result);

        if (_.isUndefined(job.demographics)) {
            //Demographics may not have been saved yet by the original sync job so we need to force the resync job to retry.
            logger.error('get-patient-demographics.loadDemographics: No demographics found for patient identifier %j.', patientIdentifier);
            return callback('No demographics found for patient identifier.');
        }
        return callback();
    });
}

//All demographics returned have an icn.  Demographics will be overwritten on resync.
function getDemographics(patientIdentifier, demographicsResults) {
    if (_.isUndefined(demographicsResults.data) || _.isEmpty(demographicsResults.data.items)) {
        return  undefined;
    }

    if (idUtil.isIcn(patientIdentifier.value)) {
        return demographicsResults.data.items[0];
    }

    return _.find(demographicsResults.data.items, function(item) {
        return idUtil.isDod(item.pid);
    });
}

module.exports.loadDemographics = loadDemographics;