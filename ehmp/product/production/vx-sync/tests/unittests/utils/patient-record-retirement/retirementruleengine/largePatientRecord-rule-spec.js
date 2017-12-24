/*global describe, it, expect, runs, waitsFor */
'use strict';
require('../../../../../env-setup');
var RetirementRulesEngine = require(global.VX_RETIREMENTRULES + '/rules-engine');
var nock = require('nock');
var _ = require('underscore');
var moment = require('moment');

var log = require(global.VX_DUMMIES + 'dummy-logger');

// var logUtil = require(global.VX_UTILS + 'log');
// log = logUtil._createLogger({
//     name: 'test',
//     level: 'debug',
//     child: logUtil._createLogger
// });

var config = {
    'recordRetirement': {
        'rules': {
            'largePatientRecord': {
                'patientTotalSizeLimit': 200,
                'avgSizePerEvent': 100
            }
        },
        'lastAccessed': 10
    },
    'syncRequestApi': {
        'protocol': 'http',
        'host': 'IP      ',
        'port': 'PORT',
        'timeout': 300000
    },
    'vistaSites': {
        'SITE': {
            'name': 'KODAK'
        },
        'SITE': {
            'name': 'PANORAMA'
        }
    }
};
var environment = {
    metrics: log
};

var vprDateFormat = 'YYYYMMDDHHmmss';
describe('large-patient-record-rule', function() {

    beforeEach(function() {
        nock.cleanAll();
        nock.disableNetConnect();
        nock('http://IP           ')
            .get('/sync/status?pid=SITE;10&docStatus=true')
            .reply(200, JSON.stringify({
                'jpid': '215c2ab2-cfe2-4702-9395-949e32f6d3e4',
                'identifierDocSizes': {
                    'totalSize': 10,
                    'SITE;10': 'NO_DOCUMENTS'
                },
                'syncStatus': {
                    'completedStamp': {
                        'sourceMetaStamp': {
                            'SITE': {
                                'domainMetaStamp': {
                                    'allergy': {
                                        'domain': 'allergy',
                                        'eventCount': 3
                                    }
                                }
                            }
                        }
                    }
                }
            }));
        nock('http://IP           ')
            .get('/sync/status?icn=10108V420871&docStatus=true')
            .reply(200, JSON.stringify({
                'jpid': '215c2ab2-cfe2-4702-9395-949e32f6d3e4',
                'identifierDocSizes': {
                    'totalSize': 100,
                    'SITE;3': 'NO_DOCUMENTS'
                },
                'syncStatus': {
                    'completedStamp': {
                        'sourceMetaStamp': {
                            'SITE': {
                                'domainMetaStamp': {
                                    'allergy': {
                                        'domain': 'allergy',
                                        'eventCount': 3
                                    }
                                }
                            }
                        }
                    }
                }
            }));

        nock('http://IP           ')
            .get('/sync/status?icn=10110V004877&docStatus=true')
            .reply(200, JSON.stringify({
                'jpid': '215c2ab2-cfe2-4702-9395-949e32f6d3e4',
                'identifierDocSizes': {
                    'totalSize': 200,
                    'SITE:8': 'NO_DOCUMENTS'
                },
                'syncStatus': {
                    'completedStamp': {
                        'sourceMetaStamp': {
                            'SITE': {
                                'domainMetaStamp': {
                                    'allergy': {
                                        'domain': 'allergy',
                                        'eventCount': 3
                                    }
                                }
                            }
                        }
                    }
                }
            }));

        nock('http://IP           ')
            .get('/sync/status?pid=AAAA;1&docStatus=true')
            .reply(404);

        nock('http://IP           ')
            .get('/sync/status?pid=BBBB;1&docStatus=true')
            .reply(200, JSON.stringify({
                'jpid': '215c2ab2-cfe2-4702-9395-949e32f6d3e4',
                'identifierDocSizes': {
                    'totalSize': 200,
                    'BBBB:1': 'NO_DOCUMENTS'
                },
                'syncStatus': {
                    'inProgress': {
                        'sourceMetaStamp': {
                            'BBBB': {
                                'domainMetaStamp': {
                                    'allergy': {
                                        'domain': 'allergy',
                                        'eventCount': 1
                                    }
                                }
                            }
                        }
                    }
                }
            }));

        nock('http://IP           ')
            .get('/sync/status?pid=CCCC;1&docStatus=true')
            .reply(200, JSON.stringify({
                'jpid': '215c2ab2-cfe2-4702-9395-949e32f6d3e4',
                'identifierDocSizes': {
                    'totalSize': 0,
                    'CCCC:1': 'NO_DOCUMENTS'
                },
                'syncStatus': {
                    'completedStamp': {
                        'sourceMetaStamp': {
                            'CCCC': {
                                'domainMetaStamp': {
                                    'allergy': {
                                        'domain': 'allergy',
                                        'eventCount': 1
                                    }
                                }
                            }
                        }
                    }
                }
            }));
    });
    it('no patients', function() {
        var done = false;
        var items = [];
        var engine = new RetirementRulesEngine(log, config, environment);
        runs(function() {
            engine.processRetirementRules(items, function(err, result) {
                expect(result.length).toEqual(0);
                done = true;
            });
        });
        waitsFor(function() {
            return done;
        });
    });
    it('all small patients', function() {
        var done = false;
        var date = moment().subtract(20, 'days').format('YYYYMMDDHHmmss');
        var items = [{
            'jpid': '215c2ab2-cfe2-4702-9395-949e32f6d3e4',
            'lastAccessTime': date,
            'patientIdentifiers': ['SITE;10']
        }, {
            'jpid': '516c44cc-a87a-4822-b2eb-979e8324505e',
            'lastAccessTime': date,
            'patientIdentifiers': ['10108V420871', 'SITE;3', 'SITE;3', 'DOD;0000000003', 'HDR;10108V420871', 'VLER;10108V420871']
        }, {
            'jpid': '5888e969-110c-4d97-8f56-10652ffee070',
            'lastAccessTime': date,
            'patientIdentifiers': ['10110V004877', 'SITE;8', 'SITE;8', 'DOD;0000000008', 'HDR;10110V004877', 'VLER;10110V004877']
        }];
        var engine = new RetirementRulesEngine(log, config, environment);
        runs(function() {
            engine.processRetirementRules(items, function(err, result) {
                expect(result.length).toEqual(0);
                done = true;
            });
        });
        waitsFor(function() {
            return done;
        });
    });

    it('mix of large and small patients', function() {
        config = {
            'recordRetirement': {
                'rules': {
                    'largePatientRecord': {
                        'largePatientLastAccessed': 10,
                        'patientTotalSizeLimit': 100,
                        'avgSizePerEvent': 0
                    }
                }
            },
            'syncRequestApi': {
                'protocol': 'http',
                'host': 'IP      ',
                'port': 'PORT',
                'timeout': 300000
            },
            'vistaSites': {
                'SITE': {
                    'name': 'KODAK'
                },
                'SITE': {
                    'name': 'PANORAMA'
                }
            }
        };
        var done = false;
        var date = moment().subtract(20, 'days').format('YYYYMMDDHHmmss');
        var items = [{
            'jpid': '215c2ab2-cfe2-4702-9395-949e32f6d3e4',
            'lastAccessTime': date,
            'patientIdentifiers': ['SITE;10']
        }, {
            'jpid': '516c44cc-a87a-4822-b2eb-979e8324505e',
            'lastAccessTime': date,
            'patientIdentifiers': ['10108V420871', 'SITE;3', 'SITE;3', 'DOD;0000000003', 'HDR;10108V420871', 'VLER;10108V420871']
        }, {
            'jpid': '5888e969-110c-4d97-8f56-10652ffee070',
            'lastAccessTime': date,
            'patientIdentifiers': ['10110V004877', 'SITE;8', 'SITE;8', 'DOD;0000000008', 'HDR;10110V004877', 'VLER;10110V004877']
        }];


        var engine = new RetirementRulesEngine(log, config, environment);
        runs(function() {
            engine.processRetirementRules(items, function(err, result) {
                expect(result.length).toEqual(1);
                done = true;
            });
        });
        waitsFor(function() {
            return done;
        });
    });

    it('patient with no documents', function(){
        var done = false;
        var date = moment().subtract(20, 'days').format('YYYYMMDDHHmmss');
        var items = [{
            'jpid': '215c2ab2-cfe2-4702-9395-949e32f6d3e4',
            'lastAccessTime': date,
            'patientIdentifiers': ['CCCC;1']
        }];
        var engine = new RetirementRulesEngine(log, config, environment);
        runs(function() {
            engine.processRetirementRules(items, function(err, result) {
                expect(result.length).toEqual(1);
                done = true;
            });
        });
        waitsFor(function() {
            return done;
        });
    });

    it('Normal path: sync in progress', function() {
        var done = false;
        var date = moment().subtract(20, 'days').format('YYYYMMDDHHmmss');
        var items = [{
            'jpid': 'aaaaa-bbbbb-ccccc',
            'lastAccessTime': date,
            'patientIdentifiers': ['BBBB;1']
        }];
        var engine = new RetirementRulesEngine(log, config, environment);
        runs(function() {
            engine.processRetirementRules(items, function(err, result) {
                expect(err).toBeFalsy();
                expect(result).toBeTruthy();
                expect(_.isEmpty(result)).toBe(true);
                done = true;
            });
        });
        waitsFor(function() {
            return done;
        });
    });

    it('Error path: error returned by sync status endpoint', function() {
        var done = false;
        var date = moment().subtract(20, 'days').format('YYYYMMDDHHmmss');
        var items = [{
            'jpid': 'aaaaa-bbbbb-ccccc',
            'lastAccessTime': date,
            'patientIdentifiers': ['AAAA;1']
        }];
        var engine = new RetirementRulesEngine(log, config, environment);
        runs(function() {
            engine.processRetirementRules(items, function(err, result) {
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
                done = true;
            });
        });
        waitsFor(function() {
            return done;
        });
    });
});