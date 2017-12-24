'use strict';

var _ = require('lodash');
var bunyan = require('bunyan');
var rdkFrameworkMiddleware = require('./rdk-framework-middleware');
var addRdkSendToResponse = rdkFrameworkMiddleware._addRdkSendToResponse;

describe('rdkSend', function() {
    var res;
    var sentBody;
    beforeEach(function() {
        sentBody = undefined;
        res = {
            statusCode: 200,
            send: function(body) {
                sentBody = body;
                return this;
            },
            get: function() {
                return this.type;
            }
        };
        res.status = _.bind(function(code) {
            this.statusCode = code;
            return this;
        }, res);
        var app = {
            use: function(next) {
                next({}, res, function() {});
            }
        };
        addRdkSendToResponse(app);
    });

    it('wraps a string in an object with a \'message\' field', function() {
        res.rdkSend('Hello, world');
        expect(sentBody).to.eql({ message: 'Hello, world', status: 200 });
    });

    it('wraps an object in an object with a \'data\' field', function() {
        res.rdkSend({ name: 'Bob' });
        expect(sentBody).to.eql({ data: { name: 'Bob' }, status: 200 });
    });

    it('doesn\'t wrap an object that already has a \'data\' field that\'s an object', function() {
        var data = { data: { name: 'Bob' } };
        res.rdkSend(data);
        expect(sentBody).to.eql({ data: { name: 'Bob' }, status: 200 });
    });

    it('wraps an object that already has a \'data\' field that\'s not an object', function() {
        res.rdkSend({ data: 'Bob' });
        expect(sentBody).to.eql({ data: { data: 'Bob' }, status: 200 });
    });

    it('wraps an array in an object with a \'data\' field', function() {
        res.rdkSend(['one', 'two']);
        expect(sentBody).to.eql({ data: ['one', 'two'], status: 200 });
    });

    it('treats a string as an object when there\'s a Content-Type of application/json', function() {
        res.type = 'application/json';
        res.rdkSend('{"data": {}}');
        expect(sentBody).to.eql({ data: {}, status: 200 });
    });

    it('handles a JSON parse error when there\'s a Content-Type of application/json', function() {
        res.type = 'application/json';
        res.rdkSend('This is {not} JSON');
        expect(sentBody).to.eql({ message: 'This is {not} JSON', status: 200 });
    });

    it('handles an empty body', function() {
        res.rdkSend();
        expect(sentBody).to.eql({ status: 200 });
    });

    it('enforces an empty body for a 204', function() {
        res.status(204).rdkSend('hello');
        expect(sentBody).to.eql(undefined);
    });

    it('handles a null body', function() {
        res.rdkSend(null);
        expect(sentBody).to.eql({ status: 200 });
    });

    it('handles an empty body when there\'s an error', function() {
        res.status(500).rdkSend();
        expect(sentBody).to.eql({ status: 500 });
    });

    it('passes along an empty object body', function() {
        res.rdkSend({});
        expect(sentBody).to.eql({ status: 200 });
    });

    it('handles an array body', function() {
        res.rdkSend([]);
        expect(sentBody).to.eql({ status: 200, data: [] });
    });

    it('handles a message object', function() {
        res.rdkSend({ message: 'Howdy' });
        expect(sentBody).to.eql({ message: 'Howdy', status: 200 });
    });

    it('doesn\'t support an error object', function() {
        res.rdkSend({ error: 'Oops' });
        expect(sentBody).to.eql({ data: { error: 'Oops' }, status: 200 });
    });

    it('overwrites a status field with the response\'s statusCode', function() {
        res.status(500).rdkSend({ message: 'Hi', status: 303 });
        expect(sentBody).to.eql({ message: 'Hi', status: 500 });
    });

    it('overwrites a status field with a 200 statusCode by default', function() {
        res.rdkSend({ message: 'Hi', status: 303 });
        expect(sentBody).to.eql({ message: 'Hi', status: 200 });
    });

    it('sets res.data to body.data when available', function () {
        var data = { data: { name: 'Bob' } };
        res.rdkSend(data);
        expect(res.data).to.eql(data.data);
    });
});

