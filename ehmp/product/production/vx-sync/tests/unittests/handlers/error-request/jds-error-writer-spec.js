'use strict';

require('../../../../env-setup');

var jdsErrorWriter = require(global.VX_HANDLERS + 'error-request/jds-error-writer');
var log = require(global.VX_DUMMIES + 'dummy-logger');
var JdsClientDummy = require(global.VX_DUMMIES + 'jds-client-dummy');


//--------------------------------------------------------------
// Uncomment the following to see the logging out on the screen.
//--------------------------------------------------------------
// var logUtil = require(global.VX_UTILS + 'log');
// logUtil.initialize([{
//     name: 'root',
//     stream: process.stdout,
//     level: 'debug'
// }]);
// log = logUtil.get('test', 'debug');
//------------------------------------------
// End of logging stuff to comment out....
//------------------------------------------
// log = require('bunyan').createLogger({
// 	name: 'jds-error-writer-spec',
// 	level: 'debug'
// });

var hmpServer = 'TheHmpServer';

var config = {
    environmentName: 'vxsync_environment',
    jds: {
        protocol: 'http',
        host: 'IP        ',
        port: PORT
    },
    'hmp.server.id': hmpServer,
    'hmp.version': '0.7-S65',
    'hmp.batch.size': '1000',
    'hmp.extract.schema': '3.001',
    'hdr': {
        'operationMode': 'REQ/RES'
    }
};

//---------------------------------------------------------------------
// Create an instance of the environment variable.
//
// theConfig: The config file to use for this environment.
// returns: The environment variable.
//---------------------------------------------------------------------
function createEnvironment(theConfig) {
    var environment = {
        jds: new JdsClientDummy(log, theConfig),
        metrics: log
    };

    spyOn(environment.jds, 'addErrorRecord').andCallThrough();

    return environment;
}

//---------------------------------------------------------------------------------------------------
// Create an error record containing a job with the given data.
//
// jobJpid: The JPID for the job.
// jobType: The type of job.
// patientIdentifierType: The type of patient identifier.
// patientIdentifierValue: The patient identifier.
// returns: The error containing a job.
//--------------------------------------------------------------------------------------------------
function createErrorJob(jobJpid, jobType, patientIdentifierType, patientIdentifierValue) {
    var errorRecord = {
        job: {
            jpid: jobJpid,
            type: jobType,
            patientIdentifier: {
                type: patientIdentifierType,
                value: patientIdentifierValue
            }
        }
    };

    return errorRecord;
}

//---------------------------------------------------------------------------------------------------
// Create a poller error record containing a job with the given data.
//
// patientIdentifierType: The type of patient identifier.
// patientIdentifierValue: The patient identifier.
// returns: The error containing a job.
//--------------------------------------------------------------------------------------------------
function createPollerError(patientIdentifierType, patientIdentifierValue) {
    var errorRecord = {
        patientIdentifier: {
            type: patientIdentifierType,
            value: patientIdentifierValue
        }
    };

    return errorRecord;
}

describe('jds-error-writer-spec.js', function() {
    it('Test writing error "JOB" to JDS', function() {
        var environment = createEnvironment(config);

        var writeErrorRecord = jdsErrorWriter.createErrorRecordWriter(config, environment, log);

        var errorRecord = createErrorJob('1234-1234-1234-1234', 'enterprise-sync-request', 'pid', 'SITE;3');

        var finished = false;
        runs (function() {
            writeErrorRecord(errorRecord, function () {
                expect(environment.jds.addErrorRecord).toHaveBeenCalledWith(jasmine.objectContaining({
                    jobJpid: '1234-1234-1234-1234',
                    jobType: 'enterprise-sync-request',
                    patientIdentifierType: 'pid',
                    patientIdentifierValue: 'SITE;3',
                    vxsyncEnvironmentName: 'vxsync_environment',
                    job: errorRecord.job
                }), jasmine.any(Function));

                finished = true;
            });
        });

        waitsFor(function() {
            return finished;
        });
    });
    it('Test writing error "POLLER" to JDS', function() {
        var environment = createEnvironment(config);

        var writeErrorRecord = jdsErrorWriter.createErrorRecordWriter(config, environment, log);

        var errorRecord = createPollerError('pid', 'SITE;3');

        var finished = false;
        runs (function() {
            writeErrorRecord(errorRecord, function () {
                expect(environment.jds.addErrorRecord).toHaveBeenCalledWith(jasmine.objectContaining({
                    patientIdentifierType: 'pid',
                    patientIdentifierValue: 'SITE;3',
                    vxsyncEnvironmentName: 'vxsync_environment',
                    patientIdentifier: errorRecord.patientIdentifier
                }), jasmine.any(Function));

                finished = true;
            });
        });

        waitsFor(function() {
            return finished;
        });

    });
});
