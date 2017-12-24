'use strict';

//------------------------------------------------------------------------------------
// This file contains unit tests for vista-record-processor.js.
//
// Author: Mike Risher, Les Westberg
//------------------------------------------------------------------------------------

require('../../../../env-setup');

const fs = require('fs');
const path = require('path');
const async = require('async');
const Processor = require(global.VX_HANDLERS + 'vista-record-processor/VistaRecordProcessor');
const PublisherRouterDummy = require(global.VX_DUMMIES + 'publisherRouterDummy');
const PublisherDummy = require(global.VX_DUMMIES + 'publisherDummy');
const patIdCompareUtil = require(global.VX_DUMMIES + 'patient-id-comparator-dummy');
const metricsDummyLogger = require(global.VX_DUMMIES + 'dummy-logger');
let dummyLogger = require(global.VX_DUMMIES + 'dummy-logger');
const _ = require('lodash');

// MAKE SURE YOU COMMENT OUT THE FOLLOWING BEFORE CHECKING IN
//------------------------------------------------------------
// //let logConfig = require('./worker-config');
// let logConfig = {
//     'loggers': [{
//         'name': 'root',
//         'streams': [{
//             'stream': process.stdout,
//             'level': 'debug'
//         }],
//         addChangeCallback: function(){}
//     }]
// };
// let logUtil = require(global.VX_UTILS + 'log');
// logUtil.initialize(logConfig.loggers[0]);
// let dummyLogger = logUtil.get('VistaRecordProcessor-spec', 'host');
// End of code to comment out.

const JobStatusUpdater = require(global.VX_SUBSYSTEMS + 'jds/JobStatusUpdater');
const JdsClientDummy = require(global.VX_DUMMIES + 'jds-client-dummy');

const config = {
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
    },
    syncNotifications: {
        discharge: {
            dataDomain: 'discharge'
        }
    }
};

const lastUpdateTimeValue = '3150106-1624';
const vistaIdValue = 'SITE';

function getEnvironment() {
    spyOn(dummyLogger, 'child').andCallThrough();

    let jdsClientDummy = new JdsClientDummy(dummyLogger, config);
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

    let jobStatusUpdater = new JobStatusUpdater(dummyLogger, config, jdsClientDummy);
    spyOn(jobStatusUpdater, 'childInstance').andCallThrough();

    let errorPublisher = {
        'publishPollerError': function(site, item, errorMessage, callback) {
            return setTimeout(callback, 0, null, null);
        }
    };
    spyOn(errorPublisher, 'publishPollerError').andCallThrough();

    let publisherRouter = new PublisherRouterDummy(dummyLogger, config, PublisherDummy);
    spyOn(publisherRouter, 'publish').andCallThrough();
    spyOn(publisherRouter, 'childInstance').andCallThrough();

    return {
        jobStatusUpdater: jobStatusUpdater,
        patientIdComparator: patIdCompareUtil.detectAndResync,
        metrics: metricsDummyLogger,
        publisherRouter: publisherRouter,
        jds: jdsClientDummy,
        errorPublisher: errorPublisher
    };
}

function getProcessor(environment) {
    let processor = new Processor(dummyLogger, config, environment);

    spyOn(processor, '_processDataItem').andCallThrough();
    spyOn(processor, '_buildVistaDataJob').andCallThrough();
    spyOn(processor, '_handleItemError').andCallThrough();
    //spyOn(processor, '_processVistaDataJobs').andCallThrough();
    spyOn(processor, '_processVistaDataJob').andCallThrough();
    //spyOn(processor, '_processSyncStartJobs').andCallThrough();
    spyOn(processor, '_processSyncStartJob').andCallThrough();
    //spyOn(processor, '_processOPDSyncStartJobs').andCallThrough();
    spyOn(processor, '_processOPDSyncStartJob').andCallThrough();
    spyOn(processor, '_storeMetaStamp').andCallThrough();
    spyOn(processor, '_storeOperationalMetaStamp').andCallThrough();
    spyOn(processor, '_storeCompletedJob').andCallThrough();

    return processor;
}

function getHdrProcessor(environment) {
    let hdrprocessor = new Processor(dummyLogger, config, environment);
    spyOn(hdrprocessor, '_storeCompletedJob').andCallThrough();
    return hdrprocessor;
}

const patientIdentifierValue1 = {
    type: 'pid',
    value: vistaIdValue + ';1'
};

