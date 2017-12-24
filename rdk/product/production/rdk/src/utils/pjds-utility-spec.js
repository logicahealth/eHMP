'use strict';

var _ = require('lodash');
var nock = require('nock');
var httpMocks = require('node-mocks-http');
var pjdsUtil = require('./pjds-utility');
var RdkError = require('./errors/rdk-error');
var logger = sinon.stub(require('bunyan').createLogger({
    name: 'pjds-utility-spec'
}));

var trustUser = {
    uid: 'CDS',
    name: 'CDS',
    permissionSet: {
        additionalPermissions: ['add-fridge-sticker'],
        val: ['read-access']
    },
    status: 'active',
    systemDesignator: 'external'
};
var subjectUser = {
    uid: 'urn:va:user:B14H:0007',
    permissionSet: {
        additionalPermissions: [
            'judo-chop',
            'can-yodel'
        ],
        modifiedBy: 'urn:va:user:B14H:0001',
        modifiedOn: '2017-03-14T13:59:26Z',
        val: [
            'read-access',
            'sumo-wrestler',
            'potty-trained'
        ]
    },
    status: 'active'
};
var actingUser = {
    uid: 'urn:va:user:B14H:0002',
    permissionSet: {
        additionalPermissions: [
            'judo-chop',
            'can-yodel'
        ],
        modifiedBy: 'urn:va:user:B14H:0001',
        modifiedOn: '2017-03-14T13:59:26Z',
        val: [
            'read-access',
            'sumo-wrestler',
            'yodel-dreams'
        ]
    },
    status: 'active'
};
var permissionSets = {
    items: [{
        'uid': 'sumo-wrestler',
        'label': 'Sumo Wrestler',
        'permissions': ['not-to-be-trifled-with'],
        'status': 'active'
    }, {
        'uid': 'read-access',
        'label': 'Read Access',
        'permissions': ['i-can-has-read'],
        'status': 'active'
    }]
};
var permissions = {
    items: [{
        'uid': 'not-to-be-trifled-with',
        'label': 'Seriously, don\'t trifle',
        'status': 'active'
    }, {
        'uid': 'i-can-has-read',
        'label': 'Passed 1st grade after 3rd try',
        'status': 'active'
    }, {
        'uid': 'add-fridge-sticker',
        'label': 'Celebrate Potty Time with Stickers!',
        'status': 'active'
    }, {
        'uid': 'judo-chop',
        'label': 'Judo CHOP',
        'description': 'Downward chop to the upward facing air',
        'status': 'active'
    }]
};
var appConfig = {
    'generalPurposeJdsServer': {
        'baseUrl': 'http://IP             ',
        'urlLengthLimit': 120
    }
};
describe('pjds-utility', function() {
    var req;
    var res;
    beforeEach(function() {
        req = {};
        req.logger = logger;
        res = httpMocks.createResponse({
            req: req
        });
        res.status = function(statusCode) {
            this.statusCode = statusCode;
            return this;
        };
        res.rdkSend = function() {};
    });
    afterEach(function() {
        nock.cleanAll();
    });
    describe('.getRequestParameter', function() {
        describe('can access by string path', function() {
            var obj;
            beforeEach(function() {
                obj = {
                    filter: 'eq(status,active)',
                    user: subjectUser
                };
            });

            describe('query parameters', function() {
                it('returns a default if no property is found', function() {
                    _.set(req, 'query.filter', obj.filter);
                    //look in the wrong path
                    var param = pjdsUtil.getRequestParameter(req, 'wrong.path', 'not true');
                    expect(param).to.be.equal('not true');
                    expect(param).to.not.be.equal(obj.filter);
                });
                it('returns properly if property found by path', function() {
                    _.set(req, 'query.filter', obj.filter);
                    var param = pjdsUtil.getRequestParameter(req, 'filter', 'not true');
                    expect(param).to.not.be.equal('not true');
                    expect(param).to.be.equal(obj.filter);
                });
            });

            describe('body parameters', function() {
                it('returns a default if no property is found', function() {
                    _.set(req, 'body', obj);
                    //look in the wrong path
                    var param = pjdsUtil.getRequestParameter(req, 'wrong.path', 'not true');
                    expect(param).to.be.equal('not true');
                    expect(obj).to.not.contain(param);
                });

                it('returns properly if property found by path', function() {
                    _.set(req, 'body', obj);
                    var param = pjdsUtil.getRequestParameter(req, 'filter', null);
                    expect(param, 'The filter should be equal').to.be.equal(obj.filter);

                    param = pjdsUtil.getRequestParameter(req, 'user.uid', null);
                    expect(param, 'The object items should be equal').to.be.equal(obj.user.uid);

                    param = pjdsUtil.getRequestParameter(req, 'user.permissionSet.val', null);
                    expect(param, 'The object items should be equal').to.be.a.permutationOf(obj.user.permissionSet.val);
                });
            });

            describe('request parameters', function() {
                it('returns a default if no property is found', function() {
                    _.set(req, 'params', obj);
                    //look in the wrong path
                    var param = pjdsUtil.getRequestParameter(req, 'wrong.path', 'not true');
                    expect(param).to.be.equal('not true');
                    expect(param).to.not.be.equal(obj);
                });
                it('returns properly if property found by path', function() {
                    _.set(req, 'params.filter', obj.filter);
                    var param = pjdsUtil.getRequestParameter(req, 'filter', 'not true');
                    expect(param).to.not.be.equal('not true');
                    expect(param).to.be.equal(obj.filter);
                });
            });
        });
        describe('can access by array path', function() {
            var obj;
            beforeEach(function() {
                obj = {
                    filter: 'eq(status,active)',
                    user: subjectUser
                };
            });

            describe('query parameters', function() {
                it('returns a default if no property is found', function() {
                    _.set(req, 'query.filter', obj.filter);
                    //look in the wrong path
                    var param = pjdsUtil.getRequestParameter(req, ['wrong', 'path'], 'not true');
                    expect(param).to.be.equal('not true');
                    expect(param).to.not.be.equal(obj.filter);
                });
                it('returns properly if property found by path', function() {
                    _.set(req, 'query.filter', obj.filter);
                    var param = pjdsUtil.getRequestParameter(req, ['filter'], 'not true');
                    expect(param).to.not.be.equal('not true');
                    expect(param).to.be.equal(obj.filter);
                });
            });

            describe('body parameters', function() {
                it('returns a default if no property is found', function() {
                    _.set(req, 'body', obj);
                    //look in the wrong path
                    var param = pjdsUtil.getRequestParameter(req, ['wrong', 'path'], 'not true');
                    expect(param).to.be.equal('not true');
                    expect(obj).to.not.contain(param);
                });

                it('returns properly if property found by path', function() {
                    _.set(req, 'body', obj);
                    var param = pjdsUtil.getRequestParameter(req, ['filter'], null);
                    expect(param, 'The filter should be equal').to.be.equal(obj.filter);

                    param = pjdsUtil.getRequestParameter(req, ['user', 'uid'], null);
                    expect(param, 'The object items should be equal').to.be.equal(obj.user.uid);

                    param = pjdsUtil.getRequestParameter(req, ['user', 'permissionSet', 'val'], null);
                    expect(param, 'The object items should be equal').to.be.a.permutationOf(obj.user.permissionSet.val);
                });
            });

            describe('request parameters', function() {
                it('returns a default if no property is found', function() {
                    _.set(req, 'params', obj);
                    //look in the wrong path
                    var param = pjdsUtil.getRequestParameter(req, 'wrong.path', 'not true');
                    expect(param).to.be.equal('not true');
                    expect(param).to.not.be.equal(obj);
                });
                it('returns properly if property found by path', function() {
                    _.set(req, 'params.filter', obj.filter);
                    var param = pjdsUtil.getRequestParameter(req, ['filter'], 'not true');
                    expect(param).to.not.be.equal('not true');
                    expect(param).to.be.equal(obj.filter);
                });
            });
        });
    });
    describe('.filterArrayByUid', function() {
        describe('sends back the source', function() {
            var sourceArray = [];
            var filterArray = [];
            var resultArray = [];
            beforeEach(function() {
                sourceArray = subjectUser.permissionSet.val;
                filterArray = permissionSets.items;
            });
            afterEach(function() {
                resultArray = [];
            });
            it('without error if there is no source', function() {
                var finalArray = pjdsUtil.filterArrayByUid(undefined, filterArray);
                //result should be no change
                resultArray = undefined;
                expect(finalArray).to.be.equal(resultArray);
            });
            it('without modification when there is no filter', function() {
                var finalArray = pjdsUtil.filterArrayByUid(sourceArray, []);
                //result should be no change
                resultArray = subjectUser.permissionSet.val;
                expect(finalArray).to.be.a.permutationOf(resultArray);
            });
            it('modified by the filtered array', function() {
                var finalArray = pjdsUtil.filterArrayByUid(sourceArray, filterArray);
                resultArray = ['read-access', 'sumo-wrestler'];
                expect(finalArray).to.be.a.permutationOf(resultArray);
            });
        });
    });
    describe('.actingUserFromRequest', function() {
        describe('returns the session user object', function() {
            it('as an empty object when no session is found on the request', function() {
                var user = pjdsUtil.actingUserFromRequest(req);
                expect(user).to.be.an.object();
                expect(user).to.be.empty();
            });
            it('as a user oject when a session is found on the request', function() {
                _.set(req, 'session.user', subjectUser);
                var user = pjdsUtil.actingUserFromRequest(req);
                expect(user).to.be.an.object();
                expect(user).to.be(subjectUser);
            });
        });
    });
    describe('.isUserModifyingSelf', function() {
        beforeEach(function() {
            _.set(req, 'session.user', actingUser);
        });
        describe('returns true if the acting user does not have "edit-own-permissions" and', function() {
            it('the method determines the acting and subject user uids match', function() {
                var isModifingSelf = pjdsUtil.isUserModifyingSelf(req, actingUser);
                expect(isModifingSelf).to.be.true();
            });
            it('the method was not passed a subject user uid, but one exists on the request and it is the actingUser', function() {
                _.set(req, 'body.user', actingUser);
                var isModifingSelf = pjdsUtil.isUserModifyingSelf(req, undefined);
                expect(isModifingSelf).to.be.true();
            });
        });

        describe('returns false if', function() {
            it('the method determines the acting and subject user uids match AND the acting user does have "edit-own-permissions"', function() {
                _.set(req, 'session.user.permissions', []); //permissions are always set during login or retrieving the user info
                req.session.user.permissions.push('edit-own-permissions');
                var isModifingSelf = pjdsUtil.isUserModifyingSelf(req, actingUser);
                expect(isModifingSelf).to.be.false();
            });
            it('the method was not passed a subject user, but a non-matching user exists on the request', function() {
                _.set(req, 'body.user', subjectUser);
                var isModifingSelf = pjdsUtil.isUserModifyingSelf(req, undefined);
                expect(isModifingSelf).to.be.false();
            });
            it('the method can not determine an acting user uid', function() {
                _.set(req, 'session.user.uid', '');
                var isModifingSelf = pjdsUtil.isUserModifyingSelf(req, subjectUser);
                expect(isModifingSelf).to.be.false();
            });
            it('the method can not determine a subject user uid', function() {
                var isModifingSelf = pjdsUtil.isUserModifyingSelf(req, {
                    'uid': undefined
                });
                expect(isModifingSelf).to.be.false();
            });
        });

        describe('returns error if', function() {
            it('the method can not find a subject user being passed in nor on the request', function() {
                _.set(req, 'body.user', undefined);
                var isModifingSelf = pjdsUtil.isUserModifyingSelf(req, undefined);
                expect(isModifingSelf, 'The returned item should be an RdkError with a code').to.have.property('code');
                expect(_.get(isModifingSelf, 'code')).to.match(/200.400.1026/);
            });
            it('the method can not find a subject user\'s uid being passed in nor on the the request', function() {
                _.set(req, 'body.user', _.omit(subjectUser, 'uid'));
                var isModifingSelf = pjdsUtil.isUserModifyingSelf(req, undefined);
                expect(isModifingSelf, 'The returned item should be an RdkError with a code').to.have.property('code');
                expect(_.get(isModifingSelf, 'code')).to.match(/200.400.1025/);
            });
            it('the method can not parse the subject user it found', function() {
                _.set(req, 'body.user', '{uid: "urn:va:user:B14H:0007"');
                var isModifingSelf = pjdsUtil.isUserModifyingSelf(req, undefined);
                expect(isModifingSelf, 'The returned item should be an RdkError with a code').to.have.property('code');
                expect(_.get(isModifingSelf, 'code')).to.match(/200.400.1021/);
            });
        });
    });
    describe('.permissionSetFromRequest', function() {
        describe('method attempts to get `permissionSets` from the request and', function() {
            it('returns the permission sets from the request object', function() {
                _.set(req, 'permissionSets', permissionSets.items);
                var requestPermSet = pjdsUtil.permissionSetFromRequest(req);
                expect(requestPermSet).to.be.an.object();
            });
            describe('returns an error if', function() {
                it('the permissionSet string cannot be parsed', function() {
                    _.set(req, 'body.permissionSets', '[{uid: "sudo-wrestler", label:"Sumo Wrestler"}');
                    var requestPermSet = pjdsUtil.permissionSetFromRequest(req);
                    expect(requestPermSet, 'The returned item should be an RdkError with a code').to.have.property('code');
                    expect(_.get(requestPermSet, 'code')).to.match(/200.400.1021/);
                });
                it('the permissionSet array is undefined', function() {
                    var requestPermSet = pjdsUtil.permissionSetFromRequest(req);
                    expect(requestPermSet, 'The returned item should be an RdkError with a code').to.have.property('code');
                    expect(_.get(requestPermSet, 'code')).to.match(/200.400.1020/);
                });
            });
        });
    });
    describe('.additionalPermissionsFromRequest', function() {
        describe('method attempts to get `additionalPermissions` from the request and', function() {
            it('returns the permission sets from the request object', function() {
                _.set(req, 'body.additionalPermissions', permissions.items);
                var requestPermissions = pjdsUtil.additionalPermissionsFromRequest(req);
                expect(requestPermissions).to.be.an.object();
            });
            describe('returns an error if', function() {
                it('the permissions string cannot be parsed', function() {
                    _.set(req, 'body.additionalPermissions', '{uid:not-to-be-trifled-with",label: "Seriously, don\'t trifle",status: "active"}, {ui');
                    var requestPermissions = pjdsUtil.additionalPermissionsFromRequest(req);
                    expect(requestPermissions, 'The returned item should be an RdkError with a code').to.have.property('code');
                    expect(_.get(requestPermissions, 'code')).to.match(/200.400.1021/);
                });
            });
        });

    });
    describe('.subjectuserFromRequest', function() {
        describe('returns user if', function() {
            it('the method finds a "user" on the request object', function() {
                _.set(req, 'body.user', subjectUser);
                var isModifingSelf = pjdsUtil.subjectUserFromRequest(req);
                expect(isModifingSelf, 'An object representing the subject user should be returned').to.be.an.object();
            });
        });
        describe('returns error if', function() {
            it('the method can not find a subject user on the request', function() {
                var isModifingSelf = pjdsUtil.subjectUserFromRequest(req);
                expect(isModifingSelf, 'The returned item should be an RdkError with a code').to.have.property('code');
                expect(_.get(isModifingSelf, 'code')).to.match(/200.400.1026/);
            });
            it('the method can not find a subject user\'s uid on the request', function() {
                _.set(req, 'body.user', _.omit(subjectUser, 'uid'));
                var isModifingSelf = pjdsUtil.subjectUserFromRequest(req);
                expect(isModifingSelf, 'The returned item should be an RdkError with a code').to.have.property('code');
                expect(_.get(isModifingSelf, 'code')).to.match(/200.400.1025/);
            });
            it('the method can not parse the subject user', function() {
                _.set(req, 'body.user', '{uid: "urn:va:user:B14H:0007"');
                var isModifingSelf = pjdsUtil.subjectUserFromRequest(req);
                expect(isModifingSelf, 'The returned item should be an RdkError with a code').to.have.property('code');
                expect(_.get(isModifingSelf, 'code')).to.match(/200.400.1021/);
            });
            /* DE8406 make sure the uid exists and is not an empty string */
            it('Testing DE8406: The subject user\'s uid is "" on the request', function() {
                var testUser = _.clone(subjectUser);
                _.set(testUser, 'uid', '');
                _.set(req, 'body.user', testUser);
                var isModifingSelf = pjdsUtil.subjectUserFromRequest(req);
                expect(isModifingSelf, 'The returned item should be an RdkError with a code').to.have.property('code');
                expect(_.get(isModifingSelf, 'code')).to.match(/200.400.1025/);
            });
            /* DE8406 make sure the uid exists and is not null */
            it('Testing DE8406: The subject user\'s uid is null on the request', function() {
                var testUser = _.clone(subjectUser);
                _.set(testUser, 'uid', null);
                _.set(req, 'body.user', testUser);
                var isModifingSelf = pjdsUtil.subjectUserFromRequest(req);
                expect(isModifingSelf, 'The returned item should be an RdkError with a code').to.have.property('code');
                expect(_.get(isModifingSelf, 'code')).to.match(/200.400.1025/);
            });
            /* DE8406 make sure the uid exists and is not undefined */
            it('Testing DE8406: The subject user\'s uid is undefined on the request', function() {
                var testUser = _.clone(subjectUser);
                _.set(testUser, 'uid', undefined);
                _.set(req, 'body.user', testUser);
                var isModifingSelf = pjdsUtil.subjectUserFromRequest(req);
                expect(isModifingSelf, 'The returned item should be an RdkError with a code').to.have.property('code');
                expect(_.get(isModifingSelf, 'code')).to.match(/200.400.1025/);
            });
        });
    });
    describe('.gatherUniquePermissions', function() {
        describe('returns a list of permissions if', function() {
            it('a user, permissionSet and permission is sent properly', function() {
                var permissionsToReturn = pjdsUtil.gatherUniquePermissions(actingUser, permissionSets.items, permissions.items);
                //notice can-yodel was removed from the list as it is not in the permissions list
                expect(permissionsToReturn).to.be.permutationOf(['judo-chop', 'not-to-be-trifled-with', 'i-can-has-read']);
            });
        });
        describe('returns nothing if', function() {
            it('a user isn\'t set or has no permission sets and permissions', function() {
                var permissionsToReturn = pjdsUtil.gatherUniquePermissions(undefined, permissionSets.items, permissions.items);
                expect(permissionsToReturn).to.be.empty();
            });
            it('the permissions filter array is empty', function() {
                var permissionsToReturn = pjdsUtil.gatherUniquePermissions(actingUser, permissionSets.items, undefined);
                expect(permissionsToReturn).to.be.empty();
            });
        });
    });
    describe('.getPermissionSet', function() {
        beforeEach(function() {
            req.logger = logger;
            _.set(req, 'app.config', appConfig);
        });
        describe('returns permission sets if', function() {
            it('the requested sets are available from pjds', function(done) {
                var cb = function(err, response, req, pjdsOptions) {
                    expect(err, 'There should not be an error').to.be.null();
                    expect(_.size(_.get(response, 'data.items')), 'This test has two permission sets and expects to see them both').to.be(2);
                    expect(pjdsOptions, 'DE6491 requires that users have only active permission sets applied to them').to.have.ownProperty('filterList');
                    expect(pjdsOptions.filterList, 'DE6491 required that an active filter be made on permission sets with the option to change the filter sent to pjds').to.match(/(eq)(.*?)(status)(.*?)(active)/);
                    done();
                };

                nock('http://IP             ')
                    .get('/permset/?filter=eq(%22status%22%2C%22active%22)')
                    .reply(200, permissionSets);

                pjdsUtil.getPermissionSet(req, {}, cb);
            });
            it('the requested sets are available from pjds when a filter is sent to override the active status default filter', function(done) {
                var pjdsOptions = {
                    filterList: 'or(eq(status,active),eq(status,deprecated))'
                };
                var cb = function(err, response, req, pjdsOptions) {
                    expect(err, 'There should not be an error').to.be.null();
                    expect(_.size(_.get(response, 'data.items')), 'This test has two permission sets and expects to see them both').to.be(2);
                    expect(pjdsOptions, 'DE6491 requires that users have only active permission sets applied to them').to.have.ownProperty('filterList');
                    expect(pjdsOptions.filterList, 'DE6491 required that an active filter be made on permission sets with the option to change the filter sent to pjds').to.match(/(eq)(.*?)(status)(.*?)(active)(.*?)(eq)(.*?)(status)(.*?)(deprecated)/);
                    done();
                };

                nock('http://IP             ')
                    .get('/permset/?filter=or(eq(%22status%22%2C%22active%22)%2Ceq(%22status%22%2C%22deprecated%22))')
                    .reply(200, permissionSets);

                pjdsUtil.getPermissionSet(req, pjdsOptions, cb);
            });
        });
        describe('returns an error if', function() {
            it('the request to pjds returns an error', function(done) {
                var errorToReturn = 'Nope not this time';
                var cb = function(err, response, req, pjdsOptions) {
                    expect(err).to.have.ownProperty('code');
                    expect(err).to.have.ownProperty('status');
                    expect(response, 'There will always be some sorta object sent back in the response from pjds-store.get').to.exist();
                    expect(pjdsOptions, 'DE6491 requires that users have only active permission sets applied to them').to.have.ownProperty('filterList');
                    expect(pjdsOptions.filterList, 'DE6491 required that an active filter be made on permission sets with the option to change the filter sent to pjds').to.match(/(eq)(.*?)(status)(.*?)(active)/);
                    done();
                };

                nock('http://IP             ')
                    .get('/permset/?filter=eq(%22status%22%2C%22active%22)')
                    .reply(404, errorToReturn);

                pjdsUtil.getPermissionSet(req, {}, cb);
            });
        });
    });
    describe('.getPermissions', function() {
        beforeEach(function() {
            req.logger = logger;
            _.set(req, 'app.config', appConfig);
        });
        describe('returns permissions if', function() {
            it('the requested permissions are available from pjds', function(done) {
                var cb = function(err, response, req, pjdsOptions) {
                    expect(err, 'There should not be an error').to.be.null();
                    expect(_.size(_.get(response, 'data.items')), 'This test has four permissions and expects to see them all').to.be(4);
                    expect(pjdsOptions, 'DE6491 requires that users have only active permissions applied to them').to.have.ownProperty('filterList');
                    expect(pjdsOptions.filterList, 'DE6491 required that an active filter be made on permissions with the option to change the filter sent to pjds').to.match(/(eq)(.*?)(status)(.*?)(active)/);
                    done();
                };

                nock('http://IP             ')
                    .get('/permission/?filter=eq(%22status%22%2C%22active%22)')
                    .reply(200, permissions);

                pjdsUtil.getPermissions(req, {}, cb);
            });
            it('the requested permissions are available from pjds when a filter is sent to override the active status default filter', function(done) {
                var pjdsOptions = {
                    filterList: 'or(eq(status,active),eq(status,deprecated))'
                };
                var cb = function(err, response, req, pjdsOptions) {
                    expect(err, 'There should not be an error').to.be.null();
                    expect(_.size(_.get(response, 'data.items')), 'This test has four permissions and expects to see them all').to.be(4);
                    expect(pjdsOptions, 'DE6491 requires that users have only active permissions applied to them').to.have.ownProperty('filterList');
                    expect(pjdsOptions.filterList, 'DE6491 required that an active filter be made on permissions with the option to change the filter sent to pjds').to.match(/(eq)(.*?)(status)(.*?)(active)(.*?)(eq)(.*?)(status)(.*?)(deprecated)/);
                    done();
                };

                nock('http://IP             ')
                    .get('/permission/?filter=or(eq(%22status%22%2C%22active%22)%2Ceq(%22status%22%2C%22deprecated%22))')
                    .reply(200, permissions);

                pjdsUtil.getPermissions(req, pjdsOptions, cb);
            });
        });
        describe('returns an error if', function() {
            it('the request to pjds returns an error', function(done) {
                var errorToReturn = 'Nope not this time';
                var cb = function(err, response, req, pjdsOptions) {
                    expect(err).to.have.ownProperty('code');
                    expect(err).to.have.ownProperty('status');
                    expect(response, 'There will always be some sorta object sent back in the response from pjds-store.get').to.exist();
                    expect(pjdsOptions, 'DE6491 requires that users have only active permissions applied to them').to.have.ownProperty('filterList');
                    expect(pjdsOptions.filterList, 'DE6491 required that an active filter be made on permissions with the option to change the filter sent to pjds').to.match(/(eq)(.*?)(status)(.*?)(active)/);
                    done();
                };

                nock('http://IP             ')
                    .get('/permission/?filter=eq(%22status%22%2C%22active%22)')
                    .reply(404, errorToReturn);

                pjdsUtil.getPermissions(req, {}, cb);
            });
        });
    });
    describe('.getUser', function() {
        beforeEach(function() {
            _.set(req, 'app.config', appConfig);
        });
        describe('returns an object from pjds if', function() {
            it('a key is provided', function(done) {
                var pjdsOptions = {
                    key: subjectUser.uid
                };
                var cb = function(error, response, req, res, pjdsOptions) {
                    expect(error, 'The error should be null').to.be.null();
                    expect(_.get(response, 'data'), 'The test response data should have some keys').to.have.keys(['uid', 'permissionSet', 'status']);
                    expect(pjdsOptions, 'The store property should have been set').to.have.ownProperty('store');
                    expect(pjdsOptions.store, 'The store property should have defaulted to ehmpusers').to.match(/ehmpusers/);
                    done();
                };

                nock('http://IP             ')
                    .get('/ehmpusers/urn:va:user:B14H:0007')
                    .reply(200, subjectUser);

                pjdsUtil.getUser(req, res, pjdsOptions, cb);
            });
            it('a key and the trustsys store is provided', function(done) {
                var pjdsOptions = {
                    key: trustUser.uid,
                    store: 'trustsys' //overriding the default store
                };
                var cb = function(error, response, req, res, pjdsOptions) {
                    expect(error).to.be.null();
                    expect(_.get(response, 'data'), 'The test response data should have some keys').to.have.keys(['uid', 'name', 'permissionSet', 'status', 'systemDesignator']);
                    expect(pjdsOptions, 'The store property should have been set').to.have.ownProperty('store');
                    expect(pjdsOptions.store, 'The store property should have properly changed to trustsys').to.match(/trustsys/);
                    done();
                };

                nock('http://IP             ')
                    .get('/trustsys/CDS')
                    .reply(200, trustUser);

                pjdsUtil.getUser(req, res, pjdsOptions, cb);
            });
        });
        describe('returns an error if', function() {
            it('no key is provided in the pJDSOptions', function(done) {
                var pjdsOptions = {};
                var cb = function() {};
                res.rdkSend = function(data) {
                    expect(data).to.have.ownProperty('code');
                    expect(data.code).to.match(/200.400.1024/);
                    done();
                };

                pjdsUtil.getUser(req, res, pjdsOptions, cb);
            });
            it('pjds sends back an error', function(done) {
                var pjdsOptions = {
                    key: subjectUser.uid
                };
                var cb = function(error, response, req, res, pjdsOptions) {
                    expect(response.statusCode).to.be(404);
                    expect(error).to.be.instanceOf(RdkError);
                    expect(pjdsOptions, 'The store property should have been set').to.have.ownProperty('store');
                    expect(pjdsOptions.store, 'The store property should have properly changed to ehmpusers').to.match(/ehmpusers/);
                    done();
                };

                nock('http://IP             ')
                    .get('/ehmpusers/urn:va:user:B14H:0007')
                    .reply(404, new Error('Pft, you thought wrong'));

                pjdsUtil.getUser(req, res, pjdsOptions, cb);
            });
        });
    });
    describe('.getUserWithFilteredPermissions', function() {
        beforeEach(function() {
            _.set(req, 'app.config', appConfig);

            nock('http://IP             ')
                .get('/permset/?filter=eq(%22status%22%2C%22active%22)')
                .reply(200, permissionSets);
            nock('http://IP             ')
                .get('/permission/?filter=eq(%22status%22%2C%22active%22)')
                .reply(200, permissions);
        });
        describe('returns an object from pjds if', function() {
            it('a key is provided', function(done) {
                var pjdsOptions = {
                    user: {
                        uid: subjectUser.uid,
                        store: 'ehmpusers'
                    }
                };
                var cb = function(error, response) {
                    expect(error, 'The error should be null').to.be.null();
                    expect(response, 'The test response data should have some keys').to.have.keys(['uid', 'permissionSet', 'permissionSets', 'permissions', 'status', 'createdBy', 'createdTime', 'lastSuccessfulLogin', 'lastUnsuccessfulLogin', 'unsuccessfulLoginAttemptCount']);
                    done();
                };

                nock('http://IP             ')
                    .get('/ehmpusers/urn:va:user:B14H:0007')
                    .reply(200, subjectUser);

                pjdsUtil.getUserWithFilteredPermissions(req, res, pjdsOptions, cb);
            });
            it('a key and the trustsys store is provided', function(done) {
                var pjdsOptions = {
                    user: {
                        uid: trustUser.uid,
                        store: 'trustsys' //overriding the default store
                    }
                };
                var cb = function(error, response) {
                    expect(error).to.be.null();
                    expect(response, 'The test response data should have some keys').to.have.keys(['uid', 'name', 'permissionSet', 'permissionSets', 'permissions', 'status', 'createdBy', 'createdTime', 'lastSuccessfulLogin', 'lastUnsuccessfulLogin', 'unsuccessfulLoginAttemptCount', 'systemDesignator']);
                    done();
                };

                nock('http://IP             ')
                    .get('/trustsys/CDS')
                    .reply(200, trustUser);

                pjdsUtil.getUserWithFilteredPermissions(req, res, pjdsOptions, cb);
            });
        });
        describe('returns an error if', function() {
            it('no key is provided in the pJDSOptions', function(done) {
                delete req.uid; //make sure the req has no uid
                var pjdsOptions = {};
                var cb = function(err, data) {};
                res.rdkSend = function(data) {
                    expect(data, 'The RdkError should have a code').to.have.ownProperty('code');
                    expect(data.code, 'The RdkError Code should match.').to.match(/200.400.1025/);
                    done();
                };

                pjdsUtil.getUserWithFilteredPermissions(req, res, pjdsOptions, cb);
            });
            it('pjds sends back an error', function(done) {
                var pjdsOptions = {
                    key: subjectUser.uid,
                    user: subjectUser
                };
                var cb = function(error, response) {
                    expect(response).to.be.null();
                    expect(error, 'RdkErrors should have a code').to.have.ownProperty('code');
                    expect(error.code, 'The error code should match').to.match(/200.500.1020/);
                    done();
                };

                nock('http://IP             ')
                    .get('/ehmpusers/urn:va:user:B14H:0007')
                    .reply(404, new Error('Pft, you thought wrong'));

                pjdsUtil.getUserWithFilteredPermissions(req, res, pjdsOptions, cb);
            });
        });
    });
    describe('.editUser', function() {
        beforeEach(function() {
            _.set(req, 'app.config', appConfig);
        });
        describe('returns an object from pjds if', function() {
            it('a key is provided', function(done) {
                var pjdsOptions = {
                    key: subjectUser.uid,
                    data: subjectUser
                };
                var cb = function(error, response, req, res, pjdsOptions) {
                    expect(error, 'The error should be null').to.be.null();
                    expect(response, 'The test response should not be empty').to.not.be.empty();
                    expect(pjdsOptions, 'The store property should have been set').to.have.ownProperty('store');
                    expect(pjdsOptions.store, 'The store property should have defaulted to ehmpusers').to.match(/ehmpusers/);
                    done();
                };

                nock('http://IP             ')
                    .filteringRequestBody(/.*/, '*')
                    .put('/ehmpusers/urn:va:user:B14H:0007', '*')
                    .reply(200, {
                        statusCode: 200
                    });

                pjdsUtil.editUser(req, res, pjdsOptions, cb);
            });
            it('a key is provided--sensitive fields are also removed', function (done) {
                var pjdsOptions = {
                    key: subjectUser.uid,
                    data: _.clone(subjectUser)
                };
                pjdsOptions.data.firstname = 'James';
                pjdsOptions.data.lastname = 'Bond';

                var cb = function (error, response, req, res, pjdsOptions) {
                    expect(error, 'The error should be null').to.be.null();
                    expect(response, 'The test response should not be empty').to.not.be.empty();
                    expect(pjdsOptions, 'The store property should have been set').to.have.ownProperty('store');
                    expect(pjdsOptions.store, 'The store property should have defaulted to ehmpusers').to.match(/ehmpusers/);
                    expect(pjdsOptions.data.firstname, 'The firstname should have been removed').to.be.undefined();
                    expect(pjdsOptions.data.lastname, 'The lastname should have been removed').to.be.undefined();
                    done();
                };

                nock('http://IP             ')
                    .filteringRequestBody(/.*/, '*')
                    .put('/ehmpusers/urn:va:user:B14H:0007', '*')
                    .reply(200, {
                        statusCode: 200
                    });

                pjdsUtil.editUser(req, res, pjdsOptions, cb);
            });
            it('a key and the trustsys store is provided', function(done) {
                var pjdsOptions = {
                    key: trustUser.uid,
                    data: trustUser,
                    store: 'trustsys' //overriding the default store
                };
                var cb = function(error, response, req, res, pjdsOptions) {
                    expect(error).to.be.null();
                    expect(response, 'The test response should not be empty').to.not.be.empty();
                    expect(pjdsOptions, 'The store property should have been set').to.have.ownProperty('store');
                    expect(pjdsOptions.store, 'The store property should have properly changed to trustsys').to.match(/trustsys/);
                    done();
                };

                nock('http://IP             ')
                    .filteringRequestBody(/.*/, '*')
                    .put('/trustsys/CDS', '*')
                    .reply(200, {
                        statusCode: 200
                    });

                pjdsUtil.editUser(req, res, pjdsOptions, cb);
            });
        });
        describe('returns an error if', function() {
            it('no key is provided in the pJDSOptions', function(done) {
                var pjdsOptions = {
                    data: subjectUser
                };
                var cb = function() {};
                res.rdkSend = function(data) {
                    expect(data).to.have.ownProperty('code');
                    expect(data.code).to.match(/200.400.1024/);
                    done();
                };

                pjdsUtil.editUser(req, res, pjdsOptions, cb);
            });
            it('pjds sends back an error', function(done) {
                var pjdsOptions = {
                    key: subjectUser.uid,
                    data: subjectUser
                };
                var cb = function(error, response, req, res, pjdsOptions) {
                    expect(response.statusCode).to.be(404);
                    expect(error).to.be.instanceOf(RdkError);
                    expect(pjdsOptions, 'The store property should have been set').to.have.ownProperty('store');
                    expect(pjdsOptions.store, 'The store property should have properly changed to ehmpusers').to.match(/ehmpusers/);
                    done();
                };

                nock('http://IP             ')
                    .filteringRequestBody(/.*/, '*')
                    .put('/ehmpusers/urn:va:user:B14H:0007', '*')
                    .reply(404, new Error('Pft, you thought wrong'));

                pjdsUtil.editUser(req, res, pjdsOptions, cb);
            });
        });
    });
    describe('.patchUser', function() {
        beforeEach(function() {
            _.set(req, 'app.config', appConfig);
        });
        describe('returns an object from pjds if', function() {
            it('a key is provided', function(done) {
                var pjdsOptions = {
                    key: subjectUser.uid,
                    data: subjectUser
                };
                var cb = function(error, response, req, res, pjdsOptions) {
                    expect(error, 'The error should be null').to.be.null();
                    expect(response, 'The test response should not be empty').to.not.be.empty();
                    expect(pjdsOptions, 'The store property should have been set').to.have.ownProperty('store');
                    expect(pjdsOptions.store, 'The store property should have defaulted to ehmpusers').to.match(/ehmpusers/);
                    done();
                };

                nock('http://IP             ')
                    .filteringRequestBody(/.*/, '*')
                    .patch('/ehmpusers/urn:va:user:B14H:0007', '*')
                    .reply(200, {
                        statusCode: 200
                    });

                pjdsUtil.patchUser(req, res, pjdsOptions, cb);
            });
            it('a key is provided--sensitive fields are also removed', function (done) {
                var pjdsOptions = {
                    key: subjectUser.uid,
                    data: _.clone(subjectUser)
                };
                pjdsOptions.data.firstname = 'James';
                pjdsOptions.data.lastname = 'Bond';

                var cb = function (error, response, req, res, pjdsOptions) {
                    expect(error, 'The error should be null').to.be.null();
                    expect(response, 'The test response should not be empty').to.not.be.empty();
                    expect(pjdsOptions, 'The store property should have been set').to.have.ownProperty('store');
                    expect(pjdsOptions.store, 'The store property should have defaulted to ehmpusers').to.match(/ehmpusers/);
                    expect(pjdsOptions.data.firstname, 'The firstname should have been removed').to.be.undefined();
                    expect(pjdsOptions.data.lastname, 'The lastname should have been removed').to.be.undefined();
                    done();
                };

                nock('http://IP             ')
                    .filteringRequestBody(/.*/, '*')
                    .patch('/ehmpusers/urn:va:user:B14H:0007', '*')
                    .reply(200, {
                        statusCode: 200
                    });

                pjdsUtil.patchUser(req, res, pjdsOptions, cb);
            });
            it('a key and the trustsys store is provided', function(done) {
                var pjdsOptions = {
                    key: trustUser.uid,
                    data: trustUser,
                    store: 'trustsys' //overriding the default store
                };
                var cb = function(error, response, req, res, pjdsOptions) {
                    expect(error).to.be.null();
                    expect(response, 'The test response should not be empty').to.not.be.empty();
                    expect(pjdsOptions, 'The store property should have been set').to.have.ownProperty('store');
                    expect(pjdsOptions.store, 'The store property should have properly changed to trustsys').to.match(/trustsys/);
                    done();
                };

                nock('http://IP             ')
                    .filteringRequestBody(/.*/, '*')
                    .patch('/trustsys/CDS', '*')
                    .reply(200, {
                        statusCode: 200
                    });

                pjdsUtil.patchUser(req, res, pjdsOptions, cb);
            });
        });
        describe('returns an error if', function() {
            it('no key is provided in the pJDSOptions', function(done) {
                var pjdsOptions = {
                    data: subjectUser
                };
                var cb = function() {};
                res.rdkSend = function(data) {
                    expect(data).to.have.ownProperty('code');
                    expect(data.code).to.match(/200.400.1024/);
                    done();
                };

                pjdsUtil.patchUser(req, res, pjdsOptions, cb);
            });
            it('pjds sends back an error', function(done) {
                var pjdsOptions = {
                    key: trustUser.uid,
                    data: trustUser,
                    store: 'trustsys'
                };
                var cb = function(error, response, req, res, pjdsOptions) {
                    expect(error).to.be.instanceOf(RdkError);
                    expect(pjdsOptions, 'The store property should have been set').to.have.ownProperty('store');
                    expect(pjdsOptions.store, 'The store property should have properly changed to trustsys').to.match(/trustsys/);
                    done();
                };

                nock('http://IP             ')
                    .filteringRequestBody(/.*/, '*')
                    .patch('/trustsys/CDS', '*')
                    .reply(404, new Error('Pft, not on your life'));

                pjdsUtil.patchUser(req, res, pjdsOptions, cb);
            });
        });
    });
    describe('.excludeSensitiveFields', function () {
        it('does nothing if nothing is passed in', function () {
            var result = pjdsUtil.excludeSensitiveFields();
            expect(result, 'Nothing should have been returned').to.be.undefined();
        });
        it('does nothing if no data is passed in', function () {
            var result = pjdsUtil.excludeSensitiveFields({});
            expect(result.data, '.data should have been empty').to.be.undefined();
        });
        it('leaves non-sensitive fields alone', function () {
            var pJDSOptions = {
                data: {
                    count: 1
                }
            };
            var result = pjdsUtil.excludeSensitiveFields(pJDSOptions);
            expect(result, 'pJDSOptions should not have changed').to.eql(pJDSOptions);
        });
        it('removes sensitive fields', function () {
            var pJDSOptions = {
                data: {
                    count: 1,
                    firstname: 'James',
                    lastname: 'Bond'
                }
            };
            var expected = {
                data: {
                    count: 1
                }
            };
            var result = pjdsUtil.excludeSensitiveFields(pJDSOptions);
            expect(result, '.firstname and .lastname should have been removed').to.eql(expected);
        });
        it('modifies the passed-in object', function () {
            var pJDSOptions = {
                data: {
                    count: 1,
                    firstname: 'James',
                    lastname: 'Bond'
                }
            };
            pjdsUtil.excludeSensitiveFields(pJDSOptions);
            expect(pJDSOptions.data.firstname, '.firstname should have been removed').to.be.undefined();
            expect(pJDSOptions.data.lastname, '.lastname should have been removed').to.be.undefined();
        });
    });
});
