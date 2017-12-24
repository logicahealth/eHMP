'use strict';

//---------------------------------------------------------------------------------------------------
// This is an integration test for the vista-record-poller.  Note that since the vista-record-poller
// is really a system that continues to run and poll VistA and process what it gets, it is not
// feasible to test this at the highest layer.  It will be tested from the point in time where it
// believes a message has been received and then process the message.  So our integration test will
// be written to use a known message - and verify that all of the downstream artifacts are created
// from the know message.
//
// Author: Les Westberg
//---------------------------------------------------------------------------------------------------

require('../../../../env-setup');
var _ = require('underscore');

var queueConfig = require(global.VX_JOBFRAMEWORK).QueueConfig;
var VistaClient = require(global.VX_SUBSYSTEMS + 'vista/vista-client');
var PublisherRouter = require(global.VX_JOBFRAMEWORK).PublisherRouter;
var grabJobs = require(global.VX_INTTESTS + 'framework/job-grabber');
var dummyLogger = require(global.VX_DUMMIES + 'dummy-logger');
// var log = require(global.VX_UTILS + 'log');
// dummyLogger = log._createLogger({
//     name: 'test',
//     level: 'debug',
//     child: log._createLogger
// });

var Poller = require(global.VX_HANDLERS + 'vista-record-poller/vista-record-poller');
var JobStatusUpdater = require(global.VX_SUBSYSTEMS + 'jds/JobStatusUpdater');
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var wConfig = require(global.VX_ROOT + 'worker-config');
var realConfig = JSON.parse(JSON.stringify(wConfig));            // Make sure we are not using a shared copy of this so we can make changes later and not side effect some other test.

var val = require(global.VX_UTILS + 'object-utils').getProperty;

var testConfig = require(global.VX_INTTESTS + 'test-config');
var host = testConfig.vxsyncIP;
var port = PORT;
var tubename = 'vx-sync-test';

var beanstalkConfig = queueConfig.createFullBeanstalkConfig({
    repoUniversal: {
        priority: 10,
        delay: 0,
        ttr: 60,
        timeout: 10,
        initMillis: 1000,
        maxMillis: 15000,
        incMillis: 1000
    },
    repoDefaults: {
        host: host,
        port: port,
        tubename: tubename,
        tubePrefix: 'vxs-',
        jobTypeForTube: false
    },
    jobTypes: {
        'enterprise-sync-request': {},
        'vista-operational-subscribe-request': {},

        'vista-SITE-subscribe-request': {},
        'vista-SITE-subscribe-request': {},

        'hdr-sync-request': {},
        'vler-sync-request': {},
        'pgd-sync-request': {},
        'jmeadows-sync-request': {},

        'hdr-xform-vpr': {},
        'vler-xform-vpr': {},
        'pgd-xform-vpr': {},

        'jmeadows-sync-allergy-request': {},
        'jmeadows-sync-appointment-request': {},
        'jmeadows-sync-consult-request': {},
        'jmeadows-sync-demographics-request': {},
        'jmeadows-sync-dischargeSummary-request': {},
        'jmeadows-sync-encounter-request': {},
        'jmeadows-sync-immunization-request': {},
        'jmeadows-sync-lab-request': {},
        'jmeadows-sync-medication-request': {},
        'jmeadows-sync-note-request': {},
        'jmeadows-sync-order-request': {},
        'jmeadows-sync-problem-request': {},
        'jmeadows-sync-progressNote-request': {},
        'jmeadows-sync-radiology-request': {},
        'jmeadows-sync-vital-request': {},

        'jmeadows-xform-allergy-vpr': {},
        'jmeadows-xform-appointment-vpr': {},
        'jmeadows-xform-consult-vpr': {},
        'jmeadows-xform-demographics-vpr': {},
        'jmeadows-xform-dischargeSummary-vpr': {},
        'jmeadows-xform-encounter-vpr': {},
        'jmeadows-xform-immunization-vpr': {},
        'jmeadows-xform-lab-vpr': {},
        'jmeadows-xform-medication-vpr': {},
        'jmeadows-xform-note-vpr': {},
        'jmeadows-xform-order-vpr': {},
        'jmeadows-xform-problem-vpr': {},
        'jmeadows-xform-progressNote-vpr': {},
        'jmeadows-xform-radiology-vpr': {},
        'jmeadows-xform-vital-vpr': {},

        'jmeadows-pdf-document-transform': {},
        'jmeadows-document-retrieval': {},

        'record-enrichment': {},
        'store-record': {},
        'event-prioritization-request': {},
        'event-record-processor-request': {},
        'operational-store-record': {},
        'publish-data-change-event': {},
        'patient-data-state-checker': {}
    }
});