const syncStartJobsValue = [{
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
            'SITE': {
                pid: vistaIdValue + ';1',
                localId: '1',
                stampTime: '20150114115126',
                domainMetaStamp: {
                    'allergy': {
                        domain: 'allergy',
                        stampTime: '20150114115126',
                        eventMetaStamp: {
                            'urn:va:allergy:SITE:1:751': {
                                stampTime: '20150114115126'
                            },
                            'urn:va:allergy:SITE:1:752': {
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
            'SITE': {
                pid: vistaIdValue + ';2',
                localId: '1',
                stampTime: '20150114115126',
                domainMetaStamp: {
                    'allergy': {
                        domain: 'allergy',
                        stampTime: '20150114115126',
                        eventMetaStamp: {
                            'urn:va:allergy:SITE:2:300': {
                                stampTime: '20150114115126'
                            },
                            'urn:va:allergy:SITE:2:301': {
                                stampTime: '20150114115126'
                            }
                        }
                    }
                }
            }
        }
    }
}];

const syncStartJobEmptyMetastamp = {
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
            'SITE': {
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

const OPDsyncStartJobsValue = [{
    'collection': 'OPDsyncStart',
    'systemId': 'SITE',
    'rootJobId': '1',
    'jobId': '3',
    'metaStamp': {
        'stampTime': 20141031094920,
        'sourceMetaStamp': {
            'SITE': {
                'stampTime': 20141031094920,
                'domainMetaStamp': {
                    'doc-def': {
                        'domain': 'doc-def',
                        'stampTime': 20141031094920,
                        'itemMetaStamp': {
                            'urn:va:doc-def:SITE:1001': {
                                'stampTime': 20141031094920
                            },
                            'urn:va:doc-def:SITE:1002': {
                                'stampTime': 20141031094920
                            }
                        }
                    },
                    'pt-select': {
                        'domain': 'pt-select',
                        'stampTime': 20141031094920,
                        'itemMetaStamp': {
                            'urn:va:pt-select:SITE:1001': {
                                'stampTime': 20141031094920
                            },
                            'urn:va:pt-select:9E7a:1002': {
                                'stampTime': 20141031094920
                            }
                        }
                    }
                }
            }
        }
    }
}];

const vistaDataJobAllergyObjectWithoutPid = {
    uid: 'urn:va:allergy:SITE:1:27837'
};

const vistaDataJobsValue = [{
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

const vistaErrorItem = {
    'error': [{
        'collection': 'med',
        'error': 'A mumps error occurred when extracting patient data. A total of 1 occurred.\n\rAn error occurred on patient: 100296\n\rA problem occurred converting order 39094 for the medication domain\n\r',
        'uid': 'urn:va:med:SITE:100296:12345'
    }]
};

const dataValue = {
    lastUpdate: lastUpdateTimeValue,
    items: []
};
dataValue.items = syncStartJobsValue.concat(vistaDataJobsValue);

const rootJobIdValue = '1';
const jobIdValue = '2';
const jpidValue = '9a6c3294-fe16-4a91-b10b-19f78656fb8c';

// Configurations related to VistaHdr
const hdrIdValue = '84F0';
//const hdrUidValue = 'urn:va:vprupdate:' + hdrIdValue;
//const hdrprocessor = getProcessor(environment);
const hdrPatientIdentifierValue1 = {
    type: 'pid',
    value: hdrIdValue + ';1'
};

const hdrSyncStartJobsValue = [{
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

const dischargeNotification = {
    collection: 'discharge',
    pid: 'SITE;3',
    systemId: 'SITE',
    localId: '3',
    icn: '-1^NO ICN',
    unsolicitedUpdate: true,
    object: {
        deceased: true,
        lastUpdateTime: '20170517094313',
        facilityCode: '998',
        facilityName: 'ABILENE (CAA)',
        kind: 'discharge',
        reasonName: 'CHEST PAIN',
        stampTime: '20170517094313',
        uid: 'urn:va:discharge:SITE:3:H4654'
    }
};

const dischargeSyncStart = {
    collection: 'syncStart',
    metaStamp: {
        pid: 'SITE;3',
        sourceMetaStamp: {
            'SITE': {
                domainMetaStamp: {
                    discharge: {
                        domain: 'discharge',
                        eventMetaStamp: {
                            'urn:va:discharge:SITE:3:H4654': {
                                stampTime: 20170518092221
                            }
                        },
                        stampTime: 20170518092221
                    }
                },
                pid: 'SITE;3',
                stampTime: 20170518092221
            }
        }
    },
    pid: 'SITE;3',
    unsolicitedUpdate: true
};

const hdrDataValue = {
    lastUpdate: lastUpdateTimeValue,
    items: []
};

const vistaHdrDataJobValue = [{
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
}, {
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
}];

hdrDataValue.items = hdrSyncStartJobsValue.concat(vistaHdrDataJobValue);

describe('VistaRecordProcessor', function() {
    describe('operational data', function() {
        it('Null Record', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            let record = null;
            expect(processor._isOperationalData(record)).toBeFalsy();
        });
        it('Empty Items', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            let record = {};
            expect(processor._isOperationalData(record)).toBeTruthy();
        });
        it('PID Record', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            let record = {
                pid: '1'
            };
            expect(processor._isOperationalData(record)).toBeFalsy();
        });
        it('Good Operational Record', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            let record = {
                collection: 'patient'
            };
            expect(processor._isOperationalData(record)).toBeTruthy();
        });
        it('Development Operational Samples', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            //iterates over all sample operational data and confirms that isOperational is true
            let directory = 'tests/data/operational';
            directory = path.resolve(directory);
            fs.readdir(directory, function(err, list) {
                expect(err).toBeFalsy();
                if (err) {
                    return;
                }

                async.eachSeries(list, function(file, callback) {
                    let path = directory + '/' + file;
                    let contents = fs.readFileSync(path);
                    try {
                        contents = JSON.parse(contents);
                        expect(contents).not.toBeUndefined();
                        expect(contents.data).not.toBeUndefined();
                        expect(contents.data.items).not.toBeUndefined();

                        let items = contents.data.items;
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

    describe('_isSyncNotification', function() {
        it('Null domain', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            let domain = null;
            expect(processor._isSyncNotification(domain)).toBeFalsy();
        });
        it('Empty domain', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            let domain = '';
            expect(processor._isOperationalData(domain)).toBeFalsy();
        });
        it('not a sync notification domain', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            let domain = 'allergy';
            expect(processor._isSyncNotification(domain)).toBeFalsy();
        });
        it('is a sync notification domain', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            let domain = 'discharge';
            expect(processor._isSyncNotification(domain)).toBeTruthy();
        });
    });

    describe('_processDataItem', function() {
        it('Normal path: syncStart', function(done) {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            processor._processDataItem(syncStartJobsValue[0], function() {
                expect(processor._processSyncStartJob).toHaveBeenCalled();
                done();
            });
        });
        it('Normal path: OPDsyncStart', function(done) {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            processor._processDataItem(OPDsyncStartJobsValue[0], function() {
                expect(processor._processOPDSyncStartJob).toHaveBeenCalled();
                done();
            });
        });
        it('Normal path: vistaDataJob', function(done) {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            processor._processDataItem(vistaDataJobsValue[0], function() {
                expect(processor._processVistaDataJob).toHaveBeenCalled();
                done();
            });
        });
        it('Normal path: vistaDataJob (Empty object)', function(done) {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            processor._processDataItem({
                collection: 'allergy',
                object: null
            }, function(error, response) {
                expect(processor._processVistaDataJob).not.toHaveBeenCalled();
                expect(error).toBeNull();
                expect(response).toEqual('Item of collection type allergy has no data to process');
                done();
            });
        });
        it('Normal path: Received item level error', function(done) {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            processor._processDataItem(vistaErrorItem, function(error, response) {
                expect(processor._processVistaDataJob).not.toHaveBeenCalled();
                expect(processor._handleItemError).toHaveBeenCalled();
                expect(environment.errorPublisher.publishPollerError).toHaveBeenCalled();
                expect(error).toBeNull();
                expect(response).toContain('A single item from a Vista Batch had an error');
                done();
            });
        });
    });

    describe('_handleItemError', function() {
        it('Normal path:', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            processor._handleItemError(vistaErrorItem, function(error, response) {
                expect(environment.errorPublisher.publishPollerError).toHaveBeenCalledWith('SITE', vistaErrorItem, jasmine.any(String), jasmine.any(Function));
                expect(error).toBeNull();
                expect(response).toContain('A single item from a Vista Batch had an error');
            });
        });
        it('Error Path: Item was null', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            processor._handleItemError(null, function(error, response) {
                expect(environment.errorPublisher.publishPollerError).not.toHaveBeenCalled();
                expect(error).toBeNull();
                expect(response).toContain('Method called with null or undefined item');
            });
        });
        it('Error path: Item did not contain an error node.', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            processor._handleItemError({}, function(error, response) {
                expect(environment.errorPublisher.publishPollerError).not.toHaveBeenCalled();
                expect(error).toBeNull();
                expect(response).toContain('Method called with item that did not contain an error.');
            });
        });
        it('Error path: Item Error did not have any UID.', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            let localItem = JSON.parse(JSON.stringify(vistaErrorItem));
            delete localItem.error[0].uid;
            processor._handleItemError(localItem, function(error, response) {
                expect(environment.errorPublisher.publishPollerError).toHaveBeenCalledWith(undefined, localItem, jasmine.any(String), jasmine.any(Function));
                expect(error).toBeNull();
                expect(response).toContain('A single item from a Vista Batch had an error');
            });
        });
        it('Error path: Item Error contains multiple errors and the second error contains a UID.', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            let localItem = JSON.parse(JSON.stringify(vistaErrorItem));
            delete localItem.error[0].uid;
            localItem.error[1] = JSON.parse(JSON.stringify(vistaErrorItem.error[0]));
            processor._handleItemError(localItem, function(error, response) {
                expect(environment.errorPublisher.publishPollerError).toHaveBeenCalledWith('SITE', localItem, jasmine.any(String), jasmine.any(Function));
                expect(error).toBeNull();
                expect(response).toContain('A single item from a Vista Batch had an error');
            });
        });
    });

    describe('_processVistaDataJob', function() {
        it('Happy Path', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            let expectedJdsResponse = {
                statusCode: 201
            };
            environment.jds._setResponseData(null, expectedJdsResponse, undefined);

            let finished = false;
            let actualError;
            let actualResponse;
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
                expect(environment.publisherRouter.childInstance.calls.length).toEqual(1);
                expect(environment.publisherRouter.childInstance).toHaveBeenCalledWith(dummyLogger);
                expect(environment.publisherRouter.publish.calls.length).toEqual(1);
                expect(environment.publisherRouter.publish).toHaveBeenCalledWith(
                    jasmine.objectContaining({
                        type: 'event-prioritization-request',
                        patientIdentifier: {
                            type: 'pid',
                            value: 'SITE;1'
                        },
                        dataDomain: 'allergy',
                        record: {
                            pid: 'SITE;1',
                            uid: 'urn:va:allergy:SITE:1:27837'
                        }
                    }),
                    jasmine.any(Function));
            });
        });
        it('Sync Notification Path', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            let finished = false;
            let actualError;
            let actualResponse;

            runs(function() {
                processor._processVistaDataJob(dischargeNotification, function(error, response) {
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
                expect(processor._buildVistaDataJob).toHaveBeenCalledWith(dummyLogger, jasmine.objectContaining(dischargeNotification));
                expect(environment.publisherRouter.childInstance.calls.length).toEqual(1);
                expect(environment.publisherRouter.childInstance).toHaveBeenCalledWith(dummyLogger);
                expect(environment.publisherRouter.publish.calls.length).toEqual(1);
                expect(environment.publisherRouter.publish).toHaveBeenCalledWith(
                    jasmine.objectContaining({
                        type: 'sync-notification',
                        patientIdentifier: {
                            type: 'pid',
                            value: 'SITE;3'
                        },
                        dataDomain: 'discharge',
                        record: {
                            deceased: true,
                            lastUpdateTime: '20170517094313',
                            facilityCode: '998',
                            facilityName: 'ABILENE (CAA)',
                            kind: 'discharge',
                            reasonName: 'CHEST PAIN',
                            stampTime: '20170517094313',
                            uid: 'urn:va:discharge:SITE:3:H4654',
                            pid: 'SITE;3'
                        }
                    }),
                    jasmine.any(Function));
            });
        });
    });

    describe('_buildVistaDataJob', function() {
        it('Patient Data Job', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            let job = processor._buildVistaDataJob(dummyLogger, vistaDataJobsValue[0]);

            expect(job).toBeTruthy();
            expect(job).toEqual(jasmine.objectContaining({
                type: 'event-prioritization-request',
                patientIdentifier: {
                    type: 'pid',
                    value: 'SITE;1'
                },
                dataDomain: 'allergy',
                record: {
                    pid: 'SITE;1',
                    uid: 'urn:va:allergy:SITE:1:27837'
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
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            let localVistaDataJobValue = JSON.parse(JSON.stringify(vistaDataJobsValue[0]));
            delete localVistaDataJobValue.referenceInfo;
            localVistaDataJobValue.unsolicitedUpdate = true;
            let job = processor._buildVistaDataJob(dummyLogger, localVistaDataJobValue);

            expect(job).toBeTruthy();
            expect(job).toEqual(jasmine.objectContaining({
                type: 'event-prioritization-request',
                patientIdentifier: {
                    type: 'pid',
                    value: 'SITE;1'
                },
                dataDomain: 'allergy',
                record: {
                    pid: 'SITE;1',
                    uid: 'urn:va:allergy:SITE:1:27837'
                },
                priority: 1,
                referenceInfo: {
                    'initialSyncId': 'SITE;1'
                }
            }));
            // Make sure that the original job ID did not sneak in the new job.
            //-----------------------------------------------------------------
            expect(job).not.toEqual(jasmine.objectContaining({
                jobId: '11-1'
            }));
        });
        it('Patient Data Job (Old system - unsolicitedUpdate is undefined)', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            let localVistaDataJobValue = JSON.parse(JSON.stringify(vistaDataJobsValue[0]));
            delete localVistaDataJobValue.referenceInfo;
            let job = processor._buildVistaDataJob(dummyLogger, localVistaDataJobValue);

            expect(job).toBeTruthy();
            expect(job).toEqual(jasmine.objectContaining({
                type: 'event-prioritization-request',
                patientIdentifier: {
                    type: 'pid',
                    value: 'SITE;1'
                },
                dataDomain: 'allergy',
                record: {
                    pid: 'SITE;1',
                    uid: 'urn:va:allergy:SITE:1:27837'
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
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            let job = processor._buildVistaDataJob(dummyLogger, vistaDataJobsValue[1]);

            expect(job).toBeTruthy();
            expect(job).toEqual(jasmine.objectContaining({
                type: 'operational-store-record',
                record: {
                    pid: 'SITE;2'
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
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            let job = processor._buildVistaDataJob(dummyLogger, vistaDataJobsValue[2]);

            expect(job).toBeTruthy();
            expect(job).toEqual(jasmine.objectContaining({
                type: 'operational-store-record',
                record: {
                    data: 'some operational data'
                }
            }));
        });
        it('Sync Notification Job', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            let job = processor._buildVistaDataJob(dummyLogger, dischargeNotification);

            expect(job).toBeTruthy();
            expect(job).toEqual(jasmine.objectContaining({
                type: 'sync-notification',
                timestamp: jasmine.any(String),
                patientIdentifier: {
                    type: 'pid',
                    value: 'SITE;3'
                },
                priority: 1,
                referenceInfo: {
                    initialSyncId: 'SITE;3'
                },
                dataDomain: 'discharge',
                record: {
                    deceased: true,
                    lastUpdateTime: '20170517094313',
                    facilityCode: '998',
                    facilityName: 'ABILENE (CAA)',
                    kind: 'discharge',
                    reasonName: 'CHEST PAIN',
                    stampTime: '20170517094313',
                    uid: 'urn:va:discharge:SITE:3:H4654',
                    pid: 'SITE;3'
                }
            }));
        });
    });
    describe('processBatch', function() {
        dummyLogger.info('Now starting processBatch test');
        it('Happy Path', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            let expectedJdsResponse = [{
                statusCode: 200
            }, {
                statusCode: 200
            }];
            environment.jds._setResponseData(null, expectedJdsResponse, undefined);

            let finished = false;
            let actualError;
            let actualResponse;
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
                expect(environment.publisherRouter.publish.calls.length).toEqual(3);
                expect(environment.publisherRouter.publish).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(Function));
            });
        });
    });
    describe('_processSyncStartJob', function() {
        it('Happy Path', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            let expectedJdsResponse = {
                statusCode: 200
            };
            environment.jds._setResponseData(null, expectedJdsResponse, undefined);

            let finished = false;
            let actualError;
            let actualResponse;
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
                expect(environment.jds.saveSyncStatus.calls.length).toEqual(1);
                expect(environment.jds.saveSyncStatus).toHaveBeenCalledWith(syncStartJobsValue[0].metaStamp, patientIdentifierValue1, jasmine.any(Function));
            });
        });
        it('Happy Path (Empty metaStamp)', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            let expectedJdsResponse = {
                statusCode: 200
            };
            environment.jds._setResponseData(null, expectedJdsResponse, undefined);

            let finished = false;
            let actualError;
            let actualResponse;
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
                expect(environment.jds.saveSyncStatus.calls.length).toEqual(0);
                //expect(environment.jds.saveSyncStatus).toHaveBeenCalledWith(syncStartJobsValue[0].metaStamp, patientIdentifierValue1, jasmine.any(Function));
            });
        });
        it('Sync Notification Path', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            let finished = false;
            let actualError;
            let actualResponse;
            runs(function() {
                processor._processSyncStartJob(dischargeSyncStart, function(error, response) {
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
                expect(actualResponse).toBeFalsy();
                expect(environment.jds.saveSyncStatus).not.toHaveBeenCalled();
            });
        });
        it('No pid', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            let syncStartJobNoPid = {
                collection: 'syncStart',
                metaStamp: {
                    stampTime: '20150114115126',
                    sourceMetaStamp: {
                        'SITE': {
                            pid: vistaIdValue + ';1',
                            localId: '1',
                            stampTime: '20150114115126',
                            domainMetaStamp: {
                                'allergy': {
                                    domain: 'allergy',
                                    stampTime: '20150114115126',
                                    eventMetaStamp: {
                                        'urn:va:allergy:SITE:1:751': {
                                            stampTime: '20150114115126'
                                        },
                                        'urn:va:allergy:SITE:1:752': {
                                            stampTime: '20150114115126'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            };
            let finished = false;
            let actualError;
            let actualResponse;
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
                expect(environment.jds.saveSyncStatus.calls.length).toEqual(0);
            });
        });
        it('No metaStamp', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            let syncStartJobNoPid = {
                collection: 'syncStart',
                pid: vistaIdValue + ';1'
            };
            let finished = false;
            let actualError;
            let actualResponse;
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
                expect(environment.jds.saveSyncStatus.calls.length).toEqual(0);
            });
        });
    });

    describe('_processOPDSyncStartJob', function() {
        it('Happy Path', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            let expectedJdsResponse = {
                statusCode: 200
            };
            //let environment.jds = new JdsClientDummy(dummyLogger, config);
            environment.jds._setResponseData(null, expectedJdsResponse, undefined);
            //spyOn(environment.jds, 'saveOperationalSyncStatus').andCallThrough();

            let finished = false;
            let actualError;
            let actualResponse;
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
                expect(environment.jds.saveOperationalSyncStatus.calls.length).toEqual(1);
                expect(environment.jds.saveOperationalSyncStatus).toHaveBeenCalledWith(OPDsyncStartJobsValue[0].metaStamp, 'SITE', jasmine.any(Function));
            });
        });

        it('No metaStamp', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            let OPDsyncStartJobNoStamp = {
                collection: 'OPDsyncStart',
                systemId: 'SITE'
            };
            let finished = false;
            let actualError;
            let actualResponse;
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
                expect(environment.jds.saveOperationalSyncStatus.calls.length).toEqual(0);
            });
        });
    });

    describe('_storeMetaStamp', function() {
        it('Happy Path', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            let expectedJdsResponse = {
                statusCode: 200
            };
            environment.jds._setResponseData(null, expectedJdsResponse, undefined);

            let finished = false;
            let actualError;
            let actualResponse;
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
                expect(_.get(environment.jds.childInstance, 'calls', []).length).toEqual(1);
                expect(_.get(environment.jds.saveSyncStatus, 'calls', []).length).toEqual(1);
                expect(environment.jds.saveSyncStatus).toHaveBeenCalledWith(syncStartJobsValue[0].metaStamp, patientIdentifierValue1, jasmine.any(Function));
            });
        });
        it('Error From JDS', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            environment.jds._setResponseData('Error occurred.', null, undefined);

            let finished = false;
            let actualError;
            let actualResponse;
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
                expect(environment.jds.childInstance.calls.length).toEqual(1);
                expect(environment.jds.saveSyncStatus.calls.length).toEqual(1);
                expect(environment.jds.saveSyncStatus).toHaveBeenCalledWith(syncStartJobsValue[0].metaStamp, patientIdentifierValue1, jasmine.any(Function));
            });
        });
        it('No response From JDS', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            environment.jds._setResponseData(null, null, undefined);

            let finished = false;
            let actualError;
            let actualResponse;
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
                expect(environment.jds.childInstance.calls.length).toEqual(1);
                expect(environment.jds.saveSyncStatus.calls.length).toEqual(1);
                expect(environment.jds.saveSyncStatus).toHaveBeenCalledWith(syncStartJobsValue[0].metaStamp, patientIdentifierValue1, jasmine.any(Function));
            });
        });
        it('Incorrect status code response From JDS', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            let expectedJdsResponse = {
                statusCode: 404
            };
            environment.jds._setResponseData(null, expectedJdsResponse, undefined);

            let finished = false;
            let actualError;
            let actualResponse;
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
                expect(environment.jds.childInstance.calls.length).toEqual(1);
                expect(environment.jds.saveSyncStatus.calls.length).toEqual(1);
                expect(environment.jds.saveSyncStatus).toHaveBeenCalledWith(syncStartJobsValue[0].metaStamp, patientIdentifierValue1, jasmine.any(Function));
            });
        });
    });

    describe('_storeOperationalMetastamp', function() {
        it('Happy Path', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            let expectedJdsResponse = {
                statusCode: 200
            };
            environment.jds._setResponseData(null, expectedJdsResponse, undefined);

            let finished = false;
            let actualError;
            let actualResponse;
            runs(function() {
                processor._storeOperationalMetaStamp(OPDsyncStartJobsValue[0].metaStamp, 'SITE', function(error, response) {
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
                expect(environment.jds.saveOperationalSyncStatus.calls.length).toEqual(1);
                expect(environment.jds.saveOperationalSyncStatus).toHaveBeenCalledWith(OPDsyncStartJobsValue[0].metaStamp, 'SITE', jasmine.any(Function));
            });
        });
        it('Error From JDS', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            environment.jds._setResponseData('Error occurred.', null, undefined);

            let finished = false;
            let actualError;
            let actualResponse;
            runs(function() {
                processor._storeOperationalMetaStamp(OPDsyncStartJobsValue[0].metaStamp, 'SITE', function(error, response) {
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
                expect(environment.jds.saveOperationalSyncStatus.calls.length).toEqual(1);
                expect(environment.jds.saveOperationalSyncStatus).toHaveBeenCalledWith(OPDsyncStartJobsValue[0].metaStamp, 'SITE', jasmine.any(Function));
            });
        });
        it('No response From JDS', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            environment.jds._setResponseData(null, null, undefined);

            let finished = false;
            let actualError;
            let actualResponse;
            runs(function() {
                processor._storeOperationalMetaStamp(OPDsyncStartJobsValue[0].metaStamp, 'SITE', function(error, response) {
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
                expect(environment.jds.saveOperationalSyncStatus.calls.length).toEqual(1);
                expect(environment.jds.saveOperationalSyncStatus).toHaveBeenCalledWith(OPDsyncStartJobsValue[0].metaStamp, 'SITE', jasmine.any(Function));
            });
        });
        it('Incorrect status code response From JDS', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            let expectedJdsResponse = {
                statusCode: 404
            };
            environment.jds._setResponseData(null, expectedJdsResponse, undefined);

            let finished = false;
            let actualError;
            let actualResponse;
            runs(function() {
                processor._storeOperationalMetaStamp(OPDsyncStartJobsValue[0].metaStamp, 'SITE', function(error, response) {
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
                expect(environment.jds.saveOperationalSyncStatus.calls.length).toEqual(1);
                expect(environment.jds.saveOperationalSyncStatus).toHaveBeenCalledWith(OPDsyncStartJobsValue[0].metaStamp, 'SITE', jasmine.any(Function));
            });
        });
    });

    describe('_storeCompletedJob', function() {
        it('Happy Path', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            dummyLogger.debug('**************** starting _storeCompletedJob:Happy Path ***************************');
            let expectedJdsResponses = [{
                statusCode: 200
            }, {
                statusCode: 200
            }];

            let expectedJdsResults = [{
                jpid: jpidValue
            }, undefined];

            environment.jds._setResponseData([null, null], expectedJdsResponses, expectedJdsResults);

            let finished = false;
            let actualError;
            let actualResponse;
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
                expect(environment.jds.childInstance.calls.length).toEqual(2); // Once within the _storeCompletedJob and once within jobStatusUpdater for the jds client.
                expect(environment.jobStatusUpdater.childInstance.calls.length).toEqual(1);
                expect(environment.jds.getPatientIdentifierByPid.calls.length).toEqual(1);
                expect(environment.jds.getPatientIdentifierByPid).toHaveBeenCalledWith(patientIdentifierValue1.value, jasmine.any(Function));
                expect(environment.jds.saveJobState.calls.length).toEqual(1);
                expect(environment.jds.saveJobState).toHaveBeenCalledWith({
                        type: 'vista-SITE-data-allergy-poller',
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
            let environment = getEnvironment();
            let hdrprocessor = getHdrProcessor(environment);

            dummyLogger.debug('**************** starting _storeCompletedJob:Happy Path for VistaHdr ***************************');
            let expectedJdsResponses = [{
                statusCode: 200
            }, {
                statusCode: 200
            }];

            let expectedJdsResults = [{
                jpid: jpidValue
            }, undefined];
            environment.jds._setResponseData([null, null], expectedJdsResponses, expectedJdsResults);

            let finished = false;
            let actualError;
            let actualResponse;
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
                expect(environment.jds.childInstance.calls.length).toEqual(2); // Once within the _storeCompletedJob and once within jobStatusUpdater for the jds client.
                expect(environment.jobStatusUpdater.childInstance.calls.length).toEqual(1);
                expect(environment.jds.getPatientIdentifierByPid.calls.length).toEqual(1);
                expect(environment.jds.getPatientIdentifierByPid).toHaveBeenCalledWith(hdrPatientIdentifierValue1.value, jasmine.any(Function));
                expect(environment.jds.saveJobState.calls.length).toEqual(1);
                expect(environment.jds.saveJobState).toHaveBeenCalledWith({
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
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            environment.jds._setResponseData(['Error occurred.'], [null], [undefined]);

            let finished = false;
            let actualError;
            let actualResponse;
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
                expect(environment.jds.childInstance.calls.length).toEqual(1); // Once within the _storeCompletedJob we skip the one within jobStatusUpdater for the jds client.
                expect(environment.jobStatusUpdater.childInstance.calls.length).toEqual(0);
                expect(environment.jds.getPatientIdentifierByPid.calls.length).toEqual(1);
                expect(environment.jds.getPatientIdentifierByPid).toHaveBeenCalledWith(patientIdentifierValue1.value, jasmine.any(Function));
                expect(environment.jds.saveJobState.calls.length).toEqual(0);
            });
        });
        it('No response From JDS on first call', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            environment.jds._setResponseData([null], [null], [undefined]);

            let finished = false;
            let actualError;
            let actualResponse;
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
                expect(environment.jds.childInstance.calls.length).toEqual(1); // Once within the _storeCompletedJob we skip the one within jobStatusUpdater for the jds client.
                expect(environment.jobStatusUpdater.childInstance.calls.length).toEqual(0);
                expect(environment.jds.getPatientIdentifierByPid.calls.length).toEqual(1);
                expect(environment.jds.getPatientIdentifierByPid).toHaveBeenCalledWith(patientIdentifierValue1.value, jasmine.any(Function));
                expect(environment.jds.saveJobState.calls.length).toEqual(0);
            });
        });
        it('Incorrect status code response From JDS on first call', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            let expectedJdsResponse = {
                statusCode: 404
            };
            environment.jds._setResponseData([null], [expectedJdsResponse], [undefined]);

            let finished = false;
            let actualError;
            let actualResponse;
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
                expect(environment.jds.childInstance.calls.length).toEqual(1); // Once within the _storeCompletedJob we skip the one within jobStatusUpdater for the jds client.
                expect(environment.jobStatusUpdater.childInstance.calls.length).toEqual(0);
                expect(environment.jds.getPatientIdentifierByPid.calls.length).toEqual(1);
                expect(environment.jds.getPatientIdentifierByPid).toHaveBeenCalledWith(patientIdentifierValue1.value, jasmine.any(Function));
                expect(environment.jds.saveJobState.calls.length).toEqual(0);
            });
        });
        it('Error from JDS on second call (when storing job)', function() {
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            let expectedJdsResponses = [{
                statusCode: 200
            }, {
                statusCode: 200
            }];

            let expectedJdsResults = [{
                jpid: jpidValue
            }, undefined];
            environment.jds._setResponseData([null, 'JDSErrorOccurred'], expectedJdsResponses, expectedJdsResults);
            dummyLogger.debug('SetResponseData...');

            let finished = false;
            let actualError;
            let actualResponse;
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
                expect(environment.jds.childInstance.calls.length).toEqual(2); // Once within the _storeCompletedJob and once within jobStatusUpdater for the jds client.
                expect(environment.jobStatusUpdater.childInstance.calls.length).toEqual(1);
                expect(environment.jds.getPatientIdentifierByPid.calls.length).toEqual(1);
                expect(environment.jds.getPatientIdentifierByPid).toHaveBeenCalledWith(patientIdentifierValue1.value, jasmine.any(Function));
                expect(environment.jds.saveJobState.calls.length).toEqual(1);
                expect(environment.jds.saveJobState).toHaveBeenCalledWith({
                        type: 'vista-SITE-data-allergy-poller',
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
            let environment = getEnvironment();
            let hdrprocessor = getHdrProcessor(environment);

            let expectedJdsResponses = [{
                statusCode: 200
            }, {
                statusCode: 200
            }];

            let expectedJdsResults = [{
                jpid: jpidValue
            }, undefined];
            environment.jds._setResponseData([null, 'JDSErrorOccurred'], expectedJdsResponses, expectedJdsResults);
            dummyLogger.debug('SetResponseData...');

            let finished = false;
            let actualError;
            let actualResponse;
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
                expect(environment.jds.childInstance.calls.length).toEqual(2); // Once within the _storeCompletedJob and once within jobStatusUpdater for the jds client.
                expect(environment.jobStatusUpdater.childInstance.calls.length).toEqual(1);
                expect(environment.jds.getPatientIdentifierByPid.calls.length).toEqual(1);
                expect(environment.jds.getPatientIdentifierByPid).toHaveBeenCalledWith(hdrPatientIdentifierValue1.value, jasmine.any(Function));
                expect(environment.jds.saveJobState.calls.length).toEqual(1);
                expect(environment.jds.saveJobState).toHaveBeenCalledWith({
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
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            let expectedJdsResponses = [{
                statusCode: 200
            }, undefined];

            let expectedJdsResults = [{
                jpid: jpidValue
            }, undefined];
            environment.jds._setResponseData([null, null], expectedJdsResponses, expectedJdsResults);
            dummyLogger.debug('SetResponseData...');

            let finished = false;
            let actualError;
            let actualResponse;
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
                expect(environment.jds.childInstance.calls.length).toEqual(2); // Once within the _storeCompletedJob and once within jobStatusUpdater for the jds client.
                expect(environment.jobStatusUpdater.childInstance.calls.length).toEqual(1);
                expect(environment.jds.getPatientIdentifierByPid.calls.length).toEqual(1);
                expect(environment.jds.getPatientIdentifierByPid).toHaveBeenCalledWith(patientIdentifierValue1.value, jasmine.any(Function));
                expect(environment.jds.saveJobState.calls.length).toEqual(1);
                expect(environment.jds.saveJobState).toHaveBeenCalledWith({
                        type: 'vista-SITE-data-allergy-poller',
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
            let environment = getEnvironment();
            let processor = getProcessor(environment);

            let expectedJdsResponses = [{
                statusCode: 200
            }, {
                statusCode: 404
            }];

            let expectedJdsResults = [{
                jpid: jpidValue
            }, undefined];
            environment.jds._setResponseData([null, null], expectedJdsResponses, expectedJdsResults);
            dummyLogger.debug('SetResponseData...');

            let finished = false;
            let actualError;
            let actualResponse;
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
                expect(environment.jds.childInstance.calls.length).toEqual(2); // Once within the _storeCompletedJob and once within jobStatusUpdater for the jds client.
                expect(environment.jobStatusUpdater.childInstance.calls.length).toEqual(1);
                expect(environment.jds.getPatientIdentifierByPid.calls.length).toEqual(1);
                expect(environment.jds.getPatientIdentifierByPid).toHaveBeenCalledWith(patientIdentifierValue1.value, jasmine.any(Function));
                expect(environment.jds.saveJobState.calls.length).toEqual(1);
                expect(environment.jds.saveJobState).toHaveBeenCalledWith({
                        type: 'vista-SITE-data-allergy-poller',
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