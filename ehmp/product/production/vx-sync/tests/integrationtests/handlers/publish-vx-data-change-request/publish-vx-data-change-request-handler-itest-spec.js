'use strict';

require('../../../../env-setup');

var logger = require(global.VX_DUMMIES + 'dummy-logger');
// logger = require('bunyan').createLogger({
//     name: 'publish-vx-data-change-request-handler-itest-spec',
//     src: true,
//     level: 'debug'
// });
var vx_sync_ip = require(global.VX_INTTESTS + 'test-config');
var handler = require(global.VX_HANDLERS + 'publish-vx-data-change-request/publish-vx-data-change-request-handler');
var testHandler = require(global.VX_INTTESTS + 'framework/handler-test-framework').testHandler;
var tubename = 'vx-sync-test';

var job = {
    type: 'publish-data-change-event',
    patientIdentifier: { type: 'pid', value: 'DOD;4325678' },
    jpid: '39b4d293-90dc-442c-aa9c-4c58191340ea',
    rootJobId: '1',
    dataDomain: 'document',
    record: {
        referenceDateTime: '20100622112945',
        codes: [ {} ],
        localTitle: 'Progress Note',
        documentTypeName: 'Progress Note',
        status: 'completed',
        statusName: 'completed',
        facilityName: 'DOD',
        facilityCode: 'DOD',
        uid: 'urn:va:document:DOD:4325678:1000004203',
        pid: 'DOD;4325678',
        text: [ {} ],
        dodComplexNoteUri: 'http://127.0.0.1:8089/documents?dir=444f443b34333235363738/1000004203&file=da39a3ee5e6b4b0d3255bfef95601890afd80709.html',
        stampTime: '20150506125559',
        isInterdisciplinary: 'false',
        summary: 'Progress Note',
        kind: 'Progress Note',
        statusDisplayName: 'Completed',
        clinicians: []
    }
};

var host = vx_sync_ip;
var port = 5000;

