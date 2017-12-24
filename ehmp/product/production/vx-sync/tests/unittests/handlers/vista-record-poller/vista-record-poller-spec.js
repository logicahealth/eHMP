'use strict';

//------------------------------------------------------------------------------------
// This file contains unit tests for vista-record-poller.js.
//
// Author: Mike Risher, Les Westberg
//------------------------------------------------------------------------------------

require('../../../../env-setup');

var _ = require('underscore');
var moment = require('moment');

var Poller = require(global.VX_HANDLERS + 'vista-record-poller/vista-record-poller');
var PublisherRouterDummy = require(global.VX_DUMMIES + 'publisherRouterDummy');
var PublisherDummy = require(global.VX_DUMMIES + 'publisherDummy');
var dummyLogger = require(global.VX_DUMMIES + 'dummy-logger');
var publisherRouterDummy = new PublisherRouterDummy(dummyLogger, config, PublisherDummy);
// var log = require(global.VX_UTILS + 'log');
// dummyLogger = log._createLogger({
//     name: 'test',
//     level: 'debug',
//     child: log._createLogger
// });
var JobStatusUpdater = require(global.VX_SUBSYSTEMS + 'jds/JobStatusUpdater');
var JdsClientDummy = require(global.VX_DUMMIES + 'jds-client-dummy');
var VistaClientDummy = require(global.VX_DUMMIES + 'vista-client-dummy');

var errorPublisher = {
    publishPollerError: function() {}
};
var config = {
    pollerIgnoreDuplicateErrorTime: 1800,
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
var vistaIdValue = 'SITE';
var patientIdentifierValue1 = {
    type: 'pid',
    value: vistaIdValue + ';1'
};
var uidValue = 'urn:va:vprupdate:' + vistaIdValue;

var environment = {
    jobStatusUpdater: {},
    metrics: dummyLogger,
    publisherRouter: publisherRouterDummy,
    jds: jdsClientDummy,
    errorPublisher: {publishPollerError: function(){}}
};
environment.jobStatusUpdater = new JobStatusUpdater(dummyLogger, config, environment.jds);

var syncStartJobsValue = [{
    collection: 'syncStart',
    pid: vistaIdValue + ';1',
    rootJobId: '3',
    jobId: '9',
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
    rootJobId: '2',
    jobId: '6',
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

var unsolicitedUpdateSyncStart = {
    collection: 'syncStart',
    pid: vistaIdValue + ';1',
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
                            }
                        }
                    }
                }
            }
        }
    }
};

