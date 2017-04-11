'use strict';

var metrics = require('./metrics/metrics');
var util = require('util');
var nock = require('nock');
var _ = require('lodash');
var httpUtil = require('./http');

var logger = {
    trace: function() {this.log('trace', arguments);},
    debug: function() {this.log('debug', arguments);},
    info: function() {this.log('info', arguments);},
    warn: function() {this.log('warn', arguments);},
    error: function() {this.log('error', arguments);},
    fatal: function() {this.log('fatal', arguments);},

    logged: {},
    log: function(level, args) {
        if (!this.logged[level]) {
            this.logged[level] = '';
        } else {
            this.logged[level] += '\n';
        }
        this.logged[level] += util.format.apply(null, _.slice(args));
    },
    reset: function() {
        this.logged = {};
    }
};

describe('http', function() {

    beforeEach(function() {
        nock.cleanAll();
        nock.disableNetConnect();
        logger.reset();
    });

    describe('initializeTimeout', function() {
        var timeout;
        var requestLogger;

        beforeEach(function() {
            timeout = undefined;
            requestLogger = undefined;
            sinon.stub(metrics, 'handleOutgoingStart', function(options, log) {
                timeout = options.timeout;
                requestLogger = log;
            });
        });

        it('should use the default timeout if not initialized', function() {
            httpUtil.get({url: 'http://localhost', logger: logger}, function(){});
            expect(timeout).to.equal(120000);
        });

        it('should replace the default timeout when initialized', function() {
            httpUtil.initializeTimeout(5000);
            httpUtil.get({url: 'http://localhost', logger: logger}, function(){});
            expect(timeout).to.equal(5000);
        });

        it('should override the default timeout with request options', function() {
            httpUtil.initializeTimeout(5000);
            httpUtil.get({url: 'http://localhost', logger: logger, timeout: 2000}, function(){});
            expect(timeout).to.equal(2000);
        });
    });

    describe('logger', function() {
        it('should be required in the options', function(done) {
            httpUtil.get({url: 'http://localhost'}, function(error) {
                expect(error).to.be.truthy();
                done();
            });
        });
    });

    describe('successful request', function() {

        beforeEach(function() {
            this.timeout(1000);
            nock('http://localhost')
                .get('/info')
                .reply(200, 'Hello World');
            nock('http://localhost')
                .post('/post')
                .reply(200, 'Posted');
            nock('http://localhost')
                .put('/put')
                .reply(200, 'Putted across the green');
            nock('http://localhost')
                .delete('/delete')
                .reply(200, 'Deleted');
            nock('http://localhost')
                .head('/head')
                .reply(200, 'Headed');
        });

        it('should support a missing callback', function() {
            httpUtil.get({url: 'http://localhost/info', logger: logger});
        });

        it('should handle a successful GET', function(done) {
            httpUtil.get({url: 'http://localhost/info', logger: logger}, function(error, response, body) {
                expect(error).to.be.falsy();
                expect(body).to.equal('Hello World');
                expect(response.statusCode).to.equal(200);
                done();
            });
        });

        it('should handle a successful POST', function(done) {
            httpUtil.post({url: 'http://localhost/post', logger: logger}, function(error, response, body) {
                expect(error).to.be.falsy();
                expect(body).to.equal('Posted');
                expect(response.statusCode).to.equal(200);
                done();
            });
        });

        it('should handle a successful PUT', function(done) {
            httpUtil.put({url: 'http://localhost/put', logger: logger}, function(error, response, body) {
                expect(error).to.be.falsy();
                expect(body).to.equal('Putted across the green');
                expect(response.statusCode).to.equal(200);
                done();
            });
        });

        it('should handle a successful DELETE', function(done) {
            httpUtil.delete({url: 'http://localhost/delete', logger: logger}, function(error, response, body) {
                expect(error).to.be.falsy();
                expect(body).to.equal('Deleted');
                expect(response.statusCode).to.equal(200);
                done();
            });
        });

        it('should handle a successful direct call', function(done) {
            httpUtil({method: 'HEAD', url: 'http://localhost/head', logger: logger}, function(error, response, body) {
                expect(error).to.be.falsy();
                expect(body).to.equal('Headed');
                expect(response.statusCode).to.equal(200);
                done();
            });
        });
    });

    describe('unsuccessful request', function() {

        beforeEach(function() {
            this.timeout(1000);
            httpUtil.initializeTimeout(5000);
            nock('http://localhost')
                .get('/info')
                .reply(500, 'Sorry, Bub');
            nock('http://localhost')
                .get('/timeout')
                .socketDelay(10000)
                .reply(500, 'Timeout');
        });

        it('should handle a unsuccessful GET', function(done) {
            httpUtil.get({url: 'httpx://localhost/noreply', logger: logger}, function(error) {
                expect(error).to.be.truthy();
                done();
            });
        });

        it('should handle a GET that times out', function(done) {
            httpUtil.get({url: 'http://localhost/timeout', logger: logger}, function(error) {
                expect(error).to.be.truthy();
                expect(logger.logged.warn).to.not.be.null();
                expect(logger.logged.warn).to.match(/Timed out/m);
                done();
            });
        });

        it('should error when the method doesn\'t match', function(done) {
            httpUtil.get({url: 'http://localhost/timeout', method: 'POST', logger: logger}, function(error) {
                expect(error).to.be.truthy();
                done();
            });
        });
    });

    describe('JSON', function() {
        var config;

        beforeEach(function() {
            this.timeout(1000);
            config = {
                url: 'http://localhost/json',
                logger: logger,
                body: {test: 'test'}
            };
        });

        it('returns a string when the request body is a string', function(done) {
            config.body = JSON.stringify(config.body);
            nock('http://localhost')
                .filteringRequestBody(function() {
                    return '*';
                })
                .post('/json', '*')
                .reply(200, '{"result": "success"}');

            httpUtil.post(config, function(error, response, body) {
                expect(error).to.be.falsy();
                expect(typeof(body)).to.equal('string');
                expect(body).to.equal('{"result": "success"}');
                done();
            });
        });

        it('returns an object when the request body is an object', function(done) {
            nock('http://localhost')
                .matchHeader('content-type', 'application/json')
                .matchHeader('content-length', 15)
                .filteringRequestBody(function() {
                    return '*';
                })
                .post('/json', '*')
                .reply(200, '{"result": "success"}');

            httpUtil.post(config, function(error, response, body) {
                expect(error).to.be.falsy();
                expect(typeof(body)).to.equal('object');
                expect(body).to.eql({result: 'success'});
                done();
            });
        });
    });

    describe('metrics', function() {
        var start, error, finish;

        beforeEach(function() {
            start = false;
            error = false;
            finish = false;
            sinon.stub(metrics, 'handleOutgoingStart', function() {
                start = true;
            });
            sinon.stub(metrics, 'handleError', function() {
                error = true;
            });
            sinon.stub(metrics, 'handleFinish', function() {
                finish = true;
            });
            nock('http://localhost')
                .get('/info')
                .reply(200, 'Hello World');
        });

        it('should run metrics for a successful request', function(done) {
            httpUtil.get({url: 'http://localhost/info', logger: logger}, function() {
                expect(start).to.be.true();
                expect(finish).to.be.true();
                expect(error).to.be.false();
                done();
            });
        });

        it('should run metrics for an unsuccessful request', function(done) {
            httpUtil.get({url: 'httpx://localhost/info', logger: logger}, function() {
                expect(start).to.be.true();
                expect(finish).to.be.false();
                expect(error).to.be.true();
                done();
            });
        });
    });

    xdescribe('caching', function() {
        var config, start, finish;

        beforeEach(function() {
            config = {
                url: 'http://localhost/info',
                logger: logger,
                cacheTimeout: true
            };
            start = 0;
            finish = 0;
            sinon.stub(metrics, 'handleOutgoingStart', function() {
                start++;
            });
            sinon.stub(metrics, 'handleFinish', function() {
                finish++;
            });
            nock('http://localhost')
                .get('/info')
                .twice()
                .reply(200, 'Hello World');
        });

        it('should cache subsequent calls when cacheTimeout is specified', function(done) {
            httpUtil.get(config, function() {
                httpUtil.get(config, function() {
                    expect(start).to.equal(1);
                    expect(finish).to.equal(1);
                    done();
                });
            });
        });

        it('should repeat subsequent calls when not caching', function(done) {
            delete config.cacheTimeout;
            httpUtil.get(config, function() {
                httpUtil.get(config, function() {
                    expect(start).to.equal(2);
                    expect(finish).to.equal(2);
                    done();
                });
            });
        });
    });
});
