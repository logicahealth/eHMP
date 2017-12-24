'use strict';

require('../../../env-setup');
var SyncRulesEngine = require(global.VX_SYNCRULES + '/rules-engine');
//var rule = require(global.VX_SYNCRULES + '/operational-data-sync-rule');
var JdsClientDummy = require(global.VX_DUMMIES + 'jds-client-dummy');

var log = require(global.VX_DUMMIES + 'dummy-logger');
// log = require('bunyan').createLogger({
//     name: 'operational-sync-endpoint-handler-spec',
//     level: 'debug'
// });


var sampleOpDataStamp = {
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
                            'stored': true
                        },
                        'urn:va:doc-def:SITE:1002': {
                            'stampTime': 20141031094920,
                            'stored': true
                        }
                    }
                },
                'pt-select': {
                    'domain': 'pt-select',
                    'stampTime': 20141031094920,
                    'itemMetaStamp': {
                        'urn:va:pt-select:SITE:3:3': {
                            'stampTime': 20141031094920,
                            'stored': true
                        },
                        'urn:va:pt-select:SITE:1000:1000': {
                            'stampTime': 20141031094920,
                            'stored': true
                        }
                    }
                }
            },
            'syncCompleteAsOf': 20141031094921
        }
    }
};

var sampleOpDataStamp2 = {
    'stampTime': 20141031094920,
    'sourceMetaStamp': {
        'SITE': {
            'stampTime': 20141031094920,
            'domainMetaStamp': {
                'pt-select': {
                    'domain': 'pt-select',
                    'stampTime': 20141031094920,
                    'itemMetaStamp': {
                        'urn:va:pt-select:SITE:3:3': {
                            'stampTime': 20141031094920,
                            'stored': true
                        },
                        'urn:va:pt-select:SITE:1000:1000': {
                            'stampTime': 20141031094920,
                            'stored': true
                        }
                    }
                }
            },
            'syncCompleteAsOf': 20141031094921
        }
    }
};

var sampleOpDataStampSITEpatientIncomplete = {
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
                            'stored': true
                        },
                        'urn:va:doc-def:SITE:1002': {
                            'stampTime': 20141031094920,
                            'stored': true
                        }
                    }
                },
                'pt-select': {
                    'domain': 'pt-select',
                    'stampTime': 20141031094920,
                    'itemMetaStamp': {
                        'urn:va:pt-select:SITE:3:3': {
                            'stampTime': 20141031094920
                        },
                        'urn:va:pt-select:SITE:1000:1000': {
                            'stampTime': 20141031094920,
                            'stored': true
                        }
                    }
                }
            },
            'syncCompleteAsOf': 20141031094921
        }
    }
};

var sampleOpDataStampSITEDifferentPatientIncomplete = {
    'stampTime': 20141031094920,
    'sourceMetaStamp': {
        'SITE': {
            'stampTime': 20141031094920,
            'domainMetaStamp': {
                'pt-select': {
                    'domain': 'pt-select',
                    'stampTime': 20141031094920,
                    'itemMetaStamp': {
                        'urn:va:pt-select:SITE:3:3': {
                            'stampTime': 20141031094920,
                            'stored': true
                        },
                        'urn:va:pt-select:SITE:1000:1000': {
                            'stampTime': 20141031094920
                        }
                    }
                }
            },
            'syncCompleteAsOf': 20141031094921
        }
    }
};

var mockPatientIds = [{
    type: 'icn',
    value: '10108V420871'
}, {
    type: 'pid',
    value: 'SITE;3'
}, {
    type: 'pid',
    value: 'SITE;3'
}, {
    type: 'pid',
    value: 'DOD;00000008'
}, {
    type: 'pid',
    value: 'HDR;10108V420871'
}, {
    type: 'pid',
    value: 'VLER;10108V420871'
}];

var mockPatientIdsNoPrimary = [{
    type: 'icn',
    value: '10108V420871'
}, {
    type: 'pid',
    value: 'HDR;10108V420871'
}];

