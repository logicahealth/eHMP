'use strict';

require('../../../env-setup');

var resyncUtil = require(global.VX_ROOT + 'record-update/utils/vista-site-data-resync-util');
var log = require(global.VX_DUMMIES + '/dummy-logger');
var JdsClientDummy = require(global.VX_DUMMIES + 'jds-client-dummy');
var VistaClientDummy = require(global.VX_DUMMIES + 'vista-client-dummy');
var jobUtil = require(global.VX_UTILS + 'job-utils');

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

var patientList9E7A = {
    'data': {
        'items': ['9E7A;3', '9E7A;123', '9E7A;234']
    }
};

var patientListXABY = {
    'data': {
        'items': ['XABY;4', 'XABY;345', 'XABY;456']
    }
};

var allergyDomainData1 = [{
    'data': 'someData',
    'pid': '2939;19',
    'stampTime': 20061217151354,
    'uid': 'urn:va:allergy:2939:19:106'
}, {
    'data': 'someData',
    'pid': '9E7A;3',
    'stampTime': 20160303154108,
    'uid': 'urn:va:allergy:9E7A:3:751'
}];

var allergyDomainData2 = [{
    'data': 'someData',
    'pid': '9E7A;8',
    'uid': 'urn:va:allergy:9E7A:8:751',
    'stampTime': 20061217151354,
}];

var consultDomainData1 = [{
    'data': 'someData',
    'pid': '9E7A;8',
    'uid': 'urn:va:consult:9E7A:8:751',
    'stampTime': 20061217151354
}];

