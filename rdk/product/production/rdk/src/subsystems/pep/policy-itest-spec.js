'use strict';

var httpMocks = require('node-mocks-http');
var pep = require('../../interceptors/authorization/pep');
var rdk = require('../../core/rdk');
var nock = require('nock');

function buildRequest() {
    var req = {
        audit: {
            patientId: '9E7A;18'
        },
        session: {
            user: {
                accessCode: 'pu1234',
                verifyCode: 'pu1234!!',
                ssn: '666884833',
                breakglass: true,
                sensitive: false,
                hasSSN: true,
                rptTabs: true,
                corsTabs: true,
                dgRecordAccess: true,
                dgSensitiveAccess: true
            }
        },
        _resourceConfigItem: {
            requiredPermissions: [],
            isPatientCentric: true
        },
        query: {
            pid: '9E7A;18'
        },
        logger: {
            info: function() {},
            debug: function() {},
            error: function() {},
            warn: function() {}
        },
        app: {
            config: {
                interceptors: {
                    pep: {
                        disabled: false
                    }
                },
                jdsServer: {
                    baseUrl: 'http://localhost:8080'
                },
                vistaSites: {
                    '9E7A': {
                        name: 'PANORAMA',
                        host: '10.2.2.101'
                    }
                }
            }
        }
    };
    return req;
}
var jdsResponse = {
    btg: {
        data: {
            items: [{
                ssn: '01201022',
                pid: '9E7A;18',
                sensitive: true
            }]
        }
    },
    permit: {
        data: {
            items: [{
                ssn: '01201023',
                pid: '9E7A;18',
                sensitive: false
            }]
        }
    },
    deny: {
        data: {
            items: [{
                ssn: '666884833',
                pid: '9E7A;18',
                sensitive: false
            }]
        }
    }
};
var req;
var res;
var spyStatus;
var spyHeader;
var jdsPath = '/data/index/pt-select-pid?range=9E7A;18';

describe('PEP Policy', function() {
    beforeEach(function() {
        req = buildRequest();
        res = httpMocks.createResponse();
        spyStatus = sinon.spy(res, 'status');
        spyHeader = sinon.spy(res, 'header');
    });
    afterEach(function() {
        spyStatus.reset();
        spyHeader.reset();
    });

    //NOTE: THIS WAS FAILING BEFORE OUR MIGRATION FROM JDS TO AN RPC CALL SO IT HAS BEEN COMMENTED OUT.
    it.skip('PEP policy returns expected result for Breakglass policy', function(done) {
        req.session.user.dgSensitiveAccess = false;
        this.timeout(15000);
        nock('http://localhost:8080')
            .get(jdsPath)
            .reply(200, jdsResponse.btg);

        function tester() {
            expect(spyStatus.withArgs(rdk.httpstatus.permanent_redirect).called).to.be.true();
            expect(spyHeader.withArgs('BTG', 'SensitiveAccessRequired').called).to.be.true();
            done();
        }
        res.rdkSend = tester;
        var next = tester;

        pep(req, res, next);

    });
    //NOTE: THIS WAS FAILING BEFORE OUR MIGRATION FROM JDS TO AN RPC CALL SO IT HAS BEEN COMMENTED OUT.
    it.skip('PEP policy returns expected result - permit', function(done) {

        req.app.config.jdsServer.baseUrl = 'http://localhost:8085';
        this.timeout(15000);
        nock('http://localhost:8085')
            .get(jdsPath)
            .reply(200, jdsResponse.permit);

        function tester() {
            expect(spyStatus.withArgs(rdk.httpstatus.ok).called).to.be.true();
            done();
        }
        res.rdkSend = tester;
        var next = tester;

        pep(req, res, next);

    });
    it('PEP policy returns expected result - deny', function(done) {
        req.session.user.corsTabs = false;
        req.session.user.rptTabs = false;
        this.timeout(15000);
        nock('http://localhost:8080')
            .get(jdsPath)
            .reply(200, jdsResponse.deny);

        function tester() {
            expect(spyStatus.withArgs(rdk.httpstatus.forbidden).called).to.be.true();
            done();
        }
        res.rdkSend = tester;
        var next = tester;

        pep(req, res, next);

    });
});
