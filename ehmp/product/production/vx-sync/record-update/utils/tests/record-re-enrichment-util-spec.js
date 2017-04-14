'use strict';

require('../../../env-setup');

var ReEnrichUtil = require(global.VX_ROOT + 'record-update/utils/record-re-enrichment-util');
var log = require(global.VX_DUMMIES + '/dummy-logger');
var JdsClientDummy = require(global.VX_DUMMIES + 'jds-client-dummy');
var _ = require('underscore');

// NOTE: be sure next line is commented out before pushing
// log = require('bunyan').createLogger({
//     name: 'record-update-spec',
//     level: 'debug'
// });

var syncStatus1 = {
    'completedStamp': {
        'icn': '10108V420871',
        'lastAccessTime': '',
        'sourceMetaStamp': {
            '2939': {
                'domainMetaStamp': {
                    'allergy': {
                        'domain': 'allergy',
                        'eventCount': 1,
                        'stampTime': 20160408113835,
                        'storedCount': 1,
                        'syncCompleted': true
                    },
                    'appointment': {
                        'domain': 'appointment',
                        'eventCount': 1,
                        'stampTime': 20160408113835,
                        'storedCount': 1,
                        'syncCompleted': true
                    },
                    'consult': {
                        'domain': 'consult',
                        'eventCount': 1,
                        'eventMetaStamp': {
                            'urn:va:consult:2939:19:82': {
                                'stampTime': 20140409083720,
                                'stored': true
                            }
                        },
                        'stampTime': 20160408113835,
                        'storedCount': 1,
                        'syncCompleted': true
                    },
                }
            },
            '9E7A': {
                'domainMetaStamp': {
                    'allergy': {
                        'domain': 'allergy',
                        'eventCount': 4,
                        'eventMetaStamp': {
                            'urn:va:allergy:9E7A:3:751': {
                                'stampTime': 20050317200936,
                                'stored': true
                            },
                            'urn:va:allergy:9E7A:3:874': {
                                'stampTime': 20071217151354,
                                'stored': true
                            }
                        },
                        'stampTime': 20160408113842,
                        'storedCount': 4,
                        'syncCompleted': true
                    }
                }
            },
            'VLER': {
                'domainMetaStamp': {
                    'patient': {
                        'domain': 'patient',
                        'eventCount': 1,
                        'eventMetaStamp': {
                            'urn:va:patient:VLER:10108V420871:10108V420871': {
                                'stampTime': 16051105010000,
                                'stored': true
                            }
                        },
                        'stampTime': 16051105010000,
                        'storedCount': 1,
                        'syncCompleted': true
                    },
                    'vlerdocument': {
                        'domain': 'vlerdocument',
                        'eventCount': 11,
                        'stampTime': 20160408113843,
                        'storedCount': 11,
                        'syncCompleted': true
                    }
                },
                'localId': '10108V420871',
                'pid': 'VLER;10108V420871',
                'stampTime': 20160408113843,
                'syncCompleteAsOf': 20160411095621,
                'syncCompleted': true
            }
        }
    }
};

var syncStatus2 = {
    'completedStamp': {
        'icn': '10110V004877',
        'lastAccessTime': 20160412140034,
        'sourceMetaStamp': {
            '2939': {
                'domainMetaStamp': {
                    'patient': {
                        'domain': 'patient',
                        'eventCount': 1,
                        'eventMetaStamp': {
                            'urn:va:patient:2939:21:21': {
                                'stampTime': 16051105010000,
                                'stored': true
                            }
                        },
                        'stampTime': 16051105010000,
                        'storedCount': 1,
                        'syncCompleted': true
                    }
                },
                'localId': 21,
                'pid': '2939;21',
                'stampTime': 16051105010000,
                'syncCompleteAsOf': 20160412140317,
                'syncCompleted': true
            },
            '9E7A': {
                'domainMetaStamp': {
                    'allergy': {
                        'domain': 'allergy',
                        'eventCount': 3,
                        'eventMetaStamp': {
                            'urn:va:allergy:9E7A:8:753': {
                                'stampTime': 20050317201533,
                                'stored': true
                            }
                        },
                        'stampTime': 20160412135639,
                        'storedCount': 3,
                        'syncCompleted': true
                    },
                    'appointment': {
                        'domain': 'appointment',
                        'eventCount': 2,
                        'eventMetaStamp': {
                            'urn:va:appointment:9E7A:8:A;2931013.14;32': {
                                'stampTime': 19931013140000,
                                'stored': true
                            },
                            'urn:va:appointment:9E7A:8:A;3000406.15;32': {
                                'stampTime': 20020307133400,
                                'stored': true
                            }
                        },
                        'stampTime': 20160412135641,
                        'storedCount': 56,
                        'syncCompleted': true
                    }
                }
            }
        }
    }
};

