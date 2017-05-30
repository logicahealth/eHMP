'use strict';

var request = require('request');
var idUtil = require(global.VX_UTILS + 'patient-identifier-utils');
var HttpHeaderUtils = require(global.VX_UTILS + 'http-header-utils');

//Used to sync jobs with icn or dod pid.
function loadPatient(logger, syncConfig, job, callback) {
    var patientIdentifier = job.patientIdentifier;

    logger.debug('demographics-sync.loadPatient: Initiating load/sync for patient identifier %j.', patientIdentifier);

    var options = {
        url: syncConfig.protocol + '://' + syncConfig.host + ':' + syncConfig.port + syncConfig.patientSyncDemoPath,
        method: 'POST',
        json: createSyncData(job)};

    if(job.referenceInfo){
        var httpHeaderUtils = new HttpHeaderUtils(logger);
        options = httpHeaderUtils.insertReferenceInfo(options, job.referenceInfo);
    }

    request.post(options, function(error, response, body) {
        if (error)  {
            logger.error('demographics-sync.loadPatient: Error trying to access demographics sync endpoint: %s.', error);
            return callback(error);
        }

        if (response.statusCode === 202 || response.statusCode === 200) {
            logger.debug('demographics-sync.loadPatient: Initiated demographics sync for patient identifier %j.', patientIdentifier);
            return callback();
        } else {
            logger.error('demographics-sync.loadPatient: Error trying to call demographics sync endpoint: %s.', body);
            return  callback('Error calling demographics sync endpoint. Status code: ' + response.statusCode + ' Error: ' + body);
        }
    });
}

function createSyncData(job) {
    var patientIdentifier = job.patientIdentifier;

    if (idUtil.isDod(patientIdentifier.value)) {
        return {edipi: idUtil.extractDfnFromPid(patientIdentifier.value), demographics: job.demographics};
    } else {
        return {icn: patientIdentifier.value, demographics: job.demographics};
    }
}

module.exports = loadPatient;