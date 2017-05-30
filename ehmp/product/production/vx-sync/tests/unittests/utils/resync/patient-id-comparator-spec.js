'use strict';
require('../../../../env-setup');
var patIdCompareUtil = require(global.VX_UTILS + 'resync/patient-id-comparator');
var JdsClientDummy = require(global.VX_DUMMIES + 'jds-client-dummy');
var jobUtil = require(global.VX_UTILS + 'job-utils');
var PublisherRouterDummy = require(global.VX_DUMMIES + 'publisherRouterDummy');
var PublisherDummy = require(global.VX_DUMMIES + 'publisherDummy');


//--------------------------------------------------------------
// Uncomment the following to see the logging out on the screen.
//--------------------------------------------------------------
/*
var log = require('bunyan').createLogger({
      name: 'patient-id-comparator',
      level: 'debug'
     });
*/
// this should be in production code.
var log = require(global.VX_DUMMIES + 'dummy-logger');

var hmpServer = 'TheHmpServer';
var requestJob= { jpid:'00000000-0000-0000-0000-000000000000',
                requestJob: {
                    patientIdentifier:{
                        'type': 'pid',
                        'value': '9E7A;3' }
                    }
                };
var job = jobUtil.createEnterpriseSyncRequest(requestJob.requestJob.patientIdentifier, requestJob.jpid, requestJob.force);
    job.jobId = 1;

var config = {
    jds: {
        protocol: 'http',
        host: 'REDACTED    ',
        port: PORT
    },
    'vistaSites': {
        '9E7A': {
            'name': 'panorama',
            'host': 'REDACTED    ',
            'port': PORT,
            'accessCode': 'REDACTED',
            'verifyCode': 'REDACTED',
            'localIP': '127.0.0.1',
            'localAddress': 'localhost',
            'connectTimeout': 3000,
            'sendTimeout': 10000
        },
        'C877': {
            'name': 'kodak',
            'host': 'REDACTED    ',
            'port': PORT,
            'accessCode': 'REDACTED',
            'verifyCode': 'REDACTED',
            'localIP': '127.0.0.1',
            'localAddress': 'localhost',
            'connectTimeout': 3000,
            'sendTimeout': 10000
        }
    },
    'hmp.server.id': hmpServer,
    'hmp.version': '0.7-S65',
    'hmp.batch.size': '1000',
    'hmp.extract.schema': '3.001',
    'hdr': {
        'operationMode': 'REQ/RES'
    }
};

var demographicsFromVista = {
    'pid': '9E7A;3',
    'birthDate': '19350407',
    'last4': '0008',
    'last5': 'E0008',
    'icn': '10108V420871',
    'familyName': 'EIGHT',
    'givenNames': 'PATIENT',
    'fullName': 'EIGHT,PATIENT',
    'displayName': 'Eight,Patient',
    'genderCode': 'urn:va:pat-gender:M',
    'genderName': 'Male',
    'sensitive': false,
    'uid': 'urn:va:patient:9E7A:3:3',
    'summary': 'Eight,Patient',
    'ssn': '666000008',
    'localId': '3'
};




//---------------------------------------------------------------------
// Create an instance of the environment variable.
//---------------------------------------------------------------------
function createEnvironment(vistaClient, config) {
    var publisherRouterDummy = new PublisherRouterDummy(log, config, PublisherDummy);
    var jdsClient = new JdsClientDummy(log, config);
    var environment = {
        jds: jdsClient,
        publisherRouter: publisherRouterDummy,
        mvi: { lookup : jasmine.createSpy().andCallFake(mviLookup) },
        vistaClient: {}
    };

    if (vistaClient) {
        environment.vistaClient = vistaClient;
    }

    spyOn(environment.publisherRouter, 'publish').andCallThrough();

    return environment;
}
//mock mvi results to return
var pidsFromMvi = [{type: 'icn', value:'10108V420871'},
            {type: 'pid', value:'2939;19'},
            {type: 'HDR', value:'HDR;10108V420871'},
            {type: 'VLER', value:'VLER;10108V420871'},
            {type: 'VHICID', value:'VHICID;10108V420871'},
            {type: 'pid', value:'FFC7;28'},
            {type: 'pid', value:'9E7A;3'},
            {type: 'edipi', value:'DOD;11223344'},
            {type: 'dfn', value:'dfn;99887766'}];