describe('extractSessionId', function() {
    it('handles missing cookies', function() {
        var req = {};
        req.app = {};
        req.app.config = {};
        req.get = function() {};
        var sessionId = rdkFrameworkMiddleware._extractSessionId(req);
        expect(sessionId).to.be.null();
    });
    it('handles non-rdk cookies', function() {
        var req = {};
        req.app = {};
        req.app.config = {};
        req.get = function() {
            return 'CUSTOMER=WILE_E_COYOTE; PART_NUMBER=ROCKET_LAUNCHER_0001';
        };
        var sessionId = rdkFrameworkMiddleware._extractSessionId(req);
        expect(sessionId).to.be.null();
    });
    it('handles rdk cookies', function() {
        var cookieValue = 'aslkdf';
        var req = {};
        req.app = {};
        req.app.config = {};
        req.get = function() {
            return 'rdk.sid=' + cookieValue;
        };
        var sessionId = rdkFrameworkMiddleware._extractSessionId(req);
        expect(sessionId).to.equal(cookieValue);
    });
    it('handles rdk cookies with strange prefixes', function() {
        var cookieValue = 'aslkdf';
        var req = {};
        req.app = {};
        req.app.config = {};
        req.app.config.cookiePrefix = 'a!b.c?d';
        req.get = function() {
            return 'a!b.c?d.rdk.sid=' + cookieValue;
        };
        var sessionId = rdkFrameworkMiddleware._extractSessionId(req);
        expect(sessionId).to.equal(cookieValue);
    });
    it('handles rdk signed cookies', function() {
        var cookieValue = 'aslkdf';
        var req = {};
        req.app = {};
        req.app.config = {};
        req.get = function() {
            return 'rdk.sid=s:' + cookieValue + '.abc';
        };
        var sessionId = rdkFrameworkMiddleware._extractSessionId(req);
        expect(sessionId).to.equal(cookieValue);
    });
    it('handles rdk encoded cookies', function() {
        var decodedCookieValue = 'a$#2897IOJ.=_=`~>&?a';
        var encodedCookieValue = encodeURIComponent(decodedCookieValue);
        var req = {};
        req.app = {};
        req.app.config = {};
        req.get = function() {
            return 'rdk.sid=' + encodedCookieValue;
        };
        var sessionId = rdkFrameworkMiddleware._extractSessionId(req);
        expect(sessionId).to.equal(decodedCookieValue);
    });
    it('handles rdk signed encoded cookies', function() {
        var decodedCookieValue = 'a$#2897IOJ.=_=`~>&?a';
        var encodedCookieValue = encodeURIComponent(decodedCookieValue);
        var req = {};
        req.app = {};
        req.app.config = {};
        req.get = function() {
            return 'rdk.sid=s:' + encodedCookieValue + '.abc';
        };
        var sessionId = rdkFrameworkMiddleware._extractSessionId(req);
        expect(sessionId).to.equal(decodedCookieValue);
    });
    it('handles rdk missing cookies', function() {
        var req = {};
        req.app = {};
        req.app.config = {};
        req.get = function() {
            return 'rdk.sid=';
        };
        var sessionId = rdkFrameworkMiddleware._extractSessionId(req);
        expect(sessionId).to.equal('');
    });
});

describe('addRequestId', function() {
    it('sets an ID on the request object', function(done) {
        var uuidV4Regex = /^\w*-\w*-4\w*-\w*-\w*$/;
        var app = {};
        app.use = function(middleware) {
            var req = {};
            var res = {};
            res.set = function(key, value) {
                expect(key).to.equal('X-Request-ID');
                expect(value).to.match(uuidV4Regex);
            };

            function reassignId() {
                req.id = 5;
            }
            var next = function() {
                expect(req.id).to.match(uuidV4Regex);
                expect(reassignId).to.throw(/read only/);
                expect(req.id).to.match(uuidV4Regex);
                done();
            };
            middleware(req, res, next);
        };
        rdkFrameworkMiddleware._addRequestId(app);
    });
});

