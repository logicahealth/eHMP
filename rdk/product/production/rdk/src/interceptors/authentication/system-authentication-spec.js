'use strict';

var moment = require('moment');
var httpMocks = require('node-mocks-http');
var sysAuth = require('./system-authentication');
var rdk = require('../../core/rdk');

var VALID_SYSTEM = 'CDS';


function buildRequest(systemUser) {
    var headers = {

    };
    var expires = moment().utc().add(14, 'minutes');

    if (systemUser) {
        var authHeader = new Buffer(systemUser).toString();
        headers.Authorization = authHeader;
    }

    var request = httpMocks.createRequest({
        method: 'POST',
        url: '/authenticate/system'
    });

    request.get = function(header) {
        return headers[header];
    };

    request.rdkSend = function() {
        return this;
    };

    request.logger = {
        trace: function() {},
        debug: function() {},
        info: function() {},
        warn: function() {},
        error: function() {}
    };

    request.app = {
        config: {}
    };

    request.audit = {};

    request.session = {
        cookie: {
            expires: expires,
            path: '/'
        },
        expires: expires
    };

    return request;
}

describe('System Authentication test mock request', function() {
    it('tests that Authorization header is created correctly', function() {
        var req = buildRequest(VALID_SYSTEM);
        expect(req.get('Authorization')).not.to.be.undefined();

        req = buildRequest();
        expect(req.get('Authorization')).to.be.undefined();
    });
});

describe('System Authentication', function(){
    it('tests that an authenticated system user bypasses the authentication calls and calls next()', function(){
        var next = sinon.spy();
        var req = buildRequest(VALID_SYSTEM);
        //add the session data
        req.session.systemName = VALID_SYSTEM;
        req.session.user = {
            expires: req.session.expires,
            name: VALID_SYSTEM,
            permissionSets: [],
            permissions: []
        };
        var res = httpMocks.createResponse();

        sysAuth(req, res, next);
        expect(next.called).to.be.true();
    });
    it('tests that passing no Authorization Header will return unauthorized', function(done){
        var next = sinon.spy();
        var req = buildRequest();
        var res = {
            status: function(status){
                expect(status).to.be(rdk.httpstatus.unauthorized);
                return this;
            },
            rdkSend: function(data) {
                expect(next.called).to.be.false();
                done();
            }
        };

        sysAuth(req, res, next);
    });
    it('tests that an acceptable Authorization Header will call next', function(){
        var next = sinon.spy();
        var req = buildRequest(VALID_SYSTEM);
        var res = httpMocks.createResponse();
        var pjds = sinon.stub(rdk.utils.pjdsStore, 'get');
        pjds.onCall(0).returns({
            'uid': 'CDS',
            'name': 'CDS',
            'systemDesignator': 'internal',
            'permissionSet': {
                'val': ['read-access'],
                'additionalPermissions': []
            }
        });
        pjds.onCall(1).returns([{
           'uid': 'read-access',
           'label': 'Read Access',
           'permissions': [
              'read-patient-record',
              'read-active-medication',
              'read-allergy',
              'read-clinical-reminder',
              'read-community-health-summary',
              'read-condition-problem',
              'read-document',
              'read-encounter',
              'read-immunization',
              'read-medication-review',
              'read-order',
              'read-patient-history',
              'read-stack-graph',
              'access-stack-graph',
              'read-task',
              'read-timeline',
              'read-vista-health-summary',
              'read-vital'
           ]
        }]);

        var auth = sysAuth(req, res, next);
    });
});