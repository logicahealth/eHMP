'use strict';

var _ = require('lodash');
var nock = require('nock');
var httpMocks = require('node-mocks-http');
var rdk = require('../../core/rdk');
var RdkError = rdk.utils.RdkError;
var userList = require('./get-user-list');
var logger = sinon.stub(require('bunyan').createLogger({
    name: 'get-user-list-spec'
}));
/*jshint -W109:start */
var expected = {
    "duz": "1111",
    "exactMatchCount": 1,
    "facility": "",
    "fname": "Bob",
    "lname": "Doe",
    "permissionSet": {
        "val": ["think-about-it"]
    },
    "site": "SITE",
    "status": "active",
    "uid": "urn:va:user:SITE:1111",
    "vistaStatus": "active"
};
/*jshint -W109:end */

var blankResponse = {
    updated: 20170627095453,
    totalItems: 0,
    currentItemCount: 0,
    items: []
};

var jdsResponse = {
    data: {
        updated: 20170627095453,
        totalItems: 0,
        currentItemCount: 0,
        items: [{
            uid: 'urn:va:user:SITE:1111',
            name: 'Doe,Bob'
        }]
    }
};

var pjdsResponse = {
    updated: 20170627095453,
    totalItems: 0,
    currentItemCount: 0,
    items: [{
        uid: 'urn:va:user:SITE:1111',
        permissionSet: {
            val: ['think-about-it']
        }
    }]
};

