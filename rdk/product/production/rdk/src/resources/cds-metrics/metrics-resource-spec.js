'use strict';

var rdk = require('../../core/rdk');
var metricsResource = require('./metrics-resource');
var cdsMetrics = require('./metrics');
var cdsSpecUtil = require('../cds-spec-util/cds-spec-util');
var cdsSubsystem = require('../../subsystems/cds/cds-subsystem');

var mockReqResUtil = cdsSpecUtil.mockReqResUtil;
var appReference = cdsSpecUtil.createAppReference;
var expectedInterceptors = {
    audit: true,
    authentication: true,
    operationalDataCheck: false,
    synchronize: false
};

var logger = {
    trace: function() {},
    debug: function() {},
    info: function() {},
    warn: function() {},
    error: function() {},
    fatal: function() {},
};

describe('Metrics Resource', function() {
    var resources = metricsResource.getResourceConfig(appReference());
    var res = mockReqResUtil.response;

    beforeEach(function() {
        sinon.spy(res, 'status');
        sinon.spy(res, 'rdkSend');
    });

    describe('Test configuration', function() {
        it('tests that getResourceConfig() is setup correctly for cds-metric-search', function() {

            expect(resources[0].name).to.equal('cds-metrics-cds-metric-search');
            expect(resources[0].path).to.equal('/metrics');
            expect(resources[0].interceptors).to.eql(expectedInterceptors);
            expect(resources[0].healthcheck).to.be.undefined();
            expect(resources[0].get).not.to.be.undefined();
        });

        it('tests that getResourceConfig() is setup correctly for cds-dashboard-get', function() {
            expect(resources[1].name).to.equal('cds-metrics-cds-dashboard-get');
            expect(resources[1].path).to.equal('/dashboard/:dashboardId');
            expect(resources[1].interceptors).to.eql(expectedInterceptors);
            expect(resources[1].healthcheck).to.be.undefined();
            expect(resources[1].get).not.to.be.undefined();
        });

        it('tests that getResourceConfig() is setup correctly for user cds-user-dashboards-get', function() {
            expect(resources[2].name).to.equal('cds-metrics-cds-user-dashboards-get');
            expect(resources[2].path).to.equal('/dashboards/:userIdParam');
            expect(resources[2].interceptors).to.eql(expectedInterceptors);
            expect(resources[2].healthcheck).to.be.undefined();
            expect(resources[2].get).not.to.be.undefined();
        });

        it('tests that getResourceConfig() is setup correctly for cds-metric-definitions-get', function() {
            expect(resources[3].name).to.equal('cds-metrics-cds-metric-definitions-get');
            expect(resources[3].path).to.equal('/definitions');
            expect(resources[3].interceptors).to.eql(expectedInterceptors);
            expect(resources[3].healthcheck).to.be.undefined();
            expect(resources[3].get).not.to.be.undefined();
        });

        it('tests that getResourceConfig() is setup correctly for cds-metric-definitions-post', function() {
            expect(resources[4].name).to.equal('cds-metrics-cds-metric-definitions-post');
            expect(resources[4].path).to.equal('/definitions');
            expect(resources[4].interceptors).to.eql(expectedInterceptors);
            expect(resources[4].healthcheck).to.be.undefined();
            expect(resources[4].post).not.to.be.undefined();
        });
        it('tests that getResourceConfig() is setup correctly for cds-metric-definitions-delete', function() {
            expect(resources[5].name).to.equal('cds-metrics-cds-metric-definitions-delete');
            expect(resources[5].path).to.equal('/definitions/:definitionId');
            expect(resources[5].interceptors).to.eql(expectedInterceptors);
            expect(resources[5].healthcheck).to.be.undefined();
            expect(resources[5].delete).not.to.be.undefined();
        });

        it('tests that getResourceConfig() is setup correctly for cds-metric-groups-get', function() {
            expect(resources[6].name).to.equal('cds-metrics-cds-metric-groups-get');
            expect(resources[6].path).to.equal('/groups');
            expect(resources[6].interceptors).to.eql(expectedInterceptors);
            expect(resources[6].healthcheck).to.be.undefined();
            expect(resources[6].get).not.to.be.undefined();
        });

        it('tests that getResourceConfig() is setup correctly for cds-metric-groups-post', function() {
            expect(resources[7].name).to.equal('cds-metrics-cds-metric-groups-post');
            expect(resources[7].path).to.equal('/groups');
            expect(resources[7].interceptors).to.eql(expectedInterceptors);
            expect(resources[7].healthcheck).to.be.undefined();
            expect(resources[7].post).not.to.be.undefined();
        });

        it('tests that getResourceConfig() is setup correctly for cds-metric-groups-put', function() {
            expect(resources[8].name).to.equal('cds-metrics-cds-metric-groups-put');
            expect(resources[8].path).to.equal('/groups');
            expect(resources[8].interceptors).to.eql(expectedInterceptors);
            expect(resources[8].healthcheck).to.be.undefined();
            expect(resources[8].put).not.to.be.undefined();
        });

        it('tests that getResourceConfig() is setup correctly for cds-metric-groups-delete', function() {
            expect(resources[9].name).to.equal('cds-metrics-cds-metric-groups-delete');
            expect(resources[9].path).to.equal('/groups/:metricGroupId');
            expect(resources[9].interceptors).to.eql(expectedInterceptors);
            expect(resources[9].healthcheck).to.be.undefined();
            expect(resources[9].delete).not.to.be.undefined();
        });
        // Per Darren Maglidt, commenting out roles' endpoint registration until they're fully implemented.
        //it('tests that getResourceConfig() is setup correctly for cds-roles-get', function() {
        //    expect(resources[10].name).to.equal('cds-metrics-cds-roles-get');
        //    expect(resources[10].path).to.equal('/roles');
        //    expect(resources[10].interceptors).to.eql(expectedInterceptors);
        //    expect(resources[10].healthcheck).to.be.undefined();
        //    expect(resources[10].get).not.to.be.undefined();
        //});

        //it('tests that getResourceConfig() is setup correctly for cds-roles-put', function() {
        //    expect(resources[11].name).to.equal('cds-metrics-cds-roles-put');
        //    expect(resources[11].path).to.equal('/roles');
        //    expect(resources[11].interceptors).to.eql(expectedInterceptors);
        //    expect(resources[11].healthcheck).to.be.undefined();
        //    expect(resources[11].put).not.to.be.undefined();
        //});

        //it('tests that getResourceConfig() is setup correctly for cds-user-roles-get', function() {
        //    expect(resources[12].name).to.equal('cds-metrics-cds-user-roles-get');
        //    expect(resources[12].path).to.equal('/userRoles');
        //    expect(resources[12].interceptors).to.eql(expectedInterceptors);
        //    expect(resources[12].healthcheck).to.be.undefined();
        //    expect(resources[12].get).not.to.be.undefined();
        //});

        //it('tests that getResourceConfig() is setup correctly for cds-user-roles-put', function() {
        //    expect(resources[13].name).to.equal('cds-metrics-cds-user-roles-put');
        //    expect(resources[13].path).to.equal('/userRoles');
        //    expect(resources[13].interceptors).to.eql(expectedInterceptors);
        //    expect(resources[13].healthcheck).to.be.undefined();
        //    expect(resources[13].put).not.to.be.undefined();
        //});

        it('tests that getResourceConfig() is setup correctly for cds-dashboard-post', function() {
            // var index = 14;
            var index = 10; // index without the role endpoints
            expect(resources[index].name).to.equal('cds-metrics-cds-dashboard-post');
            expect(resources[index].path).to.equal('/dashboard');
            expect(resources[index].interceptors).to.eql(expectedInterceptors);
            expect(resources[index].healthcheck).to.be.undefined();
            expect(resources[index].post).not.to.be.undefined();
        });

        it('tests that getResourceConfig() is setup correctly for cds-dashboard-delete', function() {
            // var index = 15;
            var index = 11; // index without the role endpoints
            expect(resources[index].name).to.equal('cds-metrics-cds-dashboard-delete');
            expect(resources[index].path).to.equal('/dashboard/:dashboardId');
            expect(resources[index].interceptors).to.eql(expectedInterceptors);
            expect(resources[index].healthcheck).to.be.undefined();
            expect(resources[index].delete).not.to.be.undefined();
        });

        it('tests that getResourceConfig() is setup correctly for cds-dashboard-put', function() {
            // var index = 16;
            var index = 12; // index without the role endpoints
            expect(resources[index].name).to.equal('cds-metrics-cds-dashboard-put');
            expect(resources[index].path).to.equal('/dashboard/:dashboardId');
            expect(resources[index].interceptors).to.eql(expectedInterceptors);
            expect(resources[index].healthcheck).to.be.undefined();
            expect(resources[index].put).not.to.be.undefined();
        });
    });

    describe('List endpoint HTTP response codes', function() {

        var db = cdsSpecUtil.createMockDb({
            find: function(callback) {
                return {
                    toArray: function(callback) {
                        callback(null, []);
                    }
                };
            },
            insert: function(postIntentJson, callback) {
                var echo = [];
                postIntentJson._id = 'mongodb12345678';
                echo.push(postIntentJson);
                callback(null, echo); // can mock a response here...
            },
            remove: function(a, callback) {
                return;
            },
            update: function(query, update, options, callback) {
                return;
            },
            aggregate: function(pipeline, callback) {
                callback(null, []);
            },
            ensureIndex: function() {
                return;
            }
        });

        var metricId = 1; //required param
        var startPeriod = 1440077684862; //required param
        var endPeriod = 1440106484862; //required param
        var granularity = 3600000; //required param
        var origin = 'Engine1'; //optional
        var invocationType = 'Direct'; //optional
        var paramMap = {};

        it('responds HTTP OK when no parameters are sent to getMetricDefinitions', function() {
            sinon.stub(cdsSubsystem, 'getCDSDB').callsFake(function(logger, dbName, initDefinitions, callback) {
                callback(null, db);
            });
            cdsMetrics.getMetricDefinitions(mockReqResUtil.createRequestWithParam({}), res);
            expect(res.status.calledWith(rdk.httpstatus.ok)).to.be.true();
        });

        it('responds HTTP Bad Request when required parameters are missing for getDashBoard', function() {
            sinon.stub(cdsSubsystem, 'getCDSDB').callsFake(function(logger, dbName, initDefinitions, callback) {
                callback(null, db);
            });
            cdsMetrics.getDashBoard(mockReqResUtil.createRequestWithParam({}), res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });

        //FUTURE-TODO update for individual user access
        it('responds HTTP Bad Request when required parameters are missing for getUserDashBoards', function() {
            sinon.stub(cdsSubsystem, 'getCDSDB').callsFake(function(logger, dbName, initDefinitions, callback) {
                callback(null, db);
            });
            cdsMetrics.getUserDashBoards(mockReqResUtil.createRequestWithParam({
                userIdParam: 'all'
            }), res);
            expect(res.status.calledWith(rdk.httpstatus.ok)).to.be.true();
        });

        it('responds HTTP Bad Request when required parameters are missing for getMetricSearch', function() {
            sinon.stub(cdsSubsystem, 'getCDSDB').callsFake(function(logger, dbName, initDefinitions, callback) {
                callback(null, db);
            });

            paramMap = {
                metricId: metricId,
                startPeriod: startPeriod,
                endPeriod: endPeriod,
                granularity: granularity,
                origin: origin,
                invocationType: invocationType
            };

            //No parameters (invalid)
            cdsMetrics.getMetricSearch(mockReqResUtil.createRequestWithParam(), res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });

        it('responds HTTP OK when required & optional parameters are present for getMetricSearch', function() {
            sinon.stub(cdsSubsystem, 'getCDSDB').callsFake(function(logger, dbName, initDefinitions, callback) {
                callback(null, db);
            });
            cdsMetrics.createInitDefinitions(logger)(db);

            paramMap = {
                metricId: metricId,
                startPeriod: startPeriod,
                endPeriod: endPeriod,
                granularity: granularity,
                origin: origin,
                invocationType: invocationType
            };
            //all parameters (valid)
            cdsMetrics.getMetricSearch(mockReqResUtil.createRequestWithParam(paramMap), res);
            expect(res.status.calledWith(rdk.httpstatus.ok)).to.be.true();
        });

        it('responds HTTP OK when required parameters are present but optional parameters missing for getMetricSearch', function() {
            sinon.stub(cdsSubsystem, 'getCDSDB').callsFake(function(logger, dbName, initDefinitions, callback) {
                initDefinitions(db);
                callback(null, db);
            });
            cdsMetrics.createInitDefinitions(logger)(db);

            //all required parameters, no optional parameters
            paramMap = {
                metricId: metricId,
                startPeriod: startPeriod,
                endPeriod: endPeriod,
                granularity: granularity
            };
            cdsMetrics.getMetricSearch(mockReqResUtil.createRequestWithParam(paramMap), res);
            expect(res.status.calledWith(rdk.httpstatus.ok)).to.be.true();
        });

        it('responds HTTP Bad Request when required parameters are missing for getMetricSearch', function() {
            sinon.stub(cdsSubsystem, 'getCDSDB').callsFake(function(logger, dbName, initDefinitions, callback) {
                callback(null, db);
            });
            cdsMetrics.createInitDefinitions(logger)(db);

            //missing some required parameters
            paramMap = {
                metricId: metricId,
                granularity: granularity
            };
            cdsMetrics.getMetricSearch(mockReqResUtil.createRequestWithParam(paramMap), res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
    });
});