var simpleSyncStatus1 = {
    'completedStamp': {
        'icn': '10108V420871',
        'lastAccessTime': 20160412104227,
        'sourceMetaStamp': {
            '9E7A': {
                'domainMetaStamp': {
                    'allergy': {
                        'domain': 'allergy',
                        'eventCount': 4,
                        'stampTime': 20160412101225,
                        'storedCount': 4,
                        'syncCompleted': true
                    },
                    'appointment': {
                        'domain': 'appointment',
                        'eventCount': 49,
                        'stampTime': 20160412101225,
                        'storedCount': 49,
                        'syncCompleted': true
                    },
                    'consult': {
                        'domain': 'consult',
                        'eventCount': 5,
                        'stampTime': 20160412101225,
                        'storedCount': 5,
                        'syncCompleted': true
                    }
                },
                'localId': 3,
                'pid': '9E7A;3',
                'stampTime': 20160412101240,
                'syncCompleteAsOf': 20160412143126,
                'syncCompleted': true
            }
        }
    }
};

var patientList = {
    'items': [{
        'jpid': '06ef29d1-3366-40ea-a4aa-2828c1574c7a',
        'lastAccessTime': 20160303153230,
        'patientIdentifiers': [
            '10000V400000',
            'CCCC;3'
        ]
    }, {
        'jpid': '0de64610-edea-4368-99b2-8c66a736bf60',
        'lastAccessTime': 20160303154440,
        'patientIdentifiers': [
            '2939;467',
            '5000000341V359724',
            '9E7A;100022',
            'C877;100022',
            'DOD;0000000010',
            'FFC7;476',
            'VHICID;7551',
            'VLER;5000000341V359724'
        ]
    }, {
        'jpid': '1511afc7-28a1-4d10-83b6-bdbe19d155f9',
        'lastAccessTime': 20160303154443,
        'patientIdentifiers': [
            '10110V004877',
            '2939;21',
            '9E7A;8',
            'C877;8',
            'DOD;0000000008',
            'FFC7;30',
            'VHICID;31733',
            'VLER;10110V004877'
        ]
    }]
};

var allergyDomainData1 = {
    'apiVersion': '1.0',
    'data': {
        'updated': 20160303154108,
        'totalItems': 2,
        'currentItemCount': 2,
        'items': [{
            'data': 'someData',
            'pid': '2939;19',
            'stampTime': 20061217151354,
            'uid': 'urn:va:allergy:2939:19:106'
        }, {
            'data': 'someData',
            'pid': '9E7A;3',
            'stampTime': 20160303154108,
            'uid': 'urn:va:allergy:9E7A:3:751'
        }]
    }
};

var allergyDomainData2 = {
    'apiVersion': '1.0',
    'data': {
        'updated': 20160303154108,
        'totalItems': 1,
        'currentItemCount': 1,
        'items': [{
            'data': 'someData',
            'pid': '9E7A;8',
            'uid': 'urn:va:allergy:9E7A:8:751',
            'stampTime': 20061217151354,
        }]
    }
};

var consultDomainData1 = {
    'apiVersion': '1.0',
    'data': {
        'updated': 20160303154108,
        'totalItems': 2,
        'currentItemCount': 2,
        'items': [{
            'data': 'someData',
            'pid': '9E7A;8',
            'uid': 'urn:va:consult:9E7A:8:751',
            'stampTime': 20061217151354
        }]
    }
};

var updateConfig = {};

