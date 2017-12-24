'use strict';

var rpcUtil = require('../../utils/rpc-config');
var RpcClient = require('vista-js').RpcClient;
var _ = require('lodash');
var builder = require('./user-policy-builder');

var logger = sinon.stub(require('bunyan').createLogger({
    name: 'user-policy-builder'
}));

describe('Create a user policy', function() {
    var defaultPolicy = {
        breakglass: false,
        consumerType: undefined,
        rptTabs: false,
        corsTabs: false,
        dgRecordAccess: false,
        dgSensitiveAccess: false,
        sensitive: false,
        hasSSN: true,
        requestingOwnRecord: false,
        site: '',
        isPublicEndpoint: false
    };

    it('when session user is undefined', function() {
        var policy = builder._buildUserPolicy({
            logger: logger
        });
        expect(policy).must.eql(defaultPolicy);

        policy = builder._buildUserPolicy({
            logger: logger,
            session: {}
        });
        expect(policy).must.eql(defaultPolicy);

        policy = builder._buildUserPolicy({
            logger: logger,
            session: {
                user: {}
            }
        });
        expect(policy).must.eql(defaultPolicy);
    });

    it('when session user has no values', function() {
        var policy = builder._buildUserPolicy({
            logger: logger,
            session: {
                user: {}
            }
        });
        expect(policy).must.eql(defaultPolicy);
    });

    it('when session user has true values', function() {
        var policy = builder._buildUserPolicy({
            logger: logger,
            session: {
                user: {
                    rptTabs: true,
                    corsTabs: 'True',
                    dgRecordAccess: 'TRUE',
                    dgSensitiveAccess: 'true',
                    consumerType: undefined,
                    site: ''
                }
            }
        });

        var enabledPolicy = _.clone(defaultPolicy);
        enabledPolicy.rptTabs = true;
        enabledPolicy.corsTabs = true;
        enabledPolicy.dgRecordAccess = true;
        enabledPolicy.dgSensitiveAccess = true;

        expect(policy).must.eql(enabledPolicy);
    });

    it('when session user has false values', function() {
        var policy = builder._buildUserPolicy({
            logger: logger,
            session: {
                user: {
                    rptTabs: 'false',
                    corsTabs: null,
                    dgRecordAccess: null,
                    dgSensitiveAccess: false,
                    consumerType: undefined,
                    site: ''
                }
            }
        });

        expect(policy).must.eql(defaultPolicy);
    });

    it('when ack is true', function() {
        var policy = builder._buildUserPolicy({
            logger: logger,
            query: {
                _ack: 'true'
            }
        });

        expect(policy.breakglass).to.be.true();
    });
});

describe('When a user is audited in Vista for sensitive patient access', function() {
    var req, patient, mockRpcUtil, mockVistaJS;

    beforeEach(function(done) {
        req = {};
        req.logger = logger;
        req.session = {
            user: {
                division: '500'
            }
        };
        req.app = {
            config: {}
        };

        patient = {
            pid: 'SITE;1B'
        };

        mockRpcUtil = sinon.stub(rpcUtil, 'getVistaRpcConfiguration', function(config, user) {
            return {};
        });

        done();
    });

    afterEach(function(done) {
        mockRpcUtil.restore();
        mockVistaJS.restore();

        done();
    });

    it('a vista call is unsuccessful then error is logged', function(done) {
        mockVistaJS = sinon.stub(RpcClient, 'callRpc', function(logger, serverConfig, command, params, callback) {
            return callback('err');
        });

        builder._auditSensitiveDataAccessInVista(req, patient);

        expect(mockRpcUtil.getCall(0).args[1].division).to.be('500');
        expect(mockVistaJS.getCall(0).args[3]).must.eql([{
            '"command"': 'logPatientAccess',
            '"patientId"': '1B'
        }]);
        expect(logger.warn.called).to.be.true();

        done();
    });

    it('a vista call is successful the result is logged', function(done) {
        mockVistaJS = sinon.stub(RpcClient, 'callRpc', function(logger, serverConfig, command, params, callback) {
            return callback(null, 'result');
        });

        builder._auditSensitiveDataAccessInVista(req, patient);

        expect(logger.debug.called).to.be.true();

        done();
    });
});

describe('User is not patient', function() {
    it('when session user ssn is not defined', function() {
        var req = {};
        var patients = [{
            pid: 'SITE;18',
            ssn: '123456789'
        }];

        expect(builder._userIsPatient(req, patients)).to.be.false();
        expect(builder._userIsPatient(req.session = {}, patients)).to.be.false();
        expect(builder._userIsPatient(req.session = {
            user: {}
        }, patients)).to.be.false();
        expect(builder._userIsPatient(req.session = {
            user: {
                ssn: ''
            }
        }, patients)).to.be.false();
        expect(builder._userIsPatient(req.session = {
            user: {
                ssn: null
            }
        }, patients)).to.be.false();
    });
});

describe('User is not patient', function() {
    it('when patient ssn is not defined', function() {
        var req = {};
        req.session = {
            user: {
                ssn: '123456789'
            }
        };

        expect(builder._userIsPatient(req, undefined)).to.be.false();
        expect(builder._userIsPatient(req, [])).to.be.false();
        expect(builder._userIsPatient(req, [{}])).to.be.false();
        expect(builder._userIsPatient(req, [{
            pid: ''
        }])).to.be.false();
        expect(builder._userIsPatient(req, [{
            pid: null
        }])).to.be.false();
    });
});

