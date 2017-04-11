'use strict';

var httpMocks = require('node-mocks-http');
var pep = require('./pep');
var PepSubsystem = require('../../subsystems/pep/pep-subsystem');

var logger = sinon.stub(require('bunyan').createLogger({
    name: 'pep'
}));

describe('Verify pep is disabled', function() {
    it('when pep.disabled equals true', function() {
        expect(pep._isDisabled({
            interceptors: {
                pep: {
                    disabled: true
                }
            }
        })).to.be.true();
    });
});

describe('Verify pep is not disabled', function() {
    it('when pep is not in config', function() {
        expect(pep._isDisabled({})).to.be.false();
        expect(pep._isDisabled({
            interceptors: {}
        })).to.be.false();
    });
    it('when pep.disabled equals fasle', function() {
        expect(pep._isDisabled({
            interceptors: {
                pep: {
                    disabled: false
                }
            }
        })).to.be.false();
    });
});

describe('Verify pep interceptor', function() {
    var req, mockPepSubsystem, next, res, spyStatus;

    beforeEach(function(done) {
        req = {};
        req.logger = logger;
        req.audit = {
            sensitive: 'false'
        };
        req.session = {
            user: {
                permissions: []
            }
        };
        req._resourceConfigItem = {
            permissions: []
        };
        req.method = 'method';
        req.originalUrl = 'url';
        req.app = {
            config: {
                interceptors: {
                    pep: {
                        disabled: false
                    }
                }
            }
        };

        next = sinon.spy();
        res = httpMocks.createResponse();
        spyStatus = sinon.spy(res, 'status');

        mockPepSubsystem = sinon.stub(PepSubsystem, 'execute', function(req, res, callback) {
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

    it('called successfully', function(done) {
        pep(req, res, next);

        expect(next.callCount).to.be(1);
        expect(mockPepSubsystem.callCount).to.be(1);

        done();
    });
});