//mock mvi results
function mviLookup(patientIdentifier, callback) {
    return callback(null, pidsFromMvi);
} 

describe('patient-id-comparator.js', function() {
    describe('JDS returns an error', function() {
        it('verify Patient Identifier does not request a resync', function() {
            var vistaClient = {
                getDemographics: function(vistaId, dfn, callback) {
                    return callback(null, demographicsFromVista);
                }
            };
            var environment = createEnvironment(vistaClient, config);
            var expectedJdsError = [null, null];
            var expectedJdsResponse = [{statusCode: 500}];
            var expectedJdsResult = {
                    patientIdentifiers: []
            };
            environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

            var callback = jasmine.createSpy();
            patIdCompareUtil.detectAndResync(log, environment, job, null ,callback);

            waitsFor(function() {
                return callback.callCount > 0;
            }, 'The call timed out.', 5000);

            runs(function() {
                expect(callback).toHaveBeenCalled();
                expect(environment.publisherRouter.publish).not.toHaveBeenCalled();
            });
        });
    });

    describe('JDS ID list is empty patient Does Not need a resync', function() {
        it('verify Patient Identifier does not require a resync', function() {
            var vistaClient = {
                getDemographics: function(vistaId, dfn, callback) {
                    return callback(null, demographicsFromVista);
                }
            };
            var environment = createEnvironment(vistaClient, config);
            var expectedJdsError = [null, null];
            var expectedJdsResponse = [{statusCode: 200}];
            var expectedJdsResult = {
                patientIdentifiers: []
            };
            environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

            var callback = jasmine.createSpy();
            patIdCompareUtil.detectAndResync(log, environment, job, null,callback);

            waitsFor(function() {
                return callback.callCount > 0;
            }, 'The call timed out.', 5000);

            runs(function() {
                expect(callback).toHaveBeenCalled();
                expect(callback).toHaveBeenCalledWith(null, 'NA');
                expect(environment.publisherRouter.publish).not.toHaveBeenCalled();
            });
        });
    });


//===================== all the test below are done with a non null MviResult ===============================

    describe('JDS returns an error', function() {
        it('verify Patient Identifier does not request a resync', function() {
            var vistaClient = {
                getDemographics: function(vistaId, dfn, callback) {
                    return callback(null, demographicsFromVista);
                }
            };
            var environment = createEnvironment(vistaClient, config);
            var expectedJdsError = [null, null];
            var expectedJdsResponse = [{statusCode: 500}];
            var expectedJdsResult = {
                    patientIdentifiers: []
            };
            environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

            var callback = jasmine.createSpy();
            patIdCompareUtil.detectAndResync(log, environment, job, pidsFromMvi,callback);

            waitsFor(function() {
                return callback.callCount > 0;
            }, 'The call timed out.', 5000);

            runs(function() {
                expect(callback).toHaveBeenCalled();
                expect(environment.publisherRouter.publish).not.toHaveBeenCalled();
            });
        });
    });

    describe('JDS ID list is empty patient Does Not need a resync', function() {
        it('verify Patient Identifier does not require a resync', function() {
            var vistaClient = {
                getDemographics: function(vistaId, dfn, callback) {
                    return callback(null, demographicsFromVista);
                }
            };
            var environment = createEnvironment(vistaClient, config);
            var expectedJdsError = [null, null];
            var expectedJdsResponse = [{statusCode: 200}];
            var expectedJdsResult = {
                patientIdentifiers: []
            };
            environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

            var callback = jasmine.createSpy();
            patIdCompareUtil.detectAndResync(log, environment, job, pidsFromMvi,callback);

            waitsFor(function() {
                return callback.callCount > 0;
            }, 'The call timed out.', 5000);

            runs(function() {
                expect(callback).toHaveBeenCalled();
                expect(callback).toHaveBeenCalledWith(null, 'NA');
                expect(environment.publisherRouter.publish).not.toHaveBeenCalled();
            });
        });
    });

    describe('patient Does Not need a resync because JDS and MVI patient id lists are the same', function() {
        it('verify Patient Identifier does not require a resync', function() {
            var vistaClient = {
                getDemographics: function(vistaId, dfn, callback) {
                    return callback(null, demographicsFromVista);
                }
            };
            var environment = createEnvironment(vistaClient, config);
            var expectedJdsError = [null, null];
            var expectedJdsResponse = [{statusCode: 200},{statusCode: 200}];
            var expectedJdsResult = [{
                    patientIdentifiers: [
                        '10108V420871',
                        'HDR;10108V420871',
                        '2939;19',
                        '9E7A;3',
                        'FFC7;28',
                        'DOD;11223344',
                        'dfn;99887766']
                        },{}];
            environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

            var callback = jasmine.createSpy();
            patIdCompareUtil.detectAndResync(log, environment, job,  pidsFromMvi, callback);

            waitsFor(function() {
                return callback.callCount > 0;
            }, 'The call timed out.', 5000);

            runs(function() {
                expect(callback).toHaveBeenCalled();
                expect(environment.publisherRouter.publish).not.toHaveBeenCalled();
            });
        });
    });

    describe('patient Does need a resync because JDS Patient list has an id not in MVI', function() {
        it('verify Patient Identifier does require a resync', function() {
            var vistaClient = {
                getDemographics: function(vistaId, dfn, callback) {
                    return callback(null, demographicsFromVista);
                }
            };
            var environment = createEnvironment(vistaClient, config);
            var expectedJdsError = [null, null];
            var expectedJdsResponse = [{statusCode: 200}, {statusCode: 200}];
            var expectedJdsResult = [{
                    patientIdentifiers: [
                        '10108V420871',
                        '2939;19',
                        '9E7A;3',
                        'C877;77',  //*not in MVI
                        'FFC7;28']
                        }, {}];
            environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);
            var callback = jasmine.createSpy();
            patIdCompareUtil.detectAndResync(log, environment, job, pidsFromMvi, callback);

            waitsFor(function() {
                return callback.callCount > 0;
            }, 'The call timed out.', 5000);

            runs(function() {
                expect(callback).toHaveBeenCalled();
                expect(environment.publisherRouter.publish).toHaveBeenCalled();
            });

        });
    });

    describe('patient Does Not need a resync, JDS is missing an ID(s) that is in MVI', function() {
        it('verify Patient Identifier does not require a resync', function() {
            var vistaClient = {
                getDemographics: function(vistaId, dfn, callback) {
                    return callback(null, demographicsFromVista);
                }
            };
            var environment = createEnvironment(vistaClient, config);
            var expectedJdsError = [null, null];
            var expectedJdsResponse = [{statusCode: 200}, {statusCode: 200}];
            var expectedJdsResult = [{
                    patientIdentifiers: [
                        '10108V420871',
                        '2939;19',
                        '9E7A;3']
                        }, {}];
            environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

            var callback = jasmine.createSpy();
            patIdCompareUtil.detectAndResync(log, environment, job, pidsFromMvi, callback);

            waitsFor(function() {
                return callback.callCount > 0;
            }, 'The call timed out.', 5000);

            runs(function() {
                expect(callback).toHaveBeenCalled();
                expect(environment.publisherRouter.publish).not.toHaveBeenCalled();
            });
        });
    });

    // *******************************************************
    describe('patient Does need a resync because ICN value is different ', function() {
        it('verify Patient Identifier does require a resync', function() {
            var vistaClient = {
                getDemographics: function(vistaId, dfn, callback) {
                    return callback(null, demographicsFromVista);
                }
            };
            var environment = createEnvironment(vistaClient, config);
            var expectedJdsError = [null, null];
            var expectedJdsResponse = [{statusCode: 200},{statusCode: 200}];
            var expectedJdsResult = [{
                    patientIdentifiers: [
                        '10108V420872',
                        '2939;19',
                        '9E7A;3',
                        'FFC7;28',
                        'DOD;11223344']
                        }, {}];
            environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);
            var callback = jasmine.createSpy();
            patIdCompareUtil.detectAndResync(log, environment, job, pidsFromMvi, callback);

            waitsFor(function() {
                return callback.callCount > 0;
            }, 'The call timed out.', 5000);

            runs(function() {
                expect(callback).toHaveBeenCalled();
                expect(environment.publisherRouter.publish).toHaveBeenCalled();
            });
        });
    });

    // *******************************************************
    describe('patient Does need a resync because EDIPI value is different ', function() {
        it('verify Patient Identifier does require a resync', function() {
            var vistaClient = {
                getDemographics: function(vistaId, dfn, callback) {
                    return callback(null, demographicsFromVista);
                }
            };
            var environment = createEnvironment(vistaClient, config);
            var expectedJdsError = [null, null];
            var expectedJdsResponse = [{statusCode: 200},{statusCode: 200}];
            var expectedJdsResult = [{
                    patientIdentifiers: [
                        '10108V420871',
                        '2939;19',
                        '9E7A;3',
                        'FFC7;28',
                        'DOD;11223355']
                        },{}];
            environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);
            var callback = jasmine.createSpy();
            patIdCompareUtil.detectAndResync(log, environment, job, pidsFromMvi, callback);

            waitsFor(function() {
                return callback.callCount > 0;
            }, 'The call timed out.', 5000);

            runs(function() {
                expect(callback).toHaveBeenCalled();
                expect(environment.publisherRouter.publish).toHaveBeenCalled();
            });
        });
    });

    // *******************************************************
    describe('patient Does need a resync because PID value is different ', function() {
        it('verify Patient Identifier does require a resync', function() {
            var vistaClient = {
                getDemographics: function(vistaId, dfn, callback) {
                    return callback(null, demographicsFromVista);
                }
            };
            var environment = createEnvironment(vistaClient, config);
            var expectedJdsError = [null, null];
            var expectedJdsResponse = [{statusCode: 200},{statusCode: 200}];
            var expectedJdsResult = [{
                    patientIdentifiers: [
                        '10108V420871',
                        '2939;19',
                        '9E7A;3',
                        'FFC7;82']  //different
                        },{}];
            environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);
            var callback = jasmine.createSpy();
            patIdCompareUtil.detectAndResync(log, environment, job, pidsFromMvi, callback);

            waitsFor(function() {
                return callback.callCount > 0;
            }, 'The call timed out.', 5000);

            runs(function() {
                expect(callback).toHaveBeenCalled();
                expect(environment.publisherRouter.publish).toHaveBeenCalled();
            });
        });
    });

    // *******************************************************
    describe('patient Does need a resync because DFN value is different ', function() {
        it('verify Patient Identifier does require a resync', function() {
            var vistaClient = {
                getDemographics: function(vistaId, dfn, callback) {
                    return callback(null, demographicsFromVista);
                }
            };
            var environment = createEnvironment(vistaClient, config);
            var expectedJdsError = [null, null];
            var expectedJdsResponse = [{statusCode: 200},{statusCode: 200}];
            var expectedJdsResult = [{
                    patientIdentifiers: [
                        '10108V420871',
                        '2939;19',
                        '9E7A;3',
                        'FFC7;28',
                        'dfn;112244']  //different
                        },{}];
            environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);
            var callback = jasmine.createSpy();
            patIdCompareUtil.detectAndResync(log, environment, job, pidsFromMvi, callback);

            waitsFor(function() {
                return callback.callCount > 0;
            }, 'The call timed out.', 5000);

            runs(function() {
                expect(callback).toHaveBeenCalled();
                expect(environment.publisherRouter.publish).toHaveBeenCalled();
            });
        });
    });

    describe('patient Does need a resync because DFN value is different but a resync is already in process', function() {
        it('verify Patient Identifier does not another resync', function() {
            var vistaClient = {
                getDemographics: function(vistaId, dfn, callback) {
                    return callback(null, demographicsFromVista);
                }
            };
            var environment = createEnvironment(vistaClient, config);
            var expectedJdsError = [null, null];
            var expectedJdsResponse = [{statusCode: 200},{statusCode: 200}];
            var expectedJdsResult = [{
                patientIdentifiers: [
                    '10108V420871',
                    '2939;19',
                    '9E7A;3',
                    'FFC7;28',
                    'dfn;112244']  //different
            },{jobStatus: [{type: 'resync-request'}]}];
            environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);
            var callback = jasmine.createSpy();
            patIdCompareUtil.detectAndResync(log, environment, job, pidsFromMvi, callback);

            waitsFor(function() {
                return callback.callCount > 0;
            }, 'The call timed out.', 5000);

            runs(function() {
                expect(callback).toHaveBeenCalled();
                expect(environment.publisherRouter.publish).not.toHaveBeenCalled();
            });
        });
    });

});
