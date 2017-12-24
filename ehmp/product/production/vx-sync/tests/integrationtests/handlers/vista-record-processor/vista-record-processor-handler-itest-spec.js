'use strict';

//---------------------------------------------------------------------------------------------------
// This is an integration test for the vista-record-procesor-handler.
//
// Author: Les Westberg
//---------------------------------------------------------------------------------------------------

require('../../../../env-setup');
var _ = require('underscore');

var testHandler = require(global.VX_INTTESTS + 'framework/handler-test-framework').testHandler;
var VistaClient = require(global.VX_SUBSYSTEMS + 'vista/vista-client');
var PublisherRouter = require(global.VX_JOBFRAMEWORK).PublisherRouter;
var grabJobs = require(global.VX_INTTESTS + 'framework/job-grabber');
var jobUtil = require(global.VX_UTILS + 'job-utils');
var dummyLogger = require(global.VX_DUMMIES + 'dummy-logger');
// dummyLogger = require('bunyan').createLogger({
//     name: 'dummy-log',
//     level: 'debug'
// });


var handle = require(global.VX_HANDLERS + 'vista-record-processor/vista-record-processor-handler');
var JobStatusUpdater = require(global.VX_SUBSYSTEMS + 'jds/JobStatusUpdater');
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var wConfig = require(global.VX_ROOT + 'worker-config');
var realConfig = JSON.parse(JSON.stringify(wConfig));            // Make sure we are not using a shared copy of this so we can make changes later and not side effect some other test.

var val = require(global.VX_UTILS + 'object-utils').getProperty;

var testConfig = require(global.VX_INTTESTS + 'test-config');
var host = testConfig.vxsyncIP;
var port = PORT;
var tubename = 'vx-sync-test';

var config = {
    vistaSites: {
        'SITE': {},
        'SITE': {}
    },
    // remove this if it has not caused an integration test build to fail
    // mvi: _.defaults(realConfig.mvi, {
    //     protocol: 'http',
    //     host: '127.0.0.1',
    //     port: 5400,
    //     path: '/mvi'
    // }),
    jds: _.defaults(realConfig.jds, {
        protocol: 'http',
        host: 'IP        ',
        port: PORT
    }),
    syncNotifications: {
        discharge: {
            dataDomain: 'discharge'
        }
    }
};

var environment = {
    vistaClient: new VistaClient(dummyLogger, dummyLogger, config),
    jobStatusUpdater: {},
    publisherRouter: {},
    metrics: dummyLogger,
    jds: new JdsClient(dummyLogger, dummyLogger, config)
};
environment.jobStatusUpdater = new JobStatusUpdater(dummyLogger, config, environment.jds);
environment.publisherRouter = new PublisherRouter(dummyLogger, config, dummyLogger, environment.jobStatusUpdater);

var icnValue = '10000V400000';

var patientIdentifierValue = {
    type: 'pid',
    value: 'CCCC;3'
};