describe('addRequestedSessionId', function() {
    it('sets the requested session ID', function(done) {
        var app = {};
        app.config = {};
        app.use = function(middleware) {
            var req = {};
            req.app = app;
            req.get = function() {
                return 'rdk.sid=foo';
            };
            var res = {};

            function reassignRequestedSessionId() {
                req._requestedSessionId = 5;
            }
            var next = function() {
                expect(req._requestedSessionId).to.equal('foo');
                expect(reassignRequestedSessionId).to.throw(/read only/);
                expect(req._requestedSessionId).to.equal('foo');
                done();
            };
            middleware(req, res, next);
        };
        rdkFrameworkMiddleware._addRequestedSessionId(app);
    });
});

describe('addLoggerToRequest', function() {
    it('creates req.logger with requestId and sid', function(done) {
        var app = {};
        app.config = {};
        var logger = sinon.stub(bunyan.createLogger({ name: 'rdk-framework-middleware-spec' }));
        app.logger = {
            child: function(object) {
                expect(object).to.eql({
                    requestId: 'abc',
                    sid: 'foo'
                });
                return logger;
            }
        };
        app.use = function(middleware) {
            var req = {};
            _.set(req, 'app.config.rootPath', '/resource');
            req.id = 'abc';
            req.ip = '127.0.0.1';
            req._requestedSessionId = 'foo';
            var res = {};
            var next = function() {
                expect(logger.info.calledWithMatch(/New Request/)).to.be.true();
                expect(logger.debug.calledWith(sinon.match({ remote: '127.0.0.1' }))).to.be.true();
                done();
            };
            middleware(req, res, next);
        };
        rdkFrameworkMiddleware._addLoggerToRequest(app);
    });
});

describe('enableMethodOverride', function() {
    var app;
    beforeEach(function() {
        app = {};
        app.handlers = [];
        app.use = function(handler) {
            app.handlers.push(handler);
        };
        rdkFrameworkMiddleware._enableMethodOverride(app);
    });
    it('enables method overriding', function(done) {
        var req = {};
        req.method = 'POST';
        req.headers = {};
        req.headers['X-HTTP-Method-Override'.toLowerCase()] = 'GET';
        _.set(req, 'app.config.rootPath', '/resource');
        var res = {};
        res.getHeader = function() {
        };
        res.setHeader = res.getHeader;
        app.handlers[0](req, res, function() {
            expect(req.method).to.equal('GET');
            expect(req.originalMethod).to.equal('POST');
            done();
        });
    });
    it('skips method overriding for FHIR resources', function(done) {
        var req = {};
        req.path = '/resource/fhir/foo/bar';
        req.method = 'POST';
        req.headers = {};
        req.headers['X-HTTP-Method-Override'.toLowerCase()] = 'GET';
        _.set(req, 'app.config.rootPath', '/resource');
        var res = {};
        res.getHeader = function() {
        };
        res.setHeader = res.getHeader;
        var callback = function() {
            expect(req.originalMethod).to.equal(req.method);
            done();
        };
        app.handlers[0](req, res, callback);
    });
});