describe('publish-vx-data-change-request-handler.js', function() {

    it('no publish tubes', function() {
        var emptyTubes = [];
        testPublishTubes(emptyTubes, emptyTubes);
    });

    it('publish to single tube', function() {
        var singleTubes = ['test-published-change-event'];
        testPublishTubes(singleTubes, singleTubes);

    });

    it('publish multiple tubes', function() {
        var multiTubes = ['test-published-change-event-1', 'test-published-change-event-2', 'test-published-change-event-3'];
        testPublishTubes(multiTubes, multiTubes);
    });

    it('publish to single tube with empty event filter: One job published', function() {
        var singleTubes = {
            'test-published-change-event' : {
                eventFilter: {
                    generic: {
                    }
                }
            }
        };
        testPublishTubes(singleTubes, ['test-published-change-event']);
    });

    it('publish to single tube with event site filter: No job published', function() {
        var singleTubes = {
            'test-published-change-event' : {
                eventFilter: {
                    generic: {
                        sites: [
                            'C877'
                        ]
                    }
                }
            }
        };
        testPublishTubes(singleTubes, []);
    });

    it('publish to single tube with event site filter: One job published', function() {
        var singleTubes = {
            'test-published-change-event' : {
                eventFilter: {
                    generic: {
                        sites: [
                            'DOD'
                        ]
                    }
                }
            }
        };
        testPublishTubes(singleTubes, ['test-published-change-event']);
    });

    it('publish to single tube with event domain filter: No job published', function() {
        var singleTubes = {
            'test-published-change-event' : {
                eventFilter: {
                    generic: {
                        domains: [
                            'image'
                        ]
                    }
                }
            }
        };
        testPublishTubes(singleTubes, []);
    });

    it('publish to single tube with event domain filter: One job published', function() {
        var singleTubes = {
            'test-published-change-event' : {
                eventFilter: {
                    generic: {
                        domains: [
                            'document'
                        ]
                    }
                }
            }
        };
        testPublishTubes(singleTubes, ['test-published-change-event']);
    });

    it('publish to single tube with customized filter: One job published', function() {
        var singleTubes = {
            'test-published-change-event' : {
                eventFilter: {
                    customized: 'filter/dummy-filter'
                }
            }
        };
        testPublishTubes(singleTubes, ['test-published-change-event']);
    });


    it('publish to single tube with invalid customized filter: No job published', function() {
        var singleTubes = {
            'test-published-change-event' : {
                eventFilter: {
                    customized: 'filter/xx/yy/zz/foo-non-exist'
                }
            }
        };
        testPublishTubes(singleTubes, []);
    });

    it('publish to multiple tube with empty event filter: All jobs are published', function() {
        var multiTubes = {
            'test-published-change-event-1' : {
                eventFilter: {
                    generic: {
                    }
                }
            },
            'test-published-change-event-2' : {
                eventFilter: {
                    generic: {
                    }
                }
            },
            'test-published-change-event-3' : {
                eventFilter: {
                    generic: {
                    }
                }
            }
        };
        testPublishTubes(multiTubes, ['test-published-change-event-1', 'test-published-change-event-2', 'test-published-change-event-3']);
    });

    it('publish to multiple tube with selective site filter:  Only Filtered Jobs are published', function() {
        var multiTubes = {
            'test-published-change-event-1' : {
                eventFilter: {
                    generic: {
                        sites: ['DOD']
                    }
                }
            },
            'test-published-change-event-2' : {
                eventFilter: {
                    generic: {
                        sites: ['C877']
                    }
                }
            },
            'test-published-change-event-3' : {
                eventFilter: {
                    generic: {
                        sites: ['9E7A']
                    }
                }
            }
        };
        testPublishTubes(multiTubes, ['test-published-change-event-1']);
    });

    it('publish to multiple tube with selective domain filter:  Only Filtered Jobs are published', function() {
        var multiTubes = {
            'test-published-change-event-1' : {
                eventFilter: {
                    generic: {
                        domains: ['image']
                    }
                }
            },
            'test-published-change-event-2' : {
                eventFilter: {
                    generic: {
                        domains: ['document']
                    }
                }
            },
            'test-published-change-event-3' : {
                eventFilter: {
                    generic: {
                        domains: ['vital']
                    }
                }
            }
        };
        testPublishTubes(multiTubes, ['test-published-change-event-2']);
    });

    it('publish to multiple tube with customized filter:  Only Filtered Jobs are published', function() {
        var multiTubes = {
            'test-published-change-event-1' : {
                eventFilter: {
                    customized: 'filter/xx/yy/zz/foo-non-exist'
                }
            },
            'test-published-change-event-2' : {
                eventFilter: {
                    customized: 'filter/xx/yy/zz/foo-non-exist'
                }
            },
            'test-published-change-event-3' : {
                eventFilter: {
                    generic: {
                        customized: 'filter/dummy-filter'
                    }
                }
            }
        };
        testPublishTubes(multiTubes, ['test-published-change-event-3']);
    });

    it('publish to multiple tube with combined filter:  Only Filtered Jobs are published', function() {
        var multiTubes = {
            'test-published-change-event-1' : {
                eventFilter: {
                    generic: {
                        domains: ['document']
                    }
                }
            },
            'test-published-change-event-2' : {
                eventFilter: {
                    generic: {
                        sites: ['DOD']
                    }
                }
            },
            'test-published-change-event-3' : {
                eventFilter: {
                    customized: 'filter/xx/yy/zz/foo-non-exist'
                }
            }
        };
        testPublishTubes(multiTubes, ['test-published-change-event-1', 'test-published-change-event-2']);
    });
});

function testPublishTubes(tubeConfig, expectedJobTypes) {
    var completed = false;
    var response;
    var config = {
        publishTubes: tubeConfig
    };

    var environment = {
        metrics: logger
    };
    testHandler(handler, logger, config, environment, host, port, tubename, job, expectedJobTypes, null, function (result) {
        response = result;
        completed = true;
    });

    waitsFor(function () {
        return completed;
    }, 'response from activity management test handler timed out.', 10000);

    runs(function () {
        expect(response).toBeTruthy();
    });
}