describe('record re-enrichment utility', function() {
    describe('retrievePatientList', function() {
        it('Normal path', function() {
            var jdsClient = new JdsClientDummy(log, {});
            jdsClient._setResponseData(null, {
                statusCode: 200
            }, patientList);

            var reEnrichUtil = new ReEnrichUtil(log, jdsClient, updateConfig);

            var done = false;

            runs(function() {
                reEnrichUtil.retrievePatientList(null, function(error, result) {
                    done = true;
                    expect(error).toBeFalsy();
                    expect(result).toBeTruthy();
                    expect(result).toContain('10000V400000');
                    expect(result).toContain('2939;467');
                    expect(result).toContain('10110V004877');
                });
            });

            waitsFor(function() {
                return done;
            });
        });
        it('Error path: Error from JDS', function() {
            var jdsClient = new JdsClientDummy(log, {});
            jdsClient._setResponseData({
                error: 'ERROR!'
            }, {
                statusCode: 500
            }, null);

            var reEnrichUtil = new ReEnrichUtil(log, jdsClient, updateConfig);

            var done = false;

            runs(function() {
                reEnrichUtil.retrievePatientList(null, function(error, result) {
                    done = true;
                    expect(error).toBeTruthy();
                    expect(result).toBeFalsy();
                });
            });

            waitsFor(function() {
                return done;
            });
        });
        it('Error path: Unexpected response from JDS', function() {
            var jdsClient = new JdsClientDummy(log, {});
            jdsClient._setResponseData(null, {
                statusCode: 404
            }, null);

            var reEnrichUtil = new ReEnrichUtil(log, jdsClient, updateConfig);

            var done = false;

            runs(function() {
                reEnrichUtil.retrievePatientList(null, function(error, result) {
                    done = true;
                    expect(error).toBeTruthy();
                    expect(result).toBeFalsy();
                });
            });

            waitsFor(function() {
                return done;
            });
        });
    });
    describe('retrievePatientSyncStatuses', function() {
        it('Normal path: updateTime provided', function() {
            var jdsClient = new JdsClientDummy(log, {});
            jdsClient._setResponseData([null, null], [{
                statusCode: 200
            }, {
                statusCode: 200
            }], [syncStatus1, syncStatus2]);

            var reEnrichUtil = new ReEnrichUtil(log, jdsClient, updateConfig);

            var done = false;

            runs(function() {
                reEnrichUtil.retrievePatientSyncStatuses('20071217151553', ['allergy', 'appointment', 'consult', 'vital'], ['9E7A;3', '9E7A;8'], function(error, result) {
                    done = true;
                    expect(error).toBeFalsy();
                    expect(result).toBeTruthy();
                    expect(result).toEqual(jasmine.objectContaining({
                        '9E7A;3': ['consult', 'allergy']
                    }));
                    expect(result).toEqual(jasmine.objectContaining({
                        '9E7A;8': ['allergy', 'appointment']
                    }));
                });
            });

            waitsFor(function() {
                return done;
            });
        });

        it('Normal path: updateTime omitted', function() {
            var jdsClient = new JdsClientDummy(log, {});
            jdsClient._setResponseData([null], [{
                statusCode: 200
            }], [simpleSyncStatus1]);

            var reEnrichUtil = new ReEnrichUtil(log, jdsClient, updateConfig);

            var done = false;

            runs(function() {
                reEnrichUtil.retrievePatientSyncStatuses(null, ['allergy', 'appointment', 'consult', 'vital'], ['9E7A;3'], function(error, result) {
                    done = true;
                    expect(error).toBeFalsy();
                    expect(result).toBeTruthy();
                    expect(result).toEqual(jasmine.objectContaining({
                        '9E7A;3': ['allergy', 'appointment', 'consult', 'vital']
                    }));
                });
            });

            waitsFor(function() {
                return done;
            });
        });

        it('Error path: Error from JDS', function() {
            var jdsClient = new JdsClientDummy(log, {});
            jdsClient._setResponseData([{
                error: 'ERROR!'
            }], [{
                statusCode: 500
            }], null);

            var reEnrichUtil = new ReEnrichUtil(log, jdsClient, updateConfig);

            var done = false;

            runs(function() {
                reEnrichUtil.retrievePatientSyncStatuses('20071217151553', ['allergy', 'appointment', 'consult', 'vital'], ['9E7A;3'], function(error, result) {
                    done = true;
                    expect(error).toBeTruthy();
                    expect(result).toBeFalsy();
                });
            });

            waitsFor(function() {
                return done;
            });
        });

        it('Error path: Unexpected response from JDS', function() {
            var jdsClient = new JdsClientDummy(log, {});
            jdsClient._setResponseData([null], [{
                statusCode: 404
            }], null);

            var reEnrichUtil = new ReEnrichUtil(log, jdsClient, updateConfig);

            var done = false;

            runs(function() {
                reEnrichUtil.retrievePatientSyncStatuses('20071217151553', ['allergy', 'appointment', 'consult', 'vital'], ['9E7A;3'], function(error, result) {
                    done = true;
                    expect(error).toBeTruthy();
                    expect(result).toBeFalsy();
                });
            });

            waitsFor(function() {
                return done;
            });
        });
    });

    describe('getDomainsToBeResynced', function() {
        it('Normal path', function() {
            var reEnrichUtil = new ReEnrichUtil(log, null, {});

            var resyncDomains = reEnrichUtil.getDomainsToBeResynced(syncStatus1, ['allergy', 'appointment', 'consult', 'vital']);
            expect(resyncDomains).toBeTruthy();
            expect(resyncDomains).toContain('allergy');
            expect(resyncDomains).toContain('consult');
        });
    });

    describe('getRecordsAndCreateJobs', function() {
        it('Normal path: updateTime provided', function() {
            var jdsClient = new JdsClientDummy(log, {});
            jdsClient._setResponseData([null, null, null], [{
                statusCode: 200
            }, {
                statusCode: 200
            },{
                statusCode: 200
            }], [allergyDomainData1, allergyDomainData2, consultDomainData1]);

            var reEnrichUtil = new ReEnrichUtil(log, jdsClient, updateConfig);

            var jobsSentToBeanstalkByPid = [];
            spyOn(reEnrichUtil, 'writeJobsToBeanstalk').andCallFake(function(jobs, callback){
                jobsSentToBeanstalkByPid.push(jobs);
                return callback(null, jobs.length);
            });

            var pidsToResyncDomains = {
                '9E7A;3': ['allergy'],
                '9E7A;8': ['allergy', 'consult']
            };
            reEnrichUtil.getRecordsAndCreateJobs(pidsToResyncDomains, 20071217151354, function(error) {
                expect(error).toBeFalsy();
                var jobsSentToBeanstalk = _.flatten(jobsSentToBeanstalkByPid);
                expect(jobsSentToBeanstalk.length).toEqual(3);
                expect(jobsSentToBeanstalk).toContain(jasmine.objectContaining({
                    'type': 'record-update',
                    'timestamp': jasmine.any(String),
                    'patientIdentifier': {
                        'type': 'pid',
                        'value': '2939;19'
                    },
                    'dataDomain': 'allergy',
                    'record': {
                        'data': 'someData',
                        'pid': '2939;19',
                        'uid': 'urn:va:allergy:2939:19:106',
                        'stampTime': 20061217151354
                    },
                    'jobId': jasmine.any(String)
                }));
                expect(jobsSentToBeanstalk).not.toContain(jasmine.objectContaining({
                    'type': 'record-update',
                    'timestamp': jasmine.any(String),
                    'patientIdentifier': {
                        'type': 'pid',
                        'value': '9E7A;3'
                    },
                    'dataDomain': 'allergy',
                    'record': {
                        'data': 'someData',
                        'pid': '9E7A;3',
                        'stampTime': 20160303154108,
                        'uid': 'urn:va:allergy:9E7A:3:751'
                    },
                    'jobId': jasmine.any(String)
                }));
            });
        });

        it('Normal path: updateTime omitted', function() {
            var jdsClient = new JdsClientDummy(log, {});
            jdsClient._setResponseData([null, null, null], [{
                statusCode: 200
            }, {
                statusCode: 200
            },{
                statusCode: 200
            }], [allergyDomainData1, allergyDomainData2, consultDomainData1]);

            var reEnrichUtil = new ReEnrichUtil(log, jdsClient, updateConfig);

            var pidsToResyncDomains = {
                '9E7A;3': ['allergy'],
                '9E7A;8': ['allergy', 'consult']
            };

            var jobsSentToBeanstalkByPid = [];
            spyOn(reEnrichUtil, 'writeJobsToBeanstalk').andCallFake(function(jobs, callback){
                jobsSentToBeanstalkByPid.push(jobs);
                return callback(null, jobs.length);
            });

            reEnrichUtil.getRecordsAndCreateJobs(pidsToResyncDomains, null, function(error) {
                expect(error).toBeFalsy();
                var jobsSentToBeanstalk = _.flatten(jobsSentToBeanstalkByPid);
                expect(jobsSentToBeanstalk.length).toEqual(4);
                expect(jobsSentToBeanstalk).toContain(jasmine.objectContaining({
                    'type': 'record-update',
                    'timestamp': jasmine.any(String),
                    'patientIdentifier': {
                        'type': 'pid',
                        'value': '2939;19'
                    },
                    'dataDomain': 'allergy',
                    'record': {
                        'data': 'someData',
                        'pid': '2939;19',
                        'uid': 'urn:va:allergy:2939:19:106',
                        'stampTime': 20061217151354
                    },
                    'jobId': jasmine.any(String)
                }));
                expect(jobsSentToBeanstalk).toContain(jasmine.objectContaining({
                    'type': 'record-update',
                    'timestamp': jasmine.any(String),
                    'patientIdentifier': {
                        'type': 'pid',
                        'value': '9E7A;3'
                    },
                    'dataDomain': 'allergy',
                    'record': {
                        'data': 'someData',
                        'pid': '9E7A;3',
                        'stampTime': 20160303154108,
                        'uid': 'urn:va:allergy:9E7A:3:751'
                    },
                    'jobId': jasmine.any(String)
                }));
            });
        });

        it('Error path: error returned by writeJobsToBeanstalk', function() {
            var jdsClient = new JdsClientDummy(log, {});
            jdsClient._setResponseData([null, null, null], [{
                statusCode: 200
            }, {
                statusCode: 200
            },{
                statusCode: 200
            }], [allergyDomainData1, allergyDomainData2, consultDomainData1]);

            var reEnrichUtil = new ReEnrichUtil(log, jdsClient, updateConfig);

            var pidsToResyncDomains = {
                '9E7A;3': ['allergy'],
                '9E7A;8': ['allergy', 'consult']
            };

            var jobsSentToBeanstalkByPid = [];
            spyOn(reEnrichUtil, 'writeJobsToBeanstalk').andCallFake(function(jobs, callback){
                jobsSentToBeanstalkByPid.push(_.first(jobs));
                return callback('Beanstalk error!', 1);
            });

            reEnrichUtil.getRecordsAndCreateJobs(pidsToResyncDomains, null, function(error) {
                expect(error).toBeTruthy();
                var jobsSentToBeanstalk = _.flatten(jobsSentToBeanstalkByPid);
                expect(jobsSentToBeanstalk.length).toEqual(1);
            });
        });

        it('Error path: error from JDS', function() {
            var jdsClient = new JdsClientDummy(log, {});
            jdsClient._setResponseData([null, {
                error: 'ERROR!'
            }, null], [{
                statusCode: 200
            }, null, {
                statusCode: 200
            }], [allergyDomainData1, null, consultDomainData1]);

            var reEnrichUtil = new ReEnrichUtil(log, jdsClient, updateConfig);

            var pidsToResyncDomains = {
                '9E7A;3': ['allergy'],
                '9E7A;8': ['allergy', 'consult']
            };

            spyOn(reEnrichUtil, 'writeJobsToBeanstalk').andCallFake(function(jobs, callback){
                return callback(null, jobs.length);
            });

            reEnrichUtil.getRecordsAndCreateJobs(pidsToResyncDomains, 20071217151354, function(error) {
                expect(error).toBeTruthy();
            });
        });

        it('Error path: No response from JDS', function() {
            var jdsClient = new JdsClientDummy(log, {});
            jdsClient._setResponseData([null, null, null], [{
                statusCode: 200
            }, null, {
                statusCode: 200
            }], [allergyDomainData1, null, consultDomainData1]);

            var reEnrichUtil = new ReEnrichUtil(log, jdsClient, updateConfig);

            var pidsToResyncDomains = {
                '9E7A;3': ['allergy'],
                '9E7A;8': ['allergy', 'consult']
            };

            spyOn(reEnrichUtil, 'writeJobsToBeanstalk').andCallFake(function(jobs, callback){
                return callback(null, jobs.length);
            });

            reEnrichUtil.getRecordsAndCreateJobs(pidsToResyncDomains, 20071217151354, function(error) {
                expect(error).toBeTruthy();
            });
        });

        it('Error path: Unexpected statusCode from JDS', function() {
            var jdsClient = new JdsClientDummy(log, {});
            jdsClient._setResponseData([null, null, null], [{
                statusCode: 200
            }, {
                statusCode: 404
            }, {
                statusCode: 200
            }], [allergyDomainData1, null, consultDomainData1]);

            var reEnrichUtil = new ReEnrichUtil(log, jdsClient, updateConfig);

            var pidsToResyncDomains = {
                '9E7A;3': ['allergy'],
                '9E7A;8': ['allergy', 'consult']
            };

            spyOn(reEnrichUtil, 'writeJobsToBeanstalk').andCallFake(function(jobs, callback){
                return callback(null, jobs.length);
            });

            reEnrichUtil.getRecordsAndCreateJobs(pidsToResyncDomains, 20071217151354, function(error) {
                expect(error).toBeTruthy();
            });
        });
    });
});