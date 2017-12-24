'use strict';

require('../../../../env-setup');

var _ = require('underscore');
var uuid = require('node-uuid');
var logger = require(global.VX_DUMMIES + 'dummy-logger');
// logger = require('bunyan').createLogger({
//     name: 'jmeadows-xform-domain-vpr-handler-itest-spec',
//     level: 'debug'
// });

var val = require(global.VX_UTILS + 'object-utils').getProperty;
var jobUtil = require(global.VX_UTILS + 'job-utils');
var testHandler = require(global.VX_INTTESTS + 'framework/handler-test-framework').testHandler;
var patientIdUtil = require(global.VX_UTILS + 'patient-identifier-utils');
var handler = require(global.VX_HANDLERS + 'jmeadows-xform-domain-vpr/jmeadows-xform-domain-vpr-handler');
var JdsClientDummy = require(global.VX_DUMMIES + 'jds-client-dummy');
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var wConfig = require(global.VX_ROOT + 'worker-config');
var realConfig = JSON.parse(JSON.stringify(wConfig));            // Make sure we are not using a shared copy of this so we can make changes later and not side effect some other test.


var config = {
    jds: _.defaults(realConfig.jds, {
        protocol: 'http',
        host: 'IP        ',
        port: PORT
    })
};

var testConfig = require(global.VX_INTTESTS + 'test-config');
var vx_sync_ip = testConfig.vxsyncIP;

var host = vx_sync_ip;
var port = PORT;
var tubename = 'vx-sync-test';
var jmeadowsVersion = "2.3.1";
var jmeadowsSoapPath = "jmeadows_v2_3_1";

