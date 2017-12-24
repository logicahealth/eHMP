'use strict';

var rdk = require('../../core/rdk');
var jds = require('./jds-subsystem');
var httpMocks = require('node-mocks-http');
var _ = require('lodash');
var asuUtils = require('../../resources/patient-record/asu-utils');
var vix = require('../vix/vix-subsystem');
var bunyan = require('bunyan');
var annotator = require('./patient-record-annotator');

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
            expectHttpFetch('jdsServer', '/vpr/' + pid + '/index/ehmp-documents', 200, {
                data: {
                    items: []
                },
                status: 200
            });

            jds.getPatientDomainData(req, pid, domain, query, vlerQuery, expectSuccess(done));
        });

        it('can prefetch vix token if vix exists', function(done) {

            req = _.set(req, 'app.subsystems.vix', true);

            var utilStub = sinon.stub(asuUtils, 'applyAsuRulesWithActionNames', function(req, requiredPermission, allPermissions, jdsResponse, callback) {
                return callback(null, jdsResponse.data.items);
            });

            var addStub = sinon.stub(vix, 'addImagesToDocument', function(req, responseBody, callback) {
                return callback(null, [1, 2], 200);
            });

            expectHttpFetch('jdsServer', '/vpr/' + pid + '/index/ehmp-documents', 200, {
                data: {
                    items: [{uid: 'B'}]
                },
                status: 200
            });

            jds.getPatientDomainData(req, pid, domain, query, vlerQuery, function(err, resp, status) {
                expect(addStub.called).to.be.true();
                expect(utilStub.called).to.be.true();
                expectSuccess(done)(err, resp, status);
            });
        });

        it('detects errors correctly', function() {
            var withErrorObj = jds._isResponseError(req, new Error(), {}, {
                data: true
            });
            var withBodyErr = jds._isResponseError(req, null, {}, {
                error: new Error()
            });
            var withNoData = jds._isResponseError(req, null, {}, {});
            var withoutErr = jds._isResponseError(req, null, {}, {
                data: {
                    items: []
                }
            });

            expect(_.isError(withErrorObj)).to.be.true();
            expect(_.isError(withBodyErr)).to.be.true();
            expect(_.isError(withNoData)).to.be.true();
            expect(withoutErr).to.be.false();
        });

        it('formats response body errors correctly', function(){
            var withBodyErr = jds._isResponseError(req, null, {}, {
                error: {message: new Error()}
            });

            var spy = sinon.spy();
            spy(withBodyErr.toString());
            sinon.assert.neverCalledWith(spy, sinon.match('[object Object]'));
        });

        it('no data from JDS', function(done) {
            expectHttpFetch('jdsServer', '/vpr/' + pid + '/index/ehmp-documents', 200);
            jds.getPatientDomainData(req, pid, domain, query, vlerQuery, expectError(done, 500));
        });

        it('filters out parent medications from JDS', function(done) {
            expectHttpFetch('jdsServer', '/vpr/' + pid + '/index/medication', 200, {
                data: {
                    totalItems: 3,
                    currentItemCount: 3,
                    items: [{
                        uid: 'urn:123',
                        name: 'Parent',
                        orders: [{
                            childrenOrderUids: ['some:uid']
                        }]
                    }, {
                        name: 'No orders',
                        uid: 'urn:234'
                    }, {
                        name: 'Unrelated orders',
                        uid: 'urn:345',
                        orders: [{
                            orderUid: 'some:order:uid'
                        }]
                    }]
                },
                status: 200
            });

            jds.getPatientDomainData(req, pid, 'medication', query, vlerQuery, function(error, result, statusCode) {
                expect(error).to.be.falsy();
                expect(statusCode).to.equal(200);

                result.data.items.length.must.be(2);
                result.data.totalItems.must.be(3);
                result.data.currentItemCount.must.be(2);

                expect(_.find(result.data.items, {
                    name: 'Parent'
                })).to.be.undefined();
                expect(_.find(result.data.items, {
                    name: 'No orders'
                })).to.be.an.object();
                expect(_.find(result.data.items, {
                    name: 'Unrelated orders'
                })).to.be.an.object();

                done();
            });
        });

    });

    describe('processVitals', function() {
        var statusStub;
        var bodyMassStub;
        var rangesStub;

        var status;
        var postOptions;

        beforeEach(function() {
            rdk.utils.http.post.restore();
            postOptions = {};
            sinon.stub(rdk.utils.http, 'post', function(options, callback) {
                var data = {
                    data: {
                        items: [{typeName: 'any'}]
                    }
                };
                postOptions = options;
                return callback(null, {statusCode: 200}, data);
            });

            status = annotator.BMI_NOT_REQUIRED;
            statusStub = sinon.stub(annotator, 'getBodyMassStatusCode', function() {
                return status;
            });

            bodyMassStub = sinon.stub(annotator, 'addCalculatedBMI', _.noop);
            rangesStub = sinon.stub(annotator, 'addReferenceRanges', _.noop);
        });

        it('skips bmi when not needed', function(done) {
            jds._processVitals(null, {statusCode: 200}, {data: true}, null, function(error, data, status) {
                expect(bodyMassStub.called).to.be.false();
                expect(rangesStub.called).to.be.true();
                expect(error).to.be.null();
                expect(data).to.eql({data: true});
                expect(status).to.be(200);
                done();
            });
        });

        it('makes no additional request when all data is present', function(done) {
            status = annotator.BMI_DATA_PRESENT;
            jds._processVitals(null, {statusCode: 200}, {data: true}, null, function(error, data, status) {
                expect(bodyMassStub.called).to.be.true();
                expect(rangesStub.called).to.be.true();
                expect(error).to.be.null();
                expect(data).to.eql({data: true});
                expect(status).to.be(200);
                done();
            });
        });

        it('makes an additional request when height is missing', function(done){
            status = annotator.BMI_MISSING_HEIGHT;
            jds._processVitals(null, {statusCode: 200}, {data: true}, {}, function(error, data, status) {
                expect(bodyMassStub.called).to.be.true();
                expect(rangesStub.called).to.be.true();
                expect(error).to.be.null();
                expect(data).to.eql({data: true});
                expect(status).to.be(200);
                expect(postOptions.body.start).to.be(0);
                expect(postOptions.body.limit).to.be(1);
                expect(postOptions.body.order).to.be('observed DESC');
                expect(postOptions.body.filter).to.include('HEIGHT');
                done();
            });
        });

        it('makes an additional request when weight is missing', function(done) {
            status = annotator.BMI_MISSING_WEIGHT;
            jds._processVitals(null, {statusCode: 200}, {data: true}, {}, function(error, data, status) {
                expect(bodyMassStub.called).to.be.true();
                expect(rangesStub.called).to.be.true();
                expect(error).to.be.null();
                expect(data).to.eql({data: true});
                expect(status).to.be(200);
                expect(postOptions.body.start).to.be(0);
                expect(postOptions.body.limit).to.be(1);
                expect(postOptions.body.order).to.be('observed DESC');
                expect(postOptions.body.filter).to.include('WEIGHT');
                done();
            });
        });

    });

    describe('filterAsuDocuments', function() {
        it('doesn\'t process a missing result', function (done) {
            var testData = [null, {}, { data: {} }, { data: { items: [] } }];
            _.each(testData, function(details) {
                jds.filterAsuDocuments(req, details, function (err, response) {
                    expect(err).to.eql(null);
                    expect(response).to.be(details);
                });
            });
            done();
        });

        it('asu filters all records', function(done) {
            mockAsu = sinon.stub(asuUtils, 'applyAsuRulesWithActionNames', function(req, requiredPermission, allPermissions, details, callback) {
                return callback(null, []);
            });
            var details = {
                data: {
                    items: [{
                        localTitle: 'two'
                    }]
                }
            };
            var error = null;
            var expectedResponse = {
                data: {
                    items: []
                }
            };
            var response = {
                statusCode: 200
            };

            jds.filterAsuDocuments(req, details, function(err, response) {
                expect(err).to.equal(error);
                expect(response).to.eql(expectedResponse);
            }, error, response, details);
            done();
        });

        it('asu returns records', function(done) {
            mockAsu = sinon.stub(asuUtils, 'applyAsuRulesWithActionNames', function(req, requiredPermission, allPermissions, details, callback) {
                return callback(null, [{
                    localTitle: 'two'
                }]);
            });
            var details = {
                data: {
                    items: [{
                        localTitle: 'two'
                    }]
                }
            };
            var error = null;
            var expectedResponse = {
                data: {
                    items: [{
                        localTitle: 'two'
                    }]
                }
            };
            var response = {
                statusCode: 200
            };

            jds.filterAsuDocuments(req, details, function(err, response) {
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
                site: 'SITE'
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
        callback(expected.error, {
            statusCode: expected.status
        }, expected.response);
    }

    function expectHttpFetch(serverName, path, status, response, error) {
        var expected = {
            serverName: serverName,
            url: path,
            method: 'POST',
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
            if (_.get(result, 'status')) {
                expect(result.status).to.equal(status);
            }
            var errorObject = _.get(result, 'error') || _.get(result, 'data.error');
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

describe('fetchJdsAndFillPagination', function() {
    var req;
    var jdsOptions;
    beforeEach(function() {
        req = {};
        jdsOptions = {};
        req.logger = sinon.stub(bunyan.createLogger({
            name: 'jds-subsystem-spec.js'
        }));
    });
    it('only requests 1 page when no limit is requested', function() {
        function responseFilterer(req, responseBody, callback) {
            responseBody = _.cloneDeep(responseBody);
            return callback(null, responseBody);
        }

        var jdsResponse = {
            data: {
                updated: '20140102',
                totalItems: 2,
                currentItemCount: 2,
                items: [
                    {uid: 'a'},
                    {uid: 'b'}
                ]
            }
        };
        sinon.stub(rdk.utils.http, 'post', function(options, callback) {
            return callback(null, {}, jdsResponse);
        });
        jds._fetchJdsAndFillPagination(req, jdsOptions, responseFilterer, function(err, filteredBody) {
            expect(filteredBody).to.eql(jdsResponse);
            expect(rdk.utils.http.post.calledOnce).to.be.true();
        });
    });
    it('stops requesting items when no more are available', function() {
        function responseFilterer(req, responseBody, callback) {
            responseBody = _.cloneDeep(responseBody);
            responseBody.data.items.length = 1;
            return callback(null, responseBody);
        }

        var jdsResponse1 = {
            data: {
                updated: '20140102',
                totalItems: 8,
                currentItemCount: 4,
                itemsPerPage: 4,
                startIndex: 0,
                pageIndex: 0,
                totalPages: 2,
                items: [
                    {uid: 'a'},
                    {uid: 'b'},
                    {uid: 'c'},
                    {uid: 'd'}
                ]
            }
        };
        var jdsResponse2 = {
            data: {
                updated: '20140102',
                totalItems: 8,
                currentItemCount: 4,
                itemsPerPage: 4,
                startIndex: 4,
                pageIndex: 1,
                totalPages: 2,
                items: [
                    {uid: 'e'},
                    {uid: 'f'},
                    {uid: 'g'},
                    {uid: 'h'}
                ]
            }
        };
        var jdsResponses = [jdsResponse1, jdsResponse2];
        var jdsResponseCounter = -1;
        sinon.stub(rdk.utils.http, 'post', function(options, callback) {
            jdsResponseCounter++;
            return callback(null, {}, jdsResponses[jdsResponseCounter]);
        });

        _.set(jdsOptions, 'body.limit', 4);

        var expectedFilteredBody = {
            data: {
                updated: '20140102',
                totalItems: 8,
                currentItemCount: 2,
                itemsPerPage: 4,
                startIndex: 0,
                nextStartIndex: 8,
                pageIndex: 0,
                totalPages: 2,
                items: [
                    {uid: 'a'},
                    {uid: 'e'}
                ]
            }
        };
        jds._fetchJdsAndFillPagination(req, jdsOptions, responseFilterer, function(err, filteredBody) {
            expect(filteredBody).to.eql(expectedFilteredBody);
            expect(rdk.utils.http.post.calledTwice).to.be.true();
        });
    });
    it('stops requesting items when enough are fetched', function() {
        function responseFilterer(req, responseBody, callback) {
            responseBody = _.cloneDeep(responseBody);
            responseBody.data.items.length = 2;
            return callback(null, responseBody);
        }

        var jdsResponse1 = {
            data: {
                updated: '20140102',
                totalItems: 15,
                currentItemCount: 4,
                itemsPerPage: 4,
                startIndex: 4,
                pageIndex: 1,
                totalPages: 4,
                items: [
                    {uid: 'a'},
                    {uid: 'b'},
                    {uid: 'c'},
                    {uid: 'd'}
                ]
            }
        };
        var jdsResponse2 = {
            data: {
                updated: '20140102',
                totalItems: 15,
                currentItemCount: 4,
                itemsPerPage: 4,
                startIndex: 8,
                pageIndex: 2,
                totalPages: 4,
                items: [
                    {uid: 'e'},
                    {uid: 'f'},
                    {uid: 'g'},
                    {uid: 'h'}
                ]
            }
        };
        var jdsResponse3 = {
            data: {
                updated: '20140102',
                totalItems: 15,
                currentItemCount: 3,
                itemsPerPage: 4,
                startIndex: 12,
                pageIndex: 3,
                totalPages: 4,
                items: [
                    {uid: 'i'},
                    {uid: 'j'},
                    {uid: 'k'}
                ]
            }
        };
        var jdsResponses = [jdsResponse1, jdsResponse2, jdsResponse3];
        var jdsResponseCounter = -1;
        sinon.stub(rdk.utils.http, 'post', function(options, callback) {
            jdsResponseCounter++;
            return callback(null, {}, jdsResponses[jdsResponseCounter]);
        });

        _.set(jdsOptions, 'body.limit', 4);
        _.set(jdsOptions, 'body.start', 4);

        var expectedFilteredBody = {
            data: {
                updated: '20140102',
                totalItems: 15,
                currentItemCount: 4,
                itemsPerPage: 4,
                startIndex: 4,
                nextStartIndex: 10,
                pageIndex: 1,
                totalPages: 4,
                items: [
                    {uid: 'a'},
                    {uid: 'b'},
                    {uid: 'e'},
                    {uid: 'f'}
                ]
            }
        };
        jds._fetchJdsAndFillPagination(req, jdsOptions, responseFilterer, function(err, filteredBody) {
            expect(filteredBody).to.eql(expectedFilteredBody);
            expect(rdk.utils.http.post.calledTwice).to.be.true();
        });
    });
    it('sets the proper paging metadata values', function() {
        function responseFilterer(req, responseBody, callback) {
            responseBody = _.cloneDeep(responseBody);
            responseBody.data.items.length = 1;
            return callback(null, responseBody);
        }

        var jdsResponse1 = {
            data: {
                updated: '20140102',
                totalItems: 8,
                currentItemCount: 4,
                itemsPerPage: 4,
                startIndex: 0,
                pageIndex: 0,
                totalPages: 2,
                items: [
                    {uid: 'a'},
                    {uid: 'b'},
                    {uid: 'c'},
                    {uid: 'd'}
                ]
            }
        };
        var jdsResponse2 = {
            data: {
                updated: '20140103',
                totalItems: 8,
                currentItemCount: 4,
                itemsPerPage: 4,
                startIndex: 4,
                pageIndex: 1,
                totalPages: 2,
                items: [
                    {uid: 'e'},
                    {uid: 'f'},
                    {uid: 'g'},
                    {uid: 'h'}
                ]
            }
        };
        var jdsResponses = [jdsResponse1, jdsResponse2];
        var jdsResponseCounter = -1;
        sinon.stub(rdk.utils.http, 'post', function(options, callback) {
            jdsResponseCounter++;
            return callback(null, {}, jdsResponses[jdsResponseCounter]);
        });

        _.set(jdsOptions, 'body.limit', 4);

        jds._fetchJdsAndFillPagination(req, jdsOptions, responseFilterer, function(err, filteredBody) {
            // taken from the first page fetched
            expect(filteredBody.data.updated).to.equal(jdsResponse1.data.updated);
            expect(filteredBody.data.startIndex).to.equal(jdsResponse1.data.startIndex);
            expect(filteredBody.data.pageIndex).to.equal(jdsResponse1.data.pageIndex);

            expect(filteredBody.data.currentItemCount).to.equal(2); // calculated

            // taken from the last page fetched
            expect(filteredBody.data.totalItems).to.equal(jdsResponse2.data.totalItems);
            expect(filteredBody.data.itemsPerPage).to.equal(jdsResponse2.data.itemsPerPage);
            expect(filteredBody.data.totalPages).to.equal(jdsResponse2.data.totalPages);
            expect(rdk.utils.http.post.calledTwice).to.be.true();
        });

    });
    it('handles when the full first page is filtered', function() {
        var firstPageFiltered = false;
        function responseFilterer(req, responseBody, callback) {
            responseBody = _.cloneDeep(responseBody);
            if (!firstPageFiltered) {
                responseBody.data.items = [];
                firstPageFiltered = true;
            }
            return callback(null, responseBody);
        }

        var jdsResponse1 = {
            data: {
                updated: '20140102',
                totalItems: 8,
                currentItemCount: 4,
                itemsPerPage: 4,
                startIndex: 0,
                pageIndex: 0,
                totalPages: 2,
                items: [
                    {uid: 'a'},
                    {uid: 'b'},
                    {uid: 'c'},
                    {uid: 'd'}
                ]
            }
        };
        var jdsResponse2 = {
            data: {
                updated: '20140103',
                totalItems: 8,
                currentItemCount: 4,
                itemsPerPage: 4,
                startIndex: 4,
                pageIndex: 1,
                totalPages: 2,
                items: [
                    {uid: 'e'},
                    {uid: 'f'},
                    {uid: 'g'},
                    {uid: 'h'}
                ]
            }
        };
        var jdsResponses = [jdsResponse1, jdsResponse2];
        var jdsResponseCounter = -1;
        sinon.stub(rdk.utils.http, 'post', function(options, callback) {
            jdsResponseCounter++;
            return callback(null, {}, jdsResponses[jdsResponseCounter]);
        });

        _.set(jdsOptions, 'body.limit', 4);
        var expectedFilteredBody = {
            data: {
                updated: '20140102',
                totalItems: 8,
                currentItemCount: 4,
                itemsPerPage: 4,
                startIndex: 0,
                nextStartIndex: 8,
                pageIndex: 0,
                totalPages: 2,
                items: [
                    {uid: 'e'},
                    {uid: 'f'},
                    {uid: 'g'},
                    {uid: 'h'}
                ]
            }
        };

        jds._fetchJdsAndFillPagination(req, jdsOptions, responseFilterer, function(err, filteredBody) {
            expect(filteredBody).to.eql(expectedFilteredBody);
            expect(rdk.utils.http.post.calledTwice).to.be.true();
        });

    });
    it('trims items over the page limit', function() {
        function responseFilterer(req, responseBody, callback) {
            responseBody = _.cloneDeep(responseBody);
            responseBody.data.items.length = 3;
            return callback(null, responseBody);
        }

        var jdsResponse1 = {
            data: {
                updated: '20140102',
                totalItems: 8,
                currentItemCount: 4,
                itemsPerPage: 4,
                startIndex: 0,
                pageIndex: 0,
                totalPages: 2,
                items: [
                    {uid: 'a'},
                    {uid: 'b'},
                    {uid: 'c'},
                    {uid: 'd'}
                ]
            }
        };
        var jdsResponse2 = {
            data: {
                updated: '20140103',
                totalItems: 8,
                currentItemCount: 4,
                itemsPerPage: 4,
                startIndex: 4,
                pageIndex: 1,
                totalPages: 2,
                items: [
                    {uid: 'e'},
                    {uid: 'f'},
                    {uid: 'g'},
                    {uid: 'h'}
                ]
            }
        };
        var jdsResponses = [jdsResponse1, jdsResponse2];
        var jdsResponseCounter = -1;
        sinon.stub(rdk.utils.http, 'post', function(options, callback) {
            jdsResponseCounter++;
            return callback(null, {}, jdsResponses[jdsResponseCounter]);
        });

        _.set(jdsOptions, 'body.limit', 4);

        var expectedFilteredBody = {
            data: {
                updated: '20140102',
                totalItems: 8,
                currentItemCount: 4,
                itemsPerPage: 4,
                startIndex: 0,
                nextStartIndex: 5,
                pageIndex: 0,
                totalPages: 2,
                items: [
                    {uid: 'a'},
                    {uid: 'b'},
                    {uid: 'c'},
                    {uid: 'e'}
                ]
            }
        };

        jds._fetchJdsAndFillPagination(req, jdsOptions, responseFilterer, function(err, filteredBody) {
            // taken from the first page fetched
            expect(filteredBody).to.eql(expectedFilteredBody);
            expect(rdk.utils.http.post.calledTwice).to.be.true();
        });
    });
});

describe('requestMedications', function() {
    it('returns an error from a malformed afterFilter (body)', function() {
        var req = {};
        req.query = {};
        req.body = {};
        _.set(req, 'body.afterFilter', 'eq(foo,bar),baz(');
        var pid;
        var options;
        jds._requestMedications(req, pid, options, function(err, body, status) {
            expect(err).to.be.an.error(/Parse error/);
        });
    });
    it('returns an error from a malformed afterFilter (query)', function() {
        var req = {};
        req.query = {};
        req.body = {};
        _.set(req, 'query.afterFilter', 'eq(foo,bar),baz(');
        var pid;
        var options;
        jds._requestMedications(req, pid, options, function(err, body, status) {
            expect(err).to.be.an.error(/Parse error/);
        });
    });
    it('handles errors from fetchJdsAndFillPagination', function() {
        var req = {};
        req.query = {};
        req.body = {};
        req.logger = sinon.stub(bunyan.createLogger({
            name: 'jds-subsystem-spec'
        }));
        sinon.stub(rdk.utils.http, 'post', function(options, callback) {
            return callback(new Error('dummy error'));
        });
        var pid;
        var options;
        jds._requestMedications(req, pid, options, function(err, body, status) {
            expect(err).to.be.an.error(/dummy error/);
            expect(body).to.be.null();
            expect(status).to.equal(500);
        });
    });
    it('removes parent medications, transforms domain data, then applies filters', function() {
        var req = {};
        var jdsOptions = {};

        _.set(req, 'body', {});
        _.set(req, 'query.afterFilter', 'not(eq(uid,d)),not(eq(recent,false))');

        var jdsResponse1 = {
            data: {
                updated: '20140102',
                totalItems: 15,
                currentItemCount: 4,
                itemsPerPage: 4,
                startIndex: 4,
                pageIndex: 1,
                totalPages: 4,
                items: [{
                    uid: 'a',
                    productFormName: 'productFormName',
                    orders: [{
                        uid: 'a1',
                        childrenOrderUids: []
                    }]
                }, {
                    uid: 'b',
                    orders: [{
                        uid: 'b1',
                        childrenOrderUids: ['urn:va:abc']
                    }]
                }, {
                    uid: 'c',
                    qualifiedName: 'qualifiedName'
                }, {
                    uid: 'd'
                }]
            }
        };
        var jdsResponse2 = {
            data: {
                updated: '20140102',
                totalItems: 15,
                currentItemCount: 4,
                itemsPerPage: 4,
                startIndex: 8,
                pageIndex: 2,
                totalPages: 4,
                items: [{
                    uid: 'e',
                    codes: [{
                        display: 'code'
                    }]
                }, {
                    uid: 'f',
                    name: 'name',
                    overallStart: '20020101135300'
                }, {
                    uid: 'g',
                    name: 'name'
                }, {
                    uid: 'h'
                }]
            }
        };
        var jdsResponses = [jdsResponse1, jdsResponse2];
        var jdsResponseCounter = -1;
        sinon.stub(rdk.utils.http, 'post', function(options, callback) {
            jdsResponseCounter++;
            return callback(null, {}, jdsResponses[jdsResponseCounter]);
        });

        _.set(jdsOptions, 'body.limit', 4);
        _.set(jdsOptions, 'body.start', 4);

        var expectedFilteredBody = {
            data: {
                items: [{
                    uid: 'a',
                    orders: [{
                        uid: 'a1',
                        childrenOrderUids: []
                    }],
                    calculatedStatus: '',
                    fills: [],
                    lastAction: 'Invalid date',
                    expirationDate: 'Invalid date',
                    recent: true,
                    normalizedName: 'productFormName',
                    productFormName: 'productFormName'
                }, {
                    uid: 'c',
                    qualifiedName: 'qualifiedName',
                    calculatedStatus: '',
                    fills: [],
                    lastAction: 'Invalid date',
                    expirationDate: 'Invalid date',
                    recent: true,
                    normalizedName: 'qualifiedName'
                }, {
                    uid: 'e',
                    calculatedStatus: '',
                    fills: [],
                    lastAction: 'Invalid date',
                    expirationDate: 'Invalid date',
                    recent: true,
                    codes: [{
                        display: 'code'
                    }],
                    normalizedName: 'code'
                }, {
                    uid: 'g',
                    calculatedStatus: '',
                    fills: [],
                    lastAction: 'Invalid date',
                    expirationDate: 'Invalid date',
                    recent: true,
                    name: 'name',
                    normalizedName: 'name'
                }],
                updated: '20140102',
                startIndex: 4,
                pageIndex: 1,
                totalItems: 15,
                currentItemCount: 4,
                itemsPerPage: 4,
                totalPages: 4,
                nextStartIndex: 11
            }
        };
        jds._requestMedications(req, 'SITE;3', jdsOptions, function(err, filteredBody, statusCode) {
            expect(filteredBody).to.eql(expectedFilteredBody);
            expect(rdk.utils.http.post.calledTwice).to.be.true();
            expect(statusCode).to.equal(200);
        });
    });
});

describe('applyFilters', function() {
    it('returns domainData if there are no items', function() {
        var domainData = {};
        var filterObject = [];
        var domainDataBefore = JSON.stringify(domainData);
        var newDomainData = jds._applyFilters(domainData, filterObject);
        var domainDataAfter = JSON.stringify(newDomainData);
        expect(domainDataBefore).to.equal(domainDataAfter);
    });
    it('returns domainData if filterObject is not an array', function() {
        var domainData = {};
        _.set(domainData, 'data.items', ['a']);
        var domainDataBefore = JSON.stringify(domainData);
        var filterObject = null;
        var newDomainData = jds._applyFilters(domainData, filterObject);
        var domainDataAfter = JSON.stringify(newDomainData);
        expect(domainDataBefore).to.equal(domainDataAfter);
    });
    it.skip('returns domainData if filterObject could not be applied', function() {
        // jdsFilter bug: bad filters clear items
        var domainData = {};
        _.set(domainData, 'data.items', [{
            id: 'a'
        }, {
            id: 'b'
        }]);
        var domainDataBefore = JSON.stringify(domainData);
        var filterObject = ['asdf', 'zyx'];
        var newDomainData = jds._applyFilters(domainData, filterObject);
        var domainDataAfter = JSON.stringify(newDomainData);
        expect(domainDataBefore).to.equal(domainDataAfter);
    });
    it('returns domainData if filterObject could not be applied', function() {
        var domainData = {};
        _.set(domainData, 'data.items', [{
            id: 'a'
        }, {
            id: 'b'
        }]);
        var filterObject = ['asdf', 'zyx'];
        var newDomainData = jds._applyFilters(domainData, filterObject);
        expect(newDomainData).to.equal(domainData);
    });
    it('returns domainData with the filtered items when there are items and a valid filter', function() {
        var domainData = {};
        _.set(domainData, 'data.items', [{
            id: 'a'
        }, {
            id: 'b'
        }]);
        var filterObject = ['eq', 'id', 'b'];
        var newDomainData = jds._applyFilters(domainData, filterObject);
        var expectedDomainData = {};
        _.set(expectedDomainData, 'data.items[0].id', 'b');
        expect(newDomainData).to.eql(expectedDomainData);
    });
});
