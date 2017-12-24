'use strict';

var _ = require('lodash');
var nock = require('nock');
var httpMocks = require('node-mocks-http');
var multiUserEdit = require('./multi-user-edit');
var testData = require('./permission-sets-test-data.json');
var logger = sinon.stub(require('bunyan').createLogger({
    name: 'multi-user-edit'
}));
var rdk = require('../../core/rdk');
var pjds = rdk.utils.pjdsStore;

describe('Multi User Edit', function() {
    var req;
    var res;

    beforeEach(function(done) {
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
        _.set(req, 'session.user', _.clone(testData.actingUser));
        _.set(req, 'session.user.consumerType', 'user');
        res = httpMocks.createResponse();
        res.rdkSend = function (result) {};
        done();
    });

    afterEach(function(done) {
        nock.cleanAll();
        done();
    });

    describe('stops early when', function() {
        beforeEach(function() {
            _.set(req, ['session', 'user', 'permissionSet', 'val', 0], 'acc');
        });

        it('no user is sent', function() {
            _.set(req, 'query.permissionSets', ['none']);
            _.set(req, 'query.mode', 'add');
            res.rdkSend = function(response) {
                expect(response).to.match(/Missing users parameter/);
            };
            multiUserEdit(req, res);
        });

        it('no permissionSets is sent', function() {
            _.set(req, 'query.users', [{'uid':'bogus'}]);
            _.set(req, 'query.mode', 'add');
            res.rdkSend = function(response) {
                expect(response.code).to.equal('200.400.1020');
            };
            multiUserEdit(req, res);
        });

        it('no mode is sent', function() {
            _.set(req, 'query.permissionSets', ['none']);
            _.set(req, 'query.users', [{'uid':'bogus'}]);
            res.rdkSend = function(response) {
                expect(response.code).to.equal('200.400.1022');
            };
            multiUserEdit(req, res);
        });

        it('no valid mode is sent', function() {
            _.set(req, 'query.permissionSets', ['none']);
            _.set(req, 'query.users', [{'uid':'bogus'}]);
            _.set(req, 'query.mode', 'wrong');
            res.rdkSend = function(response) {
                expect(response.code).to.equal('200.400.1023');
            };
            multiUserEdit(req, res);
        });
    });

    describe('having \'acc\' permission set', function() {
        beforeEach(function() {
            _.set(req, ['session', 'user', 'permissionSet', 'val', 0], 'acc');
            _.set(req, ['session', 'user', 'permissions'], [
                'add-user-permission-set',
                'edit-user-permission-set',
                'read-user-permission-set',
                'remove-user-permission-set'
            ]);
            _.set(req, 'query', {
                users: [],
                mode: 'add',
                permissionSets: ['contestant-at-eating'],
                additionalPermissions: ['pie-is-great']
            });
        });

        it('does not allow a user to edit their own permissions without \'edit-own-permissions\'', function(done) {
            _.set(req, ['query', 'users', 0, 'uid'], testData.actingUser.uid);

            nock('http://IP             ')
                .get('/permset/?filter=eq(%22status%22%2C%22active%22)')
                .reply(200, _.clone(testData.permissionSet));

            nock('http://IP             ')
                .get('/ehmpusers/urn:va:user:B14H:0007')
                .reply(200, _.clone(testData.actingUser));

            nock('http://IP             ')
                .get('/permission/?filter=eq(%22nationalAccess%22%2C%22true%22)')
                .reply(200, {
                    items: []
                });
            nock('http://IP             ')
                .get('/permset/?filter=eq(%22nationalAccess%22%2C%22true%22)')
                .reply(200, {
                    items: []
                });

            res.rdkSend = function(response) {
                expect(_.get(response, ['data', 'failedOnEditUsers', 0, 'errorMessage'])).to.match(/Not allowed to edit your own permissions/);
                done();
            };
            multiUserEdit(req, res);
        });

        it('does allow a user to edit their own permissions with \'edit-own-permissions\'', function(done) {
            _.set(req, ['query', 'users', 0, 'uid'], testData.actingUser.uid);
            _.set(req, ['session', 'user', 'permissionSet', 'additionalPermissions', 0], 'edit-own-permissions');
            req.session.user.permissions.push('edit-own-permissions');

            nock('http://IP             ')
                .get('/permset/?filter=eq(%22status%22%2C%22active%22)')
                .reply(200, _.clone(testData.permissionSet));

            nock('http://IP             ')
                .get('/ehmpusers/urn:va:user:B14H:0007')
                .reply(200, _.clone(testData.actingUser));

            nock('http://IP             ')
                .get('/permission/?filter=eq(%22nationalAccess%22%2C%22true%22)')
                .reply(200, {
                    items: []
                });
            nock('http://IP             ')
                .get('/permset/?filter=eq(%22nationalAccess%22%2C%22true%22)')
                .reply(200, {
                    items: []
                });

            nock('http://IP             ')
                .put('/ehmpusers/urn:va:user:B14H:0007')
                .reply(201, {});

            res.rdkSend = function(response) {
                expect(_.get(response, ['data', 'editedUsers', 0])).to.have.ownProperty('uid', testData.actingUser.uid);
                done();
            };

            multiUserEdit(req, res);
        });

        it('does allow a user to edit another user\'s permissions', function(done) {
            _.set(req, ['query', 'users'], testData.users);
            req.session.user.permissions.push('edit-own-permissions');

            nock('http://IP             ')
                .get('/permset/?filter=eq(%22status%22%2C%22active%22)')
                .reply(200, _.clone(testData.permissionSet));

            nock('http://IP             ')
                .get('/ehmpusers/urn:va:user:B14H:0001')
                .reply(200, _.clone(pjds.defaults.user));

            nock('http://IP             ')
                .get('/permission/?filter=eq(%22nationalAccess%22%2C%22true%22)')
                .reply(200, {
                    items: []
                });

            nock('http://IP             ')
                .get('/permset/?filter=eq(%22nationalAccess%22%2C%22true%22)')
                .reply(200, {
                    items: []
                });

            nock('http://IP             ')
                .put('/ehmpusers/urn:va:user:B14H:0001')
                .reply(201, {});

            nock('http://IP             ')
                .get('/ehmpusers/urn:va:user:B14H:0002')
                .reply(200, _.clone(pjds.defaults.user));

            nock('http://IP             ')
                .put('/ehmpusers/urn:va:user:B14H:0002')
                .reply(201, {});

            nock('http://IP             ')
                .get('/ehmpusers/urn:va:user:B14H:0003')
                .reply(200, _.clone(pjds.defaults.user));

            nock('http://IP             ')
                .put('/ehmpusers/urn:va:user:B14H:0003')
                .reply(201, {});

            res.rdkSend = function(response) {
                var users = _.get(response, ['data', 'editedUsers']);
                expect(_.size(users)).to.be(3);
                expect(_.get(response, ['data', 'editedUsers', 0])).to.have.ownProperty('uid');
                done();
            };

            multiUserEdit(req, res);
        });
    });

    describe('when missing \'acc\' permission set', function() {
        beforeEach(function() {
            _.set(req, 'query', {
                user: {},
                mode: 'add',
                permissionSets: ['contestant-at-eating'],
                additionalPermissions: ['pie-is-great']
            });
        });

        it('does not allow a user to edit their own permissions without \'edit-own-permissions\'', function(done) {
            _.set(req, ['query', 'users', 0, 'uid'], testData.actingUser.uid);

            nock('http://IP             ')
                .get('/permset/?filter=eq(%22status%22%2C%22active%22)')
                .reply(200, _.clone(testData.permissionSet));

            nock('http://IP             ')
                .get('/ehmpusers/urn:va:user:B14H:0007')
                .reply(200, _.clone(testData.actingUser));

            nock('http://IP             ')
                .get('/permission/?filter=eq(%22nationalAccess%22%2C%22true%22)')
                .reply(200, {
                    items: []
                });
            nock('http://IP             ')
                .get('/permset/?filter=eq(%22nationalAccess%22%2C%22true%22)')
                .reply(200, {
                    items: []
                });

            nock('http://IP             ')
                .get('/permission/?filter=eq(%22nationalAccess%22%2C%22true%22)')
                .reply(200, {
                    items: []
                });
            nock('http://IP             ')
                .get('/permset/?filter=eq(%22nationalAccess%22%2C%22true%22)')
                .reply(200, {
                    items: []
                });

            res.rdkSend = function(response) {
                expect(_.get(response, ['data', 'failedOnEditUsers', 0, 'errorMessage'])).to.match(/Not allowed to edit your own permissions/);
                done();
            };
            multiUserEdit(req, res);
        });

        it('does allow a user to edit their own permissions with \'edit-own-permissions\'', function(done) {
            _.set(req, ['query', 'users', 0, 'uid'], testData.actingUser.uid);
            _.set(req, ['session', 'user', 'permissionSet', 'additionalPermissions', 0], 'edit-own-permissions');
            _.set(req, 'session.user.permissions', ['edit-own-permissions']);

            nock('http://IP             ')
                .get('/permset/?filter=eq(%22status%22%2C%22active%22)')
                .reply(200, _.clone(testData.permissionSet));

            nock('http://IP             ')
                .get('/ehmpusers/urn:va:user:B14H:0007')
                .reply(200, _.clone(testData.actingUser));

            nock('http://IP             ')
                .get('/permission/?filter=eq(%22nationalAccess%22%2C%22true%22)')
                .reply(200, {
                    items: []
                });
            nock('http://IP             ')
                .get('/permset/?filter=eq(%22nationalAccess%22%2C%22true%22)')
                .reply(200, {
                    items: []
                });

            nock('http://IP             ')
                .put('/ehmpusers/urn:va:user:B14H:0007')
                .reply(201, {});

            res.rdkSend = function(response) {
                expect(_.get(response, ['data', 'editedUsers', 0])).to.have.ownProperty('uid', testData.actingUser.uid);
                done();
            };

            multiUserEdit(req, res);
        });

        it('fails if a user without national access tries to add a national access permission set', function(done) {
            _.set(req, ['query', 'users'], [testData.users[0]]);
            _.set(req, 'session.user.nationalAccess', false);
            _.set(req, 'session.user.permissions', ['edit-own-permissions']);
            req.query.permissionSets.push('nat-access-perm-set');

            nock('http://IP             ')
                .get('/permset/?filter=eq(%22status%22%2C%22active%22)')
                .reply(200, _.clone(testData.permissionSet));

            nock('http://IP             ')
                .get('/ehmpusers/urn:va:user:B14H:0001')
                .reply(200, _.clone(pjds.defaults.user));

            nock('http://IP             ')
                .get('/permission/?filter=eq(%22nationalAccess%22%2C%22true%22)')
                .reply(200, {
                    items: []
                });

            nock('http://IP             ')
                .get('/permset/?filter=eq(%22nationalAccess%22%2C%22true%22)')
                .reply(200, {
                    items: [{
                        uid: 'nat-access-perm-set',
                        nationalAccess: true
                    }]
                });

            nock('http://IP             ')
                .put('/ehmpusers/urn:va:user:B14H:0001')
                .reply(201, {});

            res.rdkSend = function(response) {
                expect(response).to.equal('Invalid request - cannot add national access permission sets if user does not have national access');
                done();
            };

            multiUserEdit(req, res);
        });

        it('fails if a user without national access tries to add a national access permission', function(done) {
            _.set(req, ['query', 'users'], [testData.users[0]]);
            _.set(req, 'session.user.nationalAccess', false);
            _.set(req, 'session.user.permissions', ['edit-own-permissions']);
            req.query.additionalPermissions.push('nat-access-perm');

            nock('http://IP             ')
                .get('/permset/?filter=eq(%22status%22%2C%22active%22)')
                .reply(200, _.clone(testData.permissionSet));

            nock('http://IP             ')
                .get('/ehmpusers/urn:va:user:B14H:0001')
                .reply(200, _.clone(pjds.defaults.user));

            nock('http://IP             ')
                .get('/permission/?filter=eq(%22nationalAccess%22%2C%22true%22)')
                .reply(200, {
                    items: [{
                        uid: 'nat-access-perm',
                        nationalAccess: true
                    }]
                });

            nock('http://IP             ')
                .get('/permset/?filter=eq(%22nationalAccess%22%2C%22true%22)')
                .reply(200, {
                    items: []
                });

            nock('http://IP             ')
                .put('/ehmpusers/urn:va:user:B14H:0001')
                .reply(201, {});

            res.rdkSend = function(response) {
                expect(response).to.equal('Invalid request - cannot add national access permissions if user does not have national access');
                done();
            };

            multiUserEdit(req, res);
        });
    });
});
