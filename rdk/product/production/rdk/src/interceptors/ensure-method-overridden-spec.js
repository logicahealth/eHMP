'use strict';

var ensureMethodOverridden = require('./ensure-method-overridden');

describe('ensure-method-overridden', function() {
    it('returns an error code if a GET resource was not overridden', function(done) {
        var req = {};
        req.originalMethod = 'GET';
        req.method = 'GET';
        var res = {};
        res.status = function(code) {
            expect(code).to.equal(400);
            return res;
        };
        res.rdkSend = function(body) {
            expect(body).to.be.an.error();
            expect(body).to.match(/This resource must be accessed with a POST request/);
            expect(body).to.match(/X-HTTP-Method-Override: GET/);
            done();
        };
        ensureMethodOverridden(req, res);
    });
    it('returns an error code if a PUT resource was not overridden', function(done) {
        var req = {};
        req.originalMethod = 'PUT';
        req.method = 'PUT';
        var res = {};
        res.status = function(code) {
            expect(code).to.equal(400);
            return res;
        };
        res.rdkSend = function(body) {
            expect(body).to.be.an.error();
            expect(body).to.match(/This resource must be accessed with a POST request/);
            expect(body).to.match(/X-HTTP-Method-Override: PUT/);
            done();
        };
        ensureMethodOverridden(req, res);
    });
    it('returns an error code if a DELETE resource was not overridden', function(done) {
        var req = {};
        req.originalMethod = 'DELETE';
        req.method = 'DELETE';
        var res = {};
        res.status = function(code) {
            expect(code).to.equal(400);
            return res;
        };
        res.rdkSend = function(body) {
            expect(body).to.be.an.error();
            expect(body).to.match(/This resource must be accessed with a POST request/);
            expect(body).to.match(/X-HTTP-Method-Override: DELETE/);
            done();
        };
        ensureMethodOverridden(req, res);
    });
    it('returns an error code if a PATCH resource was not overridden', function(done) {
        var req = {};
        req.originalMethod = 'PATCH';
        req.method = 'PATCH';
        var res = {};
        res.status = function(code) {
            expect(code).to.equal(400);
            return res;
        };
        res.rdkSend = function(body) {
            expect(body).to.be.an.error();
            expect(body).to.match(/This resource must be accessed with a POST request/);
            expect(body).to.match(/X-HTTP-Method-Override: PATCH/);
            done();
        };
        ensureMethodOverridden(req, res);
    });
    it('returns an error code if an unknown method resource was not overridden', function(done) {
        var req = {};
        req.originalMethod = 'CUSTOM';
        req.method = 'CUSTOM';
        var res = {};
        res.status = function(code) {
            expect(code).to.equal(400);
            return res;
        };
        res.rdkSend = function(body) {
            expect(body).to.be.an.error();
            expect(body).to.match(/This resource must be accessed with a POST request/);
            expect(body).to.match(/X-HTTP-Method-Override/);
            done();
        };
        ensureMethodOverridden(req, res);
    });
    it('continues running handlers if the resource was overridden', function(done) {
        var req = {};
        req.originalMethod = 'POST';
        req.method = 'GET';
        var res = {};
        var next = function() {
            done();
        };
        ensureMethodOverridden(req, res, next);
    });
});
