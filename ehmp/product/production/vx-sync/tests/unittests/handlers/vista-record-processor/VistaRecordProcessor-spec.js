'use strict';

//------------------------------------------------------------------------------------
// This file contains unit tests for vista-record-processor.js.
//
// Author: Mike Risher, Les Westberg
//------------------------------------------------------------------------------------

require('../../../../env-setup');

var fs = require('fs');
var path = require('path');
var async = require('async');
var Processor = require(global.VX_HANDLERS + 'vista-record-processor/VistaRecordProcessor');
var PublisherRouterDummy = require(global.VX_DUMMIES + 'publisherRouterDummy');
var PublisherDummy = require(global.VX_DUMMIES + 'publisherDummy');
var patIdCompareUtil = require(global.VX_DUMMIES + 'patient-id-comparator-dummy');
var metricsDummyLogger = require(global.VX_DUMMIES + 'dummy-logger');
var dummyLogger = require(global.VX_DUMMIES + 'dummy-logger');

// MAKE SURE YOU COMMENT OUT THE FOLLOWING BEFORE CHECKING IN
//------------------------------------------------------------
// // var logConfig = require('./worker-config');
// var logConfig = {
//     'loggers': [{
//         'name': 'root',
//         'streams': [{
//             'stream': process.stdout,
//             'level': 'debug'
//         }]
//     }],
// };
// var logUtil = require(global.VX_UTILS + 'log');
// logUtil.initialize(logConfig.loggers);
// var dummyLogger = logUtil.get('VistaRecordProcessor-spec', 'host');
// End of code to comment out.

var publisherRouterDummy = new PublisherRouterDummy(dummyLogger, config, PublisherDummy);
var JobStatusUpdater = require(global.VX_SUBSYSTEMS + 'jds/JobStatusUpdater');
var JdsClientDummy = require(global.VX_DUMMIES + 'jds-client-dummy');

var config = {
    jds: {
        protocol: 'http',
        host: 'IP        ',
        port: PORT
    },
    'hmp.batch.size': 1000,
    hdr: {
        hdrSites: {
            '84F0': {
                stationNumber: 578
            }
        },
        pubsubConfig: {
            maxBatchSize: 500
        }
    }
};

var jdsClientDummy = new JdsClientDummy(dummyLogger, config);
var lastUpdateTimeValue = '3150106-1624';
var vistaIdValue = 'C877';

var environment = {
    jobStatusUpdater: {},
    patientIdComparator :{},
    metrics: metricsDummyLogger,
    publisherRouter: publisherRouterDummy,
    jds: jdsClientDummy,
};
environment.jobStatusUpdater = new JobStatusUpdater(dummyLogger, config, environment.jds);
environment.patientIdComparator =  patIdCompareUtil.detectAndResync;
var processor = new Processor(dummyLogger, config, environment);

var patientIdentifierValue1 = {
    type: 'pid',
    value: vistaIdValue + ';1'
};

var syncStartJobsValue = [{
    collection: 'syncStart',
    pid: vistaIdValue + ';1',
    referenceInfo: {
        'priority': 1,
        'requestId': 'req1234',
        'sessionId': 'sess1234'
    },
    metaStamp: {
        stampTime: '20150114115126',
        sourceMetaStamp: {
            'C877': {
                pid: vistaIdValue + ';1',
                localId: '1',
                stampTime: '20150114115126',
                domainMetaStamp: {
                    'allergy': {
                        domain: 'allergy',
                        stampTime: '20150114115126',
                        eventMetaStamp: {
                            'urn:va:allergy:C877:1:751': {
                                stampTime: '20150114115126'
                            },
                            'urn:va:allergy:C877:1:752': {
                                stampTime: '20150114115126'
                            }
                        }
                    }
                }
            }
        }
    }
}, {
    collection: 'syncStart',
    pid: vistaIdValue + ';2',
    referenceInfo: {
        'priority': 1,
        'requestId': 'req1234',
        'sessionId': 'sess1234'
    },
    metaStamp: {
        stampTime: '20150114115126',
        sourceMetaStamp: {
            'C877': {
                pid: vistaIdValue + ';2',
                localId: '1',
                stampTime: '20150114115126',
                domainMetaStamp: {
                    'allergy': {
                        domain: 'allergy',
                        stampTime: '20150114115126',
                        eventMetaStamp: {
                            'urn:va:allergy:C877:2:300': {
                                stampTime: '20150114115126'
                            },
                            'urn:va:allergy:C877:2:301': {
                                stampTime: '20150114115126'
                            }
                        }
                    }
                }
            }
        }
    }
}];

var syncStartJobEmptyMetastamp = {
    collection: 'syncStart',
    rootJobId: '11-111',
    jobId: '11-111',
    pid: vistaIdValue + ';1',
    referenceInfo: {
        'priority': 1,
        'requestId': 'req1234',
        'rootJobId': '11-111',
        'sessionId': 'sess1234',
        'jobId': '11-111'
    },
    metaStamp: {
        stampTime: '20150114115126',
        sourceMetaStamp: {
            'C877': {
                pid: vistaIdValue + ';1',
                localId: '1',
                stampTime: '20150114115126',
                domainMetaStamp: {
                    'auxillary': {
                        domain: 'auxillary',
                        stampTime: '20150114115126',
                        eventMetaStamp: {}
                    }
                }
            }
        }
    }
};

var OPDsyncStartJobsValue = [{
    'collection': 'OPDsyncStart',
    'systemId': '9E7A',
    'rootJobId': '1',
    'jobId': '3',
    'metaStamp': {
        'stampTime': 20141031094920,
        'sourceMetaStamp': {
            '9E7A': {
                'stampTime': 20141031094920,
                'domainMetaStamp': {
                    'doc-def': {
                        'domain': 'doc-def',
                        'stampTime': 20141031094920,
                        'itemMetaStamp': {
                            'urn:va:doc-def:9E7A:1001': {
                                'stampTime': 20141031094920,
                            },
                            'urn:va:doc-def:9E7A:1002': {
                                'stampTime': 20141031094920,
                            }
                        }
                    },
                    'pt-select': {
                        'domain': 'pt-select',
                        'stampTime': 20141031094920,
                        'itemMetaStamp': {
                            'urn:va:pt-select:9E7A:1001': {
                                'stampTime': 20141031094920,
                            },
                            'urn:va:pt-select:9E7a:1002': {
                                'stampTime': 20141031094920,
                            }
                        }
                    }
                }
            }
        }
    }
}];