var config = {
    vistaSites: {
        'SITE': {},
        'SITE': {}
    },
// remove this if it has not caused an integration test build to fail
    // mvi: _.defaults(realConfig.mvi, {
    //     protocol: 'http',
    //     host: '127.0.0.1',
    //     port: 54000,
    //     path: '/mvi'
    // }),
    jds: _.defaults(wConfig.jds, {
        protocol: 'http',
        host: 'IP        ',
        port: PORT
    }),
    beanstalk: beanstalkConfig
};

var environment = {
    vistaClient: new VistaClient(dummyLogger, dummyLogger, config),
    jobStatusUpdater: {},
    publisherRouter: {},
    errorPublisher: {
        publishPollerError: function() {}
    },
    metrics: dummyLogger,
    jds: new JdsClient(dummyLogger, dummyLogger, config)
};
environment.jobStatusUpdater = new JobStatusUpdater(dummyLogger, config, environment.jds);
environment.publisherRouter = new PublisherRouter(dummyLogger, config, dummyLogger, environment.jobStatusUpdater);

config.beanstalk.jobRepo =  {
        host: host,
        port: port,
        tubename: tubename
    // },
    // options: {
    //     priority: 5,
    //     delay: 0,
    //     ttr: 0
    // },
    // worker: {
    //     ignoreDefaultTube: true,
    //     timeout: 10
    // },
    // delay: {
    //     initMillis: 1000,
    //     maxMillis: 5000,
    //     incMillis: 1000
    // }
};

