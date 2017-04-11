/*jslint node: true */
'use strict';

var rdk = require('../../core/rdk');
var jdsSync = require('./jds-sync-subsystem');
var httpMocks = require('node-mocks-http');
var _ = require('lodash');
var pidValidator = rdk.utils.pidValidator;
var nullchecker = require('../../utils/nullchecker');
var S = require('string');

describe('jdsSync\'s', function() {
    var pid;
    var req;
    var log;
    var httpExpected;
    beforeEach(function() {
        pid = 'test;patientId';

        req = buildRequest();

        log = '';

        httpExpected = [];
        sinon.stub(pidValidator, 'isIcn', function(icn) {
            return nullchecker.isNotNullish(icn) && !S(icn).contains(';');
        });
        sinon.stub(pidValidator, 'isSiteDfn', function(icn) {
            return nullchecker.isNotNullish(icn) && S(icn).contains(';');
        });
        sinon.stub(rdk.utils.http, 'get', stubHttp.bind(null, 'GET'));
        sinon.stub(rdk.utils.http, 'post', stubHttp.bind(null, 'POST'));
    });

    afterEach(function() {
        pidValidator.isIcn.restore(); // Unwraps the spy
        pidValidator.isSiteDfn.restore(); // Unwraps the spy
        rdk.utils.http.get.restore(); // Unwraps the spy
        rdk.utils.http.post.restore(); // Unwraps the spy
    });

    describe('getPatientStatus', function() {
        it('should add the pid to the path', function(done) {
            expectHttpFetch('vxSyncServer', '/sync/status?pid=test;patientId');


            req.app.subsystems.jdsSync.getPatientStatus(pid, req, expectSuccess(done));
        });

        it('should add the icn to the path', function(done) {
            pid = 'testicn';
            expectHttpFetch('vxSyncServer', '/sync/status?icn=testicn');
            req.app.subsystems.jdsSync.getPatientStatus(pid, req, expectSuccess(done));
        });

        it('should get the pid from the request when not provided', function(done) {
            req = buildRequest({ params: { pid: 'req;pid' } });
            expectHttpFetch('vxSyncServer', '/sync/status?pid=req;pid');
            req.app.subsystems.jdsSync.getPatientStatus(null, req, expectSuccess(done));
        });

        it('should return 404 when a patient isn\'t found', function(done) {
            expectHttpFetch('vxSyncServer', '/sync/status?pid=test;patientId', 404);
            req.app.subsystems.jdsSync.getPatientStatus(pid, req, expectError(done, 404, 'pid test;patientId is unsynced'));
        });

        it('should return a standard error result for other errors', function(done) {
            expectHttpFetch('vxSyncServer', '/sync/status?pid=test;patientId', 407);
            req.app.subsystems.jdsSync.getPatientStatus(pid, req, expectError(done, 407));
        });
    });

    describe('getPatientDataStatus', function() {
        it('should add the pid to the path', function(done) {
            expectHttpFetch('vxSyncServer', '/sync/status?pid=test;patientId');
            req.app.subsystems.jdsSync.getPatientDataStatus(pid, req, expectSuccess(done));
        });

        it('should add the icn to the path', function(done) {
            pid = 'testicn';
            expectHttpFetch('vxSyncServer', '/sync/status?icn=testicn');
            req.app.subsystems.jdsSync.getPatientDataStatus(pid, req, expectSuccess(done));
        });

        it('should get the pid from the request when not provided', function(done) {
            req = buildRequest({ params: { pid: 'req;pid' } });
            expectHttpFetch('vxSyncServer', '/sync/status?pid=req;pid');
            req.app.subsystems.jdsSync.getPatientDataStatus(null, req, expectSuccess(done));
        });

        it('should return success for a normal patient', function(done) {
            expectHttpFetch('vxSyncServer', '/sync/status?pid=test;patientId', 200, {
                syncStatus: {
                    completedStamp: {
                        sourceMetaStamp: {
                            'C877': {
                                syncCompleted: true,
                                stampTime: 'time'
                            }
                        }
                    }
                },
                jobStatus: [
                    {type: 'vler-blah'},
                    {
                        type: 'vista-9E7A-blah',
                        error: 'uh-oh'
                    },
                    {type: 'jmeadows-blah'}
                ]
            });
            req.app.subsystems.jdsSync.getPatientDataStatus(pid, req, expectResponse(done, {
                data: {
                    VISTA: {
                        C877: {
                            isSyncCompleted: true,
                            completedStamp: 'time'
                        },
                        '9E7A': {
                            isSyncCompleted: false,
                            hasError: true
                        }
                    },
                    VLER: {
                        isSyncCompleted: false,
                        hasError: false
                    },
                    DOD: {
                        isSyncCompleted: false,
                        hasError: false
                    },
                    allSites: false
                },
                status: 200
            }));
        });

        it('should return 404 when a patient isn\'t found', function(done) {
            expectHttpFetch('vxSyncServer', '/sync/status?pid=test;patientId', 404);
            req.app.subsystems.jdsSync.getPatientDataStatus(pid, req, expectError(done, 404, 'pid test;patientId is unsynced'));
        });

        it('should return a standard error result for other errors', function(done) {
            expectHttpFetch('vxSyncServer', '/sync/status?pid=test;patientId', 407);
            req.app.subsystems.jdsSync.getPatientDataStatus(pid, req, expectError(done, 407));
        });
    });

    describe('getPatientStatusDetail', function() {
        it('should add the pid and detailed params to the path', function(done) {
            expectHttpFetch('jdsServer', '/status/test;patientId?detailed=true');
            req.app.subsystems.jdsSync.getPatientStatusDetail(pid, req, expectSuccess(done));
        });

        it('should return 404 when a patient isn\'t found', function(done) {
            expectHttpFetch('jdsServer', '/status/test;patientId?detailed=true', 404);
            req.app.subsystems.jdsSync.getPatientStatusDetail(pid, req, expectError(done, 404, 'pid test;patientId is unsynced'));
        });

        it('should return a standard error result for other errors', function(done) {
            expectHttpFetch('jdsServer', '/status/test;patientId?detailed=true', 407);
            req.app.subsystems.jdsSync.getPatientStatusDetail(pid, req, expectError(done, 407));
        });
    });

    describe('syncPatientDemographics', function() {
        var payload;

        beforeEach(function() {
            payload = {
                'edipi': 'testedipi',
                'icn': 'testicn',
                'demographics': {}
            };
        });

        it('should POST to vxSyncServer', function(done) {
            expectHttpPost(payload, 'vxSyncServer', '/sync/demographicSync');
            expectHttpFetch('vxSyncServer', '/sync/status?icn=testicn');
            req.app.subsystems.jdsSync.syncPatientDemographics(payload, req, expectSuccess(done));
        });

        it('should set the pid in the audit with the icn', function(done) {
            expectHttpPost(payload, 'vxSyncServer', '/sync/demographicSync').toAudit('testicn');
            expectHttpFetch('vxSyncServer', '/sync/status?icn=testicn');
            req.app.subsystems.jdsSync.syncPatientDemographics(payload, req, expectSuccess(done));
        });

        it('should set the pid in the audit with the edipi when icn isn\'t found', function(done) {
            payload.icn = undefined;
            expectHttpPost(payload, 'vxSyncServer', '/sync/demographicSync').toAudit('DOD;testedipi');
            expectHttpFetch('vxSyncServer', '/sync/status?pid=DOD;testedipi');
            req.app.subsystems.jdsSync.syncPatientDemographics(payload, req, expectSuccess(done));
        });

        it('should raise an error when neither edipi or icn are present', function(done) {
            payload.pid = '9E7A;123';
            payload.icn = undefined;
            payload.edipi = undefined;
            req.app.subsystems.jdsSync.syncPatientDemographics(payload, req, function(error, result) {
                expect(error).to.equal('ICN or EDIPI is required for syncing patients by demographics.');
                done();
            });
        });

        it('should not use a resultProcessor', function(done) {
            expectHttpPost(payload, 'vxSyncServer', '/sync/demographicSync');
            expectHttpFetch('vxSyncServer', '/sync/status?icn=testicn');
            req.app.subsystems.jdsSync.syncPatientDemographics(payload, req, expectResponse(done, {data: {}, status: 201}));
        });

        afterEach(function() {
            payload = undefined;
        });
    });

    describe('getOperationalStatus', function() {
        var site = 'testsite';

        it('should get the site from the request site property', function(done) {
            req.site = 'sessionSite';
            expectHttpFetch('jdsServer', '/statusod/sessionSite');
            req.app.subsystems.jdsSync.getOperationalStatus(null, req, expectSuccess(done));
        });

        it('should use the passed-in site', function(done) {
            expectHttpFetch('jdsServer', '/statusod/testsite');
            req.app.subsystems.jdsSync.getOperationalStatus(site, req, expectSuccess(done));
        });

        it('should return a standard error result for errors', function(done) {
            expectHttpFetch('jdsServer', '/statusod/testsite', 407);
            req.app.subsystems.jdsSync.getOperationalStatus(site, req, expectError(done, 407));
        });
    });

    describe('getPatientAllSites', function() {
        it('should add the pid to the path', function(done) {
            expectHttpFetch('jdsServer', '/vpr/mpid/test;patientId');
            req.app.subsystems.jdsSync.getPatientAllSites(pid, req, expectSuccess(done));
        });

        it('should return success when the status is 202', function(done) {
            expectHttpFetch('jdsServer', '/vpr/mpid/test;patientId', 202);
            req.app.subsystems.jdsSync.getPatientAllSites(pid, req, expectSuccess(done));
        });

        it('should return a standard error result for errors', function(done) {
            expectHttpFetch('jdsServer', '/vpr/mpid/test;patientId', 407);
            req.app.subsystems.jdsSync.getPatientAllSites(pid, req, expectError(done, 407));
        });
    });

    describe('getJdsStatus', function() {
        it('should add the pid to the path', function(done) {
            expectHttpFetch('jdsServer', '/vpr/test;patientId/count/collection');
            req.app.subsystems.jdsSync.getJdsStatus(pid, req, expectSuccess(done));
        });

        it('should return 404 when a patient isn\'t found', function(done) {
            expectHttpFetch('jdsServer', '/vpr/test;patientId/count/collection', 404);
            req.app.subsystems.jdsSync.getJdsStatus(pid, req, expectError(done, 404, 'pid test;patientId is unsynced'));
        });

        it('should return a standard error result for other errors', function(done) {
            expectHttpFetch('jdsServer', '/vpr/test;patientId/count/collection', 407);
            req.app.subsystems.jdsSync.getJdsStatus(pid, req, expectError(done, 407));
        });
    });

    describe('syncStatusResultProcessor', function() {
        it('should respond with a 500 if the response is falsey', function() {
            var error = 599;
            var pid = '9E7A;3';
            var response = 'response';
            var data = 'data';
            var expectedResponse = {
                status: 500,
                data: {error: {code: 500, message: 'data'}}
            };
            jdsSync._syncStatusResultProcessor(pid, function(err, response) {
                expect(err).to.equal(error);
                expect(response).to.eql(expectedResponse);
            }, req, error, response, data);
        });
        it('should create an unsynced message if the response is 404', function() {
            var error = null;
            var pid = '9E7A;3';
            var response = {statusCode: 404};
            var data = 'data';
            var expectedResponse = {
                status: 404,
                data: {error: {code: 404, message: 'pid 9E7A;3 is unsynced'}}
            };
            jdsSync._syncStatusResultProcessor(pid, function(err, response) {
                expect(err).to.equal(error);
                expect(response).to.eql(expectedResponse);
            }, req, error, response, data);
        });
        it('should create an successful message if the response is 200', function() {
            var error = null;
            var pid = '9E7A;3';
            var response = {statusCode: 200};
            var data = 'data';
            var expectedResponse = {
                status: 200,
                data: data
            };
            jdsSync._syncStatusResultProcessor(pid, function(err, response) {
                expect(err).to.equal(error);
                expect(response).to.eql(expectedResponse);
            }, req, error, response, data);
        });
        it('should create an successful message if the response is 202', function() {
            var error = null;
            var pid = '9E7A;3';
            var response = {statusCode: 202};
            var data = 'data';
            var expectedResponse = {
                status: 202,
                data: data
            };
            jdsSync._syncStatusResultProcessor(pid, function(err, response) {
                expect(err).to.equal(error);
                expect(response).to.eql(expectedResponse);
            }, req, error, response, data);
        });
        it('should create a generic error message if the response is not handled', function() {
            var error = new Error('could not get URL');
            var pid = '9E7A;3';
            var response = {statusCode: 509};
            var data = 'data';
            var expectedResponse = {
                status: 500,
                data: {error: {code: 500, message: data}}
            };
            jdsSync._syncStatusResultProcessor(pid, function(err, response) {
                expect(err).to.equal(error);
                expect(response).to.eql(expectedResponse);
            }, req, error, response, data);
        });
    });

    function buildRequest(defaults) {
        var request = _.merge(httpMocks.createRequest({
            method: 'GET',
            url: '/sync'
        }), defaults);

        request.logger = {
            trace: doLog.bind(null, 'trace'),
            debug: doLog.bind(null, 'debug'),
            info: doLog.bind(null, 'info'),
            warn: doLog.bind(null, 'warn'),
            error: doLog.bind(null, 'error')
        };

        request.audit = {};

        request.session = {
            user: {
                site: '9E7A'
            }
        };

        request.app = {
            config: {
                jdsServer: {
                    host: 'jdshost',
                    port: 1
                },
                vxSyncServer: {
                    host: 'vxsynchost',
                    port: 2
                },
                hmpServer: {
                    host: 'hmphost',
                    port: 3,
                    accessCode: '9E7A;500',
                    verifyCode: 'ep1234;ep1234!!'
                },
                jdsSync: {
                    settings: {
                        timeoutMillis: 200,
                        waitMillis: 80
                    }
                },
                vistaSites: {
                    '9E7A': {},
                    'C877': {}
                }
            },
            subsystems: {}
        };

        request.app.subsystems.jdsSync = jdsSync;

        return request;
    }

    function doLog(level, stuff) {
        log += level + ': ' + JSON.stringify(stuff) + '\n';
    }

    function stubHttp(method, httpConfig, callback) {
        httpExpected.must.not.be.empty();
        var expected = httpExpected.shift();

        if (expected.log) {
            expect(log).to.eql(expected.log);
        }
        if (expected.auditPatientId) {
            expect(req.audit.patientId).to.equal(expected.auditPatientId);
        }
        if (expected.content) {
            expect(httpConfig.body).to.eql(expected.content);
        }

        expect(method).to.equal(expected.method);
        expect(httpConfig.baseUrl).to.equal(req.app.config[expected.serverName].baseUrl);
        expect(httpConfig.url).to.equal(expected.url);

        if (expected.response && httpConfig.json || typeof(httpConfig.body) === 'object') {
            expected.response = JSON.parse(expected.response);
        }
        callback(expected.error, {statusCode: expected.status}, expected.response);
    }

    function expectHttpFetch(serverName, path, status, response, error) {
        var expected = {
            serverName: serverName,
            url: path,
            method: 'GET',
            status: status || 200,
            response: JSON.stringify(response || {}),
            error: error
        };
        httpExpected.push(expected);
        var fluent = {
            toAudit: function(patientId) {
                expected.auditPatientId = patientId;
                return this;
            },
            toLog: function(messages) {
                expected.log = messages || 'log';
                return this;
            }
        };
        fluent.andAudit = fluent.toAudit;
        fluent.andLog = fluent.toLog;
        return fluent;
    }

    function expectHttpPost(payload, serverName, path, status, response, error) {
        var fluent = expectHttpFetch(serverName, path, status, response, error);
        var expected = httpExpected[httpExpected.length-1];
        expected.content = payload;
        expected.method = 'POST';
        return fluent;
    }

    function expectSuccess(done, status) {
        var callsback = 0;
        return function(error, result) {
            expect(error).to.be.falsy();
            if (status) {
                expect(result.status).to.equal(status);
            } else if (result && result.status) {
                expect(result.status).to.be.between(200, 202);
            }
            httpExpected.must.be.empty();

            callsback++;
            expect(callsback).to.equal(1);
            // allow the check for only one invocation of callback:
            setImmediate(done);
        };
    }

    function expectResponse(done, expected) {
        var callsback = 0;
        return function(err, actual) {
            expect(actual).to.eql(expected);
            httpExpected.must.be.empty();

            callsback++;
            expect(callsback).to.equal(1);
            // allow the check for only one invocation of callback:
            setImmediate(done);
        };
    }

    function expectError(done, status, message, error) {
        status = status || 500;
        message = message || 'There was an error processing your request. The error has been logged.';
        var callsback = 0;
        return function(err, result) {
            if (error) {
                expect(err).to.eql(error);
            }
            if (result.status) {
                expect(result.status).to.equal(status);
            }
            var errorObject = result.error || (result.data || {}).error;
            if (errorObject) {
                expect(errorObject.code).to.equal(status);
                if (message) {
                    expect(errorObject.message).to.equal(message);
                }
            }
            httpExpected.must.be.empty();

            callsback++;
            expect(callsback).to.equal(1);
            // allow the check for only one invocation of callback:
            setImmediate(done);
        };
    }
});