var OPDsyncStartJobsValue = [{
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
                                'stampTime': 20141031094920,
                            },
                            'urn:va:doc-def:SITE:1002': {
                                'stampTime': 20141031094920,
                            }
                        }
                    },
                    'pt-select': {
                        'domain': 'pt-select',
                        'stampTime': 20141031094920,
                        'itemMetaStamp': {
                            'urn:va:pt-select:SITE:1001': {
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
    uid: 'urn:va:allergy:SITE:1:27837'
};

var vistaDataJobAllergyObjectWithPid = {
    pid: vistaIdValue + ';1',
    uid: 'urn:va:allergy:SITE:1:27837'
};

var vistaDataJobsValue = [{
    collection: 'allergy',
    pid: vistaIdValue + ';1',
    object: vistaDataJobAllergyObjectWithoutPid
}, {
    collection: 'pt-select',
    pid: vistaIdValue + ';2',
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
dataValue.items = syncStartJobsValue.concat(vistaDataJobsValue).concat(unsolicitedUpdateSyncStart);

var rootJobIdValue = '1';
var jobIdValue = '2';
var jpidValue = '9a6c3294-fe16-4a91-b10b-19f78656fb8c';

// Configurations related to VistaHdr
var hdrIdValue = '84F0';
var hdrUidValue = 'urn:va:vprupdate:' + hdrIdValue;
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

//-----------------------------------------------------------------------------------
// Create an instance of the poller.
//
// log: The logger to be sent to the poller.
// vistaIdValue: The vistaId that the poller is running under.
// config: The configuration settings
// envrionment: The environment settings
// start: True if the poller should come up in start mode - meaning start
//        polling the site.
// multiplePollerMode: True if the poller should be running in multiple poller mode
// returns: the instance of the poller that was created.
//-----------------------------------------------------------------------------------
function createPoller(log, vistaIdValue, config, environment, start, multiplePollerMode) {
    var poller = new Poller(log, vistaIdValue, config, environment, start, multiplePollerMode);
    return poller;
}

//--------------------------------------------------------------------------------------
// This method sets up the spies that will needed on the environment level classes.
//
// jdsClient: A handle to the JDS client.
// environment: A handle to the environment.
// poller: A handle to the poller.
// publisherRouter: A handle to the job publisher.
//--------------------------------------------------------------------------------------
function setupSpies(jdsClient, environment, poller, publisherRouter) {
    // Underlying JDS calls to monitor and make sure that they are made.
    //---------------------------------------------------------------------------
    spyOn(jdsClient, 'getOperationalDataMutable').andCallThrough();
    spyOn(jdsClient, 'getPatientIdentifierByPid').andCallThrough();

    spyOn(environment.jobStatusUpdater, 'createJobStatus').andCallThrough();
    spyOn(environment.errorPublisher, 'publishPollerError').andCallThrough();

    spyOn(poller, '_storeLastUpdateTime').andCallThrough();
    spyOn(poller, '_sendToVistaRecordProcessor').andCallThrough();
    spyOn(poller, '_createJobsForUnsolicitedUpdates').andCallThrough();
    spyOn(poller, '_createUnsolicitedUpdateJobStatus').andCallThrough();
    spyOn(poller, '_updateAllocationInfo').andCallThrough();

    spyOn(publisherRouter, 'publish').andCallThrough();
}

describe('vista-record-poller', function() {
    describe('_getLastUpdateTimeFromJds', function() {
        it('Happy Path', function() {
            var poller = createPoller(dummyLogger, vistaIdValue, config, environment, false, false);
            setupSpies(jdsClientDummy, environment, poller, publisherRouterDummy);

            var expectedJdsResponse = {
                statusCode: 200
            };
            var expectedJdsResult = {
                _id: vistaIdValue,
                lastUpdate: lastUpdateTimeValue,
                uid: uidValue
            };
            jdsClientDummy._setResponseData(null, expectedJdsResponse, expectedJdsResult);

            var finished = false;
            var actualError;
            var actualResponse;
            runs(function() {
                poller._getLastUpdateTimeFromJds(function(error, response) {
                    actualError = error;
                    actualResponse = response;
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call to _getLastUpdateTimeFromJds failed to return in time.', 500);

            runs(function() {
                expect(actualError).toBeNull();
                expect(actualResponse).toEqual(lastUpdateTimeValue);
                expect(jdsClientDummy.getOperationalDataMutable.calls.length).toEqual(1);
                expect(jdsClientDummy.getOperationalDataMutable).toHaveBeenCalledWith(vistaIdValue, jasmine.any(Function));
            });
        });
        it('Happy Path for VistaHdr', function() {
            var hdrPoller = createPoller(dummyLogger, hdrIdValue, config, environment, false, false);
            setupSpies(jdsClientDummy, environment, hdrPoller, publisherRouterDummy);

            var expectedJdsResponse = {
                statusCode: 200
            };
            var expectedJdsResult = {
                _id: hdrIdValue,
                lastUpdate: lastUpdateTimeValue,
                uid: hdrUidValue
            };
            jdsClientDummy._setResponseData(null, expectedJdsResponse, expectedJdsResult);

            var finished = false;
            var actualError;
            var actualResponse;
            runs(function() {
                hdrPoller._getLastUpdateTimeFromJds(function(error, response) {
                    actualError = error;
                    actualResponse = response;
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call to _getLastUpdateTimeFromJds failed to return in time.', 500);

            runs(function() {
                expect(actualError).toBeNull();
                expect(actualResponse).toEqual(lastUpdateTimeValue);
                expect(jdsClientDummy.getOperationalDataMutable.calls.length).toEqual(1);
                expect(jdsClientDummy.getOperationalDataMutable).toHaveBeenCalledWith(hdrIdValue, jasmine.any(Function));
            });
        });
    });
    describe('_storeLastUpdateTimeToJds', function() {
        it('Happy Path', function() {
            var poller = createPoller(dummyLogger, vistaIdValue, config, environment, false, false);
            setupSpies(jdsClientDummy, environment, poller, publisherRouterDummy);

            var expectedJdsResponse = {
                statusCode: 200
            };
            jdsClientDummy._setResponseData(null, expectedJdsResponse, undefined);
            spyOn(jdsClientDummy, 'storeOperationalDataMutable').andCallThrough();
            var finished = false;
            var actualError;
            var actualResponse;
            runs(function() {
                poller._storeLastUpdateTimeToJds(lastUpdateTimeValue, function(error, response) {
                    actualError = error;
                    actualResponse = response;
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call to _storeLastUpdateTimeToJds failed to return in time.', 500);

            runs(function() {
                expect(actualError).toBeNull();
                expect(actualResponse).toEqual('success');
                expect(jdsClientDummy.storeOperationalDataMutable.calls.length).toEqual(1);
                expect(jdsClientDummy.storeOperationalDataMutable).toHaveBeenCalledWith(jasmine.objectContaining({
                    _id: vistaIdValue,
                    lastUpdate: lastUpdateTimeValue,
                    uid: uidValue
                }), jasmine.any(Function));
            });
        });
        it('Happy Path for VistaHdr', function() {
            var hdrPoller = createPoller(dummyLogger, hdrIdValue, config, environment, false, false);
            setupSpies(jdsClientDummy, environment, hdrPoller, publisherRouterDummy);

            var expectedJdsResponse = {
                statusCode: 200
            };
            jdsClientDummy._setResponseData(null, expectedJdsResponse, undefined);
            spyOn(jdsClientDummy, 'storeOperationalDataMutable').andCallThrough();
            var finished = false;
            var actualError;
            var actualResponse;
            runs(function() {
                hdrPoller._storeLastUpdateTimeToJds(lastUpdateTimeValue, function(error, response) {
                    actualError = error;
                    actualResponse = response;
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call to _storeLastUpdateTimeToJds failed to return in time.', 500);

            runs(function() {
                expect(actualError).toBeNull();
                expect(actualResponse).toEqual('success');
                expect(jdsClientDummy.storeOperationalDataMutable.calls.length).toEqual(1);
                expect(jdsClientDummy.storeOperationalDataMutable).toHaveBeenCalledWith(jasmine.objectContaining({
                    _id: hdrIdValue,
                    lastUpdate: lastUpdateTimeValue,
                    uid: hdrUidValue
                }), jasmine.any(Function));
            });
        });
    });
    describe('_storeLastUpdateTime', function() {
        it('Happy Path', function() {
            var poller = createPoller(dummyLogger, vistaIdValue, config, environment, false, false);
            setupSpies(jdsClientDummy, environment, poller, publisherRouterDummy);

            var expectedJdsResponse = {
                statusCode: 200
            };
            jdsClientDummy._setResponseData(null, expectedJdsResponse, undefined);
            spyOn(jdsClientDummy, 'storeOperationalDataMutable').andCallThrough();
            var finished = false;
            var actualError;
            var actualResponse;
            var localDataValue = JSON.parse(JSON.stringify(dataValue));
            runs(function() {

                poller._storeLastUpdateTime(localDataValue, function(error, response) {
                    actualError = error;
                    actualResponse = response;
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call to _storeLastUpdateTime failed to return in time.', 500);

            runs(function() {
                expect(actualError).toBeNull();
                expect(actualResponse).toEqual('success');
                expect(jdsClientDummy.storeOperationalDataMutable.calls.length).toEqual(1);
                expect(jdsClientDummy.storeOperationalDataMutable).toHaveBeenCalledWith(jasmine.objectContaining({
                    _id: vistaIdValue,
                    lastUpdate: lastUpdateTimeValue,
                    uid: uidValue
                }), jasmine.any(Function));
            });
        });
        it('Happy Path for VistaHdr', function() {
            var hdrPoller = createPoller(dummyLogger, hdrIdValue, config, environment, false, false);
            setupSpies(jdsClientDummy, environment, hdrPoller, publisherRouterDummy);

            var expectedJdsResponse = {
                statusCode: 200
            };
            jdsClientDummy._setResponseData(null, expectedJdsResponse, undefined);
            spyOn(jdsClientDummy, 'storeOperationalDataMutable').andCallThrough();
            var finished = false;
            var actualError;
            var actualResponse;
            var localHdrDataValue = JSON.parse(JSON.stringify(hdrDataValue));
            runs(function() {
                hdrPoller._storeLastUpdateTime(localHdrDataValue, function(error, response) {
                    actualError = error;
                    actualResponse = response;
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call to _storeLastUpdateTime failed to return in time.', 500);

            runs(function() {
                expect(actualError).toBeNull();
                expect(actualResponse).toEqual('success');
                expect(jdsClientDummy.storeOperationalDataMutable.calls.length).toEqual(1);
                expect(jdsClientDummy.storeOperationalDataMutable).toHaveBeenCalledWith(jasmine.objectContaining({
                    _id: hdrIdValue,
                    lastUpdate: lastUpdateTimeValue,
                    uid: hdrUidValue
                }), jasmine.any(Function));
            });
        });
        it('Missing lastUpdateField', function() {
            var poller = createPoller(dummyLogger, vistaIdValue, config, environment, false, false);
            setupSpies(jdsClientDummy, environment, poller, publisherRouterDummy);

            var expectedJdsResponse = {
                statusCode: 200
            };
            jdsClientDummy._setResponseData(null, expectedJdsResponse, undefined);
            spyOn(jdsClientDummy, 'storeOperationalDataMutable').andCallThrough();
            var finished = false;
            var actualError;
            var actualResponse;
            runs(function() {
                poller._storeLastUpdateTime({}, function(error, response) {
                    actualError = error;
                    actualResponse = response;
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call to _storeLastUpdateTime failed to return in time.', 500);

            runs(function() {
                expect(actualError).toBeNull();
                expect(actualResponse).toEqual('success');
                expect(jdsClientDummy.storeOperationalDataMutable.calls.length).toEqual(0);
            });
        });
    });
    describe('_processBatch', function() {
        it('Happy Path - Single Poller Mode', function() {
            var poller = createPoller(dummyLogger, vistaIdValue, config, environment, false, false);
            setupSpies(jdsClientDummy, environment, poller, publisherRouterDummy);

            dummyLogger.debug('In _processBatch test');
            spyOn(environment.jds,'storeOperationalDataMutable').andCallFake(function(data, callback){callback(null, {statusCode: 200});});

            var finished = false;
            var actualError;
            var actualResponse;
            var localDataValue = JSON.parse(JSON.stringify(dataValue));
            runs(function() {
                poller._processBatch(localDataValue, function(error, response) {
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

                expect(poller._createJobsForUnsolicitedUpdates.calls.length).toEqual(1);
                expect(poller._createUnsolicitedUpdateJobStatus.calls.length).toEqual(1);

                expect(poller._storeLastUpdateTime.calls.length).toEqual(1);
                expect(poller._sendToVistaRecordProcessor.calls.length).toEqual(1);
                expect(poller._storeLastUpdateTime).toHaveBeenCalledWith(localDataValue, jasmine.any(Function));
                expect(poller._updateAllocationInfo).not.toHaveBeenCalled();
                expect(poller._sendToVistaRecordProcessor).toHaveBeenCalledWith(localDataValue, jasmine.any(Function));

                dummyLogger.debug('End _processBatch test');
            });
        });
        it('Happy Path - Multiple Poller Mode', function() {
            var poller = createPoller(dummyLogger, vistaIdValue, config, environment, false, true);
            setupSpies(jdsClientDummy, environment, poller, publisherRouterDummy);

            dummyLogger.debug('In _processBatch test');
            spyOn(environment.jds,'storeOperationalDataMutable').andCallFake(function(data, callback){callback(null, {statusCode: 200});});

            var finished = false;
            var actualError;
            var actualResponse;
            var localDataValue = JSON.parse(JSON.stringify(dataValue));
            runs(function() {
                poller._processBatch(localDataValue, function(error, response) {
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

                expect(poller._createJobsForUnsolicitedUpdates.calls.length).toEqual(1);
                expect(poller._createUnsolicitedUpdateJobStatus.calls.length).toEqual(1);

                expect(poller._storeLastUpdateTime).not.toHaveBeenCalled();
                expect(poller._sendToVistaRecordProcessor.calls.length).toEqual(1);
                expect(poller._updateAllocationInfo).toHaveBeenCalledWith(localDataValue, 'complete', jasmine.any(Function));
                expect(poller._sendToVistaRecordProcessor).toHaveBeenCalledWith(localDataValue, jasmine.any(Function));

                dummyLogger.debug('End _processBatch test');
            });
        });
        it('Error path: task errors out', function() {
            var poller = createPoller(dummyLogger, vistaIdValue, config, environment, false, false);
            setupSpies(jdsClientDummy, environment, poller, publisherRouterDummy);

            spyOn(environment.jds,'storeOperationalDataMutable').andCallFake(function(data, callback){callback(null, {statusCode: 500});});

            var finished = false;
            var actualError;
            var actualResponse;
            var localDataValue = JSON.parse(JSON.stringify(dataValue));
            runs(function() {
                poller._processBatch(localDataValue, function(error, response) {
                    actualError = error;
                    actualResponse = response;
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call to _processSyncStartJobs failed to return in time.', 500);

            runs(function() {
                expect(actualError).toBeTruthy();
                expect(actualResponse).toBeTruthy();

                expect(environment.errorPublisher.publishPollerError).toHaveBeenCalled();

                dummyLogger.debug('End _processBatch test');
            });
        });
    });
    describe('_extractLastUpdateFromRawResponse', function() {
        it('Happy Path - with white space', function() {
            var poller = createPoller(dummyLogger, vistaIdValue, config, environment, false, false);
            setupSpies(jdsClientDummy, environment, poller, publisherRouterDummy);

            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"KODAK.VISTACORE.US\",\"systemId\":\"SITE\"},\"data\":{\"updated\":\"20150721120512\",\"totalItems\":1000,\"lastUpdate\" : \"3150721-11303\"}}';
            var lastUpdateTime = poller._extractLastUpdateFromRawResponse(rawResponse);
            expect(lastUpdateTime).toEqual('3150721-11303');
        });
        it('Happy Path - with no white space', function() {
            var poller = createPoller(dummyLogger, vistaIdValue, config, environment, false, false);
            setupSpies(jdsClientDummy, environment, poller, publisherRouterDummy);

            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"KODAK.VISTACORE.US\",\"systemId\":\"SITE\"},\"data\":{\"updated\":\"20150721120512\",\"totalItems\":1000,\"lastUpdate\":\"3150721-11303\"}}';
            var lastUpdateTime = poller._extractLastUpdateFromRawResponse(rawResponse);
            expect(lastUpdateTime).toEqual('3150721-11303');
        });
        it('Happy Path - handle multiple - get first', function() {
            var poller = createPoller(dummyLogger, vistaIdValue, config, environment, false, false);
            setupSpies(jdsClientDummy, environment, poller, publisherRouterDummy);

            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"KODAK.VISTACORE.US\",\"systemId\":\"SITE\"},\"data\":{\"updated\":\"20150721120512\",\"totalItems\":1000,\"lastUpdate\":\"3150721-11303\",\"lastUpdate\":\"3150721-11505\"}}';
            var lastUpdateTime = poller._extractLastUpdateFromRawResponse(rawResponse);
            expect(_.isArray(lastUpdateTime)).toBe(false);
            expect(lastUpdateTime).toEqual('3150721-11303');
        });
    });
    describe('_processResponse', function() {
        it('Happy Path - Single Poller Mode, JSON error with batch size of one', function () {
            var pollerFakeInstance = {
                vistaId: 'SITE',
                environment: environment,
                config: config,
                metrics: dummyLogger,
                log: dummyLogger,
                paused: false,
                readyToShutdown: false,
                allocationToken: '',
                allocationStatus: 'complete',
                multipleMode: false,
                errorPublisher: errorPublisher,
                pollDelayMillis: 1000,
                lastUpdateTime: '0',
                vprUpdateOpData: null,
                vistaProxy: new VistaClientDummy(dummyLogger, config),
                isVistaHdr: false,
                hmpBatchSize: config['hmp.batch.size'],
                success: false,
                _handleInvalidJSONWithSingleMessage: function (error, wrappedResponse) {
                    expect(error).toBeDefined();
                    expect(wrappedResponse).toBeDefined();
                    return;
                }
            };
            spyOn(pollerFakeInstance, '_handleInvalidJSONWithSingleMessage').andCallThrough();
            Poller.prototype._processResponse.call(pollerFakeInstance, 'parse error', {
                hmpBatchSize: 1,
                data: null,
                rawResponse: 'some text here...',
                errorData: { message: 'Invalid JSON with hmpBatchSize = 1'}
            });
            expect(pollerFakeInstance._handleInvalidJSONWithSingleMessage.calls.length).toEqual(1);
        });
        it('Happy Path - Single Poller Mode, Error on batch with > 1 batch size', function () {
            var pollerFakeInstance = {
                vistaId: 'SITE',
                environment: environment,
                config: config,
                metrics: dummyLogger,
                log: dummyLogger,
                paused: false,
                readyToShutdown: false,
                allocationToken: '',
                allocationStatus: 'complete',
                multipleMode: false,
                errorPublisher: errorPublisher,
                pollDelayMillis: 1000,
                lastUpdateTime: '0',
                vprUpdateOpData: null,
                vistaProxy: new VistaClientDummy(dummyLogger, config),
                isVistaHdr: false,
                hmpBatchSize: config['hmp.batch.size'],
                success: false,
                _handleBatchErrorGeneral: function (error) {
                    expect(error).toBeDefined();
                    return;
                }
            };
            spyOn(pollerFakeInstance, '_handleBatchErrorGeneral').andCallThrough();

            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"KODAK.VISTACORE.US\",\"systemId\":\"SITE\"},\"data\":{\"updated\":\"20150721120512\",\"totalItems\":1000,\"lastUpdate\" : \"3150721-11303\",\"items\":[{},{}]}}';
            Poller.prototype._processResponse.call(pollerFakeInstance, 'Some error', {
                hmpBatchSize: 1000,
                data: JSON.parse(rawResponse).data,
                rawResponse: null
            });
            expect(pollerFakeInstance._handleBatchErrorGeneral.calls.length).toEqual(1);
        });
        it('Happy Path - Single Poller Mode, with data', function () {
            var pollerFakeInstance = {
                vistaId: 'SITE',
                environment: environment,
                config: config,
                log: dummyLogger,
                metrics: dummyLogger,
                paused: false,
                readyToShutdown: false,
                allocationToken: '',
                allocationStatus: 'complete',
                multipleMode: false,
                errorPublisher: errorPublisher,
                pollDelayMillis: 1000,
                lastUpdateTime: '0',
                vprUpdateOpData: null,
                vistaProxy: new VistaClientDummy(dummyLogger, config),
                isVistaHdr: false,
                hmpBatchSize: config['hmp.batch.size'],
                success: false,
                _handleBatchSuccess: function (wrappedResponse) {
                    expect(wrappedResponse).toBeDefined();
                    return;
                }
            };
            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"KODAK.VISTACORE.US\",\"systemId\":\"SITE\"},\"data\":{\"updated\":\"20150721120512\",\"totalItems\":1000,\"lastUpdate\" : \"3150721-11303\",\"items\":[{},{}]}}';
            spyOn(pollerFakeInstance, '_handleBatchSuccess').andCallThrough();
            Poller.prototype._processResponse.call(pollerFakeInstance, null, {
                hmpBatchSize: 200,
                data: JSON.parse(rawResponse).data
            });
            expect(pollerFakeInstance._handleBatchSuccess.calls.length).toEqual(1);
        });
    });

    describe('_handleInvalidJSONWithSingleMessage', function() {
        it('JSON parsing error - single poller mode', function() {
            var poller = createPoller(dummyLogger, vistaIdValue, config, environment, false, false);
            setupSpies(jdsClientDummy, environment, poller, publisherRouterDummy);

            var pollerFakeInstance = {
                vistaId: 'SITE',
                environment: environment,
                config: config,
                log: dummyLogger,
                metrics: dummyLogger,
                paused: false,
                readyToShutdown: false,
                allocationToken: '',
                allocationStatus: 'complete',
                multipleMode: false,
                errorPublisher: errorPublisher,
                pollDelayMillis: 1000,
                lastUpdateTime: '0',
                vprUpdateOpData: null,
                vistaProxy: new VistaClientDummy(dummyLogger, config),
                isVistaHdr: false,
                hmpBatchSize: '200',
                _storeLastUpdateTime: function(data, callback) {
                    expect(data.lastUpdate).toEqual('3150721-11303');
                    complete++;
                    callback(null, 'no data');
                },
                getBatchSize: function() {
                    return config['hmp.batch.size'];
                },
                _extractLastUpdateFromRawResponse: poller._extractLastUpdateFromRawResponse.bind(this)
            };
            spyOn(errorPublisher, 'publishPollerError').andCallThrough();
            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"KODAK.VISTACORE.US\",\"systemId\":\"SITE\"},\"data\":{\"updated\":\"20150721120512\",\"totalItems\":1000,\"lastUpdate\" : \"3150721-11303\",\"items\":[{\"name\":}]}}';
            var complete = 0;
            pollerFakeInstance.doNext = function() {
                complete++;
            };
            runs(function() {
                Poller.prototype._handleInvalidJSONWithSingleMessage.call(pollerFakeInstance, 'parsing error', {
                    hmpBatchSize: 1,
                    rawResponse: rawResponse
                });
            });
            waitsFor(function() {
                return complete >= 2;
            }, 'Processing Vista Response');
            runs(function() {
                expect(errorPublisher.publishPollerError).toHaveBeenCalled();
                expect(pollerFakeInstance.hmpBatchSize).toEqual(config['hmp.batch.size']);
            });
        });
        it('JSON parsing error for VistaHdr - single poller mode', function() {
            var poller = createPoller(dummyLogger, vistaIdValue, config, environment, false, false);
            setupSpies(jdsClientDummy, environment, poller, publisherRouterDummy);

            var pollerFakeInstance = {
                vistaId: '84F0',
                environment: environment,
                config: config,
                log: dummyLogger,
                metrics: dummyLogger,
                paused: false,
                readyToShutdown: false,
                allocationToken: '',
                allocationStatus: 'complete',
                multipleMode: false,
                errorPublisher: errorPublisher,
                pollDelayMillis: 1000,
                lastUpdateTime: '0',
                vprUpdateOpData: null,
                isVistaHdr: true,
                vistaProxy: new VistaClientDummy(dummyLogger, config),
                hmpBatchSize: config.hdr.pubsubConfig.maxBatchSize,
                _storeLastUpdateTime: function(data, callback) {
                    expect(data.lastUpdate).toEqual('3150721-11303');
                    complete++;
                    callback(null, 'no data');
                },
                getBatchSize: function() {
                    return config.hdr.pubsubConfig.maxBatchSize;
                },
                _extractLastUpdateFromRawResponse: poller._extractLastUpdateFromRawResponse.bind(this)
            };
            spyOn(errorPublisher, 'publishPollerError').andCallThrough();
            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"RAPHAEL.VISTACORE.US\",\"systemId\":\"84F0\"},\"data\":{\"updated\":\"20150721120512\",\"totalItems\":1000,\"lastUpdate\" : \"3150721-11303\", "items\":[{\"name\":}]}}';
            var complete = 0;
            pollerFakeInstance.doNext = function() {
                complete++;
            };
            runs(function() {
                Poller.prototype._handleInvalidJSONWithSingleMessage.call(pollerFakeInstance, 'parsing error', {
                    hmpBatchSize: 1,
                    rawResponse: rawResponse
                });
            });
            waitsFor(function() {
                return complete >= 2;
            }, 'Processing Vista Response');
            runs(function() {
                expect(errorPublisher.publishPollerError).toHaveBeenCalled();
                expect(pollerFakeInstance.hmpBatchSize).toEqual(config.hdr.pubsubConfig.maxBatchSize);
            });
        });
        it('JSON parsing error AND error storing lastUpdateTime - Single Poller Mode', function() {
            var poller = createPoller(dummyLogger, vistaIdValue, config, environment, false, false);
            setupSpies(jdsClientDummy, environment, poller, publisherRouterDummy);

            var pollerFakeInstance = {
                vistaId: 'SITE',
                environment: environment,
                config: config,
                log: dummyLogger,
                metrics: dummyLogger,
                paused: false,
                readyToShutdown: false,
                allocationToken: '',
                allocationStatus: 'complete',
                multipleMode: false,
                errorPublisher: errorPublisher,
                pollDelayMillis: 1000,
                lastUpdateTime: '0',
                vprUpdateOpData: null,
                vistaProxy: new VistaClientDummy(dummyLogger, config),
                hmpBatchSize: config['hmp.batch.size'],
                isVistaHdr: false,
                _storeLastUpdateTime: function(data, callback){
                    complete++;
                    callback('ERROR', null);
                },
                getBatchSize: function() {
                    return config['hmp.batch.size'];
                },
                _extractLastUpdateFromRawResponse: poller._extractLastUpdateFromRawResponse.bind(this)
            };
            spyOn(errorPublisher, 'publishPollerError').andCallThrough();
            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"KODAK.VISTACORE.US\",\"systemId\":\"SITE\"},\"data\":{\"updated\":\"20150721120512\",\"totalItems\":1000,\"lastUpdate\" : \"3150721-11303\",\"items\":[{\"name\":}]}}';
            var complete = 0;
            pollerFakeInstance.doNext = function() {
                complete++;
            };
            runs(function() {
                Poller.prototype._handleInvalidJSONWithSingleMessage.call(pollerFakeInstance, 'parsing error', {
                    hmpBatchSize: 1,
                    rawResponse: rawResponse
                });
            });
            waitsFor(function() {
                return complete >=2;
            }, 'Processing Vista Response');
            runs(function(){
                expect(errorPublisher.publishPollerError.calls.length).toEqual(2);
                expect(pollerFakeInstance.hmpBatchSize).toEqual(config['hmp.batch.size']);
            });
        });
        it('JSON parsing error - multiple poller mode', function() {
            var poller = createPoller(dummyLogger, vistaIdValue, config, environment, false, false);
            setupSpies(jdsClientDummy, environment, poller, publisherRouterDummy);

            var pollerFakeInstance = {
                vistaId: 'SITE',
                environment: environment,
                config: config,
                log: dummyLogger,
                metrics: dummyLogger,
                paused: false,
                readyToShutdown: false,
                allocationToken: '',
                allocationStatus: 'complete',
                multipleMode: true,
                errorPublisher: errorPublisher,
                pollDelayMillis: 1000,
                lastUpdateTime: '0',
                vprUpdateOpData: null,
                vistaProxy: new VistaClientDummy(dummyLogger, config),
                isVistaHdr: false,
                hmpBatchSize: '200',
                getBatchSize: function() {
                    return config['hmp.batch.size'];
                }
            };
            spyOn(errorPublisher, 'publishPollerError').andCallThrough();
            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"KODAK.VISTACORE.US\",\"systemId\":\"SITE\"},\"data\":{\"updated\":\"20150721120512\",\"totalItems\":1000,\"allocationToken\" : \"123456789\",\"items\":[{\"name\":}]}}';
            var complete = 0;
            pollerFakeInstance.doNext = function() {
                complete++;
            };
            runs(function() {
                Poller.prototype._handleInvalidJSONWithSingleMessage.call(pollerFakeInstance, 'parsing error', {
                    hmpBatchSize: 1,
                    rawResponse: rawResponse
                });
            });
            waitsFor(function() {
                return complete >= 1;
            }, 'Processing Vista Response');
            runs(function() {
                expect(pollerFakeInstance.allocationToken).toBe('123456789');
                expect(pollerFakeInstance.allocationStatus).toBe('rejected');
                expect(errorPublisher.publishPollerError).toHaveBeenCalled();
                expect(pollerFakeInstance.hmpBatchSize).toEqual(config['hmp.batch.size']);
            });
        });
        it('JSON parsing error and failure to extract allocation token - multiple poller mode', function() {
            var poller = createPoller(dummyLogger, vistaIdValue, config, environment, false, false);
            setupSpies(jdsClientDummy, environment, poller, publisherRouterDummy);

            var pollerFakeInstance = {
                vistaId: 'SITE',
                environment: environment,
                config: config,
                log: dummyLogger,
                metrics: dummyLogger,
                paused: false,
                readyToShutdown: false,
                allocationToken: '',
                allocationStatus: 'complete',
                multipleMode: true,
                errorPublisher: errorPublisher,
                pollDelayMillis: 1000,
                lastUpdateTime: '0',
                vprUpdateOpData: null,
                vistaProxy: new VistaClientDummy(dummyLogger, config),
                isVistaHdr: false,
                hmpBatchSize: '200',
                getBatchSize: function() {
                    return config['hmp.batch.size'];
                }
            };
            spyOn(errorPublisher, 'publishPollerError').andCallThrough();
            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"KODAK.VISTACORE.US\",\"systemId\":\"SITE\"},\"data\":{\"updated\":\"20150721120512\",\"totalItems\":1000,\"allocationTokenJunk\" : \"123456789\",\"items\":[{\"name\":}]}}';
            var complete = 0;
            pollerFakeInstance.doNext = function() {
                complete++;
            };
            runs(function() {
                Poller.prototype._handleInvalidJSONWithSingleMessage.call(pollerFakeInstance, 'parsing error', {
                    hmpBatchSize: 1,
                    rawResponse: rawResponse
                });
            });
            waitsFor(function() {
                return complete >= 1;
            }, 'Processing Vista Response');
            runs(function() {
                expect(pollerFakeInstance.allocationToken).toBe('');
                expect(pollerFakeInstance.allocationStatus).toBe('complete');
                expect(errorPublisher.publishPollerError.calls.length).toEqual(2);
                expect(pollerFakeInstance.hmpBatchSize).toEqual(config['hmp.batch.size']);
            });
        });
    });

    describe('_handleBatchErrorGeneral', function() {
        it('Non JSON parsing error - Single Poller Mode', function() {
            var pollerFakeInstance = {
                vistaId: 'SITE',
                environment: environment,
                config: config,
                log: dummyLogger,
                metrics: dummyLogger,
                paused: false,
                readyToShutdown: false,
                allocationToken: '123456789',
                allocationStatus: 'rejected',
                multipleMode: false,
                errorPublisher: errorPublisher,
                pollDelayMillis: 1000,
                lastUpdateTime: '0',
                vprUpdateOpData: null,
                vistaProxy: new VistaClientDummy(dummyLogger, config),
                hmpBatchSize: config['hmp.batch.size'],
                isVistaHdr: false,
                lastBatchErrors: {},
                getBatchSize: function() {
                    return config['hmp.batch.size'];
                }
            };
            pollerFakeInstance._updateLastBatchErrorPublishTime = Poller.prototype._updateLastBatchErrorPublishTime.bind(pollerFakeInstance);
            pollerFakeInstance._isErrorPublishNeeded = Poller.prototype._isErrorPublishNeeded.bind(pollerFakeInstance);

            spyOn(errorPublisher, 'publishPollerError').andCallThrough();
            spyOn(environment.metrics, 'warn').andCallThrough();
            var complete = false;
            pollerFakeInstance.doNext = function() {
                complete = true;
            };
            runs(function() {
                Poller.prototype._handleBatchErrorGeneral.call(pollerFakeInstance, 'Random error from Vista', {
                    hmpBatchSize: 1,
                    data: null,
                    rawResponse: 'some text here...',
                    errorData: { message: 'RPC Error'}
                });
            });
            waitsFor(function() {
                return complete;
            }, 'Processing Vista Response');
            runs(function() {
                expect(errorPublisher.publishPollerError).toHaveBeenCalled();
                expect(environment.metrics.warn).toHaveBeenCalled();
                expect(pollerFakeInstance.success).toBe(false);
                expect(pollerFakeInstance.hmpBatchSize).toEqual(config['hmp.batch.size']);
            });
        });
        it('Non JSON parsing error for VistaHdr', function() {
            var pollerFakeInstance = {
                vistaId: '84F0',
                environment: environment,
                config: config,
                log: dummyLogger,
                metrics: dummyLogger,
                paused: false,
                readyToShutdown: false,
                allocationToken: '123456789',
                allocationStatus: 'rejected',
                multipleMode: false,
                errorPublisher: errorPublisher,
                pollDelayMillis: 1000,
                lastUpdateTime: '0',
                vprUpdateOpData: null,
                isVistaHdr: true,
                lastBatchErrors: {},
                hmpBatchSize: config.hdr.pubsubConfig.maxBatchSize,
                vistaProxy: new VistaClientDummy(dummyLogger, config),
                getBatchSize: function() {
                    return config.hdr.pubsubConfig.maxBatchSize;
                }
            };
            pollerFakeInstance._updateLastBatchErrorPublishTime = Poller.prototype._updateLastBatchErrorPublishTime.bind(pollerFakeInstance);
            pollerFakeInstance._isErrorPublishNeeded = Poller.prototype._isErrorPublishNeeded.bind(pollerFakeInstance);

            spyOn(errorPublisher, 'publishPollerError').andCallThrough();
            spyOn(environment.metrics, 'warn').andCallThrough();
            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"RAPHAEL.VISTACORE.US\",\"systemId\":\"84F0\"},\"data\":{\"updated\":\"20150721120512\",\"totalItems\":1000,\"lastUpdate\" : \"3150721-11303\"}}';
            var complete = false;
            pollerFakeInstance.doNext = function() {
                complete = true;
            };
            runs(function() {
                Poller.prototype._handleBatchErrorGeneral.call(pollerFakeInstance, 'Random error from Vista', {
                    hmpBatchSize: 500,
                    data: JSON.parse(rawResponse).data,
                    errorData: { message: 'An error occurred' }
                });
            });
            waitsFor(function() {
                return complete;
            }, 'Processing Vista Response');
            runs(function() {
                expect(errorPublisher.publishPollerError).toHaveBeenCalled();
                expect(environment.metrics.warn).toHaveBeenCalled();
                expect(pollerFakeInstance.success).toBe(false);
                expect(pollerFakeInstance.hmpBatchSize).toEqual(config.hdr.pubsubConfig.maxBatchSize);
            });
        });
        it('Non JSON parsing error (without allocationToken) - Multiple Poller Mode', function() {
            var pollerFakeInstance = {
                vistaId: 'SITE',
                environment: environment,
                config: config,
                log: dummyLogger,
                metrics: dummyLogger,
                paused: false,
                readyToShutdown: false,
                allocationToken: '123456789',
                allocationStatus: 'rejected',
                multipleMode: true,
                errorPublisher: errorPublisher,
                pollDelayMillis: 1000,
                lastUpdateTime: '0',
                vprUpdateOpData: null,
                vistaProxy: new VistaClientDummy(dummyLogger, config),
                hmpBatchSize: config['hmp.batch.size'],
                isVistaHdr: false,
                lastBatchErrors: {},
                getBatchSize: function() {
                    return config['hmp.batch.size'];
                }
            };
            pollerFakeInstance._updateLastBatchErrorPublishTime = Poller.prototype._updateLastBatchErrorPublishTime.bind(pollerFakeInstance);
            pollerFakeInstance._updateAllocationInfoSynchronous = Poller.prototype._updateAllocationInfoSynchronous.bind(pollerFakeInstance);
            pollerFakeInstance._isErrorPublishNeeded = Poller.prototype._isErrorPublishNeeded.bind(pollerFakeInstance);

            spyOn(errorPublisher, 'publishPollerError').andCallThrough();
            spyOn(environment.metrics, 'warn').andCallThrough();
            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"RAPHAEL.VISTACORE.US\",\"systemId\":\"84F0\"},\"data\":{\"updated\":\"20150721120512\",\"totalItems\":1000,\"lastUpdate\" : \"3150721-11303\"}}';
            var complete = false;
            pollerFakeInstance.doNext = function() {
                complete = true;
            };
            runs(function() {
                Poller.prototype._handleBatchErrorGeneral.call(pollerFakeInstance, 'Random error from Vista', {
                    hmpBatchSize: 500,
                    data: JSON.parse(rawResponse).data,
                    errorData: { message: 'An error occurred' }
                });
            });
            waitsFor(function() {
                return complete;
            }, 'Processing Vista Response');
            runs(function() {
                expect(errorPublisher.publishPollerError).toHaveBeenCalled();
                expect(environment.metrics.warn).toHaveBeenCalled();
                expect(pollerFakeInstance.success).toBe(false);
                expect(pollerFakeInstance.allocationToken).toBe('');
                expect(pollerFakeInstance.allocationStatus).toBe('complete');
                expect(pollerFakeInstance.hmpBatchSize).toEqual(config['hmp.batch.size']);
            });
        });
        it('Non JSON parsing error (with allocationToken) - Multiple Poller Mode', function() {
            var pollerFakeInstance = {
                vistaId: 'SITE',
                environment: environment,
                config: config,
                log: dummyLogger,
                metrics: dummyLogger,
                paused: false,
                readyToShutdown: false,
                allocationToken: '123456789',
                allocationStatus: 'rejected',
                multipleMode: true,
                errorPublisher: errorPublisher,
                pollDelayMillis: 1000,
                lastUpdateTime: '0',
                vprUpdateOpData: null,
                vistaProxy: new VistaClientDummy(dummyLogger, config),
                hmpBatchSize: config['hmp.batch.size'],
                isVistaHdr: false,
                lastBatchErrors: {},
                getBatchSize: function() {
                    return config['hmp.batch.size'];
                }
            };
            pollerFakeInstance._updateLastBatchErrorPublishTime = Poller.prototype._updateLastBatchErrorPublishTime.bind(pollerFakeInstance);
            pollerFakeInstance._updateAllocationInfoSynchronous = Poller.prototype._updateAllocationInfoSynchronous.bind(pollerFakeInstance);
            pollerFakeInstance._isErrorPublishNeeded = Poller.prototype._isErrorPublishNeeded.bind(pollerFakeInstance);

            spyOn(errorPublisher, 'publishPollerError').andCallThrough();
            spyOn(environment.metrics, 'warn').andCallThrough();
            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"RAPHAEL.VISTACORE.US\",\"systemId\":\"84F0\"},\"data\":{\"allocationToken\":\"123456789\",\"updated\":\"20150721120512\",\"totalItems\":1000,\"lastUpdate\" : \"3150721-11303\"}}';
            var complete = false;
            pollerFakeInstance.doNext = function() {
                complete = true;
            };
            runs(function() {
                Poller.prototype._handleBatchErrorGeneral.call(pollerFakeInstance, 'Random error from Vista', {
                    hmpBatchSize: 500,
                    data: JSON.parse(rawResponse).data,
                    errorData: { message: 'An error occurred' }
                });
            });
            waitsFor(function() {
                return complete;
            }, 'Processing Vista Response');
            runs(function() {
                expect(errorPublisher.publishPollerError).toHaveBeenCalled();
                expect(environment.metrics.warn).toHaveBeenCalled();
                expect(pollerFakeInstance.success).toBe(false);
                expect(pollerFakeInstance.allocationToken).toBe('123456789');
                expect(pollerFakeInstance.allocationStatus).toBe('timeout');
                expect(pollerFakeInstance.hmpBatchSize).toEqual(config['hmp.batch.size']);
            });
        });
        it('Error with no wrappedResponse returned - Multiple Poller Mode', function() {
            var pollerFakeInstance = {
                vistaId: 'SITE',
                environment: environment,
                config: config,
                log: dummyLogger,
                metrics: dummyLogger,
                paused: false,
                readyToShutdown: false,
                allocationToken: '123456789',
                allocationStatus: 'rejected',
                multipleMode: true,
                errorPublisher: errorPublisher,
                pollDelayMillis: 1000,
                lastUpdateTime: '0',
                vprUpdateOpData: null,
                vistaProxy: new VistaClientDummy(dummyLogger, config),
                hmpBatchSize: config['hmp.batch.size'],
                isVistaHdr: false,
                lastBatchErrors: {},
                getBatchSize: function() {
                    return config['hmp.batch.size'];
                }
            };
            pollerFakeInstance._updateLastBatchErrorPublishTime = Poller.prototype._updateLastBatchErrorPublishTime.bind(pollerFakeInstance);
            pollerFakeInstance._updateAllocationInfoSynchronous = Poller.prototype._updateAllocationInfoSynchronous.bind(pollerFakeInstance);
            pollerFakeInstance._isErrorPublishNeeded = Poller.prototype._isErrorPublishNeeded.bind(pollerFakeInstance);

            spyOn(errorPublisher, 'publishPollerError').andCallThrough();
            spyOn(environment.metrics, 'warn').andCallThrough();
            spyOn(pollerFakeInstance, '_updateLastBatchErrorPublishTime').andCallThrough();
            spyOn(pollerFakeInstance, '_isErrorPublishNeeded').andCallThrough();
            var complete = false;
            pollerFakeInstance.doNext = function() {
                complete = true;
            };
            runs(function() {
                Poller.prototype._handleBatchErrorGeneral.call(pollerFakeInstance, 'Random error from Vista', null);
            });
            waitsFor(function() {
                return complete;
            }, 'Processing Vista Response');
            runs(function() {
                expect(errorPublisher.publishPollerError).toHaveBeenCalled();
                expect(pollerFakeInstance._updateLastBatchErrorPublishTime).not.toHaveBeenCalled();
                expect(environment.metrics.warn).toHaveBeenCalled();
                expect(pollerFakeInstance.success).toBe(false);
                expect(pollerFakeInstance.allocationToken).toBe('');
                expect(pollerFakeInstance.allocationStatus).toBe('complete');
                expect(pollerFakeInstance.hmpBatchSize).toEqual(config['hmp.batch.size']);
            });
        });
        it('Error with no errorData in wrappedResponse returned - Multiple Poller Mode', function() {
            var pollerFakeInstance = {
                vistaId: 'SITE',
                environment: environment,
                config: config,
                log: dummyLogger,
                metrics: dummyLogger,
                paused: false,
                readyToShutdown: false,
                allocationToken: '123456789',
                allocationStatus: 'rejected',
                multipleMode: true,
                errorPublisher: errorPublisher,
                pollDelayMillis: 1000,
                lastUpdateTime: '0',
                vprUpdateOpData: null,
                vistaProxy: new VistaClientDummy(dummyLogger, config),
                hmpBatchSize: config['hmp.batch.size'],
                isVistaHdr: false,
                lastBatchErrors: {},
                getBatchSize: function() {
                    return config['hmp.batch.size'];
                }
            };
            pollerFakeInstance._updateLastBatchErrorPublishTime = Poller.prototype._updateLastBatchErrorPublishTime.bind(pollerFakeInstance);
            pollerFakeInstance._updateAllocationInfoSynchronous = Poller.prototype._updateAllocationInfoSynchronous.bind(pollerFakeInstance);
            pollerFakeInstance._isErrorPublishNeeded = Poller.prototype._isErrorPublishNeeded.bind(pollerFakeInstance);

            spyOn(errorPublisher, 'publishPollerError').andCallThrough();
            spyOn(environment.metrics, 'warn').andCallThrough();
            spyOn(pollerFakeInstance, '_updateLastBatchErrorPublishTime').andCallThrough();
            spyOn(pollerFakeInstance, '_isErrorPublishNeeded').andCallThrough();
            var complete = false;
            pollerFakeInstance.doNext = function() {
                complete = true;
            };
            runs(function() {
                Poller.prototype._handleBatchErrorGeneral.call(pollerFakeInstance, 'Random error from Vista', {});
            });
            waitsFor(function() {
                return complete;
            }, 'Processing Vista Response');
            runs(function() {
                expect(errorPublisher.publishPollerError).toHaveBeenCalled();
                expect(pollerFakeInstance._updateLastBatchErrorPublishTime).not.toHaveBeenCalled();
                expect(environment.metrics.warn).toHaveBeenCalled();
                expect(pollerFakeInstance.success).toBe(false);
                expect(pollerFakeInstance.allocationToken).toBe('');
                expect(pollerFakeInstance.allocationStatus).toBe('complete');
                expect(pollerFakeInstance.hmpBatchSize).toEqual(config['hmp.batch.size']);
            });
        });
        it('Error with no message in wrappedResponse.errorData returned - Multiple Poller Mode', function() {
            var pollerFakeInstance = {
                vistaId: 'SITE',
                environment: environment,
                config: config,
                log: dummyLogger,
                metrics: dummyLogger,
                paused: false,
                readyToShutdown: false,
                allocationToken: '123456789',
                allocationStatus: 'rejected',
                multipleMode: true,
                errorPublisher: errorPublisher,
                pollDelayMillis: 1000,
                lastUpdateTime: '0',
                vprUpdateOpData: null,
                vistaProxy: new VistaClientDummy(dummyLogger, config),
                hmpBatchSize: config['hmp.batch.size'],
                isVistaHdr: false,
                lastBatchErrors: {},
                getBatchSize: function() {
                    return config['hmp.batch.size'];
                }
            };
            pollerFakeInstance._updateLastBatchErrorPublishTime = Poller.prototype._updateLastBatchErrorPublishTime.bind(pollerFakeInstance);
            pollerFakeInstance._updateAllocationInfoSynchronous = Poller.prototype._updateAllocationInfoSynchronous.bind(pollerFakeInstance);
            pollerFakeInstance._isErrorPublishNeeded = Poller.prototype._isErrorPublishNeeded.bind(pollerFakeInstance);

            spyOn(errorPublisher, 'publishPollerError').andCallThrough();
            spyOn(environment.metrics, 'warn').andCallThrough();
            spyOn(pollerFakeInstance, '_updateLastBatchErrorPublishTime').andCallThrough();
            spyOn(pollerFakeInstance, '_isErrorPublishNeeded').andCallThrough();
            var complete = false;
            pollerFakeInstance.doNext = function() {
                complete = true;
            };
            runs(function() {
                Poller.prototype._handleBatchErrorGeneral.call(pollerFakeInstance, 'Random error from Vista', { errorData: {}});
            });
            waitsFor(function() {
                return complete;
            }, 'Processing Vista Response');
            runs(function() {
                expect(errorPublisher.publishPollerError).toHaveBeenCalled();
                expect(pollerFakeInstance._updateLastBatchErrorPublishTime).not.toHaveBeenCalled();
                expect(environment.metrics.warn).toHaveBeenCalled();
                expect(pollerFakeInstance.success).toBe(false);
                expect(pollerFakeInstance.allocationToken).toBe('');
                expect(pollerFakeInstance.allocationStatus).toBe('complete');
                expect(pollerFakeInstance.hmpBatchSize).toEqual(config['hmp.batch.size']);
            });
        });
        it('Error when _isErrorPublishNeeded returns false - Multiple Poller Mode', function() {
            var pollerFakeInstance = {
                vistaId: 'SITE',
                environment: environment,
                config: config,
                log: dummyLogger,
                metrics: dummyLogger,
                paused: false,
                readyToShutdown: false,
                allocationToken: '123456789',
                allocationStatus: 'rejected',
                multipleMode: true,
                errorPublisher: errorPublisher,
                pollDelayMillis: 1000,
                lastUpdateTime: '0',
                vprUpdateOpData: null,
                vistaProxy: new VistaClientDummy(dummyLogger, config),
                hmpBatchSize: config['hmp.batch.size'],
                isVistaHdr: false,
                lastBatchErrors: {},
                getBatchSize: function() {
                    return config['hmp.batch.size'];
                }
            };
            pollerFakeInstance._updateLastBatchErrorPublishTime = Poller.prototype._updateLastBatchErrorPublishTime.bind(pollerFakeInstance);
            pollerFakeInstance._updateAllocationInfoSynchronous = Poller.prototype._updateAllocationInfoSynchronous.bind(pollerFakeInstance);
            pollerFakeInstance._isErrorPublishNeeded = Poller.prototype._isErrorPublishNeeded.bind(pollerFakeInstance);

            spyOn(errorPublisher, 'publishPollerError').andCallThrough();
            spyOn(environment.metrics, 'warn').andCallThrough();
            spyOn(pollerFakeInstance, '_updateLastBatchErrorPublishTime').andCallThrough();
            spyOn(pollerFakeInstance, '_isErrorPublishNeeded').andCallThrough();
            var complete = false;
            pollerFakeInstance.doNext = function() {
                complete = true;
            };
            pollerFakeInstance.lastBatchErrors['RPC Error'] = moment().subtract(1000, 'seconds');
            runs(function() {
                Poller.prototype._handleBatchErrorGeneral.call(pollerFakeInstance, 'Random error from Vista', { errorData: {message: 'RPC Error'}});
            });
            waitsFor(function() {
                return complete;
            }, 'Processing Vista Response');
            runs(function() {
                expect(errorPublisher.publishPollerError).not.toHaveBeenCalled();
                expect(pollerFakeInstance._updateLastBatchErrorPublishTime).not.toHaveBeenCalled();
                expect(environment.metrics.warn).toHaveBeenCalled();
                expect(pollerFakeInstance.success).toBe(false);
                expect(pollerFakeInstance.allocationToken).toBe('');
                expect(pollerFakeInstance.allocationStatus).toBe('complete');
                expect(pollerFakeInstance.hmpBatchSize).toEqual(config['hmp.batch.size']);
            });
        });
        it('Error when _isErrorPublishNeeded returns true - Multiple Poller Mode', function() {
            var pollerFakeInstance = {
                vistaId: 'SITE',
                environment: environment,
                config: config,
                log: dummyLogger,
                metrics: dummyLogger,
                paused: false,
                readyToShutdown: false,
                allocationToken: '123456789',
                allocationStatus: 'rejected',
                multipleMode: true,
                errorPublisher: errorPublisher,
                pollDelayMillis: 1000,
                lastUpdateTime: '0',
                vprUpdateOpData: null,
                vistaProxy: new VistaClientDummy(dummyLogger, config),
                hmpBatchSize: config['hmp.batch.size'],
                isVistaHdr: false,
                lastBatchErrors: {},
                getBatchSize: function() {
                    return config['hmp.batch.size'];
                }
            };
            pollerFakeInstance._updateLastBatchErrorPublishTime = Poller.prototype._updateLastBatchErrorPublishTime.bind(pollerFakeInstance);
            pollerFakeInstance._updateAllocationInfoSynchronous = Poller.prototype._updateAllocationInfoSynchronous.bind(pollerFakeInstance);
            pollerFakeInstance._isErrorPublishNeeded = Poller.prototype._isErrorPublishNeeded.bind(pollerFakeInstance);

            spyOn(errorPublisher, 'publishPollerError').andCallThrough();
            spyOn(environment.metrics, 'warn').andCallThrough();
            spyOn(pollerFakeInstance, '_updateLastBatchErrorPublishTime').andCallThrough();
            spyOn(pollerFakeInstance, '_isErrorPublishNeeded').andCallThrough();
            var complete = false;
            pollerFakeInstance.doNext = function() {
                complete = true;
            };
            pollerFakeInstance.lastBatchErrors['RPC Error'] = moment().subtract(2000, 'seconds');
            runs(function() {
                Poller.prototype._handleBatchErrorGeneral.call(pollerFakeInstance, 'Random error from Vista', { errorData: {message: 'RPC Error'}});
            });
            waitsFor(function() {
                return complete;
            }, 'Processing Vista Response');
            runs(function() {
                expect(errorPublisher.publishPollerError).toHaveBeenCalled();
                expect(pollerFakeInstance._updateLastBatchErrorPublishTime).toHaveBeenCalled();
                expect(environment.metrics.warn).toHaveBeenCalled();
                expect(pollerFakeInstance.success).toBe(false);
                expect(pollerFakeInstance.allocationToken).toBe('');
                expect(pollerFakeInstance.allocationStatus).toBe('complete');
                expect(pollerFakeInstance.hmpBatchSize).toEqual(config['hmp.batch.size']);
            });
        });
    });

    describe('_handleBatchSuccess', function() {
        it('Happy Path with valid data', function() {
            var pollerFakeInstance = {
                vistaId: 'SITE',
                environment: environment,
                config: config,
                metrics: dummyLogger,
                log: dummyLogger,
                paused: false,
                readyToShutdown: false,
                allocationToken: '',
                allocationStatus: 'complete',
                multipleMode: false,
                errorPublisher: errorPublisher,
                pollDelayMillis: 1000,
                lastUpdateTime: '0',
                vprUpdateOpData: null,
                vistaProxy: new VistaClientDummy(dummyLogger, config),
                isVistaHdr: false,
                hmpBatchSize: config['hmp.batch.size'],
                success: false,
                _processBatch: function(wrappedResponse, callback) {
                    expect(wrappedResponse).toBeDefined();
                    callback(null, []);
                }
            };
            spyOn(errorPublisher, 'publishPollerError').andCallThrough();
            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"KODAK.VISTACORE.US\",\"systemId\":\"SITE\"},\"data\":{\"updated\":\"20150721120512\",\"totalItems\":1000,\"lastUpdate\" : \"3150721-11303\",\"items\":[{},{}]}}';
            var complete = false;
            pollerFakeInstance.doNext = function() {
                complete = true;
            };
            spyOn(pollerFakeInstance, '_processBatch').andCallThrough();
            runs(function() {
                Poller.prototype._handleBatchSuccess.call(pollerFakeInstance, {
                    hmpBatchSize: 200,
                    data: JSON.parse(rawResponse).data
                });
            });
            waitsFor(function() {
                return complete;
            }, 'Processing Vista Response');
            runs(function() {
                expect(pollerFakeInstance.hmpBatchSize).toEqual(200);
                expect(pollerFakeInstance._processBatch.calls.length).toEqual(1);
                expect(errorPublisher.publishPollerError).not.toHaveBeenCalled();
            });
        });
        it('Happy Path Happy Path with valid data for VistaHdr', function() {
            var pollerFakeInstance = {
                vistaId: '84F0',
                environment: environment,
                config: config,
                log: dummyLogger,
                paused: false,
                readyToShutdown: false,
                allocationToken: '',
                allocationStatus: 'complete',
                multipleMode: false,
                errorPublisher: errorPublisher,
                pollDelayMillis: 1000,
                lastUpdateTime: '0',
                success: false,
                vprUpdateOpData: null,
                isVistaHdr: true,
                vistaProxy: new VistaClientDummy(dummyLogger, config),
                hmpBatchSize: config.hdr.pubsubConfig.maxBatchSize,
                _processBatch: function(wrappedResponse, callback) {
                    expect(wrappedResponse).toBeDefined();
                    callback(null, []);
                }
            };
            spyOn(errorPublisher, 'publishPollerError').andCallThrough();
            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"RAPHAEL.VISTACORE.US\",\"systemId\":\"84F0\"},\"data\":{\"updated\":\"20150721120512\",\"totalItems\":1000,\"lastUpdate\" : \"3150721-11303\",\"items\":[{},{}]}}';
            var complete = false;
            pollerFakeInstance.doNext = function() {
                complete = true;
            };
            spyOn(pollerFakeInstance, '_processBatch').andCallThrough();
            runs(function() {
                Poller.prototype._handleBatchSuccess.call(pollerFakeInstance, {
                    hmpBatchSize: 200,
                    data: JSON.parse(rawResponse).data
                });
            });
            waitsFor(function() {
                return complete;
            }, 'Processing VistaHdr Response');
            runs(function() {
                expect(pollerFakeInstance.hmpBatchSize).toEqual(200);
                expect(pollerFakeInstance._processBatch.calls.length).toEqual(1);
                expect(errorPublisher.publishPollerError).not.toHaveBeenCalled();
            });
        });
        it('Happy Path with empty batch message and allocationToken. (Multiple Poller Mode)', function() {
            var pollerFakeInstance = {
                vistaId: 'SITE',
                environment: environment,
                config: config,
                metrics: dummyLogger,
                log: dummyLogger,
                paused: false,
                readyToShutdown: false,
                allocationToken: '',
                allocationStatus: 'complete',
                multipleMode: true,
                errorPublisher: errorPublisher,
                pollDelayMillis: 1000,
                lastUpdateTime: '0',
                vprUpdateOpData: null,
                vistaProxy: new VistaClientDummy(dummyLogger, config),
                isVistaHdr: false,
                hmpBatchSize: config['hmp.batch.size'],
                success: false,
                _processBatch: function(wrappedResponse, callback) {
                    expect(wrappedResponse).toBeDefined();
                    callback(null, []);
                }
            };
            pollerFakeInstance._updateAllocationInfoSynchronous = Poller.prototype._updateAllocationInfoSynchronous.bind(pollerFakeInstance);

            spyOn(errorPublisher, 'publishPollerError').andCallThrough();
            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"KODAK.VISTACORE.US\",\"systemId\":\"SITE\"},\"data\":{\"allocationToken\":\"12345678\",\"updated\":\"20150721120512\",\"totalItems\":0,\"lastUpdate\" : \"3150721-11303\",\"items\":[]}}';
            var complete = false;
            pollerFakeInstance.doNext = function() {
                complete = true;
            };
            spyOn(pollerFakeInstance, '_processBatch').andCallThrough();
            runs(function() {
                Poller.prototype._handleBatchSuccess.call(pollerFakeInstance, {
                    hmpBatchSize: 200,
                    data: JSON.parse(rawResponse).data
                });
            });
            waitsFor(function() {
                return complete;
            }, 'Processing Vista Response');
            runs(function() {
                expect(pollerFakeInstance.hmpBatchSize).toEqual(200);
                expect(pollerFakeInstance.allocationToken).toEqual('12345678');
                expect(pollerFakeInstance.allocationStatus).toEqual('complete');
            });
        });
        it('Happy Path with empty batch message and no allocationToken. (Multiple Poller Mode)', function() {
            var pollerFakeInstance = {
                vistaId: 'SITE',
                environment: environment,
                config: config,
                metrics: dummyLogger,
                log: dummyLogger,
                paused: false,
                readyToShutdown: false,
                allocationToken: '',
                allocationStatus: 'complete',
                multipleMode: true,
                errorPublisher: errorPublisher,
                pollDelayMillis: 1000,
                lastUpdateTime: '0',
                vprUpdateOpData: null,
                vistaProxy: new VistaClientDummy(dummyLogger, config),
                isVistaHdr: false,
                hmpBatchSize: config['hmp.batch.size'],
                success: false,
                _processBatch: function(wrappedResponse, callback) {
                    expect(wrappedResponse).toBeDefined();
                    callback(null, []);
                }
            };
            pollerFakeInstance._updateAllocationInfoSynchronous = Poller.prototype._updateAllocationInfoSynchronous.bind(pollerFakeInstance);

            spyOn(errorPublisher, 'publishPollerError').andCallThrough();
            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"KODAK.VISTACORE.US\",\"systemId\":\"SITE\"},\"data\":{\"updated\":\"20150721120512\",\"totalItems\":0,\"lastUpdate\" : \"3150721-11303\",\"items\":[]}}';
            var complete = false;
            pollerFakeInstance.doNext = function() {
                complete = true;
            };
            spyOn(pollerFakeInstance, '_processBatch').andCallThrough();
            runs(function() {
                Poller.prototype._handleBatchSuccess.call(pollerFakeInstance, {
                    hmpBatchSize: 200,
                    data: JSON.parse(rawResponse).data
                });
            });
            waitsFor(function() {
                return complete;
            }, 'Processing Vista Response');
            runs(function() {
                expect(pollerFakeInstance.hmpBatchSize).toEqual(200);
                expect(pollerFakeInstance.allocationToken).toEqual('');
                expect(pollerFakeInstance.allocationStatus).toEqual('complete');
            });
        });
        it('Happy Path with no data node. (Multiple Poller Mode)', function() {
            var pollerFakeInstance = {
                vistaId: 'SITE',
                environment: environment,
                config: config,
                metrics: dummyLogger,
                log: dummyLogger,
                paused: false,
                readyToShutdown: false,
                allocationToken: '',
                allocationStatus: 'complete',
                multipleMode: true,
                errorPublisher: errorPublisher,
                pollDelayMillis: 1000,
                lastUpdateTime: '0',
                vprUpdateOpData: null,
                vistaProxy: new VistaClientDummy(dummyLogger, config),
                isVistaHdr: false,
                hmpBatchSize: config['hmp.batch.size'],
                success: false,
                _processBatch: function(wrappedResponse, callback) {
                    expect(wrappedResponse).toBeDefined();
                    callback(null, []);
                }
            };
            pollerFakeInstance._updateAllocationInfoSynchronous = Poller.prototype._updateAllocationInfoSynchronous.bind(pollerFakeInstance);

            spyOn(errorPublisher, 'publishPollerError').andCallThrough();
            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"KODAK.VISTACORE.US\",\"systemId\":\"SITE\"}}';
            var complete = false;
            pollerFakeInstance.doNext = function() {
                complete = true;
            };
            spyOn(pollerFakeInstance, '_processBatch').andCallThrough();
            runs(function() {
                Poller.prototype._handleBatchSuccess.call(pollerFakeInstance, {
                    hmpBatchSize: 200,
                    data: JSON.parse(rawResponse).data
                });
            });
            waitsFor(function() {
                return complete;
            }, 'Processing Vista Response');
            runs(function() {
                expect(pollerFakeInstance.hmpBatchSize).toEqual(200);
                expect(pollerFakeInstance.allocationToken).toEqual('');
                expect(pollerFakeInstance.allocationStatus).toEqual('complete');
            });
        });
        it('Error Path with valid data', function() {
            var pollerFakeInstance = {
                vistaId: 'SITE',
                environment: environment,
                config: config,
                metrics: dummyLogger,
                log: dummyLogger,
                paused: false,
                readyToShutdown: false,
                allocationToken: '',
                allocationStatus: 'complete',
                multipleMode: false,
                errorPublisher: errorPublisher,
                pollDelayMillis: 1000,
                lastUpdateTime: '0',
                vprUpdateOpData: null,
                vistaProxy: new VistaClientDummy(dummyLogger, config),
                isVistaHdr: false,
                hmpBatchSize: config['hmp.batch.size'],
                success: false,
                _processBatch: function(wrappedResponse, callback) {
                    expect(wrappedResponse).toBeDefined();
                    callback('ERROR', []);
                }
            };
            spyOn(errorPublisher, 'publishPollerError').andCallThrough();
            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"KODAK.VISTACORE.US\",\"systemId\":\"SITE\"},\"data\":{\"updated\":\"20150721120512\",\"totalItems\":1000,\"lastUpdate\" : \"3150721-11303\",\"items\":[{},{}]}}';
            var complete = false;
            pollerFakeInstance.doNext = function() {
                complete = true;
            };
            spyOn(pollerFakeInstance, '_processBatch').andCallThrough();
            runs(function() {
                Poller.prototype._handleBatchSuccess.call(pollerFakeInstance, {
                    hmpBatchSize: 200,
                    data: JSON.parse(rawResponse).data
                });
            });
            waitsFor(function() {
                return complete;
            }, 'Processing Vista Response');
            runs(function() {
                expect(pollerFakeInstance.hmpBatchSize).toEqual(200);
                expect(pollerFakeInstance._processBatch.calls.length).toEqual(1);
                expect(errorPublisher.publishPollerError).toHaveBeenCalled();
            });
        });
        it('Error Path with valid data (Multiple Poller Mode)', function() {
            var pollerFakeInstance = {
                vistaId: 'SITE',
                environment: environment,
                config: config,
                metrics: dummyLogger,
                log: dummyLogger,
                paused: false,
                readyToShutdown: false,
                allocationToken: '',
                allocationStatus: 'complete',
                multipleMode: true,
                errorPublisher: errorPublisher,
                pollDelayMillis: 1000,
                lastUpdateTime: '0',
                vprUpdateOpData: null,
                vistaProxy: new VistaClientDummy(dummyLogger, config),
                isVistaHdr: false,
                hmpBatchSize: config['hmp.batch.size'],
                success: false,
                _processBatch: function(wrappedResponse, callback) {
                    expect(wrappedResponse).toBeDefined();
                    callback('ERROR', []);
                }
            };
            pollerFakeInstance._updateAllocationInfoSynchronous = Poller.prototype._updateAllocationInfoSynchronous.bind(pollerFakeInstance);

            spyOn(errorPublisher, 'publishPollerError').andCallThrough();
            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"KODAK.VISTACORE.US\",\"systemId\":\"SITE\"},\"data\":{\"allocationToken\":\"123456789\",\"updated\":\"20150721120512\",\"totalItems\":1000,\"lastUpdate\" : \"3150721-11303\",\"items\":[{},{}]}}';
            var complete = false;
            pollerFakeInstance.doNext = function() {
                complete = true;
            };
            spyOn(pollerFakeInstance, '_processBatch').andCallThrough();
            runs(function() {
                Poller.prototype._handleBatchSuccess.call(pollerFakeInstance, {
                    hmpBatchSize: 200,
                    data: JSON.parse(rawResponse).data
                });
            });
            waitsFor(function() {
                return complete;
            }, 'Processing Vista Response');
            runs(function() {
                expect(pollerFakeInstance.hmpBatchSize).toEqual(200);
                expect(pollerFakeInstance._processBatch.calls.length).toEqual(1);
                expect(pollerFakeInstance.allocationToken).toBe('123456789');
                expect(pollerFakeInstance.allocationStatus).toBe('timeout');
                expect(errorPublisher.publishPollerError).toHaveBeenCalled();
            });
        });
        it('Reset batch size', function() {
            var pollerFakeInstance = {
                vistaId: 'SITE',
                environment: environment,
                config: config,
                log: dummyLogger,
                paused: false,
                readyToShutdown: false,
                allocationToken: '',
                allocationStatus: 'complete',
                multipleMode: false,
                pollDelayMillis: 1000,
                lastUpdateTime: '0',
                errorPublisher: errorPublisher,
                vprUpdateOpData: null,
                isVistaHdr: false,
                success: true,
                hmpBatchSize: 200,
                getBatchSize: function() {
                    return config['hmp.batch.size'];
                },
                _processBatch: function(data, callback) {
                    expect(data).toBeDefined();
                    callback('no data');
                }
            };
            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"KODAK.VISTACORE.US\",\"systemId\":\"SITE\"},\"data\":{\"updated\":\"20150721120512\",\"totalItems\":1000,\"lastUpdate\" : \"3150721-11303\",\"items\":[{},{}]}}';
            var complete = false;
            pollerFakeInstance.doNext = function() {
                complete = true;
            };
            spyOn(pollerFakeInstance, '_processBatch').andCallThrough();
            runs(function() {
                Poller.prototype._handleBatchSuccess.call(pollerFakeInstance, {
                    hmpBatchSize: 200,
                    data: JSON.parse(rawResponse).data
                });
            });
            waitsFor(function() {
                return complete;
            }, 'Processing Vista Response');
            runs(function() {
                expect(pollerFakeInstance.hmpBatchSize).toEqual(config['hmp.batch.size']);
                expect(pollerFakeInstance._processBatch.calls.length).toEqual(1);
            });
        });
        it('Reset batch size for VistaHdr', function() {
            var pollerFakeInstance = {
                vistaId: '84F0',
                environment: environment,
                config: config,
                log: dummyLogger,
                paused: false,
                readyToShutdown: false,
                allocationToken: '',
                allocationStatus: 'complete',
                multipleMode: false,
                pollDelayMillis: 1000,
                lastUpdateTime: '0',
                errorPublisher: errorPublisher,
                vprUpdateOpData: null,
                success: true,
                hmpBatchSize: 500,
                isVistaHdr: true,
                getBatchSize: function() {
                    return config.hdr.pubsubConfig.maxBatchSize;
                },
                _processBatch: function(data, callback) {
                    expect(data).toBeDefined();
                    callback('no data');
                }
            };
            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"RAPHAEL.VISTACORE.US\",\"systemId\":\"84F0\"},\"data\":{\"updated\":\"20150721120512\",\"totalItems\":1000,\"lastUpdate\" : \"3150721-11303\",\"items\":[{},{}]}}';
            var complete = false;
            pollerFakeInstance.doNext = function() {
                complete = true;
            };
            spyOn(pollerFakeInstance, '_processBatch').andCallThrough();
            runs(function() {
                Poller.prototype._handleBatchSuccess.call(pollerFakeInstance, {
                    hmpBatchSize: 200,
                    data: JSON.parse(rawResponse).data
                });
            });
            waitsFor(function() {
                return complete;
            }, 'Processing VistaHdr Response');
            runs(function() {
                expect(pollerFakeInstance.hmpBatchSize).toEqual(config.hdr.pubsubConfig.maxBatchSize);
                expect(pollerFakeInstance._processBatch.calls.length).toEqual(1);
            });
        });
    });

    describe('_createUnsolicitedUpdateJobStatus()', function() {
        var vistaId = 'AAAA';
        var pid = 'AAAA;1';
        var hdrPid = '84F0;1';
        var pollerJobId = '1234';

        it('Happy Path', function() {
            var poller = createPoller(dummyLogger, vistaIdValue, config, environment, false, false);
            setupSpies(jdsClientDummy, environment, poller, publisherRouterDummy);

            var actualError;
            var actualResponse;
            var called = false;
            spyOn(jdsClientDummy, 'saveJobState').andCallFake(function(jobState, callback){callback(null, {statusCode:200});});

            poller._createUnsolicitedUpdateJobStatus(vistaId, 'allergy', pid, pollerJobId, environment.jobStatusUpdater, dummyLogger, function(error, response) {
                actualError = error;
                actualResponse = response;
                called = true;
            });

            waitsFor(function() {
                return called;
            }, 'Call to _setJobStatusToStarted failed to return in time.', 500);

            runs(function() {
                expect(actualError).toBeNull();
                expect(environment.jobStatusUpdater.createJobStatus.calls.length).toEqual(1);
                expect(environment.jobStatusUpdater.createJobStatus).toHaveBeenCalledWith(jasmine.objectContaining({
                    type: 'vista-AAAA-data-allergy-poller',
                    patientIdentifier: {
                        type: 'pid',
                        value: pid
                    },
                    rootJobId: pollerJobId,
                    jobId: pollerJobId,
                    status: 'created',
                    timestamp: jasmine.any(String)
                }), jasmine.any(Function));
            });
        });
        it('Happy Path For VistA HDR', function() {
            var hdrPoller = createPoller(dummyLogger, hdrIdValue, config, environment, false, false);
            setupSpies(jdsClientDummy, environment, hdrPoller, publisherRouterDummy);

            var actualError;
            var actualResponse;
            var called = false;
            var hdrId = '84F0';
            spyOn(jdsClientDummy, 'saveJobState').andCallFake(function(jobState, callback){callback(null, {statusCode:200});});
            hdrPoller._createUnsolicitedUpdateJobStatus(hdrId, null, hdrPid, pollerJobId, environment.jobStatusUpdater, dummyLogger, function(error, response) {
                actualError = error;
                actualResponse = response;
                called = true;
            });

            waitsFor(function() {
                return called;
            }, 'Call to _setJobStatusToStarted failed to return in time.', 500);

            runs(function() {
                expect(actualError).toBeNull();
                expect(environment.jobStatusUpdater.createJobStatus.calls.length).toEqual(1);
                expect(environment.jobStatusUpdater.createJobStatus).toHaveBeenCalledWith(jasmine.objectContaining({
                    type: 'vistahdr-84F0-data-poller',
                    patientIdentifier: {
                        type: 'pid',
                        value: hdrPid
                    },
                    rootJobId: pollerJobId,
                    jobId: pollerJobId,
                    status: 'created',
                    timestamp: jasmine.any(String)
                }), jasmine.any(Function));
            });
        });
    });

    describe('_createJobsForUnsolicitedUpdates()', function() {
        var unsolicitedUpdateSyncStart2 = {
            collection: 'syncStart',
            pid: vistaIdValue + ';1',
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
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };

        var unsolicitedUpdateNoMetaStamp = {
            collection: 'syncStart',
            pid: vistaIdValue + ';1',
        };

        var noDomainMetaStamp = {
            collection: 'syncStart',
            pid: vistaIdValue + ';1',
            metaStamp: {
                stampTime: '20150114115126',
                sourceMetaStamp: {
                    'SITE': {
                        pid: vistaIdValue + ';1',
                        localId: '1',
                        stampTime: '20150114115126'
                    }
                }
            }
        };

        it('Normal path', function() {
            var done;

            var poller = createPoller(dummyLogger, vistaIdValue, config, environment, false, false);
            setupSpies(jdsClientDummy, environment, poller, publisherRouterDummy);

            // Need a deep copy so we are not modifying our source information.
            //-----------------------------------------------------------------
            var batch = JSON.parse(JSON.stringify({
                items: [syncStartJobsValue[0], unsolicitedUpdateSyncStart2]
            }));

            poller._createJobsForUnsolicitedUpdates(batch, function(error, response) {
                done = true;

                expect(error).toBeFalsy();
                expect(response).toBeTruthy();
                expect(batch.items[1].rootJobId).toBeDefined();
                expect(batch.items[1].jobId).toBeDefined();
                expect(environment.jobStatusUpdater.createJobStatus.calls.length).toEqual(1);
            });

            waitsFor(function() {
                return done;
            });
        });

        it('Error path: missing metastamp', function(){
            var done;

            var poller = createPoller(dummyLogger, vistaIdValue, config, environment, false, false);
            setupSpies(jdsClientDummy, environment, poller, publisherRouterDummy);

            // Need a deep copy so we are not modifying our source information.
            //-----------------------------------------------------------------
            var batch = JSON.parse(JSON.stringify({
                items: [unsolicitedUpdateNoMetaStamp]
            }));

            poller._createJobsForUnsolicitedUpdates(batch, function(error, response) {
                done = true;
                expect(error).toBeFalsy();
                expect(environment.errorPublisher.publishPollerError).toHaveBeenCalled();
                expect(response).toEqual([]);
            });

            waitsFor(function() {
                return done;
            });
        });

        it('Error path: no domain in metastamp', function(){
            var done;

            var poller = createPoller(dummyLogger, vistaIdValue, config, environment, false, false);
            setupSpies(jdsClientDummy, environment, poller, publisherRouterDummy);

            // Need a deep copy so we are not modifying our source information.
            //-----------------------------------------------------------------
            var batch = JSON.parse(JSON.stringify({
                items: [noDomainMetaStamp]
            }));

            poller._createJobsForUnsolicitedUpdates(batch, function(error, response) {
                done = true;
                expect(error).toBeFalsy();
                expect(environment.errorPublisher.publishPollerError).toHaveBeenCalled();
                expect(response).toEqual([]);
            });

            waitsFor(function() {
                return done;
            });
        });
    });

    describe('_updateAllocationInfo()', function() {
        it('Happy Path', function() {
            var poller = createPoller(dummyLogger, vistaIdValue, config, environment, false, true);
            setupSpies(jdsClientDummy, environment, poller, publisherRouterDummy);

            var finished = false;
            var actualError;
            var actualResponse;
            var localDataValue = JSON.parse(JSON.stringify(dataValue));
            localDataValue.allocationToken = '123456789';
            runs(function() {

                poller._updateAllocationInfo(localDataValue, 'timeout', function(error, response) {
                    actualError = error;
                    actualResponse = response;
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call to _updateAllocationInfo failed to return in time.', 500);

            runs(function() {
                expect(actualError).toBeNull();
                expect(actualResponse).toEqual('success');
                expect(poller.allocationToken).toBe('123456789');
                expect(poller.allocationStatus).toBe('timeout');
            });
        });

        it('Missing allocation token', function() {
            var poller = createPoller(dummyLogger, vistaIdValue, config, environment, false, true);
            setupSpies(jdsClientDummy, environment, poller, publisherRouterDummy);

            var finished = false;
            var actualError;
            var actualResponse;
            var localDataValue = JSON.parse(JSON.stringify(dataValue));
            delete localDataValue.allocationToken;
            runs(function() {

                poller._updateAllocationInfo(localDataValue, 'complete', function(error, response) {
                    actualError = error;
                    actualResponse = response;
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call to _updateAllocationInfo failed to return in time.', 500);

            runs(function() {
                expect(actualError).toBeNull();
                expect(actualResponse).toEqual('success');
                expect(poller.allocationToken).toBe('');
                expect(poller.allocationStatus).toBe('complete');
            });
        });


    });

    describe('_updateAllocationInfoSynchronous()', function() {
        it('Happy Path', function() {
            var poller = createPoller(dummyLogger, vistaIdValue, config, environment, false, true);
            setupSpies(jdsClientDummy, environment, poller, publisherRouterDummy);

            var localDataValue = JSON.parse(JSON.stringify(dataValue));
            localDataValue.allocationToken = '123456789';
            poller._updateAllocationInfoSynchronous(localDataValue, 'timeout');
            expect(poller.allocationToken).toBe('123456789');
            expect(poller.allocationStatus).toBe('timeout');
        });

        it('Missing allocation token', function() {
            var poller = createPoller(dummyLogger, vistaIdValue, config, environment, false, true);
            setupSpies(jdsClientDummy, environment, poller, publisherRouterDummy);

            var localDataValue = JSON.parse(JSON.stringify(dataValue));
            delete localDataValue.allocationToken;
            poller._updateAllocationInfoSynchronous(localDataValue, 'timeout');
            expect(poller.allocationToken).toBe('');
            expect(poller.allocationStatus).toBe('complete');
        });


    });

    describe('_updateLastBatchErrorPublishTime()', function() {
        it('Happy Path', function() {
            var poller = createPoller(dummyLogger, vistaIdValue, config, environment, false, true);
            setupSpies(jdsClientDummy, environment, poller, publisherRouterDummy);

            poller._updateLastBatchErrorPublishTime('1Error1');
            var firstPublishTime = poller.lastBatchErrors['1Error1'];
            expect(firstPublishTime).toBeTruthy();
            poller._updateLastBatchErrorPublishTime('1Error1');
            var secondPublishTime = poller.lastBatchErrors['1Error1'];
            expect(secondPublishTime).toBeTruthy();
            expect(firstPublishTime === secondPublishTime).toBe(false);
        });
        it('Happy Path - two separate errors', function() {
            var poller = createPoller(dummyLogger, vistaIdValue, config, environment, false, true);
            setupSpies(jdsClientDummy, environment, poller, publisherRouterDummy);

            var error1PublishTime = poller.lastBatchErrors['1Error1'];
            expect(error1PublishTime).toBeFalsy();
            poller._updateLastBatchErrorPublishTime('1Error1');
            error1PublishTime = poller.lastBatchErrors['1Error1'];
            expect(error1PublishTime).toBeTruthy();

            var error2PublishTime = poller.lastBatchErrors['2Error2'];
            expect(error2PublishTime).toBeFalsy();
            poller._updateLastBatchErrorPublishTime('2Error2');
            error2PublishTime = poller.lastBatchErrors['2Error2'];
            expect(error2PublishTime).toBeTruthy();

        });
    });

    describe('_isErrorPublishNeeded()', function() {
        it('Happy Path when the error has never been logged before.', function() {
            var poller = createPoller(dummyLogger, vistaIdValue, config, environment, false, true);
            setupSpies(jdsClientDummy, environment, poller, publisherRouterDummy);

            var result = poller._isErrorPublishNeeded('1Error1');
            expect(result).toBe(true);
        });

        it('Happy Path when the error has been logged and our time window has not passed.', function() {
            var poller = createPoller(dummyLogger, vistaIdValue, config, environment, false, true);
            setupSpies(jdsClientDummy, environment, poller, publisherRouterDummy);

            poller._updateLastBatchErrorPublishTime('1Error1');
            var result = poller._isErrorPublishNeeded('1Error1');
            expect(result).toBe(false);
        });

        it('Happy Path when the error has been logged and our time window has passed.', function() {
            var poller = createPoller(dummyLogger, vistaIdValue, config, environment, false, true);
            setupSpies(jdsClientDummy, environment, poller, publisherRouterDummy);

            poller._updateLastBatchErrorPublishTime('1Error1');
            poller.lastBatchErrors['1Error1'] = moment().subtract(1801, 'seconds');

            var result = poller._isErrorPublishNeeded('1Error1');
            expect(result).toBe(true);
        });
        it('Happy Path when config does not have a pollerIgnoreDuplicateErrorTime value.', function() {
            var localConfig = JSON.parse(JSON.stringify(config));
            delete localConfig.pollerIgnoreDuplicateErrorTime;
            var poller = createPoller(dummyLogger, vistaIdValue, localConfig, environment, false, true);
            setupSpies(jdsClientDummy, environment, poller, publisherRouterDummy);

            poller._updateLastBatchErrorPublishTime('1Error1');
            poller.lastBatchErrors['1Error1'] = moment().subtract(800, 'seconds');

            var result = poller._isErrorPublishNeeded('1Error1');
            expect(result).toBe(false);

            poller.lastBatchErrors['1Error1'] = moment().subtract(910, 'seconds');
            result = poller._isErrorPublishNeeded('1Error1');
            expect(result).toBe(true);
        });
    });

});