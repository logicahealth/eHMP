'use strict';

var request = require('request');
var HttpHeaderUtils = require(global.VX_UTILS + 'http-header-utils');

function loadPatient(logger, syncConfig, job, callback) {
    var patientIdentifier = job.patientIdentifier;

    logger.debug('load-patient.loadPatient: Initiating load/sync for patient id %s.', patientIdentifier.value);

    var options = {
        url: syncConfig.protocol + '://' + syncConfig.host + ':' + syncConfig.port + syncConfig.patientSyncPath,
        method: 'GET',
        qs: {}};

    options.qs[patientIdentifier.type] = patientIdentifier.value;

    if(job.referenceInfo){
        var httpHeaderUtils = new HttpHeaderUtils(logger);
        httpHeaderUtils.insertReferenceInfo(options, job.referenceInfo);
    }

    request.get(options, function(error, response, body) {
        if (error)  {
            logger.error('load-patient.loadPatient: Error trying to access load patient endpoint: %s.', error);
            return callback(error);
        }

        if (response.statusCode === 202 || response.statusCode === 200) {
            logger.debug('load-patient.loadPatient: Initiated sync for patient with patient id %s.', patientIdentifier.value);
            return callback();
        } else {
            logger.error('load-patient.loadPatient: Error trying to call load/sync patient endpoint: %s.', body);
            return  callback('Error calling load patient endpoint. Status code: ' + response.statusCode + ' Error: ' + body);
        }
    });
}

module.exports = loadPatient;