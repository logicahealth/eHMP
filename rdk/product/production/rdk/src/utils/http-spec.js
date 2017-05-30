'use strict';

var metrics = require('./metrics/metrics');
var util = require('util');
var nock = require('nock');
var _ = require('lodash');
var httpUtil = require('./http');
var fs = require('fs');
var bunyan = require('bunyan');


var logger = {
    trace: function() {this.log('trace', arguments);},
    debug: function() {this.log('debug', arguments);},
    info: function() {this.log('info', arguments);},
    warn: function() {this.log('warn', arguments);},
    error: function() {this.log('error', arguments);},
    fatal: function() {this.log('fatal', arguments);},

    fields: {},
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

    describe('request context', function() {
        var config;

        beforeEach(function() {
            this.timeout(1000);
            config = {
                url: 'http://localhost/info',
                logger: bunyan.createLogger({name: 'http-spec.js', level: 99})
            };
            // level 99 should prevent logs from being written
        });

        it('adds an X-Request-ID header when present in the logger', function(done) {
            config.logger = config.logger.child({requestId: 'test-request-ID'});

            nock('http://localhost')
                .matchHeader('X-Request-ID', 'test-request-ID')
                .get('/info')
                .reply(200, 'Hello World');

            httpUtil.get(config, function(error, response, body) {
                expect(error).to.be.falsy();
                done();
            });
        });

        it('preserves a custom-added X-Request-ID header in the options', function(done) {
            config.logger = config.logger.child({requestId: 'test-request-ID'});
            config.headers = { 'X-Request-ID': 'original-request-ID' };

            nock('http://localhost')
                .matchHeader('X-Request-ID', 'original-request-ID')
                .get('/info')
                .reply(200, 'Hello World');

            httpUtil.get(config, function(error, response, body) {
                expect(error).to.be.falsy();
                done();
            });
        });

        it('doesn\'t add an X-Request-ID header when not in the options', function(done) {
            nock('http://localhost', { badheaders: ['X-Request-ID'] })
                .get('/info')
                .reply(200, 'Hello World');

            httpUtil.get(config, function(error, response, body) {
                expect(error).to.be.falsy();
                done();
            });
        });

        it('adds an X-Session-ID header when present in the logger', function(done) {
            config.logger = config.logger.child({sid: 'test-session-ID'});

            nock('http://localhost')
                .matchHeader('X-Session-ID', 'test-session-ID')
                .get('/info')
                .reply(200, 'Hello World');

            httpUtil.get(config, function(error, response, body) {
                expect(error).to.be.falsy();
                done();
            });
        });

        it('preserves a custom-added X-Session-ID header in the options', function(done) {
            config.logger = config.logger.child({sid: 'test-session-ID'});
            config.headers = { 'X-Session-ID': 'original-session-ID' };

            nock('http://localhost')
                .matchHeader('X-Session-ID', 'original-session-ID')
                .get('/info')
                .reply(200, 'Hello World');

            httpUtil.get(config, function(error, response, body) {
                expect(error).to.be.falsy();
                done();
            });
        });

        it('doesn\'t add an X-Session-ID header when not in the options', function(done) {
            nock('http://localhost', { badheaders: ['X-Session-ID'] })
                .get('/info')
                .reply(200, 'Hello World');

            httpUtil.get(config, function(error, response, body) {
                expect(error).to.be.falsy();
                done();
            });
        });

        it('adds X-Session-ID and X-Request-ID headers when present in the logger', function(done) {
            config.logger = config.logger.child({requestId: 'test-request-ID', sid: 'test-session-ID'});

            nock('http://localhost')
                .matchHeader('X-Session-ID', 'test-session-ID')
                .matchHeader('X-Request-ID', 'test-request-ID')
                .get('/info')
                .reply(200, 'Hello World');

            httpUtil.get(config, function(error, response, body) {
                expect(error).to.be.falsy();
                done();
            });
        });

        it('preserves custom-added X-Session-ID and X-Request-ID headers in the options', function(done) {
            config.logger = config.logger.child({requestId: 'test-request-ID', sid: 'test-session-ID'});
            config.headers = {
                'X-Session-ID': 'original-session-ID',
                'X-Request-ID': 'original-request-ID'
            };

            nock('http://localhost')
                .matchHeader('X-Session-ID', 'original-session-ID')
                .matchHeader('X-Request-ID', 'original-request-ID')
                .get('/info')
                .reply(200, 'Hello World');

            httpUtil.get(config, function(error, response, body) {
                expect(error).to.be.falsy();
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

    describe('certificates', function() {
        var options;
        var certificate = new Buffer('---BEGIN CERTIFICATE---\nhello world\n---END CERTIFICATE---\n');
        var key = new Buffer('---BEGIN KEY---\nhello world\n---END KEY---\n');

        beforeEach(function() {
            options = {};
            sinon.stub(fs, 'readFile', function(file, callback) {
                if (/\.key$/.test(file)) {
                    return callback(null, key);
                }
                return callback(null, certificate);
            });
        });

        it('replaces certificate file paths with their contents', function() {
            options.key = '/tmp/helloWorld.key';
            options.cert = '/tmp/helloWorld.crt';
            options.pfx = '/tmp/helloWorld.pfx';
            options.ca = '/tmp/helloWorld.ca';
            options.agentOptions = {};
            options.agentOptions.key = '/tmp/helloWorld.key';
            options.agentOptions.cert = '/tmp/helloWorld.crt';
            options.agentOptions.pfx = '/tmp/helloWorld.pfx';
            options.agentOptions.ca = '/tmp/helloWorld.ca';
            var callback = sinon.spy();
            httpUtil._withCertificates(next, options, callback);
            function next(options, callback) {
                expect(callback.callCount).to.equal(0);
                expect(options).to.eql({
                    key: key,
                    cert: certificate,
                    pfx: certificate,
                    ca: certificate,
                    agentOptions: {
                        key: key,
                        cert: certificate,
                        pfx: certificate,
                        ca: certificate
                    }
                });
            }
        });

        it('preserves the value of certificates that are not file paths', function() {
            options.key = key;
            options.cert = '---BEGIN CERTIFICATE---\ncert\n---END CERTIFICATE---';
            options.pfx = new Buffer([0x30, 0x82, 0x9, 0x50, 0x2, 0x1, 0x3, 0x30, 0x82, 0x9, 0x1a]);
            options.ca = '/tmp/helloWorld.ca';
            options.agentOptions = {};
            options.agentOptions.key = new Buffer([0x30, 0x82, 0x4, 0xa4, 0x2, 0x1, 0x0, 0x2, 0x82, 0x1, 0x1]);
            options.agentOptions.cert = options.cert;
            options.agentOptions.pfx = new Buffer([0x30, 0x82, 0x9, 0x50, 0x2, 0x1, 0x3, 0x30, 0x82, 0x9, 0x1a]);
            options.agentOptions.ca = '/tmp/helloWorld.ca';
            var callback = sinon.spy();
            httpUtil._withCertificates(next, options, callback);
            function next(resultOptions, callback) {
                expect(callback.callCount).to.equal(0);
                expect(resultOptions).to.eql({
                    key: key,
                    cert: options.cert,
                    pfx: options.pfx,
                    ca: certificate,
                    agentOptions: {
                        key: options.agentOptions.key,
                        cert: options.cert,
                        pfx: options.agentOptions.pfx,
                        ca: certificate
                    }
                });
            }
        });

        it('handles arrays of certificate authority certificates', function() {
            options.key = key;
            options.cert = '---BEGIN CERTIFICATE---\ncert\n---END CERTIFICATE---';
            options.ca = [
                '/tmp/helloWorld.ca',
                options.cert,
                new Buffer([0x30, 0x82, 0x5, 0xb5, 0x30, 0x82, 0x03, 0x9d, 0xa0, 0x3, 0x2, 0x1, 0x2, 0x2, 0x9])
            ];
            options.agentOptions = {};
            options.agentOptions.ca = [
                options.cert,
                new Buffer([0x30, 0x82, 0x5, 0xb5, 0x30, 0x82, 0x03, 0x9d, 0xa0, 0x3, 0x2, 0x1, 0x2, 0x2, 0x9]),
                '/tmp/helloWorld.ca'
            ];
            var callback = sinon.spy();
            httpUtil._withCertificates(next, options, callback);
            function next(resultOptions, callback) {
                expect(callback.callCount).to.equal(0);
                expect(resultOptions).to.eql({
                    key: key,
                    cert: options.cert,
                    ca: [
                        certificate,
                        options.ca[1],
                        options.ca[2]
                    ],
                    agentOptions: {
                        ca: [
                            options.agentOptions.ca[0],
                            options.agentOptions.ca[1],
                            certificate
                        ]
                    }
                });
            }
        });

    });

    describe.skip('caching', function() {
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