describe('operational-data-sync-rule', function() {
    it('Error path: JDS returns error', function() {
        var done = false;
        var config = {
            vistaSites: {
                'SITE': {},
                'SITE': {}
            },
            jds: {
                protocol: 'http',
                host: 'IP        ',
                port: PORT
            },
            rules: {
                'operational-data-sync': {}
            },
            'hdr': {
                'operationMode': 'REQ/RES'
            }
        };
        var jdsClientDummy = new JdsClientDummy(log, config);
        jdsClientDummy._setResponseData(['Error', 'Error'], null, null);
        var environment = {
            jds: jdsClientDummy,
            metrics: log
        };
        var engine = new SyncRulesEngine(log, config, environment);
        //engine.rules = [rule];
        runs(function() {
            engine.getSyncPatientIdentifiers(mockPatientIds, [], function(err, result) {
                expect(result.length).toEqual(0);
                done = true;
            });
        });
        waitsFor(function() {
            return done;
        });
    });
    it('Error path: JDS returns no response', function() {
        var done = false;
        var config = {
            vistaSites: {
                'SITE': {},
                'SITE': {}
            },
            jds: {
                protocol: 'http',
                host: 'IP        ',
                port: PORT
            },
            rules: {
                'operational-data-sync': {}
            },
            'hdr': {
                'operationMode': 'REQ/RES'
            }
        };
        var jdsClientDummy = new JdsClientDummy(log, config);
        jdsClientDummy._setResponseData(null, null, null);
        var environment = {
            jds: jdsClientDummy,
            metrics: log
        };

        var engine = new SyncRulesEngine(log, config, environment);
        //engine.rules = [rule];
        runs(function() {
            engine.getSyncPatientIdentifiers(mockPatientIds, [], function(err, result) {
                expect(result.length).toEqual(0);
                done = true;
            });
        });
        waitsFor(function() {
            return done;
        });
    });
    it('Error path: JDS returns no result', function() {
        var done = false;
        var config = {
            vistaSites: {
                'SITE': {},
                'SITE': {}
            },
            jds: {
                protocol: 'http',
                host: 'IP        ',
                port: PORT
            },
            rules: {
                'operational-data-sync': {}
            },
            'hdr': {
                'operationMode': 'REQ/RES'
            }
        };
        var jdsClientDummy = new JdsClientDummy(log, config);
        jdsClientDummy._setResponseData(null, {
            statusCode: 200
        }, null);
        var environment = {
            jds: jdsClientDummy,
            metrics: log
        };

        var engine = new SyncRulesEngine(log, config, environment);
        //engine.rules = [rule];
        runs(function() {
            engine.getSyncPatientIdentifiers(mockPatientIds, [], function(err, result) {
                expect(result.length).toEqual(0);
                done = true;
            });
        });
        waitsFor(function() {
            return done;
        });
    });
    it('Error path: JDS returns wrong status code', function() {
        var done = false;
        var config = {
            vistaSites: {
                'SITE': {},
                'SITE': {}
            },
            jds: {
                protocol: 'http',
                host: 'IP        ',
                port: PORT
            },
            rules: {
                'operational-data-sync': {}
            },
            'hdr': {
                'operationMode': 'REQ/RES'
            }
        };
        var jdsClientDummy = new JdsClientDummy(log, config);
        jdsClientDummy._setResponseData(null, {
            statusCode: 403
        }, {});
        var environment = {
            jds: jdsClientDummy,
            metrics: log
        };

        var engine = new SyncRulesEngine(log, config, environment);
        //engine.rules = [rule];
        runs(function() {
            engine.getSyncPatientIdentifiers(mockPatientIds, [], function(err, result) {
                expect(result.length).toEqual(0);
                done = true;
            });
        });
        waitsFor(function() {
            return done;
        });
    });
    it('Normal path: some primary sites associated with patient have completed OPD sync; allow patient sync with some primary and all secondary sites', function() {
        var done = false;
        var config = {
            vistaSites: {
                'SITE': {},
                'SITE': {}
            },
            jds: {
                protocol: 'http',
                host: 'IP        ',
                port: PORT
            },
            rules: {
                'operational-data-sync': {}
            },
            'hdr': {
                'operationMode': 'REQ/RES'
            }
        };
        var jdsClientDummy = new JdsClientDummy(log, config);
        jdsClientDummy._setResponseData(null, [{
            statusCode: 200
        }, {
            statusCode: 200
        }], [{
            'completedStamp': sampleOpDataStamp
        }, {
            'stampTime': 20150219134300
        }]);
        var environment = {
            jds: jdsClientDummy,
            metrics: log
        };
        var engine = new SyncRulesEngine(log, config, environment);
        //engine.rules = [rule];
        runs(function() {
            engine.getSyncPatientIdentifiers(mockPatientIds, [], function(err, result) {
                expect(result.length).toEqual(5);
                done = true;
            });
        });
        waitsFor(function() {
            return done;
        });
    });
    it('Normal path: all primary sites associated with patient have completed opd sync', function() {
        var done = false;
        var config = {
            vistaSites: {
                'SITE': {},
                'SITE': {}
            },
            jds: {
                protocol: 'http',
                host: 'IP        ',
                port: PORT
            },
            rules: {
                'operational-data-sync': {}
            },
            'hdr': {
                'operationMode': 'REQ/RES'
            }
        };
        var jdsClientDummy = new JdsClientDummy(log, config);
        jdsClientDummy._setResponseData(null, [{
            statusCode: 200
        }, {
            statusCode: 200
        }], [{
            'completedStamp': sampleOpDataStamp
        }, {
            'completedStamp': sampleOpDataStamp2
        }]);
        var environment = {
            jds: jdsClientDummy,
            metrics: log
        };
        var engine = new SyncRulesEngine(log, config, environment);
        //engine.rules = [rule];
        runs(function() {
            engine.getSyncPatientIdentifiers(mockPatientIds, [], function(err, result) {
                expect(result.length).toEqual(6);
                done = true;
            });
        });
        waitsFor(function() {
            return done;
        });
    });
    it('Normal path: no primary sites associated with patient have completed opd sync', function() {
        var done = false;
        var config = {
            vistaSites: {
                'SITE': {},
                'SITE': {}
            },
            jds: {
                protocol: 'http',
                host: 'IP        ',
                port: PORT
            },
            rules: {
                'operational-data-sync': {}
            },
            'hdr': {
                'operationMode': 'REQ/RES'
            }
        };
        var jdsClientDummy = new JdsClientDummy(log, config);
        jdsClientDummy._setResponseData(null, [{
            statusCode: 404
        }, {
            statusCode: 404
        }], [{}, {}]);
        var environment = {
            jds: jdsClientDummy,
            metrics: log
        };
        var engine = new SyncRulesEngine(log, config, environment);
        //engine.rules = [rule];
        runs(function() {
            engine.getSyncPatientIdentifiers(mockPatientIds, [], function(err, result) {
                expect(err).toEqual('NO_OPDATA');
                done = true;
            });
        });
        waitsFor(function() {
            return done;
        });
    });
    it('Normal path: no primary sites associated with patient have completed opd sync', function() {
        var done = false;
        var config = {
            vistaSites: {
                'SITE': {},
                'SITE': {}
            },
            jds: {
                protocol: 'http',
                host: 'IP        ',
                port: PORT
            },
            rules: {
                'operational-data-sync': {}
            },
            'hdr': {
                'operationMode': 'REQ/RES'
            }
        };
        var jdsClientDummy = new JdsClientDummy(log, config);
        jdsClientDummy._setResponseData(null, [{
            statusCode: 404
        }, {
            statusCode: 404
        }], [{}, {}]);
        var environment = {
            jds: jdsClientDummy,
            metrics: log
        };
        var engine = new SyncRulesEngine(log, config, environment);
        runs(function() {
            engine.getSyncPatientIdentifiers(mockPatientIdsNoPrimary, [], function(err, result) {
                expect(result.length).toEqual(2);
                done = true;
            });
        });
        waitsFor(function() {
            return done;
        });
    });
    it('Normal path: primary site complete once, but pt-select for patient is not', function() {
        var done = false;
        var config = {
            vistaSites: {
                'SITE': {},
                'SITE': {}
            },
            jds: {
                protocol: 'http',
                host: 'IP        ',
                port: PORT
            },
            rules: {
                'operational-data-sync': {}
            },
            'hdr': {
                'operationMode': 'REQ/RES'
            }
        };
        var jdsClientDummy = new JdsClientDummy(log, config);
        jdsClientDummy._setResponseData(null, [{
            statusCode: 200
        }, {
            statusCode: 200
        }], [{
            'inProgress': sampleOpDataStampSITEpatientIncomplete
        }, {
            'completedStamp': sampleOpDataStamp2
        }]);
        var environment = {
            jds: jdsClientDummy,
            metrics: log
        };
        var engine = new SyncRulesEngine(log, config, environment);
        //engine.rules = [rule];
        runs(function() {
            engine.getSyncPatientIdentifiers(mockPatientIds, [], function(err, result) {
                expect(result.length).toEqual(5);
                done = true;
            });
        });
        waitsFor(function() {
            return done;
        });
    });
    it('Normal path: primary site complete once, but pt-select for different patient is not', function() {
        var done = false;
        var config = {
            vistaSites: {
                'SITE': {},
                'SITE': {}
            },
            jds: {
                protocol: 'http',
                host: 'IP        ',
                port: PORT
            },
            rules: {
                'operational-data-sync': {}
            },
            'hdr': {
                'operationMode': 'REQ/RES'
            }
        };
        var jdsClientDummy = new JdsClientDummy(log, config);
        jdsClientDummy._setResponseData(null, [{
            statusCode: 200
        }, {
            statusCode: 200
        }], [{
            'completedStamp': sampleOpDataStamp
        }, {
            'inProgress': sampleOpDataStampSITEDifferentPatientIncomplete
        }]);
        var environment = {
            jds: jdsClientDummy,
            metrics: log
        };
        var engine = new SyncRulesEngine(log, config, environment);
        //engine.rules = [rule];
        runs(function() {
            engine.getSyncPatientIdentifiers(mockPatientIds, [], function(err, result) {
                expect(result.length).toEqual(6);
                done = true;
            });
        });
        waitsFor(function() {
            return done;
        });
    });
});