var vistaDataJobAllergyObjectWithoutPid = {
    uid: 'urn:va:allergy:9E7A:1:27837'
};

var vistaDataJobsValue = [{
    collection: 'allergy',
    pid: vistaIdValue + ';1',
    referenceInfo: {
        'priority': '1',
        'jobId': '11-1',
        'rootJobId': '11',
        'requestId': 'req1234',
        'sessionId': 'sess1234'
    },
    object: vistaDataJobAllergyObjectWithoutPid
}, {
    collection: 'pt-select',
    pid: vistaIdValue + ';2',
    referenceInfo: {
        'priority': '1',
        'jobId': '11-1',
        'rootJobId': '11',
        'requestId': 'req1234',
        'sessionId': 'sess1234'
    },
    object: {
        pid: vistaIdValue + ';2'
    }
}, {
    collection: 'doc-ref',
    object: {
        data: 'some operational data'
    }
}];

var dataValue = {
    lastUpdate: lastUpdateTimeValue,
    items: []
};
dataValue.items = syncStartJobsValue.concat(vistaDataJobsValue);

var rootJobIdValue = '1';
var jobIdValue = '2';
var jpidValue = '9a6c3294-fe16-4a91-b10b-19f78656fb8c';

// Configurations related to VistaHdr
var hdrIdValue = '84F0';
//var hdrUidValue = 'urn:va:vprupdate:' + hdrIdValue;
var hdrprocessor = new Processor(dummyLogger, config, environment);
var hdrPatientIdentifierValue1 = {
    type: 'pid',
    value: hdrIdValue + ';1'
};

var hdrSyncStartJobsValue = [{
    collection: 'syncStart',
    pid: hdrIdValue + ';1',
    metaStamp: {
        stampTime: '20150114115126',
        sourceMetaStamp: {
            '84F0': {
                pid: hdrIdValue + ';1',
                localId: '1',
                stampTime: '20150114115126',
                domainMetaStamp: {
                    'allergy': {
                        domain: 'allergy',
                        stampTime: '20150114115126',
                        eventMetaStamp: {
                            'urn:va:allergy:84F0:1:751': {
                                stampTime: '20150114115126'
                            },
                            'urn:va:allergy:84F0:1:752': {
                                stampTime: '20150114115126'
                            }
                        }
                    }
                }
            }
        }
    }
}, {
    collection: 'syncStart',
    pid: hdrIdValue + ';2',
    metaStamp: {
        stampTime: '20150114115126',
        sourceMetaStamp: {
            '84F0': {
                pid: hdrIdValue + ';2',
                localId: '1',
                stampTime: '20150114115126',
                domainMetaStamp: {
                    'allergy': {
                        domain: 'allergy',
                        stampTime: '20150114115126',
                        eventMetaStamp: {
                            'urn:va:allergy:84F0:2:300': {
                                stampTime: '20150114115126'
                            },
                            'urn:va:allergy:84F0:2:301': {
                                stampTime: '20150114115126'
                            }
                        }
                    }
                }
            }
        }
    }
}];

var hdrDataValue = {
    lastUpdate: lastUpdateTimeValue,
    items: []
};

var vistaHdrDataJobValue = [{
    collection: 'consult',
    pid: '84F0;1',
    localId: '1',
    seq: 1,
    total: 1,
    object: {
      lastUpdateTime: 20140409083720,
      category: 'P',
      uid: 'urn:va:consult:84F0:1:82'
    }
  },
  {
    collection: 'cpt',
    pid: '84F0;1',
    localId: '1',
    seq: 1,
    total: 1,
    object: {
      lastUpdateTime: 20140409083720,
      type: 'U',
      uid: 'urn:va:cpt:84F0:1:881'
    }
  }
];

hdrDataValue.items = hdrSyncStartJobsValue.concat(vistaHdrDataJobValue);

