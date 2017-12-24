'use strict';

var _ = require('lodash');
var nock = require('nock');
var httpMocks = require('node-mocks-http');
var getPermissionSetsFeatures = require('./get-permission-sets-features');
var logger = sinon.stub(require('bunyan').createLogger({
    name: 'get-permission-sets-features'
}));

var featurePermissions = [
    {
        'uid': 'vitals',
        'description': 'Vitals feature category',
        'label': 'Vitals',
        'permissions': [
            'read-vitals',
            'eie-vitals',
            'add-vitals'
        ],
        'status': 'active'
    }, {
        'uid': 'problems',
        'description': 'Problems feature category',
        'label': 'Problems',
        'permissions': [
            'read-problems',
            'add-problems'
        ],
        'status': 'active'
    }
];

describe('Get feature categories for permissions', function() {
    var req;
    var res;

    beforeEach(function() {
        req = httpMocks.createRequest({
            method: 'GET',
            url: 'resource/permission-sets/features-list'
        });
        _.set(req, 'app.config.generalPurposeJdsServer', {
            baseUrl: 'http://IP             ',
            urlLengthLimit: 120
        });
        _.set(req, 'audit', {});
        _.set(req, 'logger', logger);
        res = httpMocks.createResponse();
        nock.disableNetConnect();
    });

    afterEach(function() {
        nock.cleanAll();
        nock.enableNetConnect();
    });

    it('returns a list of feature categories for permissions', function(done) {
        nock('http://IP             ')
            .get('/featperms/')
            .reply(200, featurePermissions);

        res.rdkSend = function(response) {
            _.each(response.data, function(item) {
                expect(item).to.have.property('label');
                expect(item).to.have.property('uid');
                expect(item).to.have.property('permissions');
            });
            done();
        };

        getPermissionSetsFeatures(req, res);
    });

    it('returns a list of permission sets', function(done) {
        nock('http://IP             ')
            .get('/featperms/')
            .replyWithError('Something went wrong');

        res.rdkSend = function(response) {
            expect(response).to.match(/There was an error retrieving feature permissions list./);
            done();
        };

        getPermissionSetsFeatures(req, res);
    });
});
