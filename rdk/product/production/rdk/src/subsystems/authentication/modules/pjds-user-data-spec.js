'use strict';
var _ = require('lodash');
var nock = require('nock');
var httpMocks = require('node-mocks-http');
var logger = sinon.stub(require('bunyan').createLogger({
    name: 'pjds-user-data-spec'
}));
var pjdsUserData = require('./pjds-user-data');

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
var fakeUser = {
    uid: 'FAKER',
    name: 'FAKER',
    permissionSet: {
        val: ['read-access'],
        additionalPermissions: ['knifes-edge']
    },
    breakglass: true
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

describe('pJDS eHMP User Data module', function() {
    var req;
    var res;

    beforeEach(function(done) {
        req = httpMocks.createRequest({
            method: 'GET',
            url: '/ehmpusers/{uid}'
        });
        req.logger = logger;
        _.set(req, 'app.config', appConfig);

        res = httpMocks.createResponse();

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

    it('makes the callback early with an error and no data if the uid is blank', function(done) {
        var data = {
            duz: {}
        };
        var params = {
            site: 'SITE',
            data: data
        };

        var cb = function(err, data) {
            expect(err.code, 'The error code should match the given error').to.match(/202.412.1001/);
            expect(data, 'No data should be send on the callback with error').to.be.null();
            done();
        };

        pjdsUserData.getEhmpUserData(req, res, cb, params);
    });

    it('makes the callback with error when pjds returns an error', function(done) {
        var data = {
            uid: 'urn:va:user:B14H:0007'
        };
        var params = {
            site: 'B14H',
            data: data
        };

        var cb = function (err, data) {
            expect(err.code, 'The error code should match the given error').to.match(/202.500.1001/);
            expect(data, 'No data should be send on the callback with error').to.be.null();
            done();
        };

        nock('http://IP             ')
            .get('/ehmpusers/urn:va:user:B14H:0007')
            .reply(404, new Error('Address Unknown'));

        pjdsUserData.getEhmpUserData(req, res, cb, params);
    });

    it('makes the callback when pJDS returns data as expected', function(done) {
        var data = {
            uid: 'urn:va:user:B14H:0007'
        };
        var params = {
            site: 'B14H',
            data: data
        };

        var cb = function (err, data) {
            expect(err, 'The error should be null').to.be.null();
            expect(data, 'The response should have the following keys').to.be.have.keys(['eHMPUIContext', 'preferences', 'permissions', 'permissionSets', 'uid', 'unsuccessfulLoginAttemptCount', 'nationalAccess']);
            expect(_.get(data, 'unsuccessfulLoginAttemptCount'), 'The login count should be reset to 0').to.be(0);
            expect(_.get(data, 'permissionSets'), 'The response should contain the following permission sets').to.be.a.permutationOf(['read-access', 'sumo-wrestler']);
            done();
        };

        nock('http://IP             ')
            .get('/ehmpusers/urn:va:user:B14H:0007')
            .reply(200, subjectUser);

        pjdsUserData.getEhmpUserData(req, res, cb, params);
    });
});

describe('pJDS trust system data call', function() {
    var req;
    var res;

    beforeEach(function(done) {
        req = httpMocks.createRequest({
            method: 'GET',
            url: '/trustsys/{uid}'
        });
        req.logger = logger;
        _.set(req, 'app.config', appConfig);

        nock('http://IP             ')
            .get('/permset/?filter=ilike(%22status%22%2C%22active%25%22)')
            .reply(200, permissionSets);
        nock('http://IP             ')
            .get('/permission/?filter=ilike(%22status%22%2C%22active%25%22)')
            .reply(200, permissions);

        res = httpMocks.createResponse();

        done();
    });

    afterEach(function(done) {
        nock.cleanAll();
        done();
    });

    it('makes the callback early with an error and no data if the name is blank', function(done) {
        var params = {};
        var cb = function (err, data)  {
            expect(err.code, 'The error code should match the given error').to.match(/202.412.1001/);
            expect(data, 'No data should be send on the callback with error').to.be.null();
            done();
        };

        pjdsUserData.getTrustedSystemData(req, res, cb, params);
    });

    it('makes the callback with error when pjds returns an error', function(done) {
        var params = {
            name: 'NBC'
        };

        var cb = function (err, data) {
            expect(err.code, 'The error code should match the given error').to.match(/202.401.1003/);
            expect(data, 'No data should be send on the callback with error').to.be.null();
            done();
        };

        nock('http://IP             ')
            .get('/trustsys/NBC')
            .reply(404, new Error('Nope. Not gonna do it!'));

        pjdsUserData.getTrustedSystemData(req, res, cb, params);
    });

    it('makes the callback with no data when pjds returns no error and a name that doesn\'t match the requested name', function(done) {
        var params = {
            name: 'CDS'
        };
        var cb = function (err, data) {
            expect(err.error).to.match(/response name did not match the request name/);
            expect(data, 'No data should be send on the callback with error').to.be.null();
            done();
        };

        nock('http://IP             ')
            .get('/trustsys/CDS')
            .reply(200, fakeUser);

        pjdsUserData.getTrustedSystemData(req, res, cb, params);
    });

    it('makes the callback with data when pjds returns no error', function(done) {
        var params = {
            name: 'CDS'
        };
        var cb = function (err, data) {
            expect(err, 'The error should be null').to.be.null();
            expect(_.keys(data), 'Response should have keys').to.be.permutationOf(['uid','name','permissionSet','status','systemDesignator','createdBy','createdTime','lastSuccessfulLogin','lastUnsuccessfulLogin','unsuccessfulLoginAttemptCount','permissions','breakglass','consumerType','permissionSets']);
            done();
        };

        nock('http://IP             ')
            .get('/trustsys/CDS')
            .reply(200, trustUser);

        pjdsUserData.getTrustedSystemData(req, res, cb, params);
    });
});

describe('pJDS store login attempt call', function() {
    var req;
    var res;

    beforeEach(function(done) {
        req = httpMocks.createRequest({
            method: 'GET',
            url: '/ehmpusers/{uid}'
        });
        req.logger = logger;
        _.set(req, 'app.config', appConfig);

        res = httpMocks.createResponse();

        done();
    });

    afterEach(function(done) {
        nock.cleanAll();
        done();
    });

    it('makes the callback early with data if the uid is blank', function(done) {
        var params = {
            data: {}
        };
        var cb =function (err, data) {
            expect(err.code, 'The error code should match the given error').to.be.match(/202.412.1001/);
            expect(data, 'No data should be send on the callback with error').to.be.null();
            done();
        };

        pjdsUserData.setLoginAttempt(req, res, cb, params);
    });

    it('makes the callback with error when pjds returns an error', function(done) {
        var cb = function (err, data) {
            expect(err.code, 'The error code should match the given error').to.match(/202.500.1001/);
            expect(data, 'No data should be send on the callback with error').to.be.null();
            done();
        };
        var params = {};
        _.set(params, 'data', {});
        _.set(req, 'session.user.uid', 'urn:va:user:B14H:0007');

        nock('http://IP             ')
            .patch('/ehmpusers/urn:va:user:B14H:0007')
            .reply(404, new Error('This is bogus'));

        pjdsUserData.setLoginAttempt(req, res, cb, params);
    });

    it('sets default data properly for pjds patch if error during login', function(done) {
        var message = 'login wasn\'t successful';
        var cb = function (err, data) {
            expect(err, 'The error message should match the given message').to.match(message);
            expect(data, 'No data should be send on the callback with error').to.be.null();
            done();
        };
        var params = {};
        _.set(params, 'data', {});
        _.set(params, 'error', new Error(message));
        _.set(req, 'session.user.uid', 'urn:va:user:B14H:0007');

        nock('http://IP             ')
            .patch('/ehmpusers/urn:va:user:B14H:0007')
            .reply(200, subjectUser);

        pjdsUserData.setLoginAttempt(req, res, cb, params);
    });

    it('makes the callback with data when pjds returns no error', function(done) {
        var cb = function (err, data) {
            expect(err, 'The error should be null').to.be.null();
            expect(data).to.have.keys(['permissions', 'permissionSets']);
            done();
        };
        var params = {};
        _.set(params, 'data.permissionSets', ['sumo-wrestler']);
        _.set(params, 'data.permissions', ['judo-chop']);
        _.set(req, 'session.user.uid', 'urn:va:user:B14H:0007');

        nock('http://IP             ')
            .patch('/ehmpusers/urn:va:user:B14H:0007')
            .reply(200, subjectUser);

        pjdsUserData.setLoginAttempt(req, res, cb, params);
    });
});