var vistaFullMessage = {
    apiVersion: 1.02,
    params: {
        domain: 'PANORAMA.VISTACORE.US',
        systemId: 'CCCC'
    },
    data: {
        updated: '20150119135618',
        totalItems: 6,
        lastUpdate: '3150119-15430',
        waitingPids: [],
        processingPids: [],
        remainingObjects: 0,
        items: [{
            collection: 'OPDsyncStart',
            systemId: 'CCCC',
            rootJobId: '1',
            jobId: '3',
            metaStamp: {
                stampTime: 20141031094920,
                sourceMetaStamp: {
                    'CCCC': {
                        stampTime: 20141031094920,
                        domainMetaStamp: {
                            'asu-class': {
                                domain: 'asu-class',
                                stampTime: 20141031094920,
                                itemMetaStamp: {
                                    'urn:va:asu-class:CCCC:19': {
                                        'stampTime': 20141031094920
                                    },
                                    'urn:va:asu-class:CCCC:31': {
                                        'stampTime': 20141031094920
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }, {
            collection: 'asu-class',
            seq: 1,
            total: 2,
            object: {
                abbreviation: 'ANES',
                active: true,
                displayName: 'Anesthesiologist',
                localId: 19,
                name: 'ANESTHESIOLOGIST',
                uid: 'urn:va:asu-class:CCCC:19'
            }
        }, {
            collection: 'asu-class',
            seq: 2,
            total: 2,
            object: {
                abbreviation: 'ACOS',
                active: true,
                displayName: 'Associate Chief Of Staff',
                localId: 31,
                name: 'ASSOCIATE CHIEF OF STAFF',
                uid: 'urn:va:asu-class:CCCC:31'
            }
        }, {
            collection: 'syncStart',
            pid: 'CCCC;3',
            systemId: 'CCCC',
            localId: '3',
            icn: icnValue,
            rootJobId: '1',
            jobId: '3',
            metaStamp: {
                icn: icnValue,
                stampTime: '20150119135618',
                sourceMetaStamp: {
                    'CCCC': {
                        pid: 'CCCC;3',
                        localId: '3',
                        stampTime: '20150119135618',
                        domainMetaStamp: {
                            allergy: {
                                domain: 'allergy',
                                stampTime: '20150119135618',
                                eventMetaStamp: {
                                    'urn:va:allergy:CCCC:3:751': {
                                        stampTime: '20150119135618'
                                    },
                                    'urn:va:allergy:CCCC:3:752': {
                                        stampTime: '20150119135618'
                                    }
                                }
                            }
                        }
                    }
                }
            },
            seq: 1,
            total: 1
        }, {
            collection: 'allergy',
            pid: 'CCCC;3',
            systemId: 'CCCC',
            localId: '3',
            icn: icnValue,
            seq: 1,
            total: 2,
            object: {
                drugClasses: [{
                    code: 'AM114',
                    name: 'PENICILLINSANDBETA-LACTAMANTIMICROBIALS'
                }],
                entered: 200503172009,
                facilityCode: 500,
                facilityName: 'CAMPMASTER',
                historical: true,
                kind: 'Allergy\/AdverseReaction',
                lastUpdateTime: 20050317200936,
                localId: 751,
                mechanism: 'PHARMACOLOGIC',
                originatorName: 'VEHU, EIGHT',
                products: [{
                    name: 'PENICILLIN',
                    vuid: 'urn:va:vuid'
                }],
                reactions: [{
                    name: 'ITCHING, WATERINGEYES',
                    vuid: 'urn:va:vuid'
                }],
                reference: '125;GMRD(120.82,',
                stampTime: 20050317200936,
                summary: 'PENICILLIN',
                typeName: 'DRUG',
                uid: 'urn:va:allergy:CCCC:3:751',
                verified: 20050317200936,
                verifierName: '<auto-verified>'
            }
        }, {
            collection: 'allergy',
            pid: 'CCCC;3',
            systemId: 'CCCC',
            localId: '3',
            icn: icnValue,
            seq: 1,
            total: 2,
            object: {
                drugClasses: [{
                    code: 'AM114',
                    name: 'PENICILLINSANDBETA-LACTAMANTIMICROBIALS'
                }],
                entered: 200503172009,
                facilityCode: 500,
                facilityName: 'CAMPMASTER',
                historical: true,
                kind: 'Allergy\/AdverseReaction',
                lastUpdateTime: 20050317200936,
                localId: 751,
                mechanism: 'PHARMACOLOGIC',
                originatorName: 'VEHU, EIGHT',
                products: [{
                    name: 'PENICILLIN',
                    vuid: 'urn:va:vuid'
                }],
                reactions: [{
                    name: 'ITCHING, WATERINGEYES',
                    vuid: 'urn:va:vuid'
                }],
                reference: '125;GMRD(120.82,',
                stampTime: 20050317200936,
                summary: 'PENICILLIN',
                typeName: 'DRUG',
                uid: 'urn:va:allergy:CCCC:3:752',
                verified: 20050317200936,
                verifierName: '<auto-verified>'
            }
        }]
    }
};

var dischargeFullMessage = {
    apiVersion: 1.02,
    params: {
        domain: 'PANORAMA.VISTACORE.US',
        systemId: 'CCCC'
    },
    data: {
        updated: '20150119135618',
        totalItems: 6,
        lastUpdate: '3150119-15430',
        waitingPids: [],
        processingPids: [],
        remainingObjects: 0,
        items: [{
            collection: 'syncStart',
            pid: 'CCCC;3',
            systemId: 'CCCC',
            localId: '3',
            icn: icnValue,
            rootJobId: '1',
            jobId: '3',
            metaStamp: {
                icn: icnValue,
                stampTime: '20150119135618',
                sourceMetaStamp: {
                    'CCCC': {
                        pid: 'CCCC;3',
                        localId: '3',
                        stampTime: '20150119135618',
                        domainMetaStamp: {
                            discharge: {
                                domain: 'discharge',
                                stampTime: '20150119135618',
                                eventMetaStamp: {
                                    'urn:va:allergy:CCCC:3:751': {
                                        stampTime: '20150119135618'
                                    }
                                }
                            }
                        }
                    }
                }
            },
            seq: 1,
            total: 1
        }, {
            collection: 'discharge',
            pid: 'CCCC;3',
            systemId: 'CCCC',
            localId: '3',
            icn: icnValue,
            seq: 1,
            total: 1,
            unsolicitedUpdate: true,
            object: {
                deceased: true,
                lastUpdateTime: '20170517094313',
                facilityCode: '998',
                facilityName: 'ABILENE (CAA)',
                kind: 'discharge',
                reasonName: 'CHEST PAIN',
                stampTime: '20170517094313',
                uid: 'urn:va:discharge:CCCC:3:H4654'
            }

        }]
    }
};

//--------------------------------------------------------------------------
// Clear the entries from the tube.
//--------------------------------------------------------------------------
function clearTube(logger, host, port, tubename) {
    var called = false;
    var calledError;

    grabJobs(logger, host, port, tubename, 0, function(error) {
        calledError = error;
        called = true;
    });

    waitsFor(function() {
        return called;
    }, 'should be called', 20000);

    runs(function() {
        // console.log('clearTube: error: %s;', calledError);
        expect(calledError).toBeNull();
    });
}

//-----------------------------------------------------------------------
// Clear the sync status
//-----------------------------------------------------------------------
function clearTestPatient(environment) {
    var completed = false;
    var actualError;
    var actualResponse;

    runs(function() {
        environment.jds.deletePatientByPid(patientIdentifierValue.value, function(error, response) {
            actualError = error;
            actualResponse = response;
            completed = true;
        });
    });

    waitsFor(function() {
        return completed;
    }, 'Timed out waiting for jds.deletePatientByPid.', 20000);

    runs(function() {
        // console.log('deletePatientByPid: error: %s; response: %j', actualError, actualResponse);
        expect(actualError).toBeFalsy();
        expect(actualResponse).toBeTruthy();
        //expect(val(actualResponse, 'statusCode')).toEqual(200); //Status code can be 200 or 404
    });
}

//-----------------------------------------------------------------------
// Clear the operational sync status for CCCC
//-----------------------------------------------------------------------
function clearOperationalSyncStatus(environment) {
    var completed = false;
    var actualError;
    var actualResponse;

    runs(function() {
        environment.jds.deleteOperationalSyncStatus('CCCC', function(error, response) {
            actualError = error;
            actualResponse = response;
            completed = true;
        });
    });

    waitsFor(function() {
        return completed;
    }, 'Timed out waiting for jds.deleteOperationalSyncStatus.', 20000);

    runs(function() {
        // console.log('deleteOperationalSyncStatus: error: %s; response: %j', actualError, actualResponse);
        expect(actualError).toBeFalsy();
        expect(actualResponse).toBeTruthy();
        expect(val(actualResponse, 'statusCode')).toEqual(200);
    });
}

//---------------------------------------------------------------------
// Retrieve sync status
//---------------------------------------------------------------------
function retrieveSyncStatus(patientIdentifier, environment, callback) {
    var completed2 = false;
    var actualError;
    var actualResponse;
    var actualResult;

    // console.log('retrieveSyncStatus: Entering method');
    runs(function() {
        environment.jds.getSyncStatus(patientIdentifier, function(error, response, result) {
            actualError = error;
            actualResponse = response;
            actualResult = result;
            // console.log('retrieveSyncStatus: finished retrieving sync status.  error: %s; response: %s; result: %j', actualError, actualResponse, actualResult);
            completed2 = true;
        });
    });

    waitsFor(function() {
        return completed2;
    }, 'Timed out waiting for jds.clearTestPatient.', 20000);

    runs(function() {
        // console.log('retrieveSyncStatus: error: %s; response: %j', actualError, actualResponse);
        expect(actualError).toBeNull();
        expect(actualResponse).toBeTruthy();
        expect(val(actualResponse, 'statusCode')).toEqual(200);
        expect(actualResult).toBeTruthy();
        callback(null, actualResult);
    });
}

//---------------------------------------------------------------------
// Retrieve operational sync status
//---------------------------------------------------------------------
function retrieveOperationalSyncStatus(siteId, environment, callback) {
    var completed2 = false;
    var actualError;
    var actualResponse;
    var actualResult;

    // console.log('retrieveSyncStatus: Entering method');
    runs(function() {
        environment.jds.getOperationalSyncStatus(siteId, function(error, response, result) {
            actualError = error;
            actualResponse = response;
            actualResult = result;
            // console.log('retrieveSyncStatus: finished retrieving sync status.  error: %s; response: %s; result: %j', actualError, actualResponse, actualResult);
            completed2 = true;
        });
    });

    waitsFor(function() {
        return completed2;
    }, 'Timed out waiting for jds.clearTestPatient.', 20000);

    runs(function() {
        // console.log('retrieveSyncStatus: error: %s; response: %j', actualError, actualResponse);
        expect(actualError).toBeNull();
        expect(actualResponse).toBeTruthy();
        expect(val(actualResponse, 'statusCode')).toEqual(200);
        expect(actualResult).toBeTruthy();
        callback(null, actualResult);
    });
}

//--------------------------------------------------------------------
// Create patientIdentifiers for the patient we want to use.
//--------------------------------------------------------------------
function createPatientIdentifiers(icn, patientIdentifier, environment, callback) {
    var jdsPatientIdentificationRequest = {
        patientIdentifiers: [icn, patientIdentifier.value]
    };
    var completed3 = false;
    var actualError;
    var actualResponse;

    runs(function() {
        environment.jds.storePatientIdentifier(jdsPatientIdentificationRequest, function(error, response, result) {
            actualError = error;
            actualResponse = response;
            dummyLogger.debug('createPatientIdentifiers: finished storing patient identifiers.  error: %s; response: %j; result: %j', error, response, result);
            completed3 = true;
        });
    });

    waitsFor(function() {
        return completed3;
    }, 'Timed out waiting for jds.storePatientIdentifier.', 20000);

    runs(function() {
        expect(actualError).toBeNull();
        expect(actualResponse).toBeTruthy();
        //expect(val(actualResponse, 'statusCode')).toEqual(200);
        callback(null, 'success');
    });

}

describe('vista-record-processor.js', function() {
    describe('Verify handler processed the messages, creates expected jobs, and stores metaStamps / sync status into JDS', function() {
        beforeEach(function() {
            // Clear SyncStatus
            //-----------------
            clearTestPatient(environment);
            clearOperationalSyncStatus(environment);

            // Clear Jobs
            //-----------
            clearTube(dummyLogger, host, port, tubename);

            // Create the patient Identifiers
            //--------------------------------
            createPatientIdentifiers(icnValue, patientIdentifierValue, environment, function(error, response) {
                expect(error).toBeNull();
                expect(response).toBe('success');
            });
        });

        afterEach(function() {
            environment.publisherRouter.close();
        });

        var job = jobUtil.createVistaRecordProcessorRequest(vistaFullMessage.data, null);

        var actualResponse, actualError, actualOperationalSyncStatus, actualSyncStatus;

        var matchingJobTypes = [jobUtil.operationalDataStoreType(), jobUtil.operationalDataStoreType(), jobUtil.eventPrioritizationRequestType(), jobUtil.eventPrioritizationRequestType()];
        testHandler(handle, dummyLogger, config, environment, host, port, tubename, job, matchingJobTypes, null, function(error, response) {
            actualError = error;
            actualResponse = response;
            // Now that we have published and retrieved the jobs.  Lets retrieve the SyncStatus (meta stamp)
            //-----------------------------------------------------------------------------------------------
            var completed2 = false;
            var completed3 = false;
            runs(function() {
                dummyLogger.debug('it(poller processed correctly): before retrieving syncStatus.  error: %s; jobs: %j;', actualError, actualResponse);
                retrieveSyncStatus({
                    type: 'pid',
                    value: 'CCCC;3'
                }, environment, function(error, syncStatus) {
                    actualError = error;
                    actualSyncStatus = syncStatus;
                    dummyLogger.debug('it(poller processed correctly): after retrieving syncStatus.  error: %s; jobs: %j; actualSyncStatus: ', actualError, actualResponse, actualSyncStatus);
                    completed2 = true;
                });
                dummyLogger.debug('it(poller processed correctly): now retrieving operational syncStatus.');
                retrieveOperationalSyncStatus('CCCC', environment, function(error, syncStatus) {
                    actualError = error;
                    actualOperationalSyncStatus = syncStatus;
                    dummyLogger.debug('it(poller processed correctly): after retrieving operational syncStatus. actualOperationalSyncStatus: ', actualOperationalSyncStatus);
                    completed3 = true;
                });
            });

            waitsFor(function() {
                return completed2 && completed3;
            }, 'response from poller._processBatch timed out.', 10000);

            runs(function() {
                expect(actualError).toBeFalsy();

                // Verify that the syncStatus was created
                //---------------------------------------
                expect(actualSyncStatus).toBeTruthy();
                dummyLogger.warn(actualSyncStatus);
                expect(val(actualSyncStatus, 'inProgress')).toBeTruthy();
                expect(val(actualSyncStatus, 'inProgress', 'icn')).toEqual('10000V400000');
                expect(val(actualSyncStatus, 'inProgress', 'sourceMetaStamp')).toBeTruthy();
                expect(val(actualSyncStatus, 'inProgress', 'sourceMetaStamp', 'CCCC')).toBeTruthy();
                expect(val(actualSyncStatus, 'inProgress', 'sourceMetaStamp', 'CCCC', 'domainMetaStamp')).toBeTruthy();

                var domainMetaStamp = val(actualSyncStatus, 'inProgress', 'sourceMetaStamp', 'CCCC', 'domainMetaStamp');
                expect(val(domainMetaStamp, 'allergy')).toBeTruthy();
                expect(val(domainMetaStamp, 'allergy', 'domain')).toEqual('allergy');
                dummyLogger.debug('vista-record-poller-itest-spec - in test...   actualSyncStatus: %j', actualSyncStatus);

                // Verify that the operational syncStatus was created
                //---------------------------------------------------
                //console.log(actualOperationalSyncStatus);
                expect(actualOperationalSyncStatus).toBeTruthy();
                expect(val(actualOperationalSyncStatus, 'inProgress')).toBeTruthy();
                expect(val(actualOperationalSyncStatus, 'inProgress', 'sourceMetaStamp')).toBeTruthy();
                expect(val(actualOperationalSyncStatus, 'inProgress', 'sourceMetaStamp', 'CCCC')).toBeTruthy();
                expect(val(actualOperationalSyncStatus, 'inProgress', 'sourceMetaStamp', 'CCCC', 'domainMetaStamp')).toBeTruthy();

                var operationalDomainMetastamp = val(actualOperationalSyncStatus, 'inProgress', 'sourceMetaStamp', 'CCCC', 'domainMetaStamp');
                //console.log(operationalDomainMetastamp);
                expect(val(operationalDomainMetastamp, 'asu-class')).toBeTruthy();
                expect(val(operationalDomainMetastamp, 'asu-class', 'domain')).toEqual('asu-class');
            });
        });
    });

    describe('Verify handler processed the discharge messages, creates expected jobs, and does NOT stores metaStamps / sync status into JDS', function() {
        beforeEach(function() {
            // Clear SyncStatus
            //-----------------
            clearTestPatient(environment);
            clearOperationalSyncStatus(environment);

            // Clear Jobs
            //-----------
            clearTube(dummyLogger, host, port, tubename);

            // Create the patient Identifiers
            //--------------------------------
            createPatientIdentifiers(icnValue, patientIdentifierValue, environment, function(error, response) {
                expect(error).toBeNull();
                expect(response).toBe('success');
            });
        });

        afterEach(function() {
            environment.publisherRouter.close();
        });

        var job = jobUtil.createVistaRecordProcessorRequest(dischargeFullMessage.data, null);

        var actualResponse, actualError;

        var matchingJobTypes = [jobUtil.syncNotificationType()];
        testHandler(handle, dummyLogger, config, environment, host, port, tubename, job, matchingJobTypes, null, function(error, response) {
            actualError = error;
            actualResponse = response;
            // Now that we have published and retrieved the jobs.  Lets retrieve the SyncStatus (meta stamp)
            //-----------------------------------------------------------------------------------------------
            var completed2 = false;
            runs(function() {
                dummyLogger.debug('it(poller processed correctly): before retrieving syncStatus.  error: %s; jobs: %j;', actualError, actualResponse);
                environment.jds.getSyncStatus({
                    type: 'pid',
                    value: 'CCCC;3'
                }, function(error, response, result) {
                    //Patient not found
                    expect(error).toBeFalsy();
                    expect(response.statusCode).toBe(200);
                    expect(result.syncStatus).toBeFalsy();
                    completed2 = true;
                });
            });

            waitsFor(function() {return completed2;}, 'response from poller._processBatch timed out.', 10000);
        });
    });
});