describe('ensureQueryMatchesBody', function() {
    var app;
    var req;
    beforeEach(function() {
        app = {};
        app.handlers = [];
        app.use = function(handler) {
            app.handlers.push(handler);
        };
        req = {};
        _.set(req, 'app.config.rootPath', '/resource');

        rdkFrameworkMiddleware._ensureQueryMatchesBody(app);
    });
    it('skips query-body comparison for FHIR resources', function(done) {
        req.path = '/resource/fhir/foo/bar';
        req.method = 'POST';
        _.set(req, 'app.config.rootPath', '/resource');
        var res = {};
        app.handlers[0](req, res, done);
    });
    it('responds error on conflicting query parameters and body fields', function(done) {
        req.method = 'GET';
        req.originalMethod = 'POST';
        req.query = {
            abc: 'abc'
        };
        req.body = {
            abc: 'def'
        };
        var res = {};
        res.status = function(status) {
            expect(status).to.equal(400);
            return this;
        };
        res.rdkSend = function(body) {
            expect(body).to.be.an.error();
            expect(body.message).to.match(/Query parameters must not conflict with body/);
            done();
        };
        app.handlers[0](req, res);
    });
    it('responds error when query parameter is not present as body field', function(done) {
        req.method = 'GET';
        req.originalMethod = 'POST';
        req.query = {
            abc: 'abc'
        };
        req.body = {
        };
        var res = {};
        res.status = function(status) {
            expect(status).to.equal(400);
            return this;
        };
        res.rdkSend = function(body) {
            expect(body).to.be.an.error();
            expect(body.message).to.match(/All query parameters must be present as body fields/);
            done();
        };
        app.handlers[0](req, res);
    });
    it('sets the query equal to the body for overridden GET methods', function(done) {
        req.method = 'GET';
        req.originalMethod = 'POST';
        req.query = {
        };
        req.body = {
            abc: 'abc'
        };
        var res = {};
        var next = function() {
            expect(req.query).to.equal(req.body);
            done();
        };
        app.handlers[0](req, res, next);
    });
    describe('doesQueryMatchBody', function() {
        beforeEach(function() {
            req.method = 'GET';
            req.originalMethod = 'POST';
        });
        function getDoesQueryMatchBodyValue(req) {
            var res = {};
            res.status = function() {
                return res;
            };
            res.rdkSend = function() {
                return false;
            };
            var next = function() {
                return true;
            };
            return app.handlers[0](req, res, next);
        }
        it('returns true for GET requests', function() {
            req.method = 'POST';
            req.originalMethod = 'GET';
            var queryMatchesBody = getDoesQueryMatchBodyValue(req);
            expect(queryMatchesBody).to.be.true();
        });
        it('returns false if a query parameter is missing in the body fields', function() {
            _.set(req, 'query.name', 'john');
            _.set(req, 'body', {});
            var queryMatchesBody = getDoesQueryMatchBodyValue(req);
            expect(queryMatchesBody).to.be.false();
        });
        it('returns false if a query parameter is different from the body field', function() {
            _.set(req, 'query.name', 'john');
            _.set(req, 'body.name', 'doe');
            var queryMatchesBody = getDoesQueryMatchBodyValue(req);
            expect(queryMatchesBody).to.be.false();
        });
        it('returns true if a body field is not in the query parameter', function() {
            _.set(req, 'body.name', 'doe');
            var queryMatchesBody = getDoesQueryMatchBodyValue(req);
            expect(queryMatchesBody).to.be.true();
        });
        it('returns true if there are no query parameters or body fields', function() {
            _.set(req, 'query', {});
            _.set(req, 'body', {});
            var queryMatchesBody = getDoesQueryMatchBodyValue(req);
            expect(queryMatchesBody).to.be.true();
        });
        it('returns true if the query parameters match the body fields', function() {
            _.set(req, 'query.name', 'john');
            _.set(req, 'body.name', 'john');
            var queryMatchesBody = getDoesQueryMatchBodyValue(req);
            expect(queryMatchesBody).to.be.true();
        });
        it('returns true if complex query parameters match the body fields', function() {
            _.set(req, 'query', {
                items: [
                    'foo',
                    'bar',
                    '2',
                    '3'
                ]
            });
            _.set(req, 'body', {
                items: [
                    'foo',
                    'bar',
                    2,
                    3
                ]
            });
            var queryMatchesBody = getDoesQueryMatchBodyValue(req);
            expect(queryMatchesBody).to.be.true();
        });
        it('returns false if complex query parameters do not match the body fields', function() {
            _.set(req, 'query', {
                items: [
                    'foo',
                    'bar',
                    '2',
                    '3'
                ]
            });
            _.set(req, 'body', {
                items: [
                    'foo',
                    3
                ]
            });
            var queryMatchesBody = getDoesQueryMatchBodyValue(req);
            expect(queryMatchesBody).to.be.false();
        });
        it('returns true if complex query parameters do not match the body fields', function() {
            _.set(req, 'query', {
                items: [
                    'foo',
                    'bar',
                    '2',
                    {
                        a: '1',
                        b: '2'
                    },
                    '3'
                ]
            });
            _.set(req, 'body', {
                items: [
                    'foo',
                    'bar',
                    2,
                    {
                        b: '2',
                        a: 1
                    },
                    3
                ]
            });
            var queryMatchesBody = getDoesQueryMatchBodyValue(req);
            expect(queryMatchesBody).to.be.true();
        });
    });
});