describe('User is not patient', function() {
    it('when patient ssn and user ssn are empty', function() {
        var req = {};
        req.session = {
            user: {
                ssn: ''
            }
        };
        var patients = [{
            pid: 'SITE;18',
            ssn: ''
        }];

        expect(builder._userIsPatient(req, patients)).to.be.false();
    });
});

describe('User is the patient', function() {
    it('when patient ssn is the same as the session user ssn', function() {
        var req = {};
        req.session = {
            user: {
                ssn: '123456789'
            }
        };
        var patients = [{
            pid: 'SITE;18',
            ssn: '123456789'
        }];

        expect(builder._userIsPatient(req, patients)).to.be.true();
    });
});

describe('When a user policy is updated based on patient information', function() {
    var req, userPolicy, mockRpcUtil, mockVistaJS;

    beforeEach(function(done) {
        req = {};
        req.logger = logger;
        req.session = {
            user: {
                ssn: '123456789'
            }
        };
        req.app = {
            config: {}
        };
        req.audit = {
            sensitive: false
        };

        userPolicy = {
            breakglass: false,
            rptTabs: false,
            corsTabs: false,
            dgRecordAccess: false,
            dgSensitiveAccess: false,
            sensitive: false,
            hasSSN: true,
            requestingOwnRecord: false,
            consumerType: undefined,
            site: ''
        };

        mockRpcUtil = sinon.stub(rpcUtil, 'getVistaRpcConfiguration', function(config, user) {
            return {};
        });

        mockVistaJS = sinon.stub(RpcClient, 'callRpc', function(logger, serverConfig, command, params, callback) {
            return callback(null, 'result');
        });

        done();
    });

    afterEach(function(done) {
        mockRpcUtil.restore();
        mockVistaJS.restore();

        done();
    });

    it('the user policy is not changed if there are no patients', function(done) {
        var verifyUserPolicy = function(userPolicy) {
            expect(userPolicy.sensitive).to.be.false();
            expect(userPolicy.hasSSN).to.be.true();
            expect(userPolicy.requestingOwnRecord).to.be.false();
            expect(logger.warn.called).to.be.true();

        };

        builder._updateUserPolicyWithPatientData(req, userPolicy, undefined);
        verifyUserPolicy(userPolicy);

        builder._updateUserPolicyWithPatientData(req, userPolicy, {});
        verifyUserPolicy(userPolicy);

        builder._updateUserPolicyWithPatientData(req, userPolicy, {
            data: {}
        });
        verifyUserPolicy(userPolicy);

        builder._updateUserPolicyWithPatientData(req, userPolicy, {
            data: {
                items: []
            }
        });
        verifyUserPolicy(userPolicy);

        done();
    });

    it('and the user is the patient then the requestOwnRecord flag is set true', function() {
        builder._updateUserPolicyWithPatientData(req, userPolicy, {
            data: {
                items: [{
                    ssn: '123456789'
                }]
            }
        });
        expect(userPolicy.requestingOwnRecord).to.be.true();
    });

    it('and the user does not have an ssn then the hasSSN flag is set to false', function(done) {
        builder._updateUserPolicyWithPatientData(req, userPolicy, {
            data: {
                items: [{}, {}]
            }
        });
        expect(userPolicy.hasSSN).to.be.false();

        builder._updateUserPolicyWithPatientData(req, userPolicy, {
            data: {
                items: [{}, {
                    ssn: null
                }]
            }
        });
        expect(userPolicy.hasSSN).to.be.false();

        builder._updateUserPolicyWithPatientData(req, userPolicy, {
            data: {
                items: [{
                    ssn: ''
                }, {}]
            }
        });
        expect(userPolicy.hasSSN).to.be.false();

        done();
    });

    it('and this is a sensitive patient then the user policy sensitive flag and the req audit sensitive flag are set to true', function(done) {
        builder._updateUserPolicyWithPatientData(req, userPolicy, {
            data: {
                items: [{
                    sensitive: false
                }, {
                    sensitive: true
                }]
            }
        });
        expect(userPolicy.sensitive).to.be.true();
        expect(req.audit.sensitive).to.be.true();
        expect(mockVistaJS.called).to.be.false();

        done();
    });

    it('and this is a sensitive patient and the user policy breakglass flag is true then the vista sensitive audit rpc is called', function(done) {
        userPolicy.breakglass = true;
        builder._updateUserPolicyWithPatientData(req, userPolicy, {
            data: {
                items: [{
                    pid: 'SITE;18',
                    sensitive: true
                }, {
                    pid: 'SITE;18',
                    sensitive: false
                }]
            }
        });
        expect(userPolicy.sensitive).to.be.true();
        expect(mockVistaJS.called).to.be.true();

        done();
    });

    it('and this is a sensitive patient and the user policy breakglass flag is true but it is not a local pid then the vista sensitive audit rpc is NOT called', function(done) {
        userPolicy.breakglass = true;
        builder._updateUserPolicyWithPatientData(req, userPolicy, {
            data: {
                items: [{
                    pid: '10108V420871',
                    sensitive: true
                }]
            }
        });
        expect(userPolicy.sensitive).to.be.true();
        expect(mockVistaJS.called).to.be.false();

        done();
    });
});