describe('VistaRecordProcessor', function() {
    beforeEach(function() {
        // Underlying JDS calls to monitor and make sure that they are made.
        //---------------------------------------------------------------------------
        // spyOn(jdsClientDummy, 'storeOperationalData').andCallThrough();
        // spyOn(jdsClientDummy, 'getOperationalDataByUid').andCallThrough();

        spyOn(jdsClientDummy, 'storeOperationalDataMutable').andCallThrough();
        spyOn(jdsClientDummy, 'getOperationalDataMutable').andCallThrough();

        spyOn(jdsClientDummy, 'saveSyncStatus').andCallThrough();
        spyOn(jdsClientDummy, 'saveOperationalSyncStatus').andCallThrough();
        spyOn(jdsClientDummy, 'getPatientIdentifierByPid').andCallThrough();
        spyOn(jdsClientDummy, 'saveJobState').andCallThrough();
        spyOn(jdsClientDummy, 'childInstance').andCallThrough();
        spyOn(processor, '_processDataItem').andCallThrough();
        spyOn(processor, '_buildVistaDataJob').andCallThrough();
        //spyOn(processor, '_processVistaDataJobs').andCallThrough();
        spyOn(processor, '_processVistaDataJob').andCallThrough();
        //spyOn(processor, '_processSyncStartJobs').andCallThrough();
        spyOn(processor, '_processSyncStartJob').andCallThrough();
        //spyOn(processor, '_processOPDSyncStartJobs').andCallThrough();
        spyOn(processor, '_processOPDSyncStartJob').andCallThrough();
        spyOn(processor, '_storeMetaStamp').andCallThrough();
        spyOn(processor, '_storeOperationalMetaStamp').andCallThrough();
        spyOn(processor, '_storeCompletedJob').andCallThrough();
        spyOn(hdrprocessor, '_storeCompletedJob').andCallThrough();
        spyOn(publisherRouterDummy, 'publish').andCallThrough();
        spyOn(publisherRouterDummy, 'childInstance').andCallThrough();
        spyOn(dummyLogger, 'child').andCallThrough();
        spyOn(environment.jobStatusUpdater, 'childInstance').andCallThrough();
    });

    describe('operational data', function() {
        it('Null Record', function() {
            var record = null;
            expect(processor._isOperationalData(record)).toBeFalsy();
        });
        it('Empty Items', function() {
            var record = {};
            expect(processor._isOperationalData(record)).toBeTruthy();
        });
        it('PID Record', function() {
            var record = {
                pid: '1'
            };
            expect(processor._isOperationalData(record)).toBeFalsy();
        });
        it('Good Operational Record', function() {
            var record = {
                collection: 'patient'
            };
            expect(processor._isOperationalData(record)).toBeTruthy();
        });
        it('Development Operational Samples', function() {
            //iterates over all sample operational data and confirms that isOperational is true
            var directory = 'tests/data/operational';
            directory = path.resolve(directory);
            fs.readdir(directory, function(err, list) {
                expect(err).toBeFalsy();
                if (err) {
                    return;
                }

                async.eachSeries(list, function(file, callback) {
                    var path = directory + '/' + file;
                    var contents = fs.readFileSync(path);
                    try {
                        contents = JSON.parse(contents);
                        expect(contents).not.toBeUndefined();
                        expect(contents.data).not.toBeUndefined();
                        expect(contents.data.items).not.toBeUndefined();

                        var items = contents.data.items;
                        async.eachSeries(items, function(operationalPayload, callback) {
                            expect(processor._isOperationalData(operationalPayload)).toBeTruthy();
                            callback();
                        });
                        callback();
                    } catch (e) {
                        expect(e).toBeUndefined();
                        console.log(e);
                        // console.log('could not parse ' +file);x
                        callback(e);
                    }
                });
            });
        });
    });
    describe('_processDataItem', function(){
        it('Normal path: syncStart', function(){
            processor._processDataItem(syncStartJobsValue[0], function(){
                expect(processor._processSyncStartJob).toHaveBeenCalled();
            });
        });
        it('Normal path: OPDsyncStart', function(){
            processor._processDataItem(OPDsyncStartJobsValue[0], function(){
                expect(processor._processOPDSyncStartJob).toHaveBeenCalled();
            });
        });
        it('Normal path: vistaDataJob', function(){
            processor._processDataItem(vistaDataJobsValue[0], function(){
                expect(processor._processVistaDataJob).toHaveBeenCalled();
            });
        });
        it('Normal path: vistaDataJob (Empty object)', function(){
            processor._processDataItem({collection: 'allergy', object: null}, function(error, response){
                expect(processor._processVistaDataJob).not.toHaveBeenCalled();
                expect(error).toBeNull();
                expect(response).toEqual('Item of collection type allergy has no data to process');
            });
        });
    });
    describe('_processVistaDataJob', function() {
        it('Happy Path', function() {
            var expectedJdsResponse = {
                statusCode: 201
            };
            jdsClientDummy._setResponseData(null, expectedJdsResponse, undefined);

            var finished = false;
            var actualError;
            var actualResponse;
            runs(function() {
                processor._processVistaDataJob(vistaDataJobsValue[0], function(error, response) {
                    actualError = error;
                    actualResponse = response;
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call to _processVistaDataJobs failed to return in time.', 500);

            runs(function() {
                expect(actualError).toBeFalsy();
                expect(actualResponse).toBeTruthy();
                expect(processor._buildVistaDataJob.calls.length).toEqual(1);
                expect(processor._buildVistaDataJob).toHaveBeenCalledWith(dummyLogger, jasmine.objectContaining(vistaDataJobsValue[0]));
                expect(publisherRouterDummy.childInstance.calls.length).toEqual(1);
                expect(publisherRouterDummy.childInstance).toHaveBeenCalledWith(dummyLogger);
                expect(publisherRouterDummy.publish.calls.length).toEqual(1);
                expect(publisherRouterDummy.publish).toHaveBeenCalledWith(
                        jasmine.objectContaining({
                            type: 'event-prioritization-request',
                            patientIdentifier: {
                                type: 'pid',
                                value: 'C877;1'
                            },
                            // jpid: jasmine.any(String),
                            dataDomain: 'allergy',
                            record: {
                                pid: 'C877;1',
                                uid: 'urn:va:allergy:9E7A:1:27837'
                            }
                        }),
                    jasmine.any(Function));
            });
        });
    });

    describe('_buildVistaDataJob', function() {
        it('Patient Data Job', function() {
            var job = processor._buildVistaDataJob(dummyLogger, vistaDataJobsValue[0]);

            expect(job).toBeTruthy();
            expect(job).toEqual(jasmine.objectContaining({
                type: 'event-prioritization-request',
                patientIdentifier: {
                    type: 'pid',
                    value: 'C877;1'
                },
                // jpid: jasmine.any(String),
                dataDomain: 'allergy',
                record: {
                    pid: 'C877;1',
                    uid: 'urn:va:allergy:9E7A:1:27837'
                },
                priority: 1,
                referenceInfo: {
                    'requestId': 'req1234',
                    'sessionId': 'sess1234'
                },
                rootJobId: '11'
            }));
            // Make sure that the original job ID did not sneak in the new job.
            //-----------------------------------------------------------------
            expect(job).not.toEqual(jasmine.objectContaining({
                jobId: '11-1'
            }));
        });
        it('Patient Data Job (Unsolicited Update)', function() {
            var localVistaDataJobValue = JSON.parse(JSON.stringify(vistaDataJobsValue[0]));
            delete localVistaDataJobValue.referenceInfo;
            localVistaDataJobValue.unsolicitedUpdate = true;
            var job = processor._buildVistaDataJob(dummyLogger, localVistaDataJobValue);

            expect(job).toBeTruthy();
            expect(job).toEqual(jasmine.objectContaining({
                type: 'event-prioritization-request',
                patientIdentifier: {
                    type: 'pid',
                    value: 'C877;1'
                },
                // jpid: jasmine.any(String),
                dataDomain: 'allergy',
                record: {
                    pid: 'C877;1',
                    uid: 'urn:va:allergy:9E7A:1:27837'
                },
                priority: 1,
                referenceInfo: {
                    'initialSyncId': 'C877;1'
                }
            }));
            // Make sure that the original job ID did not sneak in the new job.
            //-----------------------------------------------------------------
            expect(job).not.toEqual(jasmine.objectContaining({
                jobId: '11-1'
            }));
        });
        it('Patient Data Job (Old system - unsolicitedUpdate is undefined)', function() {
            var localVistaDataJobValue = JSON.parse(JSON.stringify(vistaDataJobsValue[0]));
            delete localVistaDataJobValue.referenceInfo;
            var job = processor._buildVistaDataJob(dummyLogger, localVistaDataJobValue);

            expect(job).toBeTruthy();
            expect(job).toEqual(jasmine.objectContaining({
                type: 'event-prioritization-request',
                patientIdentifier: {
                    type: 'pid',
                    value: 'C877;1'
                },
                // jpid: jasmine.any(String),
                dataDomain: 'allergy',
                record: {
                    pid: 'C877;1',
                    uid: 'urn:va:allergy:9E7A:1:27837'
                }
            }));
            // Make sure that the original job ID did not sneak in the new job.
            //-----------------------------------------------------------------
            expect(job).not.toEqual(jasmine.objectContaining({
                jobId: '11-1'
            }));
            expect(job.priority).toBeUndefined();
            expect(job.referenceInfo).toBeUndefined();
        });
        it('Operational Data pt-select', function() {
            var job = processor._buildVistaDataJob(dummyLogger, vistaDataJobsValue[1]);

            expect(job).toBeTruthy();
            expect(job).toEqual(jasmine.objectContaining({
                type: 'operational-store-record',
                jpid: jasmine.any(String),
                record: {
                    pid: 'C877;2'
                }
            }));
            expect(job).not.toEqual(jasmine.objectContaining({
                priority: 1,
                referenceInfo: {
                    'requestId': 'req1234',
                    'sessionId': 'sess1234'
                },
                rootJobId: '11'
            }));
        });
        it('Operational Data other', function() {
            var job = processor._buildVistaDataJob(dummyLogger, vistaDataJobsValue[2]);

            expect(job).toBeTruthy();
            expect(job).toEqual(jasmine.objectContaining({
                type: 'operational-store-record',
                jpid: jasmine.any(String),
                record: {
                    data: 'some operational data'
                }
            }));
        });
    });
    describe('processBatch', function() {
        dummyLogger.info('Now starting processBatch test');
        it('Happy Path', function() {
            var expectedJdsResponse = [{
                statusCode: 200
            },{
                statusCode: 200
            }];
            jdsClientDummy._setResponseData(null, expectedJdsResponse, undefined);

            var finished = false;
            var actualError;
            var actualResponse;
            runs(function() {
                processor.processBatch(dataValue, function(error, response) {
                    dummyLogger.debug('arrived in the callback.');
                    actualError = error;
                    actualResponse = response;
                    finished = true;
                    dummyLogger.debug('end of callback.');
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call to _processBatch failed to return in time.', 1000);

            runs(function() {
                expect(actualError).toBeFalsy();
                expect(actualResponse).toBeTruthy();
                expect(processor._processSyncStartJob.calls.length).toEqual(2);
                expect(processor._processVistaDataJob.calls.length).toEqual(3);
                expect(publisherRouterDummy.publish.calls.length).toEqual(3);
                expect(publisherRouterDummy.publish).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(Function));
            });
        });
    });
    describe('_processSyncStartJob', function() {
        it('Happy Path', function() {
            var expectedJdsResponse = {
                statusCode: 200
            };
            jdsClientDummy._setResponseData(null, expectedJdsResponse, undefined);

            var finished = false;
            var actualError;
            var actualResponse;
            runs(function() {
                processor._processSyncStartJob(syncStartJobsValue[0], function(error, response) {
                    actualError = error;
                    actualResponse = response;
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call to _processSyncStartJobs failed to return in time.', 500);

            runs(function() {
                expect(actualError).toBeFalsy();
                expect(actualResponse).toBeTruthy();
                expect(dummyLogger.child).toHaveBeenCalledWith(syncStartJobsValue[0].referenceInfo);
                expect(jdsClientDummy.saveSyncStatus.calls.length).toEqual(1);
                expect(jdsClientDummy.saveSyncStatus).toHaveBeenCalledWith(syncStartJobsValue[0].metaStamp, patientIdentifierValue1, jasmine.any(Function));
            });
        });
        it('Happy Path (Empty metaStamp)', function() {
            var expectedJdsResponse = {
                statusCode: 200
            };
            jdsClientDummy._setResponseData(null, expectedJdsResponse, undefined);

            var finished = false;
            var actualError;
            var actualResponse;
            runs(function() {
                processor._processSyncStartJob(syncStartJobEmptyMetastamp, function(error, response) {
                    actualError = error;
                    actualResponse = response;
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call to _processSyncStartJobs failed to return in time.', 500);

            runs(function() {
                expect(actualError).toBeFalsy();
                expect(actualResponse).toBeTruthy();
                expect(dummyLogger.child).toHaveBeenCalledWith(syncStartJobEmptyMetastamp.referenceInfo);
                expect(jdsClientDummy.saveSyncStatus.calls.length).toEqual(0);
                //expect(jdsClientDummy.saveSyncStatus).toHaveBeenCalledWith(syncStartJobsValue[0].metaStamp, patientIdentifierValue1, jasmine.any(Function));
            });
        });
        it('No pid', function() {
            var syncStartJobNoPid = {
                collection: 'syncStart',
                metaStamp: {
                    stampTime: '20150114115126',
                    sourceMetaStamp: {
                        '9E7A': {
                            pid: vistaIdValue + ';1',
                            localId: '1',
                            stampTime: '20150114115126',
                            domainMetaStamp: {
                                'allergy': {
                                    domain: 'allergy',
                                    stampTime: '20150114115126',
                                    eventMetaStamp: {
                                        'urn:va:allergy:C877:1:751': {
                                            stampTime: '20150114115126'
                                        },
                                        'urn:va:allergy:C877:1:752': {
                                            stampTime: '20150114115126'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            };
            var finished = false;
            var actualError;
            var actualResponse;
            runs(function() {
                processor._processSyncStartJob(syncStartJobNoPid, function(error, response) {
                    actualError = error;
                    actualResponse = response;
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call to _processSyncStartJobs failed to return in time.', 500);

            runs(function() {
                expect(actualError).toBeNull();
                expect(actualResponse).toBe('FailedNoPid');
                expect(dummyLogger.child).not.toHaveBeenCalled();
                expect(jdsClientDummy.saveSyncStatus.calls.length).toEqual(0);
            });
        });
        it('No metaStamp', function() {
            var syncStartJobNoPid = {
                collection: 'syncStart',
                pid: vistaIdValue + ';1'
            };
            var finished = false;
            var actualError;
            var actualResponse;
            runs(function() {
                processor._processSyncStartJob(syncStartJobNoPid, function(error, response) {
                    actualError = error;
                    actualResponse = response;
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call to _processSyncStartJob failed to return in time.', 500);

            runs(function() {
                expect(actualError).toBeNull();
                expect(actualResponse).toBe(null);
                expect(dummyLogger.child).not.toHaveBeenCalled();
                expect(jdsClientDummy.saveSyncStatus.calls.length).toEqual(0);
            });
        });
    });

    describe('_processOPDSyncStartJob', function() {
        it('Happy Path', function() {
            var expectedJdsResponse = {
                statusCode: 200
            };
            //var jdsClientDummy = new JdsClientDummy(dummyLogger, config);
            jdsClientDummy._setResponseData(null, expectedJdsResponse, undefined);
            //spyOn(jdsClientDummy, 'saveOperationalSyncStatus').andCallThrough();

            var finished = false;
            var actualError;
            var actualResponse;
            runs(function() {
                processor._processOPDSyncStartJob(OPDsyncStartJobsValue[0], function(error, response) {
                    actualError = error;
                    actualResponse = response;
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call to _processSyncStartJobs failed to return in time.', 500);

            runs(function() {
                expect(actualError).toBeFalsy();
                expect(actualResponse).toBeTruthy();
                expect(jdsClientDummy.saveOperationalSyncStatus.calls.length).toEqual(1);
                expect(jdsClientDummy.saveOperationalSyncStatus).toHaveBeenCalledWith(OPDsyncStartJobsValue[0].metaStamp, '9E7A', jasmine.any(Function));
            });
        });

        it('No metaStamp', function() {
            var OPDsyncStartJobNoStamp = {
                collection: 'OPDsyncStart',
                systemId: '9E7A'
            };
            var finished = false;
            var actualError;
            var actualResponse;
            runs(function() {
                processor._processOPDSyncStartJob(OPDsyncStartJobNoStamp, function(error, response) {
                    actualError = error;
                    actualResponse = response;
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call to _processOPDSyncStartJob failed to return in time.', 500);

            runs(function() {
                expect(actualError).toBeNull();
                expect(actualResponse).toBe('FailedNoMetaStamp');
                expect(jdsClientDummy.saveOperationalSyncStatus.calls.length).toEqual(0);
            });
        });
    });

    describe('_storeMetaStamp', function() {
        it('Happy Path', function() {
            var expectedJdsResponse = {
                statusCode: 200
            };
            jdsClientDummy._setResponseData(null, expectedJdsResponse, undefined);

            var finished = false;
            var actualError;
            var actualResponse;
            runs(function() {
                processor._storeMetaStamp(dummyLogger, syncStartJobsValue[0].metaStamp, patientIdentifierValue1, function(error, response) {
                    actualError = error;
                    actualResponse = response;
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call to _storeMetaStamp failed to return in time.', 500);

            runs(function() {
                expect(actualError).toBeFalsy();
                expect(actualResponse).toBeTruthy();
                expect(jdsClientDummy.childInstance.calls.length).toEqual(1);
                expect(jdsClientDummy.saveSyncStatus.calls.length).toEqual(1);
                expect(jdsClientDummy.saveSyncStatus).toHaveBeenCalledWith(syncStartJobsValue[0].metaStamp, patientIdentifierValue1, jasmine.any(Function));
            });
        });
        it('Error From JDS', function() {
            jdsClientDummy._setResponseData('Error occurred.', null, undefined);

            var finished = false;
            var actualError;
            var actualResponse;
            runs(function() {
                processor._storeMetaStamp(dummyLogger, syncStartJobsValue[0].metaStamp, patientIdentifierValue1, function(error, response) {
                    actualError = error;
                    actualResponse = response;
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call to _storeMetaStamp failed to return in time.', 500);

            runs(function() {
                expect(actualError).toBeNull();
                expect(actualResponse).toBe('FailedJdsError');
                expect(jdsClientDummy.childInstance.calls.length).toEqual(1);
                expect(jdsClientDummy.saveSyncStatus.calls.length).toEqual(1);
                expect(jdsClientDummy.saveSyncStatus).toHaveBeenCalledWith(syncStartJobsValue[0].metaStamp, patientIdentifierValue1, jasmine.any(Function));
            });
        });
        it('No response From JDS', function() {
            jdsClientDummy._setResponseData(null, null, undefined);

            var finished = false;
            var actualError;
            var actualResponse;
            runs(function() {
                processor._storeMetaStamp(dummyLogger, syncStartJobsValue[0].metaStamp, patientIdentifierValue1, function(error, response) {
                    actualError = error;
                    actualResponse = response;
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call to _storeMetaStamp failed to return in time.', 500);

            runs(function() {
                expect(actualError).toBeNull();
                expect(actualResponse).toBe('FailedJdsNoResponse');
                expect(jdsClientDummy.childInstance.calls.length).toEqual(1);
                expect(jdsClientDummy.saveSyncStatus.calls.length).toEqual(1);
                expect(jdsClientDummy.saveSyncStatus).toHaveBeenCalledWith(syncStartJobsValue[0].metaStamp, patientIdentifierValue1, jasmine.any(Function));
            });
        });
        it('Incorrect status code response From JDS', function() {
            var expectedJdsResponse = {
                statusCode: 404
            };
            jdsClientDummy._setResponseData(null, expectedJdsResponse, undefined);

            var finished = false;
            var actualError;
            var actualResponse;
            runs(function() {
                processor._storeMetaStamp(dummyLogger, syncStartJobsValue[0].metaStamp, patientIdentifierValue1, function(error, response) {
                    actualError = error;
                    actualResponse = response;
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call to _storeMetaStamp failed to return in time.', 500);

            runs(function() {
                expect(actualError).toBeNull();
                expect(actualResponse).toBe('FailedJdsWrongStatusCode');
                expect(jdsClientDummy.childInstance.calls.length).toEqual(1);
                expect(jdsClientDummy.saveSyncStatus.calls.length).toEqual(1);
                expect(jdsClientDummy.saveSyncStatus).toHaveBeenCalledWith(syncStartJobsValue[0].metaStamp, patientIdentifierValue1, jasmine.any(Function));
            });
        });
    });

    //_storeOperationalMetastamp

    describe('_storeOperationalMetastamp', function() {
        it('Happy Path', function() {
            var expectedJdsResponse = {
                statusCode: 200
            };
            jdsClientDummy._setResponseData(null, expectedJdsResponse, undefined);

            var finished = false;
            var actualError;
            var actualResponse;
            runs(function() {
                processor._storeOperationalMetaStamp(OPDsyncStartJobsValue[0].metaStamp, '9E7A', function(error, response) {
                    actualError = error;
                    actualResponse = response;
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call to _storeOperationalMetaStamp failed to return in time.', 500);

            runs(function() {
                expect(actualError).toBeFalsy();
                expect(actualResponse).toBeTruthy();
                expect(jdsClientDummy.saveOperationalSyncStatus.calls.length).toEqual(1);
                expect(jdsClientDummy.saveOperationalSyncStatus).toHaveBeenCalledWith(OPDsyncStartJobsValue[0].metaStamp, '9E7A', jasmine.any(Function));
            });
        });
        it('Error From JDS', function() {
            jdsClientDummy._setResponseData('Error occurred.', null, undefined);

            var finished = false;
            var actualError;
            var actualResponse;
            runs(function() {
                processor._storeOperationalMetaStamp(OPDsyncStartJobsValue[0].metaStamp, '9E7A', function(error, response) {
                    actualError = error;
                    actualResponse = response;
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call to _storeOperationalMetaStamp failed to return in time.', 500);

            runs(function() {
                expect(actualError).toBeNull();
                expect(actualResponse).toBe('FailedJdsError');
                expect(jdsClientDummy.saveOperationalSyncStatus.calls.length).toEqual(1);
                expect(jdsClientDummy.saveOperationalSyncStatus).toHaveBeenCalledWith(OPDsyncStartJobsValue[0].metaStamp, '9E7A', jasmine.any(Function));
            });
        });
        it('No response From JDS', function() {
            jdsClientDummy._setResponseData(null, null, undefined);

            var finished = false;
            var actualError;
            var actualResponse;
            runs(function() {
                processor._storeOperationalMetaStamp(OPDsyncStartJobsValue[0].metaStamp, '9E7A', function(error, response) {
                    actualError = error;
                    actualResponse = response;
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call to _storeMetaStamp failed to return in time.', 500);

            runs(function() {
                expect(actualError).toBeNull();
                expect(actualResponse).toBe('FailedJdsNoResponse');
                expect(jdsClientDummy.saveOperationalSyncStatus.calls.length).toEqual(1);
                expect(jdsClientDummy.saveOperationalSyncStatus).toHaveBeenCalledWith(OPDsyncStartJobsValue[0].metaStamp, '9E7A', jasmine.any(Function));
            });
        });
        it('Incorrect status code response From JDS', function() {
            var expectedJdsResponse = {
                statusCode: 404
            };
            jdsClientDummy._setResponseData(null, expectedJdsResponse, undefined);

            var finished = false;
            var actualError;
            var actualResponse;
            runs(function() {
                processor._storeOperationalMetaStamp(OPDsyncStartJobsValue[0].metaStamp, '9E7A', function(error, response) {
                    actualError = error;
                    actualResponse = response;
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call to _storeMetaStamp failed to return in time.', 500);

            runs(function() {
                expect(actualError).toBeNull();
                expect(actualResponse).toBe('FailedJdsWrongStatusCode');
                expect(jdsClientDummy.saveOperationalSyncStatus.calls.length).toEqual(1);
                expect(jdsClientDummy.saveOperationalSyncStatus).toHaveBeenCalledWith(OPDsyncStartJobsValue[0].metaStamp, '9E7A', jasmine.any(Function));
            });
        });
    });

    describe('_storeCompletedJob', function() {
       it('Happy Path', function() {
            dummyLogger.debug('**************** starting _storeCompletedJob:Happy Path ***************************');
            var expectedJdsResponses = [{
                statusCode: 200
            }, {
                statusCode: 200
            }];

            var expectedJdsResults = [{
                jpid: jpidValue
            }, undefined];
            jdsClientDummy._setResponseData([null, null], expectedJdsResponses, expectedJdsResults);

            var finished = false;
            var actualError;
            var actualResponse;
            runs(function() {
                processor._storeCompletedJob(dummyLogger, rootJobIdValue, jobIdValue, 'allergy', patientIdentifierValue1, function(error, response) {
                    actualError = error;
                    actualResponse = response;
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call to _storeCompletedJob failed to return in time.', 500);

            runs(function() {
                expect(actualError).toBeFalsy();
                expect(actualResponse).toBeTruthy();
                expect(jdsClientDummy.childInstance.calls.length).toEqual(2);       // Once within the _storeCompletedJob and once within jobStatusUpdater for the jds client.
                expect(environment.jobStatusUpdater.childInstance.calls.length).toEqual(1);
                expect(jdsClientDummy.getPatientIdentifierByPid.calls.length).toEqual(1);
                expect(jdsClientDummy.getPatientIdentifierByPid).toHaveBeenCalledWith(patientIdentifierValue1.value, jasmine.any(Function));
                expect(jdsClientDummy.saveJobState.calls.length).toEqual(1);
                expect(jdsClientDummy.saveJobState).toHaveBeenCalledWith({
                        type: 'vista-C877-data-allergy-poller',
                        patientIdentifier: patientIdentifierValue1,
                        jpid: jpidValue,
                        rootJobId: rootJobIdValue,
                        jobId: jobIdValue,
                        status: 'completed',
                        timestamp: jasmine.any(String)
                    },
                    jasmine.any(Function));
                dummyLogger.debug('**************** ending _storeCompletedJob:Happy Path ***************************');
            });
        });
        it('Happy Path for VistaHdr', function() {
            dummyLogger.debug('**************** starting _storeCompletedJob:Happy Path for VistaHdr ***************************');
            var expectedJdsResponses = [{
                statusCode: 200
            }, {
                statusCode: 200
            }];

            var expectedJdsResults = [{
                jpid: jpidValue
            }, undefined];
            jdsClientDummy._setResponseData([null, null], expectedJdsResponses, expectedJdsResults);

            var finished = false;
            var actualError;
            var actualResponse;
            runs(function() {
                hdrprocessor._storeCompletedJob(dummyLogger, rootJobIdValue, jobIdValue, 'allergy', hdrPatientIdentifierValue1, function(error, response) {
                    actualError = error;
                    actualResponse = response;
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call to _storeCompletedJob failed to return in time.', 500);

            runs(function() {
                expect(actualError).toBeFalsy();
                expect(actualResponse).toBeTruthy();
                expect(jdsClientDummy.childInstance.calls.length).toEqual(2);       // Once within the _storeCompletedJob and once within jobStatusUpdater for the jds client.
                expect(environment.jobStatusUpdater.childInstance.calls.length).toEqual(1);
                expect(jdsClientDummy.getPatientIdentifierByPid.calls.length).toEqual(1);
                expect(jdsClientDummy.getPatientIdentifierByPid).toHaveBeenCalledWith(hdrPatientIdentifierValue1.value, jasmine.any(Function));
                expect(jdsClientDummy.saveJobState.calls.length).toEqual(1);
                expect(jdsClientDummy.saveJobState).toHaveBeenCalledWith({
                        type: 'vistahdr-84F0-data-allergy-poller',
                        patientIdentifier: hdrPatientIdentifierValue1,
                        jpid: jpidValue,
                        rootJobId: rootJobIdValue,
                        jobId: jobIdValue,
                        status: 'completed',
                        timestamp: jasmine.any(String)
                    },
                    jasmine.any(Function));
                dummyLogger.debug('**************** ending _storeCompletedJob:Happy Path ***************************');
            });
        });
        it('Error From JDS on first call.', function() {
            jdsClientDummy._setResponseData(['Error occurred.'], [null], [undefined]);

            var finished = false;
            var actualError;
            var actualResponse;
            runs(function() {
                processor._storeCompletedJob(dummyLogger, rootJobIdValue, jobIdValue, 'allergy', patientIdentifierValue1, function(error, response) {
                    actualError = error;
                    actualResponse = response;
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call to _storeCompletedJob failed to return in time.', 500);

            runs(function() {
                expect(actualError).toBeNull();
                expect(actualResponse).toBe('FailedJdsError');
                expect(jdsClientDummy.childInstance.calls.length).toEqual(1);       // Once within the _storeCompletedJob we skip the one within jobStatusUpdater for the jds client.
                expect(environment.jobStatusUpdater.childInstance.calls.length).toEqual(0);
                expect(jdsClientDummy.getPatientIdentifierByPid.calls.length).toEqual(1);
                expect(jdsClientDummy.getPatientIdentifierByPid).toHaveBeenCalledWith(patientIdentifierValue1.value, jasmine.any(Function));
                expect(jdsClientDummy.saveJobState.calls.length).toEqual(0);
            });
        });
        it('No response From JDS on first call', function() {
            jdsClientDummy._setResponseData([null], [null], [undefined]);

            var finished = false;
            var actualError;
            var actualResponse;
            runs(function() {
                processor._storeCompletedJob(dummyLogger, rootJobIdValue, jobIdValue, 'allergy', patientIdentifierValue1, function(error, response) {
                    actualError = error;
                    actualResponse = response;
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call to _storeCompletedJob failed to return in time.', 500);

            runs(function() {
                expect(actualError).toBeNull();
                expect(actualResponse).toBe('FailedJdsNoResponse');
                expect(jdsClientDummy.childInstance.calls.length).toEqual(1);       // Once within the _storeCompletedJob we skip the one within jobStatusUpdater for the jds client.
                expect(environment.jobStatusUpdater.childInstance.calls.length).toEqual(0);
                expect(jdsClientDummy.getPatientIdentifierByPid.calls.length).toEqual(1);
                expect(jdsClientDummy.getPatientIdentifierByPid).toHaveBeenCalledWith(patientIdentifierValue1.value, jasmine.any(Function));
                expect(jdsClientDummy.saveJobState.calls.length).toEqual(0);
            });
        });
        it('Incorrect status code response From JDS on first call', function() {
            var expectedJdsResponse = {
                statusCode: 404
            };
            jdsClientDummy._setResponseData([null], [expectedJdsResponse], [undefined]);

            var finished = false;
            var actualError;
            var actualResponse;
            runs(function() {
                processor._storeCompletedJob(dummyLogger, rootJobIdValue, jobIdValue, 'allergy', patientIdentifierValue1, function(error, response) {
                    actualError = error;
                    actualResponse = response;
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call to _storeCompletedJob failed to return in time.', 500);

            runs(function() {
                expect(actualError).toBeNull();
                expect(actualResponse).toBe('FailedJdsWrongStatusCode');
                expect(jdsClientDummy.childInstance.calls.length).toEqual(1);       // Once within the _storeCompletedJob we skip the one within jobStatusUpdater for the jds client.
                expect(environment.jobStatusUpdater.childInstance.calls.length).toEqual(0);
                expect(jdsClientDummy.getPatientIdentifierByPid.calls.length).toEqual(1);
                expect(jdsClientDummy.getPatientIdentifierByPid).toHaveBeenCalledWith(patientIdentifierValue1.value, jasmine.any(Function));
                expect(jdsClientDummy.saveJobState.calls.length).toEqual(0);
            });
        });
        it('Error from JDS on second call (when storing job)', function() {
            var expectedJdsResponses = [{
                statusCode: 200
            }, {
                statusCode: 200
            }];

            var expectedJdsResults = [{
                jpid: jpidValue
            }, undefined];
            jdsClientDummy._setResponseData([null, 'JDSErrorOccurred'], expectedJdsResponses, expectedJdsResults);
            dummyLogger.debug('SetResponseData...');

            var finished = false;
            var actualError;
            var actualResponse;
            runs(function() {
                dummyLogger.debug('calling _storeCompletedJob...');
                processor._storeCompletedJob(dummyLogger, rootJobIdValue, jobIdValue, 'allergy', patientIdentifierValue1, function(error, response) {
                    actualError = error;
                    actualResponse = response;
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call to _storeCompletedJob failed to return in time.', 500);

            runs(function() {
                expect(actualError).toBeFalsy();
                expect(actualResponse).toBe('FailedJdsError');
                expect(jdsClientDummy.childInstance.calls.length).toEqual(2);       // Once within the _storeCompletedJob and once within jobStatusUpdater for the jds client.
                expect(environment.jobStatusUpdater.childInstance.calls.length).toEqual(1);
                expect(jdsClientDummy.getPatientIdentifierByPid.calls.length).toEqual(1);
                expect(jdsClientDummy.getPatientIdentifierByPid).toHaveBeenCalledWith(patientIdentifierValue1.value, jasmine.any(Function));
                expect(jdsClientDummy.saveJobState.calls.length).toEqual(1);
                expect(jdsClientDummy.saveJobState).toHaveBeenCalledWith({
                        type: 'vista-C877-data-allergy-poller',
                        patientIdentifier: patientIdentifierValue1,
                        jpid: jpidValue,
                        rootJobId: rootJobIdValue,
                        jobId: jobIdValue,
                        status: 'completed',
                        timestamp: jasmine.any(String)
                    },
                    jasmine.any(Function));
            });
        });
        it('Error from JDS on second call (when storing job) for VistaHdr', function() {
            var expectedJdsResponses = [{
                statusCode: 200
            }, {
                statusCode: 200
            }];

            var expectedJdsResults = [{
                jpid: jpidValue
            }, undefined];
            jdsClientDummy._setResponseData([null, 'JDSErrorOccurred'], expectedJdsResponses, expectedJdsResults);
            dummyLogger.debug('SetResponseData...');

            var finished = false;
            var actualError;
            var actualResponse;
            runs(function() {
                dummyLogger.debug('calling _storeCompletedJob...');
                hdrprocessor._storeCompletedJob(dummyLogger, rootJobIdValue, jobIdValue, 'allergy', hdrPatientIdentifierValue1, function(error, response) {
                    actualError = error;
                    actualResponse = response;
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call to _storeCompletedJob failed to return in time.', 500);

            runs(function() {
                expect(actualError).toBeFalsy();
                expect(actualResponse).toBe('FailedJdsError');
                expect(jdsClientDummy.childInstance.calls.length).toEqual(2);       // Once within the _storeCompletedJob and once within jobStatusUpdater for the jds client.
                expect(environment.jobStatusUpdater.childInstance.calls.length).toEqual(1);
                expect(jdsClientDummy.getPatientIdentifierByPid.calls.length).toEqual(1);
                expect(jdsClientDummy.getPatientIdentifierByPid).toHaveBeenCalledWith(hdrPatientIdentifierValue1.value, jasmine.any(Function));
                expect(jdsClientDummy.saveJobState.calls.length).toEqual(1);
                expect(jdsClientDummy.saveJobState).toHaveBeenCalledWith({
                        type: 'vistahdr-84F0-data-allergy-poller',
                        patientIdentifier: hdrPatientIdentifierValue1,
                        jpid: jpidValue,
                        rootJobId: rootJobIdValue,
                        jobId: jobIdValue,
                        status: 'completed',
                        timestamp: jasmine.any(String)
                    },
                    jasmine.any(Function));
            });
        });
        it('JDS error no response on second call (when storing job)', function() {
            var expectedJdsResponses = [{
                statusCode: 200
            }, undefined];

            var expectedJdsResults = [{
                jpid: jpidValue
            }, undefined];
            jdsClientDummy._setResponseData([null, null], expectedJdsResponses, expectedJdsResults);
            dummyLogger.debug('SetResponseData...');

            var finished = false;
            var actualError;
            var actualResponse;
            runs(function() {
                dummyLogger.debug('calling _storeCompletedJob...');
                processor._storeCompletedJob(dummyLogger, rootJobIdValue, jobIdValue, 'allergy', patientIdentifierValue1, function(error, response) {
                    actualError = error;
                    actualResponse = response;
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call to _storeCompletedJob failed to return in time.', 500);

            runs(function() {
                expect(actualError).toBeFalsy();
                expect(actualResponse).toBe('FailedJdsNoResponse');
                expect(jdsClientDummy.childInstance.calls.length).toEqual(2);       // Once within the _storeCompletedJob and once within jobStatusUpdater for the jds client.
                expect(environment.jobStatusUpdater.childInstance.calls.length).toEqual(1);
                expect(jdsClientDummy.getPatientIdentifierByPid.calls.length).toEqual(1);
                expect(jdsClientDummy.getPatientIdentifierByPid).toHaveBeenCalledWith(patientIdentifierValue1.value, jasmine.any(Function));
                expect(jdsClientDummy.saveJobState.calls.length).toEqual(1);
                expect(jdsClientDummy.saveJobState).toHaveBeenCalledWith({
                        type: 'vista-C877-data-allergy-poller',
                        patientIdentifier: patientIdentifierValue1,
                        jpid: jpidValue,
                        rootJobId: rootJobIdValue,
                        jobId: jobIdValue,
                        status: 'completed',
                        timestamp: jasmine.any(String)
                    },
                    jasmine.any(Function));
            });
        });
        it('JDS error incorrect status code on second call (when storing job)', function() {
            var expectedJdsResponses = [{
                statusCode: 200
            }, {
                statusCode: 404
            }];

            var expectedJdsResults = [{
                jpid: jpidValue
            }, undefined];
            jdsClientDummy._setResponseData([null, null], expectedJdsResponses, expectedJdsResults);
            dummyLogger.debug('SetResponseData...');

            var finished = false;
            var actualError;
            var actualResponse;
            runs(function() {
                dummyLogger.debug('calling _storeCompletedJob...');
                processor._storeCompletedJob(dummyLogger, rootJobIdValue, jobIdValue, 'allergy', patientIdentifierValue1, function(error, response) {
                    actualError = error;
                    actualResponse = response;
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call to _storeCompletedJob failed to return in time.', 500);

            runs(function() {
                expect(actualError).toBeFalsy();
                expect(actualResponse).toBe('FailedJdsWrongStatusCode');
                expect(jdsClientDummy.childInstance.calls.length).toEqual(2);       // Once within the _storeCompletedJob and once within jobStatusUpdater for the jds client.
                expect(environment.jobStatusUpdater.childInstance.calls.length).toEqual(1);
                expect(jdsClientDummy.getPatientIdentifierByPid.calls.length).toEqual(1);
                expect(jdsClientDummy.getPatientIdentifierByPid).toHaveBeenCalledWith(patientIdentifierValue1.value, jasmine.any(Function));
                expect(jdsClientDummy.saveJobState.calls.length).toEqual(1);
                expect(jdsClientDummy.saveJobState).toHaveBeenCalledWith({
                        type: 'vista-C877-data-allergy-poller',
                        patientIdentifier: patientIdentifierValue1,
                        jpid: jpidValue,
                        rootJobId: rootJobIdValue,
                        jobId: jobIdValue,
                        status: 'completed',
                        timestamp: jasmine.any(String)
                    },
                    jasmine.any(Function));
            });
        });

    });
});