describe('vista resync utility', function() {
    describe('retrievePatientList', function() {
        it('Normal path', function() {
            var jdsClient = new JdsClientDummy(log, {});
            jdsClient._setResponseData(null, [{
                statusCode: 200
            }, {
                statusCode: 200
            }], [patientList9E7A, patientListXABY]);

            var done = false;

            runs(function() {
                resyncUtil.retrievePatientList(log, jdsClient, ['9E7A', 'XABY'], null, function(error, result) {
                    done = true;
                    expect(error).toBeFalsy();
                    expect(result).toBeTruthy();
                    expect(result).toContain('9E7A;3');
                    expect(result).toContain('9E7A;123');
                    expect(result).toContain('9E7A;234');
                    expect(result).toContain('XABY;4');
                    expect(result).toContain('XABY;345');
                    expect(result).toContain('XABY;456');
                });
            });

            waitsFor(function() {
                return done;
            });
        });
        it('Error path: No pids found', function() {
            var jdsClient = new JdsClientDummy(log, {});
            jdsClient._setResponseData(null, [{
                statusCode: 200
            }, {
                statusCode: 200
            }], [{
                data: {
                    items: []
                }
            }, {
                data: {
                    items: []
                }
            }]);

            var done = false;

            runs(function() {
                resyncUtil.retrievePatientList(log, jdsClient, ['9E7A', 'XABY'], null, function(error, result) {
                    done = true;
                    expect(error).toBeTruthy();
                    expect(result).toBeFalsy();
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

            var done = false;

            runs(function() {
                resyncUtil.retrievePatientList(log, jdsClient, ['9E7A'], null, function(error, result) {
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

            var done = false;

            runs(function() {
                resyncUtil.retrievePatientList(log, jdsClient, ['9E7A'], null, function(error, result) {
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

            var done = false;

            runs(function() {
                resyncUtil.retrievePatientSyncStatuses(log, jdsClient, '20071217151553', ['allergy', 'appointment', 'consult', 'vital'], ['9E7A;3', '9E7A;8'], function(error, result) {
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

            var done = false;

            runs(function() {
                resyncUtil.retrievePatientSyncStatuses(log, jdsClient, null, ['allergy', 'appointment', 'consult', 'vital'], ['9E7A;3'], function(error, result) {
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

            var done = false;

            runs(function() {
                resyncUtil.retrievePatientSyncStatuses(log, jdsClient, '20071217151553', ['allergy', 'appointment', 'consult', 'vital'], ['9E7A;3'], function(error, result) {
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

            var done = false;

            runs(function() {
                resyncUtil.retrievePatientSyncStatuses(log, jdsClient, '20071217151553', ['allergy', 'appointment', 'consult', 'vital'], ['9E7A;3'], function(error, result) {
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
            var resyncDomains = resyncUtil.getDomainsToBeResynced(log, syncStatus1, ['allergy', 'appointment', 'consult', 'vital']);
            expect(resyncDomains).toBeTruthy();
            expect(resyncDomains).toContain('allergy');
            expect(resyncDomains).toContain('consult');
        });
    });

    describe('getRecordsAndCreateJobs', function() {
        it('Normal path: updateTime provided', function() {
            var vistaClient = {
                getPatientDataByDomain: function(vistaId, dfn, domain, callback) {
                    if (domain === 'allergy') {
                        if (dfn === '3') {
                            callback(null, allergyDomainData1);
                        } else {
                            callback(null, allergyDomainData2);
                        }
                    } else if (domain === 'consult' && dfn === '8') {
                        callback(null, consultDomainData1);
                    }
                }
            };

            var pidsToResyncDomains = {
                '9E7A;3': ['allergy'],
                '9E7A;8': ['allergy', 'consult']
            };
            resyncUtil.getRecordsAndCreateJobs(log, vistaClient, pidsToResyncDomains, 20071217151354, function(error, result) {
                expect(error).toBeFalsy();
                expect(result).toBeTruthy();
                expect(result.length).toEqual(3);
                expect(result).toContain(jasmine.objectContaining({
                    'type': 'record-update',
                    'timestamp': jasmine.any(String),
                    'patientIdentifier': {
                        'type': 'pid',
                        'value': '9E7A;3'
                    },
                    'dataDomain': 'allergy',
                    'record': {
                        'data': 'someData',
                        'pid': '2939;19',
                        'uid': 'urn:va:allergy:2939:19:106',
                        'stampTime': 20061217151354
                    },
                    'metaStamp': {
                        'stampTime': jasmine.any(String),
                        'sourceMetaStamp': {
                            2939: {
                                'pid': '2939;19',
                                'localId': '19',
                                'stampTime': jasmine.any(String),
                                'domainMetaStamp': {
                                    'allergy': {
                                        'domain': 'allergy',
                                        'stampTime': jasmine.any(String),
                                        'eventMetaStamp': {
                                            'urn:va:allergy:2939:19:106': {
                                                'stampTime': 20061217151354
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        'icn': null
                    },
                    'jobId': jasmine.any(String)
                }));
                expect(result).not.toContain(jasmine.objectContaining({
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
                    'metaStamp': {
                        'stampTime': jasmine.any(String),
                        'sourceMetaStamp': {
                            '9E7A': {
                                'pid': '9E7A;3',
                                'localId': '3',
                                'stampTime': jasmine.any(String),
                                'domainMetaStamp': {
                                    'allergy': {
                                        'domain': 'allergy',
                                        'stampTime': jasmine.any(String),
                                        'eventMetaStamp': {
                                            'urn:va:allergy:9E7A:3:751': {
                                                'stampTime': 20160303154108
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        'icn': null
                    },
                    'jobId': jasmine.any(String)
                }));
            });
        });

        it('Normal path: updateTime omitted', function() {
            var vistaClient = {
                getPatientDataByDomain: function(vistaId, dfn, domain, callback) {
                    if (domain === 'allergy') {
                        if (dfn === '3') {
                            callback(null, allergyDomainData1);
                        } else {
                            callback(null, allergyDomainData2);
                        }
                    } else if (domain === 'consult' && dfn === '8') {
                        callback(null, consultDomainData1);
                    }
                }
            };

            var pidsToResyncDomains = {
                '9E7A;3': ['allergy'],
                '9E7A;8': ['allergy', 'consult']
            };
            resyncUtil.getRecordsAndCreateJobs(log, vistaClient, pidsToResyncDomains, null, function(error, result) {
                expect(error).toBeFalsy();
                expect(result).toBeTruthy();
                expect(result.length).toEqual(4);
                expect(result).toContain(jasmine.objectContaining({
                    'type': 'record-update',
                    'timestamp': jasmine.any(String),
                    'patientIdentifier': {
                        'type': 'pid',
                        'value': '9E7A;3'
                    },
                    'dataDomain': 'allergy',
                    'record': {
                        'data': 'someData',
                        'pid': '2939;19',
                        'uid': 'urn:va:allergy:2939:19:106',
                        'stampTime': 20061217151354
                    },
                    'jobId': jasmine.any(String),
                    'metaStamp': {
                        stampTime: jasmine.any(String),
                        sourceMetaStamp: {
                            2939: {
                                pid: '2939;19',
                                localId: '19',
                                stampTime: jasmine.any(String),
                                domainMetaStamp: {
                                    allergy: {
                                        domain: 'allergy',
                                        stampTime: jasmine.any(String),
                                        eventMetaStamp: {
                                            'urn:va:allergy:2939:19:106': {
                                                stampTime: 20061217151354
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        icn: null
                    }
                }));
                expect(result).toContain(jasmine.objectContaining({
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
                    'metaStamp': {
                        'stampTime': jasmine.any(String),
                        'sourceMetaStamp': {
                            '9E7A': {
                                'pid': '9E7A;3',
                                'localId': '3',
                                'stampTime': jasmine.any(String),
                                'domainMetaStamp': {
                                    'allergy': {
                                        'domain': 'allergy',
                                        'stampTime': jasmine.any(String),
                                        'eventMetaStamp': {
                                            'urn:va:allergy:9E7A:3:751': {
                                                'stampTime': 20160303154108
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        'icn': null
                    },
                    'jobId': jasmine.any(String)
                }));
            });
        });

        it('Error path: error from VistA', function() {
            var vistaClient = {
                getPatientDataByDomain: function(vistaId, dfn, domain, callback) {
                    callback('ERROR!');
                }
            };

            var pidsToResyncDomains = {
                '9E7A;3': ['allergy'],
                '9E7A;8': ['allergy', 'consult']
            };
            resyncUtil.getRecordsAndCreateJobs(log, vistaClient, pidsToResyncDomains, 20071217151354, function(error, result) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();
            });
        });

    });
});