'use strict';
var _ = require('lodash');
var moment = require('moment');
var httpMocks = require('node-mocks-http');
var logger = sinon.stub(require('bunyan').createLogger({
    name: 'osyncUserData'
}));
var osyncUserData = require('./osync-users');
var rdk = require('../../../core/rdk');
var pjds = rdk.utils.pjdsStore;
var SITE = '9E7A';

describe('Osync Users module', function() {
    var req;
    var res;
    var cb;
    var postStub;

    beforeEach(function(done) {
        req = httpMocks.createRequest({
            method: 'GET',
            url: '/authenticate'
        });
        req.logger = logger;
        _.set(req, 'app.config.jdsServer', {});

        cb = sinon.spy();
        postStub = sinon.stub(pjds, 'post');
        res = httpMocks.createResponse();

        done();
    });

    afterEach(function(done) {
        cb.reset();
        postStub.restore();
        done();
    });

    it('expect saveOsyncUsers to not error and send back data', function() {
        var expires = moment().add(10, 'minutes').utc().format();
        var body = 'some random data came back';
        var result = {
            statusCode: 200,
            data: body
        };
        var params = {
            site: SITE,
            data: {
                site: SITE,
                expires: expires,
                duz: {
                    '9E7A': 'new-osync-user'
                }
            }
        };
        _.set(req, 'session.expires', expires);
        postStub.callsArgWith(3, null, result, body);
        osyncUserData.saveOsyncUsers(req, res, cb, params);
        expect(cb.called).to.be.true();
        expect(cb.args[0][0]).to.be.null();
        expect(cb.args[0][1]).not.to.be.empty();
    });

    it('expect saveOsyncUsers not to be pass on any errors received from pJDS', function() {
        var expires = moment().add(10, 'minutes').utc().format();
        var params = {
            site: SITE,
            data: {
                site: SITE,
                expires: expires,
                duz: {
                    '9E7A': 'new-osync-user'
                }
            }
        };
        _.set(req, 'session.expires', expires);
        postStub.callsArgWith(3, new Error('This is bogus'), null, null);
        osyncUserData.saveOsyncUsers(req, res, cb, params);
        expect(cb.called).to.be.true();
        expect(cb.args[0][0]).to.be.null();
        expect(cb.args[0][1]).to.be.truthy();
    });
});