describe('getUserList', function () {

    var req;
    var res;

    beforeEach(function () {
        req = buildRequest();
        res = {
            status: function (stat) {
                this.statusCode = stat;
                return this;
            },
            rdkSend: function (data) {
                return data;
            }
        };
    });

    afterEach(function () {
        nock.cleanAll();
    });

    it('returns an empty collection if requested', function () {
        req.params = {
            fetchEmptyCollection: 'true'
        };
        req.rdkSend = function(data){
            expect(data).to.eql([]);
        };
        userList.getUserList(req, res);
    });

    it('handles an unparsable user.filter', function () {
        _.set(req, 'query', '{uid: "urn:va:user:SITE:1111", permissionS');

        req.rdkSend = function(data){
            expect(data).to.eql('Cannot parse filter parameters');
        };

        userList.getUserList(req, res);
    });

    it('handles an error from pjds', function (done) {
        res.rdkSend = function (data) {
            expect(data).to.match(/An error occured processing the results of user data/);
            done();
        };

        nock('http://IP             ')
            .get('/ehmpusers/index/ehmpusers_uid')
            .replyWithError({code: 404, message: 'Broken beyond repair.'});

        nock('http://IP             ')
            .get('/data/index/user-uid?filter=or(eq(%22localId%22%2C%221111%22)%2Cilike(%22uid%22%2C%22%251111%25%22))%2Cne(%22disuser%22%2C%22true%22)%2Cne(%22terminated%22%2C%22true%22)&order=name%20asc&range=urn%3Ava%3Auser%3ASITE%3A*')
            .reply(200, {data: jdsResponse});

        userList.getUserList(req, res);
    });

    it('handles an error from jds', function (done) {
        res.rdkSend = function (data) {
            expect(data).to.not.be.instanceOf(RdkError);
            expect(data).to.match(/Expected JDS Conditions were not met for a list of users/);
            done();
        };

        nock('http://IP             ')
            .get('/ehmpusers/index/ehmpusers_uid')
            .reply(200, pjdsResponse);

        nock('http://IP             ')
            .get('/data/index/user-uid?filter=or(eq(%22localId%22%2C%221111%22)%2Cilike(%22uid%22%2C%22%251111%25%22))%2Cne(%22disuser%22%2C%22true%22)%2Cne(%22terminated%22%2C%22true%22)&order=name%20asc&range=urn%3Ava%3Auser%3ASITE%3A*')
            .reply({code: 404, message: 'This is a stupid error, make ready the warhammers!'});

        userList.getUserList(req, res);
    });

    it('handles an empty response from jds', function (done) {
        res.rdkSend = function (data) {
            expect(data).to.not.be.instanceOf(RdkError);
            expect(data).to.be.empty();
            done();
        };

        nock('http://IP             ')
            .get('/ehmpusers/index/ehmpusers_uid')
            .reply(200, pjdsResponse);

        nock('http://IP             ')
            .get('/data/index/user-uid?filter=or(eq(%22localId%22%2C%221111%22)%2Cilike(%22uid%22%2C%22%251111%25%22))%2Cne(%22disuser%22%2C%22true%22)%2Cne(%22terminated%22%2C%22true%22)&order=name%20asc&range=urn%3Ava%3Auser%3ASITE%3A*')
            .reply(200, {data: blankResponse});

        userList.getUserList(req, res);
    });

    it('handles an empty response from pjds', function (done) {
        res.rdkSend = function (data) {
            expect(data).to.not.be.instanceOf(RdkError);
            expect(data).to.be.empty();
            done();
        };

        nock('http://IP             ')
            .get('/ehmpusers/index/ehmpusers_uid')
            .reply(200, blankResponse);

        nock('http://IP             ')
            .get('/data/index/user-uid?filter=or(eq(%22localId%22%2C%221111%22)%2Cilike(%22uid%22%2C%22%251111%25%22))%2Cne(%22disuser%22%2C%22true%22)%2Cne(%22terminated%22%2C%22true%22)&order=name%20asc&range=urn%3Ava%3Auser%3ASITE%3A*')
            .reply(200, jdsResponse);

        userList.getUserList(req, res);
    });

    it('properly removes any bad data from jds', function (done) {
        var items = _.union([{uid: 'urn:va:user:SITE:1117'}], jdsResponse.data.items);
        res.rdkSend = function (data) {
            expect(data).to.not.be.
            empty();
            expect(data[0]).to.have.keys(['duz', 'exactMatchCount', 'facility', 'fname', 'lname', 'permissionSet', 'site', 'status', 'uid', 'vistaStatus']);
            done();
        };

        nock('http://IP             ')
            .get('/ehmpusers/index/ehmpusers_uid')
            .reply(200, pjdsResponse);

        nock('http://IP             ')
            .get('/data/index/user-uid?filter=or(eq(%22localId%22%2C%221111%22)%2Cilike(%22uid%22%2C%22%251111%25%22))%2Cne(%22disuser%22%2C%22true%22)%2Cne(%22terminated%22%2C%22true%22)&order=name%20asc&range=urn%3Ava%3Auser%3ASITE%3A*')
            .reply(200, {
                data: {
                    items: items
                }
            });

        userList.getUserList(req, res);
    });

    it('handles merger from jds and pjds', function (done) {
        res.rdkSend = function (data) {
            expect(data).to.not.be.
            empty();
            expect(data[0]).to.be.eql(expected);
            done();
        };

        nock('http://IP             ')
            .get('/ehmpusers/index/ehmpusers_uid')
            .reply(200, pjdsResponse);

        nock('http://IP             ')
            .get('/data/index/user-uid?filter=or(eq(%22localId%22%2C%221111%22)%2Cilike(%22uid%22%2C%22%251111%25%22))%2Cne(%22disuser%22%2C%22true%22)%2Cne(%22terminated%22%2C%22true%22)&order=name%20asc&range=urn%3Ava%3Auser%3ASITE%3A*')
            .reply(200, jdsResponse);

        userList.getUserList(req, res);
    });


    function buildRequest(defaults) {
        var request = _.merge(httpMocks.createRequest({
            method: 'GET',
            url: '/user/list',
            params: {
                'user.filter': '{"duz":1111}'
            }
        }), defaults);

        request.logger = logger;

        request.audit = {};

        request.session = {
            user: {
                uid: 'urn:va:user:SITE:007',
                site: 'SITE'
            }
        };

        request.app = {
            config: {
                jdsServer: {
                    baseUrl: 'http://IP             ',
                    urlLengthLimit: 120
                },
                generalPurposeJdsServer: {
                    baseUrl: 'http://IP             ',
                    urlLengthLimit: 120
                },
                vistaSites: {
                    'SITE': {
                        division: [
                            {
                                id:500,
                                name: 'Panny'
                            }
                        ]
                    }
                }
            }
        };

        return request;
    }
});
