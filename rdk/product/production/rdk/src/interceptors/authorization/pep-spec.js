'use strict';

var httpMocks = require('node-mocks-http');
var pep = require('./pep');
var PepSubsystem = require('../../subsystems/pep/pep-subsystem');

var logger = sinon.stub(require('bunyan').createLogger({
    name: 'pep'
}));

describe('Verify PepMetrics', function() {
    it('created with valid values', function() {
        var pepMetrics = new pep._PepMetrics('method', 'url');

        expect(pepMetrics.start).must.be.a.number();
        expect(pepMetrics.path).to.be('method url');
    });
    it('calculates elapsed time', function() {
        var pepMetrics = new pep._PepMetrics('method', 'url');
        pepMetrics.stop();

        expect(pepMetrics.end).must.be.a.number();
        expect(pepMetrics.elapsedMilliseconds).must.be.a.number();
        expect(pepMetrics.elapsedMilliseconds).must.be.above(-1);
    });
});

describe('Verify pep is disabled', function() {
    it('when pep.disabled equals true', function() {
        expect(pep._isDisabled({interceptors: {pep: {disabled: true}}})).to.be.true();
    });
});

describe('Verify pep is not disabled', function() {
    it('when pep is not in config', function() {
        expect(pep._isDisabled({})).to.be.false();
        expect(pep._isDisabled({interceptors: {}})).to.be.false();
    });
    it('when pep.disabled equals fasle', function() {
        expect(pep._isDisabled({interceptors: {pep: {disabled: false}}})).to.be.false();
    });
});

/*describe('Verify user does not have correct permissions', function() {
    it('when user permission are not defined', function() {
        expect(pep._checkUserPermissions(['read'], undefined, logger)).to.be.false();
    });
    it('when resource requires a permission and user does not have', function() {
        expect(pep._checkUserPermissions(['read'], [], logger)).to.be.false();
    });
    it('when resource requires multiple permission and user has only one', function() {
        expect(pep._checkUserPermissions(['read, write'], ['read'], logger)).to.be.false();
    });
    it('when resource requires multiple permission and user has wrong ones', function() {
        expect(pep._checkUserPermissions(['read', 'write'], ['delete', 'update'], logger)).to.be.false();
    });
});

describe('Verify  user does have correct permissions', function() {
    it('when resource does not require a permission', function() {
        expect(pep._checkUserPermissions([], ['read'], logger)).to.be.true();
    });
    it('when resource does not require a permission and user permissions are not set', function() {
        expect(pep._checkUserPermissions([], [], logger)).to.be.true();
    });
    it('when one permission is expected', function() {
        expect(pep._checkUserPermissions(['read'], ['read'], logger)).to.be.true();
    });
    it('when multiple permissions are expected', function() {
        expect(pep._checkUserPermissions(['read', 'write'], ['read', 'write'], logger)).to.be.true();
    });
    it('when resource permission is not defined', function() {
        expect(pep._checkUserPermissions(undefined, [], logger)).to.be.true();
    });
});*/

describe('Verify pep interceptor', function() {
    var req, mockPepSubsystem, next, res, spyStatus;

    beforeEach(function(done) {
        req = {};
        req.logger = logger;
        req.audit = {sensitive: 'false'};
        req.session = {user: {permissions: []}};
        req._resourceConfigItem = {permissions: []};
        req.method = 'method';
        req.originalUrl = 'url';
        req.app = {config: {interceptors: {pep: {disabled: false}}}};

        next = sinon.spy();
        res = httpMocks.createResponse();
        spyStatus = sinon.spy(res, 'status');

        mockPepSubsystem = sinon.stub(PepSubsystem, 'execute', function (req, res, callback) {
            return callback();
        });

        done();
    });

    afterEach(function(done) {
        mockPepSubsystem.restore();
        next.reset();
        spyStatus.reset();

        done();
    });

    it('skipped pep interceptor if disabled', function(done) {
        req.app.config.interceptors.pep.disabled = true;

        pep(req, res, next);

        expect(next.callCount).to.be(1);
        expect(mockPepSubsystem.callCount).to.be(0);

        done();
    });

    /*it('fails if user does not have required permissions', function(done) {
        req._resourceConfigItem.permissions = ['read'];

        function tester() {
            expect(spyStatus.withArgs(403).called).to.be.true();
            done();
        }
        res.rdkSend = tester;

        pep(req, res, next);
    });*/

    it('called successfully', function(done) {
        pep(req, res, next);

        expect(next.callCount).to.be(1);
        expect(mockPepSubsystem.callCount).to.be(1);

        done();
    });
});
