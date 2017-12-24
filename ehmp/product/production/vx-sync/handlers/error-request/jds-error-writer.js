'use strict';

require('../../env-setup');

var _ = require('underscore');

var logUtil = require(global.VX_UTILS + 'log');
var Metrics = require(global.VX_UTILS + 'metrics');
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');

function writeErrorRecord(jds, config, errorRecord, callback) {
    callback = _.isFunction(callback) ? callback : function() {};

    // these are necessary for searching via JDS filter
    if (_.has(errorRecord, 'job')) {
        errorRecord.jobJpid = errorRecord.job.jpid;
        errorRecord.jobType = errorRecord.job.type;

        if (_.has(errorRecord.job, 'patientIdentifier')) {
            errorRecord.patientIdentifierType = errorRecord.job.patientIdentifier.type;
            errorRecord.patientIdentifierValue = errorRecord.job.patientIdentifier.value;
        }
    } else if (_.has(errorRecord, 'patientIdentifier')) {
        errorRecord.patientIdentifierType = errorRecord.patientIdentifier.type;
        errorRecord.patientIdentifierValue = errorRecord.patientIdentifier.value;
    }

    if (config.environmentName) {
        errorRecord.vxsyncEnvironmentName= config.environmentName;
    }

    jds.addErrorRecord(errorRecord, callback);
}

//---------------------------------------------------------------------------------------------
// This function creates the error record writer and returns a handle to it.
//
// config: The worker-config settings.
// environment: The environment information to be used to write this error.
// logger: The logger to be used to write the error information.
// returns: The error record writer function.
//----------------------------------------------------------------------------------------------
function createErrorRecordWriter(config, environment, logger) {
    if (!logger) {
        logUtil.initialize(config);
        logger = logUtil.get('jds-error-writer');
    }

    var jdsClient;
    if ((environment) && (environment.jds)) {
        jdsClient = environment.jds;
    } else {
        var metrics = new Metrics(config);
        jdsClient = new JdsClient(logger, metrics, config);
    }

    return writeErrorRecord.bind(null, jdsClient, config);
}

module.exports.writeErrorRecord = writeErrorRecord;
module.exports.createErrorRecordWriter = createErrorRecordWriter;