describe('jmeadows-xfom-domain-vpr-handler integration test', function() {
    var testPatientIdentifier = patientIdUtil.create('pid', 'DOD;' + 0xD0D);

    beforeEach(function() {
        // Underlying JDS calls to monitor and make sure that they are made.
        //---------------------------------------------------------------------------
        // spyOn(jdsClientDummy, 'saveSyncStatus').andCallThrough();
    });

    describe('record enrichment pathway', function() {
        var jdsClientDummy = new JdsClientDummy(logger, config);
        var environment = {
            jds: jdsClientDummy,
            metrics:logger
        };
        var expectedJdsResponse = {
            statusCode: 200
        };
        jdsClientDummy._setResponseData(null, expectedJdsResponse, undefined);

        var dodAllergyItems = require('../../../data/secondary/'+jmeadowsSoapPath+'/allergySoap');

        var job = {};
        job.type = 'jmeadows-xform-allergy-vpr';
        job.dataDomain = 'allergy';
        job.record = dodAllergyItems;
        job.jpid = uuid.v4();
        job.icn = '10108V420871';
        job.patientIdentifier = patientIdUtil.create('pid', 'DOD;000000003');
        job.requestStampTime = '20140102120059';

        var localConfig = _.clone(config);
        localConfig.jmeadows = {
            version: jmeadowsVersion,
            domains: ['allergy']
        };

        var matchingJobTypes = [jobUtil.eventPrioritizationRequestType(), jobUtil.eventPrioritizationRequestType(), jobUtil.eventPrioritizationRequestType()];
        testHandler(handler, logger, localConfig, environment, host, port, tubename, job, matchingJobTypes);
    });

    xdescribe('document retrieval pathway: consult that contains link to pdf document', function() {
        var jdsClientDummy = new JdsClientDummy(logger, config);
        var environment = {
            jds: jdsClientDummy,
            metrics:logger
        };
        var expectedJdsResponse = {
            statusCode: 200
        };
        jdsClientDummy._setResponseData(null, expectedJdsResponse, undefined);

        var dodConsultItems = require('../../../data/secondary/'+jmeadowsSoapPath+'/consultSoap');

        var job = {};
        job.type = 'jmeadows-xform-consult-vpr';
        job.dataDomain = 'consult';
        job.record = dodConsultItems;
        job.jpid = uuid.v4();
        job.icn = '10108V420871';
        job.patientIdentifier = patientIdUtil.create('pid', 'DOD;000000003');
        job.requestStampTime = '20140102120059.000';

        var localConfig = _.clone(config);
        localConfig.jmeadows = {
            version: jmeadowsVersion,
            domains: ['consult']
        };

        var matchingJobTypes = [jobUtil.jmeadowsDocRetrievalType(), jobUtil.jmeadowsDocRetrievalType(), jobUtil.jmeadowsDocRetrievalType()];
        testHandler(handler, logger, localConfig, environment, host, port, tubename, job, matchingJobTypes);
    });

    xdescribe('document retrieval pathway: progressNote that contains link to pdf document', function() {
        var localLogger = require('bunyan').createLogger({
            name: 'jmeadows-xform-domain-vpr-handler-itest-spec: ',
            level: 'debug'
        });
        localLogger.debug('**** start of document retrieval patheway:... test ******');
        var jdsClientDummy = new JdsClientDummy(localLogger, config);
        var environment = {
            jds: jdsClientDummy,
            metrics:localLogger
        };
        var expectedJdsResponse = {
            statusCode: 200
        };
        jdsClientDummy._setResponseData(null, expectedJdsResponse, undefined);

        var dodProgressNoteItems = require('../../../data/secondary/'+jmeadowsSoapPath+'/progressNoteSoap');

        var job = {};
        job.type = 'jmeadows-xform-progressNote-vpr';
        job.dataDomain = 'progressNote';
        job.record = dodProgressNoteItems;
        job.jpid = uuid.v4();
        job.icn = '10108V420871';
        job.patientIdentifier = patientIdUtil.create('pid', 'DOD;000000003');
        job.requestStampTime = '20140102120059.000';

        var localConfig = _.clone(config);
        localConfig.jmeadows = {
            version: jmeadowsVersion,
            domains: ['progressNote']
        };

        var matchingJobTypes = [jobUtil.jmeadowsDocRetrievalType(), jobUtil.jmeadowsDocRetrievalType(), jobUtil.jmeadowsDocRetrievalType(),
            jobUtil.jmeadowsDocRetrievalType(), jobUtil.jmeadowsDocRetrievalType(), jobUtil.jmeadowsDocRetrievalType(),
            jobUtil.jmeadowsDocRetrievalType(), jobUtil.jmeadowsDocRetrievalType(), jobUtil.jmeadowsDocRetrievalType(),
            jobUtil.jmeadowsDocRetrievalType(), jobUtil.jmeadowsDocRetrievalType(), jobUtil.jmeadowsDocRetrievalType(), jobUtil.jmeadowsDocRetrievalType()
        ];

        // Note:  Because of all the things that this is doing - we are seein on the build server - this test taking as long as 42 seconds to complete.
        // so need to set the time out high enough so that it does not fail prematurely.
        //----------------------------------------------------------------------------------------------------------------------------------------------
        testHandler(handler, localLogger, localConfig, environment, host, port, tubename, job, matchingJobTypes, 60000);
        localLogger.debug('**** end of document retrieval patheway:... test ******');
    });

    describe('record enrichment pathway: dischargeSummary that does not link to pdf document', function() {
        var jdsClientDummy = new JdsClientDummy(logger, config);
        var environment = {
            jds: jdsClientDummy,
            metrics:logger
        };
        var expectedJdsResponse = {
            statusCode: 200
        };
        jdsClientDummy._setResponseData(null, expectedJdsResponse, undefined);

        var dodDischargeSummaryItems = require('../../../data/secondary/'+jmeadowsSoapPath+'/dischargeSummarySoap');

        var job = {};
        job.type = 'jmeadows-xform-dischargeSummary-vpr';
        job.dataDomain = 'dischargeSummary';
        job.record = dodDischargeSummaryItems;
        job.jpid = uuid.v4();
        job.icn = '10108V420871';
        job.patientIdentifier = patientIdUtil.create('pid', 'DOD;000000003');
        job.requestStampTime = '20140102120059.000';

        var localConfig = _.clone(config);
        localConfig.jmeadows = {
            version: jmeadowsVersion,
            domains: ['dischargeSummary']
        };

        var matchingJobTypes = [jobUtil.jmeadowsCdaDocumentConversionType()];

        testHandler(handler, logger, localConfig, environment, host, port, tubename, job, matchingJobTypes);
    });

    describe('test JDS communications', function() {
        var jdsClient = new JdsClient(logger, logger, config);
        var environment = {
            jds: jdsClient,
            publisherRouter: {
                publish: function(job, callback) {
                    callback();
                }
            },
            metrics:logger
        };
        // var expectedJdsResponse = {
        //     statusCode: 200
        // };
        // //jdsClientDummy._setResponseData(null, expectedJdsResponse, undefined);

        var dodAllergyItems = require('../../../data/secondary/'+jmeadowsSoapPath+'/allergySoap');

        var job = {};
        job.type = 'jmeadows-xform-allergy-vpr';
        job.dataDomain = 'allergy';
        job.record = dodAllergyItems;
        job.jpid = uuid.v4();
        job.icn = '10108V420871';
        job.patientIdentifier = testPatientIdentifier;
        job.requestStampTime = '20140102120059';

        var localConfig = _.clone(config);
        localConfig.jmeadows = {
            version: jmeadowsVersion,
            domains: ['allergy']
        };

        it('verify metastamp is stored in JDS', function() {
            var cleanUpDone = true;
            runs(function() {
                environment.jds.deletePatientByPid(testPatientIdentifier.value, function() {
                    cleanUpDone = true;
                });
            });

            waitsFor(function(){
                return cleanUpDone;
            });

            var setUpDone = false;
            runs(function() {
                environment.jds.storePatientIdentifier({
                    'patientIdentifiers': [testPatientIdentifier.value]
                }, function() {
                    setUpDone = true;
                });
            });

            waitsFor(function() {
                return setUpDone;
            });

            var handleDone = false;
            runs(function() {
                handler(logger, localConfig, environment, job, function() {
                    handleDone = true;
                });
            });

            waitsFor(function() {
                return handleDone;
            });

            var done = false;
            runs(function() {
                environment.jds.getSyncStatus(testPatientIdentifier, function(error, response) {
                    expect(error).toBeFalsy();
                    expect(val(response, 'statusCode')).toBe(200);
                    done = true;
                });
            });
            waitsFor(function() {
                return done;
            });

            var cleanUpDone = false;
            runs(function() {
                environment.jds.deletePatientByPid(testPatientIdentifier.value, function() {
                    cleanUpDone = true;
                });
            });
            waitsFor(function() {
                return cleanUpDone;
            });
        });

    });
});