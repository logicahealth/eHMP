'use strict';

//------------------------------------------------------------------------------------
// This file contains unit tests for vista-record-poller.js.
//
// Author: Mike Risher, Les Westberg
//------------------------------------------------------------------------------------

require('../../../../env-setup');

var _ = require('underscore');
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
    jds: {
        protocol: 'http',
        host: 'IP_ADDRESS',
        port: 9080
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

var poller = new Poller(dummyLogger, vistaIdValue, config, environment);

var syncStartJobsValue = [{
    collection: 'syncStart',
    pid: vistaIdValue + ';1',
    rootJobId: '3',
    jobId: '9',
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
}, {
    collection: 'syncStart',
    pid: vistaIdValue + ';2',
    rootJobId: '2',
    jobId: '6',
    metaStamp: {
        stampTime: '20150114115126',
        sourceMetaStamp: {
            '9E7A': {
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

var unsolicitedUpdateSyncStart = {
    collection: 'syncStart',
    pid: vistaIdValue + ';1',
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

var vistaDataJobAllergyObjectWithPid = {
    pid: vistaIdValue + ';1',
    uid: 'urn:va:allergy:9E7A:1:27837'
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
var hdrPoller = new Poller(dummyLogger, hdrIdValue, config, environment);
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
describe('vista-record-poller', function() {
    beforeEach(function() {
        // Underlying JDS calls to monitor and make sure that they are made.
        //---------------------------------------------------------------------------
        spyOn(jdsClientDummy, 'getOperationalDataMutable').andCallThrough();
        spyOn(jdsClientDummy, 'getPatientIdentifierByPid').andCallThrough();

        spyOn(environment.jobStatusUpdater, 'createJobStatus').andCallThrough();
        spyOn(environment.errorPublisher, 'publishPollerError').andCallThrough();

        spyOn(poller, '_storeLastUpdateTime').andCallThrough();
        spyOn(poller, '_sendToVistaRecordProcessor').andCallThrough();
        spyOn(poller, '_createJobsForUnsolicitedUpdates').andCallThrough();
        spyOn(poller, '_createUnsolicitedUpdateJobStatus').andCallThrough();
        spyOn(hdrPoller, '_storeLastUpdateTime').andCallThrough();
        spyOn(hdrPoller, '_sendToVistaRecordProcessor').andCallThrough();
        spyOn(publisherRouterDummy, 'publish').andCallThrough();
    });

    describe('_getLastUpdateTimeFromJds', function() {
        it('Happy Path', function() {
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
            var expectedJdsResponse = {
                statusCode: 200
            };
            jdsClientDummy._setResponseData(null, expectedJdsResponse, undefined);
            spyOn(jdsClientDummy, 'storeOperationalDataMutable').andCallThrough();
            var finished = false;
            var actualError;
            var actualResponse;
            runs(function() {
                poller._storeLastUpdateTime(dataValue, function(error, response) {
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
            var expectedJdsResponse = {
                statusCode: 200
            };
            jdsClientDummy._setResponseData(null, expectedJdsResponse, undefined);
            spyOn(jdsClientDummy, 'storeOperationalDataMutable').andCallThrough();
            var finished = false;
            var actualError;
            var actualResponse;
            runs(function() {
                hdrPoller._storeLastUpdateTime(hdrDataValue, function(error, response) {
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
        it('Happy Path', function() {
            dummyLogger.debug('In _processBatch test');
            spyOn(environment.jds,'storeOperationalDataMutable').andCallFake(function(data, callback){callback(null, {statusCode: 200});});

            var finished = false;
            var actualError;
            var actualResponse;
            runs(function() {
                poller._processBatch(dataValue, function(error, response) {
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
                expect(poller._storeLastUpdateTime).toHaveBeenCalledWith(dataValue, jasmine.any(Function));
                expect(poller._sendToVistaRecordProcessor).toHaveBeenCalledWith(dataValue, jasmine.any(Function));

                dummyLogger.debug('End _processBatch test');
            });
        });
        it('Error path: task errors out', function() {
            spyOn(environment.jds,'storeOperationalDataMutable').andCallFake(function(data, callback){callback(null, {statusCode: 500});});

            var finished = false;
            var actualError;
            var actualResponse;
            runs(function() {
                poller._processBatch(dataValue, function(error, response) {
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
            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"KODAK.VISTACORE.US\",\"systemId\":\"C877\"},\"data\":{\"updated\":\"20150721120512\",\"totalItems\":1000,\"lastUpdate\" : \"3150721-11303\"}}';
            var lastUpdateTime = poller._extractLastUpdateFromRawResponse(rawResponse);
            expect(lastUpdateTime).toEqual('3150721-11303');
        });
        it('Happy Path - with no white space', function() {
            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"KODAK.VISTACORE.US\",\"systemId\":\"C877\"},\"data\":{\"updated\":\"20150721120512\",\"totalItems\":1000,\"lastUpdate\":\"3150721-11303\"}}';
            var lastUpdateTime = poller._extractLastUpdateFromRawResponse(rawResponse);
            expect(lastUpdateTime).toEqual('3150721-11303');
        });
        it('Happy Path - handle multiple - get first', function() {
            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"KODAK.VISTACORE.US\",\"systemId\":\"C877\"},\"data\":{\"updated\":\"20150721120512\",\"totalItems\":1000,\"lastUpdate\":\"3150721-11303\",\"lastUpdate\":\"3150721-11505\"}}';
            var lastUpdateTime = poller._extractLastUpdateFromRawResponse(rawResponse);
            expect(_.isArray(lastUpdateTime)).toBe(false);
            expect(lastUpdateTime).toEqual('3150721-11303');
        });
    });
    describe('_processResponse', function() {
        it('Happy Path - with white space', function() {
            var pollerFakeInstance = {
                vistaId: '9E7A',
                environment: environment,
                config: config,
                log: dummyLogger,
                paused: false,
                errorPublisher: errorPublisher,
                pollDelayMillis: 1000,
                lastUpdateTime: '0',
                success: false,
                vprUpdateOpData: null,
                vistaProxy: new VistaClientDummy(dummyLogger, config),
                hmpBatchSize: config['hmp.batch.size'],
                _processBatch: function(data, callback) {
                    expect(data).toBeDefined();
                    callback('no data');
                }
            };
            spyOn(errorPublisher, 'publishPollerError').andCallThrough();
            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"KODAK.VISTACORE.US\",\"systemId\":\"C877\"},\"data\":{\"updated\":\"20150721120512\",\"totalItems\":1000,\"lastUpdate\" : \"3150721-11303\"},\"items\":[{},{}]}';
            var complete = false;
            pollerFakeInstance.doNext = function() {
                complete = true;
            };
            spyOn(pollerFakeInstance, '_processBatch').andCallThrough();
            runs(function() {
                Poller.prototype._processResponse.call(pollerFakeInstance, null, {
                    hmpBatchSize: 200,
                    data: JSON.parse(rawResponse)
                });
            });
            waitsFor(function() {
                return complete;
            }, 'Processing Vista Response');
            runs(function() {
                expect(pollerFakeInstance.hmpBatchSize).toEqual(200);
                // expect(pollerFakeInstance.hmpBatchSize).toEqual(config['hmp.batch.size']);
                expect(pollerFakeInstance._processBatch.calls.length).toEqual(1);
                expect(errorPublisher.publishPollerError).not.toHaveBeenCalled();
            });
        });
        it('Happy Path - with white space for VistaHdr', function() {
            var pollerFakeInstance = {
                vistaId: '84F0',
                environment: environment,
                config: config,
                log: dummyLogger,
                paused: false,
                errorPublisher: errorPublisher,
                pollDelayMillis: 1000,
                lastUpdateTime: '0',
                success: false,
                vprUpdateOpData: null,
                isVistaHdr: true,
                vistaProxy: new VistaClientDummy(dummyLogger, config),
                hmpBatchSize: config.hdr.pubsubConfig.maxBatchSize,
                _processBatch: function(data, callback) {
                    expect(data).toBeDefined();
                    callback('no data');
                }
            };
            spyOn(errorPublisher, 'publishPollerError').andCallThrough();
            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"RAPHAEL.VISTACORE.US\",\"systemId\":\"84F0\"},\"data\":{\"updated\":\"20150721120512\",\"totalItems\":1000,\"lastUpdate\" : \"3150721-11303\"},\"items\":[{},{}]}';
            var complete = false;
            pollerFakeInstance.doNext = function() {
                complete = true;
            };
            spyOn(pollerFakeInstance, '_processBatch').andCallThrough();
            runs(function() {
                Poller.prototype._processResponse.call(pollerFakeInstance, null, {
                    hmpBatchSize: 200,
                    data: JSON.parse(rawResponse)
                });
            });
            waitsFor(function() {
                return complete;
            }, 'Processing VistaHdr Response');
            runs(function() {
                expect(pollerFakeInstance.hmpBatchSize).toEqual(200);
                // expect(pollerFakeInstance.hmpBatchSize).toEqual(config['hmp.batch.size']);
                expect(pollerFakeInstance._processBatch.calls.length).toEqual(1);
                expect(errorPublisher.publishPollerError).not.toHaveBeenCalled();
            });
        });
        it('Non JSON parsing error', function() {
            var pollerFakeInstance = {
                vistaId: '9E7A',
                environment: environment,
                config: config,
                log: dummyLogger,
                paused: false,
                errorPublisher: errorPublisher,
                pollDelayMillis: 1000,
                lastUpdateTime: '0',
                vprUpdateOpData: null,
                vistaProxy: new VistaClientDummy(dummyLogger, config),
                getBatchSize: function() {
                    return config['hmp.batch.size'];
                },
                hmpBatchSize: config['hmp.batch.size']
            };
            spyOn(errorPublisher, 'publishPollerError').andCallThrough();
            spyOn(environment.metrics, 'warn').andCallThrough();
            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"KODAK.VISTACORE.US\",\"systemId\":\"C877\"},\"data\":{\"updated\":\"20150721120512\",\"totalItems\":1000,\"lastUpdate\" : \"3150721-11303\"}}';
            var complete = false;
            pollerFakeInstance.doNext = function() {
                complete = true;
            };
            runs(function() {
                Poller.prototype._processResponse.call(pollerFakeInstance, 'Random error from Vista', {
                    hmpBatchSize: 500,
                    data: JSON.parse(rawResponse)
                });
            });
            waitsFor(function() {
                return complete;
            }, 'Processing VistaHdr Response');
            runs(function() {
                expect(errorPublisher.publishPollerError).toHaveBeenCalled();
                expect(environment.metrics.warn).toHaveBeenCalled();
                expect(pollerFakeInstance.hmpBatchSize).toEqual(config['hmp.batch.size']);
            });
        });
        it('Non JSON parsing error for VistaHdr', function() {
            var pollerFakeInstance = {
                vistaId: '84F0',
                environment: environment,
                config: config,
                log: dummyLogger,
                paused: false,
                errorPublisher: errorPublisher,
                pollDelayMillis: 1000,
                lastUpdateTime: '0',
                vprUpdateOpData: null,
                isVistaHdr: true,
                vistaProxy: new VistaClientDummy(dummyLogger, config),
                getBatchSize: function() {
                    return config.hdr.pubsubConfig.maxBatchSize;
                },
                hmpBatchSize: config.hdr.pubsubConfig.maxBatchSize
            };
            spyOn(errorPublisher, 'publishPollerError').andCallThrough();
            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"RAPHAEL.VISTACORE.US\",\"systemId\":\"84F0\"},\"data\":{\"updated\":\"20150721120512\",\"totalItems\":1000,\"lastUpdate\" : \"3150721-11303\"}}';
            var complete = false;
            pollerFakeInstance.doNext = function() {
                complete = true;
            };
            runs(function() {
                Poller.prototype._processResponse.call(pollerFakeInstance, 'Random error from Vista', {
                    hmpBatchSize: 500,
                    data: JSON.parse(rawResponse)
                });
            });
            waitsFor(function() {
                return complete;
            }, 'Processing Vista Response');
            runs(function() {
                expect(errorPublisher.publishPollerError).toHaveBeenCalled();
                expect(pollerFakeInstance.hmpBatchSize).toEqual(config.hdr.pubsubConfig.maxBatchSize);
            });
        });
        it('JSON parsing error', function() {
            var pollerFakeInstance = {
                vistaId: '9E7A',
                environment: environment,
                config: config,
                log: dummyLogger,
                paused: false,
                errorPublisher: errorPublisher,
                pollDelayMillis: 1000,
                lastUpdateTime: '0',
                vprUpdateOpData: null,
                vistaProxy: new VistaClientDummy(dummyLogger, config),
                hmpBatchSize: config['hmp.batch.size'],
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
            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"KODAK.VISTACORE.US\",\"systemId\":\"C877\"},\"data\":{\"updated\":\"20150721120512\",\"totalItems\":1000,\"lastUpdate\" : \"3150721-11303\"},\"items\":[{\"name\":}]}';
            var complete = 0;
            pollerFakeInstance.doNext = function() {
                complete++;
            };
            runs(function() {
                Poller.prototype._processResponse.call(pollerFakeInstance, 'parsing error', {
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
        it('JSON parsing error for VistaHdr', function() {
            var pollerFakeInstance = {
                vistaId: '84F0',
                environment: environment,
                config: config,
                log: dummyLogger,
                paused: false,
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
            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"RAPHAEL.VISTACORE.US\",\"systemId\":\"84F0\"},\"data\":{\"updated\":\"20150721120512\",\"totalItems\":1000,\"lastUpdate\" : \"3150721-11303\"},\"items\":[{\"name\":}]}';
            var complete = 0;
            pollerFakeInstance.doNext = function() {
                complete++;
            };
            runs(function() {
                Poller.prototype._processResponse.call(pollerFakeInstance, 'parsing error', {
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
        it('JSON parsing error AND error storing lastUpdateTime', function() {
            var pollerFakeInstance = {
                vistaId: '9E7A',
                environment: environment,
                config: config,
                log: dummyLogger,
                paused: false,
                errorPublisher: errorPublisher,
                pollDelayMillis: 1000,
                lastUpdateTime: '0',
                vprUpdateOpData: null,
                vistaProxy: new VistaClientDummy(dummyLogger, config),
                hmpBatchSize: config['hmp.batch.size'],
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
            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"KODAK.VISTACORE.US\",\"systemId\":\"C877\"},\"data\":{\"updated\":\"20150721120512\",\"totalItems\":1000,\"lastUpdate\" : \"3150721-11303\"},\"items\":[{\"name\":}]}';
            var complete = 0;
            pollerFakeInstance.doNext = function() {
                complete++;
            };
            runs(function() {
                Poller.prototype._processResponse.call(pollerFakeInstance, 'parsing error', {
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
        it('Reset batch size', function() {
            var pollerFakeInstance = {
                vistaId: '9E7A',
                environment: environment,
                config: config,
                log: dummyLogger,
                paused: false,
                pollDelayMillis: 1000,
                lastUpdateTime: '0',
                errorPublisher: errorPublisher,
                vprUpdateOpData: null,
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
            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"KODAK.VISTACORE.US\",\"systemId\":\"C877\"},\"data\":{\"updated\":\"20150721120512\",\"totalItems\":1000,\"lastUpdate\" : \"3150721-11303\"},\"items\":[{},{}]}';
            var complete = false;
            pollerFakeInstance.doNext = function() {
                complete = true;
            };
            spyOn(pollerFakeInstance, '_processBatch').andCallThrough();
            runs(function() {
                Poller.prototype._processResponse.call(pollerFakeInstance, null, {
                    hmpBatchSize: 200,
                    data: JSON.parse(rawResponse)
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
            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"RAPHAEL.VISTACORE.US\",\"systemId\":\"84F0\"},\"data\":{\"updated\":\"20150721120512\",\"totalItems\":1000,\"lastUpdate\" : \"3150721-11303\"},\"items\":[{},{}]}';
            var complete = false;
            pollerFakeInstance.doNext = function() {
                complete = true;
            };
            spyOn(pollerFakeInstance, '_processBatch').andCallThrough();
            runs(function() {
                Poller.prototype._processResponse.call(pollerFakeInstance, null, {
                    hmpBatchSize: 200,
                    data: JSON.parse(rawResponse)
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
                    'C877': {
                        pid: vistaIdValue + ';1',
                        localId: '1',
                        stampTime: '20150114115126'
                    }
                }
            }
        };

        var batch = {
            items: [syncStartJobsValue[0], unsolicitedUpdateSyncStart2]
        };

        it('Normal path', function() {
            var done;

            poller._createJobsForUnsolicitedUpdates(batch, function(error, response) {
                done = true;

                expect(error).toBeFalsy();
                expect(response).toBeTruthy();
                expect(unsolicitedUpdateSyncStart.rootJobId).toBeDefined();
                expect(unsolicitedUpdateSyncStart.jobId).toBeDefined();
                expect(environment.jobStatusUpdater.createJobStatus.calls.length).toEqual(1);
            });

            waitsFor(function() {
                return done;
            });
        });

        it('Error path: missing metastamp', function(){
            var done;

            poller._createJobsForUnsolicitedUpdates({items: [unsolicitedUpdateNoMetaStamp]}, function(error, response) {
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

            poller._createJobsForUnsolicitedUpdates({items: [noDomainMetaStamp]}, function(error, response) {
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
});