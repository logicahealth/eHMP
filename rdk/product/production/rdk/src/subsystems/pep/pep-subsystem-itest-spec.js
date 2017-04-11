'use strict';

var httpMocks = require('node-mocks-http');
var pepFactory = require('./pep-handler-factory');
var pepSubsystem = require('./pep-subsystem');

describe('When pep subsystem is called', function() {
    var req, res, callback, mockPolicyHandler, mockPermissionHandler;

    beforeEach(function(done) {
        req = {
            interceptorResults: {
                patientIdentifiers: {
                    originalID: ''
                }
            },
            logger: {},
            audit: {
                sensitive: false
            },
            app: {
                config: {
                    jdsServer:{
                        'baseURL': 'http://10.2.2.110:9080'
                    }
                }
            }
        };
        req._resourceConfigItem = {
            isPatientCentric: false,
            requiredPermissions: []
        };
        req.session = {
            user: {
                permissionSets: [{
                    label: 'Read Access',
                    val: 'read-access'
                }],
                permissions: ['read-generic-permission']
            }
        };
        req.logger.info = function(){};
        req.logger.error = function(){};
        req.logger.debug = function(){};

        callback = sinon.spy();
        res = httpMocks.createResponse();


        mockPolicyHandler = sinon.spy(pepFactory.handlers.policy, 'handler');

        mockPermissionHandler = sinon.spy(pepFactory.handlers.permission, 'handler');

        done();
    });

    afterEach(function(done) {

        done();
    });

    it('with patientcentric false and requiredPermissions empty the policy and permissions handlers are skipped', function(done) {
        pepSubsystem.execute(req, res, callback);

        expect(mockPolicyHandler.callCount).to.be(0);
        expect(mockPermissionHandler.callCount).to.be(0);
        expect(callback.callCount).to.be(1);

        done();
    });

    it('with patientcentric true and requiredPermissions empty the policy handler is run and permissions handler is skipped', function(done) {
        req._resourceConfigItem.isPatientCentric = true;
        req.interceptorResults.patientIdentifiers.originalID = '9E7A;10';

        pepSubsystem.execute(req, res, callback);

        expect(mockPolicyHandler.callCount).to.be(1);
        expect(mockPermissionHandler.callCount).to.be(0);
        expect(callback.callCount).to.be(1);

        done();
    });

    it('with patientcentric false and requiredPermissions not empty the policy handler is skipped and permissions handler is run', function(done) {
        req._resourceConfigItem.requiredPermissions = ['read-generic-permission'];

        pepSubsystem.execute(req, res, callback);

        expect(mockPolicyHandler.callCount).to.be(0);
        expect(mockPermissionHandler.callCount).to.be(1);
        expect(callback.callCount).to.be(1);

        done();
    });

    it('with patientcentric true and requiredPermissions not empty the policy and permissions handlers are run', function(done) {
        req._resourceConfigItem.isPatientCentric = true;
        req.interceptorResults.patientIdentifiers.originalID = '9E7A;10';
        req._resourceConfigItem.requiredPermissions = ['read-generic-permission'];

        pepSubsystem.execute(req, res, callback);

        expect(mockPolicyHandler.callCount).to.be(1);
        expect(mockPermissionHandler.callCount).to.be(1);
        expect(callback.callCount).to.be(1);

        done();
    });

    it('with policy and permission handlers and permission handler calls back with an error', function(done) {
        req._resourceConfigItem.isPatientCentric = true;
        req.interceptorResults.patientIdentifiers.originalID = '9E7A;10';
        req._resourceConfigItem.requiredPermissions = ['read-explicit-permission'];

        pepSubsystem.execute(req, res, callback);

        var args = callback.getCall(0).args;

        expect(mockPolicyHandler.callCount).to.be(1);
        expect(mockPermissionHandler.callCount).to.be(1);
        expect(callback.callCount).to.be(1);
        expect(args[0]).should.be.an('object');

        done();
    });
});
