'use strict';
var activities = require('./activities-with-details-resource');
var _ = require('lodash');
var bunyan = require('bunyan');
var async = require('async');
var rdk = require('../../core/rdk');
var httpUtil = rdk.utils.http;

describe('activities with details resource', function() {
    var logger = sinon.stub(bunyan.createLogger({name: 'test-logger'}));
    describe('parses team and facility routes', function() {
        it('returns an array of team codes', function() {
            expect(activities.getTeamRoutes(['team:1234', 'team:5678', 'facility:123'])).to.eql(['1234', '5678']);
        });
        it('returns a facility code parsed from facility:SITE', function() {
            expect(activities.getFacilityRoutes('facility:SITE')).to.eql('SITE');
        });
    });
    describe('Builds response', function() {
        it('returns an array of response objects', function() {
            var activityResults = [{
                activityhealthdescription: 'description',
                assignedtofacilityid: 'facility',
                createdbyid: 'SITE;10000000272',
                pid: 'SITE;8'
            }, {
                activityhealthdescription: 'description2',
                assignedtofacilityid: 'facility2',
                createdbyid: 'SITE;10000000272',
                pid: 'SITE;8'
            }];
            var demographics = {
                users: {
                    'SITE;10000000272': 'LAST,FIRST'
                },
                patients: {
                    'SITE;8': {
                        fullName: 'TEN,PATIENT',
                        last4: '0010',
                        sensitive: false
                    }
                }
            };
            activities.buildResponse(activityResults, demographics, function(err, result) {
                expect(result.length).to.eql(2);
            });
        });
    });
    describe('Builds JDS query urls', function() {
        it('returns an array of user urls', function() {
            var ids = [1001];
            expect(activities.buildJDSQueryFromPids('user', ids)).to.eql(['/data/index/user-uid?range=1001']);
        });
        it('returns an array of patient urls', function() {
            var ids = [1001];
            expect(activities.buildJDSQueryFromPids('patient', ids)).to.eql(['/data/index/pt-select-pid?range=1001']);
        });
    });
    it('returns array of formatted user ids', function() {
        var req = {};
        _.set(req, 'logger', logger);
        expect(activities.adjustUserIds(req.logger, ['SITE;10000000272'])).to.eql(['urn:va:user:SITE:10000000272']);
    });

    describe('json.parse wrapper', function() {
        it('returns valid json', function() {
            expect(activities.parse('{"foo":"bar"}')).to.eql({
                foo: 'bar'
            });
        });
        it('returns same input if there is a parse error', function() {
            expect(activities.parse('invalid json')).to.eql('invalid json');
        });
    });

    describe('queries JDS', function() {
        var req = {};
        _.set(req, 'logger', logger);
        _.set(req, 'app.config', {
            jdsServer: {
                baseUrl: 'foo'
            }
        });
        it('returns connection error', function() {
            var httpStub = sinon.stub(httpUtil, 'get').callsFake(function(options, callback) {
                return callback('error');
            });
            activities.runJDSQuery(req, '/url', function(err, data) {
                expect(err).be.not.null();
                expect(err).to.eql('error');
            });
            httpStub.restore();
        });
        it('returns data items', function() {
            var results = {
                data: {
                    items: [1, 2, 3, 4]
                }
            };
            var httpStub = sinon.stub(httpUtil, 'get').callsFake(function(options, callback) {
                return callback(null, 'response', results);
            });
            activities.runJDSQuery(req, '/url', function(err, data) {
                expect(data).to.eql([1, 2, 3, 4]);
            });
            httpStub.restore();
        });
        it('returns empty object', function() {
            var httpStub = sinon.stub(httpUtil, 'get').callsFake(function(options, callback) {
                return callback(null, 'response', {});
            });
            activities.runJDSQuery(req, '/url', function(err, data) {
                expect(data).to.eql({});
            });
            httpStub.restore();
        });
    });
    describe('gets pids from JDS', function() {
        var req = {};
        _.set(req, 'logger', logger);
        _.set(req, 'app.config', {
            jdsServer: {
                baseUrl: 'foo'
            }
        });
        _.set(req, ['query', 'pid'], 'SITE;8');
        it('returns an array of pids', function() {
            var httpStub = sinon.stub(httpUtil, 'get').callsFake(function(options, callback) {
                return callback(null, 'response', {
                    patientIdentifiers: ['123', '000']
                });
            });
            activities.fetchPidsFromJDS(req, function(err, result) {
                expect(result).to.eql(['123', '000']);
            });
            httpStub.restore();
        });
        it('returns a jds error', function() {
            var httpStub = sinon.stub(httpUtil, 'get').callsFake(function(options, callback) {
                return callback('jdsError');
            });
            activities.fetchPidsFromJDS(req, function(err, result) {
                expect(err).to.include('jds.500.1000');
            });
            httpStub.restore();
        });
        it('returns a jds 404 error', function() {
            var httpStub = sinon.stub(httpUtil, 'get').callsFake(function(options, callback) {
                return callback(null, {
                    statusCode: 404
                }, '');
            });
            activities.fetchPidsFromJDS(req, function(err, result) {
                expect(err).to.include('jds.404.1000');
            });
            httpStub.restore();
        });
        it('adds patientidentifiers to params if pid is in the query', function() {
            var queryParams = {};
            var config = {};
            var httpStub = sinon.stub(httpUtil, 'get').callsFake(function(options, callback) {
                return callback(null, 'response', {
                    patientIdentifiers: ['123', '000']
                });
            });
            activities.verifyAndGetPidsIfNeeded(req, config, queryParams, function(err, result) {
                expect(queryParams).to.eql({
                    pid: ['123', '000']
                });
            });
            httpStub.restore();
        });
    });

    describe('returns a demographics object', function() {
        it('returns a demographics object', function() {
            var req = {};
            _.set(req, 'logger', logger);
            var activityRows = [{
                pid: 'SITE;8',
                createdbyid: 'SITE;10000000272'
            }];
            var jdsRes = [
                [{
                    fullName: 'TEN,PATIENT',
                    pid: 'SITE;8',
                    sensitive: false,
                    uid: 'urn:va:pt-select:SITE:8:8',
                    displayName: 'Ten,Patient',
                    last4: '0010'
                }],
                [{
                    name: 'LAST,FIRST',
                    uid: 'urn:va:user:SITE:10000000272'
                }]
            ];
            var expectedRes = {
                users: {
                    'SITE;10000000272': 'LAST,FIRST'
                },
                patients: {
                    'SITE;8': {
                        fullName: 'TEN,PATIENT',
                        last4: '0010',
                        sensitive: false
                    }
                }
            };
            var asyncSub = sinon.stub(async, 'parallelLimit').callsFake(function(options, max, callback) {
                return callback(null, jdsRes);
            });
            activities.buildDemographicsResponse(req, activityRows, true, function(err, results) {
                expect(results).to.eql(expectedRes);
            });
            asyncSub.restore();
        });
    });

    describe('get activities instances', function() {
        it('returns activity data items', function(done) {
            var res = {};
            var req = {
                query: {
                    routes: 'facility:SITE, team:1234',
                    initiatedBy: '123',
                    flagged: 'true',
                    returnActivityJSON: 'true',
                    primarySortBy: 'this.column',
                    secondarySortBy: 'this.column'
                }
            };
            res.set = function(header) {
                return this;
            };
            res.status = function(status) {
                expect(status).to.equal(200);
                return this;
            };
            res.rdkSend = function(body) {
                expect(body.items).to.eql([{'foo':'bar'},{'test':'response'}]);
                done();
            };
            _.set(req, 'app.config.oracledb.activityDatabase', {
                foo: 'bar'
            });
            var waterfallStub = sinon.stub(async, 'waterfall').callsFake(function(items, callback) {
                return callback(null, [{
                    foo: 'bar'
                }, {
                    test: 'response'
                }]);
            });
            activities.getActivitiesDetails(req, res);
            waterfallStub.restore();
        });
    });
    describe('returns formatted staff name', function () {
        it('returns string with last, first middle', function () {
           expect(activities.buildPcpName('doe', 'john', 'j')).to.eql('doe, john j');
        });
        it('returns null if all three params are null', function () {
            expect(activities.buildPcpName(null, null, null)).to.eql(null);
        });
        it('returns just first and last name', function () {
            expect(activities.buildPcpName('doe', 'jane', null)).to.eql('doe, jane');
        });
    });
});
