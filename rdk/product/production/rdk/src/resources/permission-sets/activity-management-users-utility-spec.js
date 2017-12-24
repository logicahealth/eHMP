'use strict';

var _ = require('lodash');
var oracledb = require('oracledb');
var httpMocks = require('node-mocks-http');
var activityManagementUsersUtil = require('./activity-management-users-utility');
var logger = sinon.stub(require('bunyan').createLogger({
    name: 'activity-management-user-utility'
}));


describe('Activity Management Users Utility', function() {
    var req;
    var cb;
    var mockPoolExec;

    beforeEach(function() {
        req = httpMocks.createRequest({
            method: 'PUT',
            url: 'resource/permission-sets/edit'
        });
        _.set(req, 'app.config.generalPurposeJdsServer', {
            baseUrl: 'http://IP             ',
            urlLengthLimit: 120
        });
        _.set(req, 'app.config.jbpm.ehmproutingDatabase', {
            user: 'none',
            password: 'fake',
            connectString: 'IP             /XE'
        });
        _.set(req, 'audit', {});
        _.set(req, 'logger', logger);
        _.set(req, 'session.user', {
            uid: 'urn:va:user:B14H:0007',
            consumerType: 'user'
        });
        _.set(req, 'query.user.uid', 'urn:va:user:B14H:0001');
        cb = sinon.spy();
        mockPoolExec = sinon.stub(activityManagementUsersUtil._pool, 'doExecuteProcWithInOutParams');
    });

    afterEach(function() {
        cb.reset();
        mockPoolExec.reset();
    });

    describe('does not error when a call is made for', function(){
        it('an oracle insert on an active user', function() {
            mockPoolExec.onCall(0).callsArgWith(5, null, {rows: 'connection.execute success'});
            var params = {
                queryParams: {
                    'i_user_uid': 'urn:va:user:B14H:0001',
                    'output': {
                        dir: oracledb.BIND_OUT,
                        type: oracledb.NUMBER
                    }
                },
                status: 'active',
                error: 'This should propigate through the crazy oracledb fake'
            };
            activityManagementUsersUtil(req, params, cb);
            expect(cb.called).to.be.true();
            expect(cb.firstCall.args[0]).to.be.falsy();
            expect(cb.firstCall.args[1]).to.be.truthy();
        });

        it('an oracle delete on an inactive user', function() {
            mockPoolExec.onCall(0).callsArgWith(5, null, {rows: 'connection.execute success'});
            var params = {
                queryParams: {
                    'i_user_uid': 'urn:va:user:B14H:0001',
                    'output': {
                        dir: oracledb.BIND_OUT,
                        type: oracledb.NUMBER
                    }
                },
                status: 'inactive'
            };
            activityManagementUsersUtil(req, params, cb);
            expect(cb.called).to.be.true();
            expect(cb.firstCall.args[0]).to.be.falsy();
            expect(cb.firstCall.args[1]).to.be.truthy();
        });
    });

    describe('does log an error when a call errors during', function(){
        it('an oracle insert on an active user', function() {
            mockPoolExec.onCall(0).callsArgWith(5, 'This is a bogus error.', null);
            var params = {
                queryParams: {
                    'i_user_uid': 'urn:va:user:B14H:0001',
                    'output': {
                        dir: oracledb.BIND_OUT,
                        type: oracledb.NUMBER
                    }
                },
                status: 'active'
            };
            activityManagementUsersUtil(req, params, cb);
            expect(cb.called).to.be.true();
            expect(cb.firstCall.args[0]).to.be.truthy();
            expect(cb.firstCall.args[1]).to.be.falsy();
        });

        it('an oracle delete on an inactive user', function() {
            mockPoolExec.onCall(0).callsArgWith(5, 'This is a bogus error.', null);
            var params = {
                queryParams: {
                    'i_user_uid': 'urn:va:user:B14H:0001',
                    'output': {
                        dir: oracledb.BIND_OUT,
                        type: oracledb.NUMBER
                    }
                },
                status: 'inactive'
            };
            activityManagementUsersUtil(req, params, cb);
            expect(cb.called).to.be.true();
            expect(cb.firstCall.args[0]).to.be.truthy();
            expect(cb.firstCall.args[1]).to.be.falsy();
        });
    });
});
