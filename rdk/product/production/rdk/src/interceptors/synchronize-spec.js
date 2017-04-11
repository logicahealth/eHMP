'use strict';

var moment = require('moment');
var synchronize = require('../interceptors/synchronize');

describe('The synchronize interceptor', function() {
    var req = stubRequest();
    var res = stubResponse();
    var jdsSync = req.app.subsystems.jdsSync;
    var statusStub, clearStub, loadStub, nextStub;

    beforeEach(function() {
        clearStub = sinon.stub(jdsSync, 'clearPatient', function(pid, req, callback) {
            callback(undefined, {});
        });
        loadStub = sinon.stub(jdsSync, 'loadPatientPrioritized', function(pid, prioritySite, req, callback) {
            callback(undefined, {});
        });
        nextStub = sinon.stub(res, 'next');
    });

    it('does a load when a patient is fully synced', function() {
        spyOnSyncStatus({
            data: {
                syncStatus: {},
                jobStatus: []
            },
            status: 200
        });

        synchronize(req, res, res.next);

        expectLoad();
    });

    // Commented out per comment-out in synchronize.js; see comment there
    // it('does a clear when there are only error jobs', function() {
    //     spyOnSyncStatus({
    //         data: {
    //             syncStatus: {},
    //             jobStatus: [{
    //                 status: 'error',
    //                 timestamp: '1443808179308'
    //             }]
    //         },
    //         status: 200
    //     });

    //     synchronize(req, res, res.next);

    //     expectClearAndLoad();
    // });

    it('does a clear when there are timed out open jobs', function() {
        spyOnSyncStatus({
            data: {
                syncStatus: {},
                jobStatus: [{
                    status: 'open',
                    timestamp: '1443808179308'
                }]
            },
            status: 200
        });

        synchronize(req, res, res.next);

        expectClearAndLoad();
    });

    it('does a load when there are recent open jobs', function() {
        spyOnSyncStatus({
            data: {
                syncStatus: {},
                jobStatus: [{
                    status: 'open',
                    timestamp: moment().valueOf()
                }]
            },
            status: 200
        });

        synchronize(req, res, res.next);

        expectLoad();
    });

    it('does a clear when there are no open jobs and a timed out stamp', function() {
        spyOnSyncStatus({
            data: {
                syncStatus: {
                    inProgress: {
                        sourceMetaStamp: {
                            VLER: {
                                stampTime: 20151002134926
                            }
                        }
                    }
                },
                jobStatus: []
            },
            status: 200
        });

        synchronize(req, res, res.next);

        expectClearAndLoad();
    });

    it('does a load when there are no open jobs and a recent stamp', function() {
        spyOnSyncStatus({
            data: {
                syncStatus: {
                    inProgress: {
                        sourceMetaStamp: {
                            VLER: {
                                stampTime: Number(moment().format('YYYYMMDDHHmmss'))
                            }
                        }
                    }
                },
                jobStatus: []
            },
            status: 200
        });

        synchronize(req, res, res.next);

        expectLoad();
    });

    function spyOnSyncStatus(json, error) {
        statusStub = sinon.stub(jdsSync, 'getPatientStatus', function(pid, req, callback) {
            callback(error, json);
        });
    }

    function expectClearAndLoad() {
        expectLoad(true);
    }

    function expectLoad(clear) {
        if (clear) {
            expect(clearStub.called).to.be.true();
        } else {
            expect(clearStub.called).to.not.be.true();
        }
        expect(loadStub.called).to.be.true();
        expect(nextStub.called).to.be.true();
    }
});

function stubRequest() {
    var logger = {
        trace: function() {},
        debug: function() {},
        info: function() {},
        warn: function() {},
        error: function() {},
        fatal: function() {}
    };
    var app = {
        config: {
            jdsSync: {
                settings: {
                    waitMillis: 1000,
                    timeoutMillis: 420000
                },
                syncPatientLoad: {
                    timeoutMillis: 420000,
                    protocol: 'http',
                    options: {
                        path: '/sync/load',
                        method: 'POST',
                        rejectUnauthorized: false,
                        requestCert: true,
                        agent: false
                    }
                },
                syncPatientClear: {
                    timeoutMillis: 420000,
                    protocol: 'http',
                    options: {
                        path: '/sync/clearPatient',
                        method: 'POST',
                        rejectUnauthorized: false,
                        requestCert: true,
                        agent: false
                    }
                },
                syncPatientStatus: {
                    timeoutMillis: 420000,
                    options: {
                        path: '/sync/status',
                        method: 'GET',
                        rejectUnauthorized: false,
                        requestCert: true,
                        agent: false
                    }
                },
            },
            resync: {
                openJobsTimeoutMillis: 2222,
                inProgressTimeoutMillis: 3333
            }
        },
        subsystems: {
            jdsSync: {
                getPatientStatus: function() {},
                clearPatient: function() {},
                loadPatientPrioritized: function() {}
            }
        }
    };
    var pid = 1;
    var req = {
        app: app,
        param: function() {
            // different pids to avoid caching
            ++pid;
            return '9E7A;' + pid;
        },
        get: function() {},
        logger: logger,
        session: {}
    };
    return req;
}

function stubResponse() {
    var res = {
        status: function() {},
        send: function() {},
        next: function() {}
    };
    return res;
}