var vistaIdValue = 'CCCC';
var icnValue = '10000V400000';
var patrientIdentifierValue = {
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
        }, {
            collection: 'syncStart',
            pid: 'CCCC;3',
            systemId: 'CCCC',
            localId: '3',
            icn: icnValue,
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
                                    'urn:va:allergy:CCCC:3:753': {
                                        stampTime: '20150119135618'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }, {
            collection: 'allergy',
            pid: 'CCCC;3',
            systemId: 'CCCC',
            localId: '3',
            icn: icnValue,
            seq: 1,
            total: 1,
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
                uid: 'urn:va:allergy:CCCC:3:753',
                verified: 20050317200936,
                verifierName: '<auto-verified>'
            }
        } ]
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
        environment.jds.deletePatientByPid(patrientIdentifierValue.value, function(error, response) {
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

//-----------------------------------------------------------------------
// Get the last update time for CCCC
//-----------------------------------------------------------------------
function getSiteLastUpdateTime(environment, callback){
    var completed = false;
    var actualError;
    var actualResponse;
    var actualResult;

    runs(function() {
        environment.jds.getOperationalDataMutable('CCCC', function(error, response, result) {
            actualError = error;
            actualResponse = response;
            actualResult = result;
            completed = true;
        });
    });

    waitsFor(function() {
        return completed;
    }, 'Timed out waiting for jds.deleteOperationalDataMutable.', 20000);

    runs(function() {
        expect(actualError).toBeFalsy();
        expect(actualResponse).toBeTruthy();
        expect(actualResult).toBeTruthy();
        expect(val(actualResponse, 'statusCode')).toEqual(200);
        callback(null, actualResult);
    });
}

//-----------------------------------------------------------------------
// Clear the last update time for CCCC
//-----------------------------------------------------------------------
function clearTestSiteLastUpdateTime(environment){
    var completed = false;
    var actualError;
    var actualResponse;

    runs(function() {
        environment.jds.deleteOperationalDataMutable('CCCC', function(error, response) {
            actualError = error;
            actualResponse = response;
            completed = true;
        });
    });

    waitsFor(function() {
        return completed;
    }, 'Timed out waiting for jds.deleteOperationalDataMutable.', 20000);

    runs(function() {
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

function retrieveUnsolicitedUpdatePollerJob(pid, domain, siteHash, jdsClient, callback){
    jdsClient.getJobStatus({jpid: pid}, /*{filter:'?filter=ilike(\"type\",\"vista-' + siteHash + '-data-' + domain + '-poller\")'},*/ function(error, response, result){
        expect(error).toBeFalsy();
        expect(response).toBeTruthy();
        expect(result).toBeTruthy();

        callback(error, result);
    });
}

describe('vista-record-poller.js', function() {

    beforeEach(function() {
        // Clear SyncStatus
        //-----------------
        clearTestPatient(environment);
        clearOperationalSyncStatus(environment);
        clearTestSiteLastUpdateTime(environment);
        // Clear Jobs
        //-----------
        clearTube(dummyLogger, host, port, tubename);

        // Create the patient Identifiers
        //--------------------------------
        createPatientIdentifiers(icnValue, patrientIdentifierValue, environment, function(error, response) {
            expect(error).toBeNull();
            expect(response).toBe('success');
        });
    });

    afterEach(function() {
        environment.publisherRouter.close();
    });

    it('poller processed the message correctly - single poller mode', function() {

        var completed = false;
        var actualError;
        var actualResponse;
        var actualSyncStatus;

        //var actualOperationalError;
        //var actualOperationalSyncStatus;

        var actualSiteLastUpdateTime;

        var poller = new Poller(dummyLogger, vistaIdValue, config, environment);
        runs(function() {
            dummyLogger.debug('it(poller processed correctly): started the test');
            var localData = JSON.parse(JSON.stringify(vistaFullMessage.data));
            poller._processBatch(localData, function(error, response) {
                if (error) {
                    actualError = error;
                    actualResponse = response;
                    dummyLogger.debug('it(poller processed correctly): error from _processBatch.  error: %s; response: %s;', actualError, actualResponse);
                    completed = true;
                    return;
                }
                // console.log('it(poller processed correctly): Grabbing jobs from tube.');
                grabJobs(dummyLogger, host, port, tubename, 0, function(error, jobs) {
                    actualResponse = jobs;
                    if (error) {
                        actualError = error;
                        dummyLogger.debug('it(poller processed correctly): error from grabJobs.  error: %s; response: %j;', actualError, actualResponse);
                        completed=true;
                        return;
                    }
                    dummyLogger.debug('it(poller processed correctly): Success Grabbing jobs from tube.');
                    completed = true;
                });
            });
        });

        waitsFor(function() {
            return completed;
        }, 'response from poller._processBatch timed out.', 10000);

        // Now that we have published and retrieved the jobs.  Lets retrieve the SyncStatus (meta stamp)
        //-----------------------------------------------------------------------------------------------
        var completed2 = false;
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
        });

        waitsFor(function() {
            return completed2 /*&& completed3*/;
        }, 'response from poller._processBatch timed out.', 10000);

        // Get the last update time for site CCCC from JDS
        //------------------------------------------------
        var completed4 = false;
        runs(function(){
            getSiteLastUpdateTime(environment, function(error, result){
                actualSiteLastUpdateTime = result;
                completed4 = true;
            });
        });
        waitsFor(function(){
            return completed4;
        });

        // Retrieve the unsolicited update poller job from JDS
        //----------------------------------------------------
        var completed5 = false;
        var actualUnsolicitedUpdatePollerJobResult;
        runs(function(){
            retrieveUnsolicitedUpdatePollerJob(patrientIdentifierValue.value, 'allergy', vistaIdValue, environment.jds, function(error, result){
                actualUnsolicitedUpdatePollerJobResult = result;
                completed5 = true;
            });
        });

        waitsFor(function(){
            return completed5;
        }, 'checking for unsolicited update job status in JDS', 10000);


        runs(function() {
            expect(actualError).toBeFalsy();
            // Verify the site's last update time was stored
            //----------------------------------------------
            expect(actualSiteLastUpdateTime).toBeTruthy();
            expect(val(actualSiteLastUpdateTime, '_id')).toBeTruthy();
            expect(val(actualSiteLastUpdateTime, 'lastUpdate')).toBeTruthy();
            expect(val(actualSiteLastUpdateTime, 'uid')).toBeTruthy();

            // Verify that the jobs were published
            //-------------------------------------
            var jobs = _.chain(actualResponse).map(function(response) {return response.jobs}).flatten().value();
            expect(jobs).toBeTruthy();
            expect(val(jobs, 'length')).toEqual(1);

            var resultJobTypes = _.pluck(jobs, 'type');
            var operationalStoreJobs = _.filter(resultJobTypes, function(job) {
                return (job === 'operational-store-record');
            });
            var prioritizationJobs = _.filter(resultJobTypes, function(job) {
                return (job === 'event-prioritization-request');
            });
            var vistaRecordProcessorJobs = _.filter(resultJobTypes, function(job) {
                return (job === 'vista-record-processor-request');
            });

            expect(val(resultJobTypes, 'length')).toEqual(1);
            expect(val(vistaRecordProcessorJobs, 'length')).toEqual(1);
            expect(val(operationalStoreJobs, 'length')).toEqual(0);         // Regression test - make sure that we get no operational jobs
            expect(val(prioritizationJobs, 'length')).toEqual(0);           // Regression test - make sure that we get no prioritization jobs


            // Verify unsolicited update job sent to JDS
            //------------------------------------------
            expect(_.isEmpty(actualUnsolicitedUpdatePollerJobResult)).toBe(false);
            expect(actualUnsolicitedUpdatePollerJobResult.items).toContain(jasmine.objectContaining({type: 'vista-CCCC-data-allergy-poller'}));

            // Clear the syncStatus we just created.
            //---------------------------------------
            clearTestPatient(environment);
            clearOperationalSyncStatus(environment);
            clearTestSiteLastUpdateTime(environment);
        });
    });

    it('poller processed the message correctly - multiple poller mode', function() {

        var completed = false;
        var actualError;
        var actualResponse;
        var actualSyncStatus;

        var poller = new Poller(dummyLogger, vistaIdValue, config, environment, false, true);
        runs(function() {
            dummyLogger.debug('it(poller processed correctly): started the test');
            var localData = JSON.parse(JSON.stringify(vistaFullMessage.data));
            localData.allocationToken = '123456789';
            poller._processBatch(localData, function(error, response) {
                if (error) {
                    actualError = error;
                    actualResponse = response;
                    dummyLogger.debug('it(poller processed correctly): error from _processBatch.  error: %s; response: %s;', actualError, actualResponse);
                    completed = true;
                    return;
                }
                // console.log('it(poller processed correctly): Grabbing jobs from tube.');
                grabJobs(dummyLogger, host, port, tubename, 0, function(error, jobs) {
                    actualResponse = jobs;
                    if (error) {
                        actualError = error;
                        dummyLogger.debug('it(poller processed correctly): error from grabJobs.  error: %s; response: %j;', actualError, actualResponse);
                        completed=true;
                        return;
                    }
                    dummyLogger.debug('it(poller processed correctly): Success Grabbing jobs from tube.');
                    completed = true;
                });
            });
        });

        waitsFor(function() {
            return completed;
        }, 'response from poller._processBatch timed out.', 10000);

        // Now that we have published and retrieved the jobs.  Lets retrieve the SyncStatus (meta stamp)
        //-----------------------------------------------------------------------------------------------
        var completed2 = false;
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
        });

        waitsFor(function() {
            return completed2 /*&& completed3*/;
        }, 'response from poller._processBatch timed out.', 10000);

        // Retrieve the unsolicited update poller job from JDS
        //----------------------------------------------------
        var completed5 = false;
        var actualUnsolicitedUpdatePollerJobResult;
        runs(function(){
            retrieveUnsolicitedUpdatePollerJob(patrientIdentifierValue.value, 'allergy', vistaIdValue, environment.jds, function(error, result){
                actualUnsolicitedUpdatePollerJobResult = result;
                completed5 = true;
            });
        });

        waitsFor(function(){
            return completed5;
        }, 'checking for unsolicited update job status in JDS', 10000);


        runs(function() {
            expect(actualError).toBeFalsy();

            // Verify that the allocationToken was updated in the poller.
            //-----------------------------------------------------------
            expect(poller.allocationToken).toBe('123456789');
            expect(poller.allocationStatus).toBe('complete');

            // Verify that the jobs were published
            //-------------------------------------
            var jobs = _.chain(actualResponse).map(function(response) {return response.jobs;}).flatten().value();
            expect(jobs).toBeTruthy();
            expect(val(jobs, 'length')).toEqual(1);

            var resultJobTypes = _.pluck(jobs, 'type');
            var operationalStoreJobs = _.filter(resultJobTypes, function(job) {
                return (job === 'operational-store-record');
            });
            var prioritizationJobs = _.filter(resultJobTypes, function(job) {
                return (job === 'event-prioritization-request');
            });
            var vistaRecordProcessorJobs = _.filter(resultJobTypes, function(job) {
                return (job === 'vista-record-processor-request');
            });

            expect(val(resultJobTypes, 'length')).toEqual(1);
            expect(val(vistaRecordProcessorJobs, 'length')).toEqual(1);
            expect(val(operationalStoreJobs, 'length')).toEqual(0);         // Regression test - make sure that we get no operational jobs
            expect(val(prioritizationJobs, 'length')).toEqual(0);           // Regression test - make sure that we get no prioritization jobs


            // Verify unsolicited update job sent to JDS
            //------------------------------------------
            expect(_.isEmpty(actualUnsolicitedUpdatePollerJobResult)).toBe(false);
            expect(actualUnsolicitedUpdatePollerJobResult.items).toContain(jasmine.objectContaining({type: 'vista-CCCC-data-allergy-poller'}));

            // Clear the syncStatus we just created.
            //---------------------------------------
            clearTestPatient(environment);
            clearOperationalSyncStatus(environment);
        });
    });

});