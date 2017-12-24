'use strict';

var _ = require('lodash');
var nock = require('nock');
var httpMocks = require('node-mocks-http');
var getUserPermissionSets = require('./get-user-permission-sets');
var logger = sinon.stub(require('bunyan').createLogger({
    name: 'get-user-permission-sets'
}));
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

describe('Get User Permission Sets', function() {
    var req;
    var res;

    beforeEach(function(done) {
        req = httpMocks.createRequest({
            method: 'PUT',
            url: 'resource/permission-sets/getUserPermissionSets'
        });
        _.set(req, 'app.config.generalPurposeJdsServer', {
            baseUrl: 'http://IP             ',
            urlLengthLimit: 120
        });
        _.set(req, 'audit', {});
        _.set(req, 'logger', logger);
        _.set(req, 'query.uid', subjectUser.uid);
        res = httpMocks.createResponse();
        res.rdkSend = function (result) {};

        nock('http://IP             ')
            .get('/permset/?filter=eq(%22status%22%2C%22active%22)')
            .reply(200, permissionSets);
        nock('http://IP             ')
            .get('/permission/?filter=eq(%22status%22%2C%22active%22)')
            .reply(200, permissions);
        done();
    });

    afterEach(function(done) {
        nock.cleanAll();
        done();
    });

    it('returns the permission sets of a specific user', function(done) {
        nock('http://IP             ')
            .get('/ehmpusers/urn:va:user:B14H:0007')
            .reply(200, subjectUser);
        res.rdkSend = function(response) {
            expect(_.get(response, 'val', []).indexOf('sumo-wrestler'), 'sumo-wrestler should be a listed value').to.be.above(-1);
            expect(_.get(response, 'val', []).indexOf('read-access'), 'read-access should be a listed value').to.be.above(-1);
            expect(_.get(response, 'val', []).indexOf('potty-trained'), 'potty-trained is deprecated and should not be listed').to.be(-1);
            expect(_.get(response, 'additionalPermissions', []).indexOf('judo-chop'), 'judo-chop should be a listed additionalPermissions').to.be.above(-1);
            expect(_.get(response, 'additionalPermissions', []).indexOf('can-yodel'), 'can-yodel is deprecated and should not be listed').to.be(-1);
            done();
        };

        getUserPermissionSets(req, res);
    });

    it('returns the an error message if a problem occurs at the store', function(done) {
        nock('http://IP             ')
            .get('/ehmpusers/urn:va:user:B14H:0007')
            .reply(404, new Error('Nothing there at this address'));
        res.rdkSend = function(response) {
            expect(response, 'The response should have an Error message').to.match(/Error/);
            done();
        };

        getUserPermissionSets(req, res);
    });
});
