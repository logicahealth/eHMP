'use strict';

var httpMocks = require('node-mocks-http');
var metricsInterceptor = require('./metrics');
var metrics = require('../utils/metrics/metrics');

var logger = sinon.stub(require('bunyan').createLogger({
    name: 'metrics-interceptor'
}));

describe('When metrics are collected', function() {
    var req, res, next, mockMetricsIncoming, eventMap;

    beforeEach(function() {
        req = {};
        req.logger = logger;

        var EmitEmitter = function() {
            eventMap = {};
        };
        EmitEmitter.prototype.on = function(event, listener) {
            eventMap[event] = listener;
        };
        EmitEmitter.prototype.emit = function(event) {
            eventMap[event]();
        };

        //Have to override default mock emitter to test onFinish and onClose methods called.
        res = httpMocks.createResponse({
            eventEmitter: EmitEmitter
        });

        next = sinon.spy();
        mockMetricsIncoming = sinon.stub(metrics, 'handleIncomingStart', function (req, logger) {
            return {data: 'some data'};
        });
    });

    afterEach(function() {
        mockMetricsIncoming.restore();
        next.reset();
    });

    it('metrics finished', function(done) {
        var mockMetricsFinish = sinon.stub(metrics, 'handleFinish', function (metricData, logger) {
            return;
        });

        metricsInterceptor(req, res, next);
        res.emit('finish');

        expect(mockMetricsIncoming.callCount).to.be(1);
        expect(mockMetricsFinish.callCount).to.be(1);
        expect(next.callCount).to.be(1);

        mockMetricsFinish.restore();

        done();
    });

    it('metrics closed', function(done) {
        metricsInterceptor(req, res, next);
        res.emit('close');

        expect(mockMetricsIncoming.callCount).to.be(1);
        expect(next.callCount).to.be(1);
        expect(logger.info.callCount).to.be.above(1);

        done();
    });
});
