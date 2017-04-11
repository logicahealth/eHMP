'use strict';

var rdk = require('../../core/rdk');
var jds = require('./jds-subsystem');
var httpMocks = require('node-mocks-http');
var _ = require('lodash');
var http = rdk.utils.http;
var asuUtils = require('../../resources/patient-record/asu-utils');

describe('jds\'s', function() {
    var pid, req, log, httpExpected, domain, query, vlerQuery, mockAsu;

    beforeEach(function() {
        pid = 'test;patientId';
        req = buildRequest();
        log = '';
        domain = 'document-view';
        query = '';
        vlerQuery = '';

        httpExpected = [];
        sinon.stub(rdk.utils.http, 'get', stubHttp.bind(null, 'GET'));
        sinon.stub(rdk.utils.http, 'post', stubHttp.bind(null, 'POST'));
    });

    afterEach(function() {
        rdk.utils.http.get.restore(); // Unwraps the spy
        rdk.utils.http.post.restore(); // Unwraps the spy
        if (mockAsu) {
            asuUtils.applyAsuRulesWithActionNames.restore();
            //asuUtils.applyAsuRules.restore();
            mockAsu = undefined;
        }
    });

    describe('getPatientDomainData', function() {
        it('empty data from jds, returns empty results', function(done) {
            var data = 'data';
            expectHttpFetch('jdsServer', '/vpr/' + pid + '/index/docs-view?', 200, {
                data: {
                    items: []
                },
                status: 200
            });

            jds.getPatientDomainData(req, pid, domain, query, vlerQuery, expectSuccess(done));
        });

        it('no data from JDS', function(done) {
            var data = 'data';
            expectHttpFetch('jdsServer', '/vpr/' + pid + '/index/docs-view?', 200);
            jds.getPatientDomainData(req, pid, domain, query, vlerQuery, expectError(done, 500));
        });

        it('filters out parent medications from JDS', function(done) {
            var data = 'data';
            expectHttpFetch('jdsServer', '/vpr/' + pid + '/index/medication?', 200, {
                data: {
                    totalItems: 3,
                    currentItemCount: 3,
                    items: [{
                        name: 'Parent',
                        orders: [{
                            childrenOrderUids: ['some:uid']
                        }]
                    }, {
                        name: 'No orders'
                    }, {
                        name: 'Unrelated orders',
                        orders: [{
                            orderUid: 'some:order:uid'
                        }]
                    }]
                },
                status: 200
            });

            jds.getPatientDomainData(req, pid, 'medication', query, vlerQuery, function(error, result) {
                expect(error).to.be.falsy();
                expect(result.status).to.equal(200);

                result.data.items.length.must.be(2);
                result.data.totalItems.must.be(2);
                result.data.currentItemCount.must.be(2);

                expect(_.find(result.data.items, { name: 'Parent' })).to.be.undefined();
                expect(_.find(result.data.items, { name: 'No orders' })).to.be.an.object();
                expect(_.find(result.data.items, { name: 'Unrelated orders' })).to.be.an.object();

                done();
            });
        });

    });
    describe('filterAsuDocuments', function() {
        it('asu filters all records', function(done) {
            mockAsu = sinon.stub(asuUtils, "applyAsuRulesWithActionNames", function (req, requiredPermission, allPermissions, details, callback) {
                return callback(null, []);
            });
            var details = {
                data: {items: [{localTitle: 'two'}]}
            };
            var error = null;
            var expectedResponse = {
                data: {items: []}
            };
            var response = {statusCode: 200};

            jds._filterAsuDocuments(req, details, function(err, response) {
                expect(err).to.equal(error);
                expect(response).to.eql(expectedResponse);
            }, error, response, details);
            done();
        });

        it('asu returns records', function(done) {
            mockAsu = sinon.stub(asuUtils, "applyAsuRulesWithActionNames", function (req, requiredPermission, allPermissions, details, callback) {
                return callback(null, [{localTitle: 'two'}]);
            });
            var details = {
                data: {items: [{localTitle: 'two'}]}
            };
            var error = null;
            var expectedResponse = {
                data: {items: [{localTitle: 'two'}]}
            };
            var response = {statusCode: 200};

            jds._filterAsuDocuments(req, details, function(err, response) {
                expect(err).to.equal(error);
                expect(response).to.eql(expectedResponse);
            }, error, response, details);
            done();
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
                jds: {
                    settings: {
                        timeoutMillis: 200,
                        waitMillis: 80
                    }
                }
            },
            subsystems: {}
        };

        request.app.subsystems.jds = jds;

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
