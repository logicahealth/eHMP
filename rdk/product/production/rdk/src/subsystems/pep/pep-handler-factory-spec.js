'use strict';

var rdk = require('../../core/rdk');
var httpMocks = require('node-mocks-http');
var handlerFactory = require('./pep-handler-factory');

describe('When pep-handler-factory is called', function() {
    var req;
    var res;
    var callback;
    beforeEach(function(done) {
        req = {};
        req._resourceConfigItem = {};
        req._resourceConfigItem.requiredPermissions = [];
        req._resourceConfigItem.isPatientCentric = false;
        req.logger = sinon.stub(require('bunyan').createLogger(
            {name: 'validate-response-format-spec.js'}
        ));
        req.session = {};
        req.session.user = {
            uid: 'read-access',
            label: 'Read Access',
            permissions: []
        };
        callback = sinon.spy();
        res = httpMocks.createResponse();

        done();
    });

    afterEach(function(done) {
        callback.reset();

        done();
    });

    it('with no permissions, not patient centric, no asu actions', function(done){
        var handlers = handlerFactory.build(req);

        expect(handlers).must.be.empty();

        done();
    });


    it('with an empty permissions array', function(done) {
        var handlers = handlerFactory.build(req);

        expect(handlers).must.be.empty();

        done();
    });

    it('with some permissions', function(done) {
        req._resourceConfigItem.requiredPermissions = ['some-blank-permission'];

        var handlers = handlerFactory.build(req);

        expect(handlers).must.not.be.empty();
        expect(handlers).must.have.length(1);
        expect(handlers[0]).must.be.a.function();

        done();
    });

    it('as not Patient Centric', function(done) {
        var handlers = handlerFactory.build(req);

        expect(handlers).must.be.empty();

        done();
    });

    it('as Patient Centric', function(done) {
        req._resourceConfigItem.isPatientCentric = true;

        var handlers = handlerFactory.build(req);

        expect(handlers).must.not.be.empty();
        expect(handlers).must.have.length(1);
        expect(handlers[0]).must.be.a.function();

        done();
    });

    it('without an asu action', function(done) {
        var handlers = handlerFactory.build(req);

        expect(handlers).must.be.empty();

        done();
    });


    it('with a asu action', function(done) {
        req._resourceConfigItem.requiredASUActions = ['DELETE RECORD'];

        var handlers = handlerFactory.build(req);

        expect(handlers).must.not.be.empty();
        expect(handlers).must.have.length(1);
        expect(handlers[0]).must.be.a.function();

        done();
    });


    it('with no permissions, not patient centric, no asu actions', function(done){
        var handlers = handlerFactory.build(req);

        expect(handlers).must.be.empty();

        done();
    });

    it('with permissions, patient centric, an asu action', function(done){
        req._resourceConfigItem.isPatientCentric = true;
        req._resourceConfigItem.requiredPermissions = ['some-blank-permission'];
        req._resourceConfigItem.requiredASUActions = ['DELETE RECORD'];

        var handlers = handlerFactory.build(req);

        expect(handlers).must.not.be.empty();
        expect(handlers).must.have.length(3);
        expect(handlers[0]).must.be.a.function();
        expect(handlers[1]).must.be.a.function();
        expect(handlers[2]).must.be.a.function();

        done();
    });
});