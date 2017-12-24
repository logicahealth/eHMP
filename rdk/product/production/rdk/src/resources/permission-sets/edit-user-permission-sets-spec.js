'use strict';

var _ = require('lodash');
var nock = require('nock');
var httpMocks = require('node-mocks-http');
var editPermissionSets = require('./edit-user-permission-sets');
var testData = require('./permission-sets-test-data.json');
var rdk = require('../../core/rdk');
var pjds = rdk.utils.pjdsStore;
var logger = sinon.stub(require('bunyan').createLogger({
    name: 'edit-user-permission-sets'
}));

describe('Edit User Permission Sets', function() {
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
        res.rdkSend = function (results) {};
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
            res.rdkSend = function (result) {
                expect(result).to.match(/Missing user parameter/);
            };
            editPermissionSets(req, res);
        });

        it('no uid is sent on the user', function() {
            _.set(req, 'query.user', {});
            res.rdkSend = function (result) {
                expect(result).to.match(/Missing user uid/);
            };
            editPermissionSets(req, res);
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
                user: {},
                permissionSets: ['contestant-at-eating'],
                additionalPermissions: ['pie-is-great']
            });
        });

        it('does not allow a user to edit their own permissions without \'edit-own-permissions\'', function(done) {
            _.set(req, 'query.user.uid', testData.actingUser.uid);
            res.rdkSend = function (result) {
                expect(result).to.match(/Not allowed to edit permission sets on this user/);
                done();
            };
            editPermissionSets(req, res);
        });

        it('does allow a user to edit their own permissions with \'edit-own-permissions\'', function(done) {
            _.set(req, 'query.user.uid', testData.actingUser.uid);
            _.set(req, ['session', 'user', 'permissionSet', 'additionalPermissions', 0], 'edit-own-permissions');
            req.session.user.permissions.push('edit-own-permissions');

            nock('http://IP             ')
                .get('/ehmpusers/urn:va:user:B14H:0007')
                .reply(200, _.clone(testData.actingUser));

            nock('http://IP             ')
                .put('/ehmpusers/urn:va:user:B14H:0007')
                .reply(201, {});

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
                expect(_.get(response, 'data.val')).to.contain('contestant-at-eating');
                expect(_.get(response, 'data.additionalPermissions')).to.contain('pie-is-great');
                expect(response.data).to.have.property('modifiedOn');
                expect(response.data).to.have.property('modifiedBy');
                res.rdkSend = sinon.stub(); //reset the function to a stub
                done();
            };

            editPermissionSets(req, res);
        });

        it('does allow a user to edit another user\'s permissions', function(done) {
            _.set(req, 'query.user.uid', 'urn:va:user:B14H:0001');
            req.session.user.permissions.push('edit-own-permissions');

            nock('http://IP             ')
                .get('/ehmpusers/urn:va:user:B14H:0001')
                .reply(200, _.clone(pjds.defaults.user));

            nock('http://IP             ')
                .put('/ehmpusers/urn:va:user:B14H:0001')
                .reply(201, {});

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
                expect(_.get(response, 'data.val')).to.contain('contestant-at-eating');
                expect(_.get(response, 'data.additionalPermissions')).to.contain('pie-is-great');
                expect(response.data).to.have.property('modifiedOn');
                expect(response.data).to.have.property('modifiedBy');
                res.rdkSend = sinon.stub(); //reset the function to a stub
                done();
            };

            editPermissionSets(req, res);
        });

        it('does not allow a user to add a national access permission set if they do not have national access', function(done) {
            _.set(req, 'query.user.uid', 'urn:va:user:B14H:0001');
            req.session.user.permissions.push('edit-own-permissions');
            _.set(req, 'query.permissionSets', ['nat-access-perm-set']);

            nock('http://IP             ')
                .get('/ehmpusers/urn:va:user:B14H:0001')
                .reply(200, _.clone(pjds.defaults.user));

            nock('http://IP             ')
                .put('/ehmpusers/urn:va:user:B14H:0001')
                .reply(201, {});

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

            res.rdkSend = function(response) {
                expect(response).to.equal('Invalid request - cannot add national access permission sets if user does not have national access');
                res.rdkSend = sinon.stub();
                done();
            };

            editPermissionSets(req, res);
        });

        it('does not allow a user to add a national access permission if they do not have national access', function(done) {
            _.set(req, 'query.user.uid', 'urn:va:user:B14H:0001');
            req.session.user.permissions.push('edit-own-permissions');
            _.set(req, 'query.additionalPermissions', ['nat-access-perm']);

            nock('http://IP             ')
                .get('/ehmpusers/urn:va:user:B14H:0001')
                .reply(200, _.clone(pjds.defaults.user));

            nock('http://IP             ')
                .put('/ehmpusers/urn:va:user:B14H:0001')
                .reply(201, {});

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

            res.rdkSend = function(response) {
                expect(response).to.equal('Invalid request - cannot add national access permissions if user does not have national access');
                res.rdkSend = sinon.stub();
                done();
            };

            editPermissionSets(req, res);
        });
    });

    describe('when missing \'acc\' permission set', function() {
        beforeEach(function() {
            _.set(req, 'query', {
                user: {},
                permissionSets: ['contestant-at-eating'],
                additionalPermissions: ['pie-is-great']
            });
        });

        it('does not allow a user to edit their own permissions without \'edit-own-permissions\'', function() {
            _.set(req, 'query.user.uid', testData.actingUser.uid);
            res.rdkSend = function (result) {
                expect(result).to.match(/Not allowed to edit permission sets on this user/);
            };
            editPermissionSets(req, res);
        });

        it('does allow a user to edit their own permissions with \'edit-own-permissions\'', function(done) {
            _.set(req, 'query.user.uid', testData.actingUser.uid);
            _.set(req, ['session', 'user', 'permissionSet', 'additionalPermissions', 0], 'edit-own-permissions');
            _.set(req, 'session.user.permissions', ['edit-own-permissions']);

            nock('http://IP             ')
                .get('/ehmpusers/urn:va:user:B14H:0007')
                .reply(200, _.clone(testData.actingUser));

            nock('http://IP             ')
                .put('/ehmpusers/urn:va:user:B14H:0007')
                .reply(201, {});

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
                expect(_.get(response, 'data.val')).to.contain('contestant-at-eating');
                expect(_.get(response, 'data.additionalPermissions')).to.contain('pie-is-great');
                expect(response.data).to.have.property('modifiedOn');
                expect(response.data).to.have.property('modifiedBy');
                res.rdkSend = sinon.stub(); //reset the function to a stub
                done();
            };

            editPermissionSets(req, res);
        });
    });
});
