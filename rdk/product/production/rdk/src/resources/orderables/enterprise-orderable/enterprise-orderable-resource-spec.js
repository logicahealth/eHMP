'use strict';

var _ = require('lodash');
var rdk = require('../../../core/rdk');
var pjds = rdk.utils.pjdsStore;
var enterpriseOrderable = require('../../../subsystems/orderables/enterprise-orderable-subsystem');

var logger = {
    trace: function() {},
    debug: function() {},
    info: function() {},
    warn: function() {},
    error: function() {},
    fatal: function() {}
};

function noop() {}

function createReqWithParam(map) {
    map = map || {};
    var req = {
        param: (function param(map, name, defaultValue) {
            if (_.has(map, name)) {
                return map[name] !== null ? String(map[name]) : null;
            }

            if (defaultValue !== undefined && defaultValue !== null) {
                String(defaultValue);
            }

            return defaultValue;
        }).bind(null, map),

        query: map,
        logger: logger,
        audit: {},
        app: {
            config: {},
            subsystems: {
                enterpriseOrderable: enterpriseOrderable
            }
        },
        session: {
            user: {
                site: 'vistaSite',
                uid: 'userUid'
            }
        }
    };
    return req;
}

describe('enterpriseOrderables', function() {
    var req;
    var res = {
        status: function() {
            return {
                rdkSend: noop,
                send: noop
            };
        }
    };
    var enterpriseOrderablePayload;
    var pjdsPutOptions;
    var pjdsGetOptions;
    var pjdsDeleteOptions;
    var storedData;
    var pjdsGetResult;


    beforeEach(function() {
        pjdsPutOptions = null;

        req = createReqWithParam();

        enterpriseOrderablePayload = {
            'name': 'Physical Therapy Consult',
            'state': 'active',
            'facility-enterprise': '',
            'type': 'ehmp-enterprise-orderable',
            'domain': 'ehmp-activity',
            'subDomain': 'consult',
            'data': {
                'activity': {
                    'deploymentId': 'VistaCore:Order',
                    'processDefinitionId': 'Order:Consult'
                },
                'prerequisites': {
                    'cdsIntent': 'name of a cds intent to be executed',
                    'questions': [{'question':'What?'}, {'question':'When?'}]
                },
                'codes': [
                    {
                    'code': '2601-3',
                    'system': 'urn:oid:2.16.840.1.113883.6.1',
                    'display': 'Magnesium [Moles/volume] in Serum or Plasma'
                    }
                ],
                'data': {
                }
            },
        };
        sinon.spy(res, 'status');

        sinon.stub(pjds, 'post', function(req, res, options, callback) {
            storedData = options.data;
            pjdsPutOptions = options;
        });
        sinon.stub(pjds, 'put', function(req, res, options, callback) {
            storedData = options.data;
            pjdsPutOptions = options;
        });
        sinon.stub(pjds, 'get', function(req, res, options, callback) {
            callback(null, pjdsGetResult);
            pjdsGetOptions = options;
        });
        sinon.stub(pjds, 'delete', function(req, res, options, callback) {
            callback(null, pjdsGetResult);
            pjdsDeleteOptions = options;
        });
    });

    describe('CREATE', function() {
        beforeEach(function() {
            pjdsGetResult = {
                data: []
            };
        });

        it('Creates a enterpriseOrderable', function() {
            req.body = enterpriseOrderablePayload;
            enterpriseOrderable.create(req, res);
            expect(pjdsPutOptions.data).to.equal(enterpriseOrderablePayload);
            expect(pjds.post.called).to.be.true();
        });
        it('Returns HTTP-400 bad request if enterpriseOrderable payload is missing', function() {
            req.body = undefined;
            enterpriseOrderable.create(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
        it('Returns HTTP-400 bad request if the enterpriseOrderable payload\'s domain is missing', function() {
            enterpriseOrderablePayload.domain = undefined;
            req.body = enterpriseOrderablePayload;
            enterpriseOrderable.create(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
        it('Returns HTTP-400 bad request if the enterpriseOrderable payload\'s subDomain is missing', function() {
            enterpriseOrderablePayload.subDomain = undefined;
            req.body = enterpriseOrderablePayload;
            enterpriseOrderable.create(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
        it('Returns HTTP-400 bad request if the enterpriseOrderable payload\'s name is missing', function() {
            enterpriseOrderablePayload.name = undefined;
            req.body = enterpriseOrderablePayload;
            enterpriseOrderable.create(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
        it('Returns HTTP-409 conflict if there\'s a name collision', function() {
            pjdsGetResult.data = [
                'found one item'
            ]; // mock a name collision
            req.body = enterpriseOrderablePayload;
            enterpriseOrderable.create(req, res);
            expect(res.status.calledWith(rdk.httpstatus.conflict)).to.be.true();
        });
    });

    describe('UPDATE', function() {
        beforeEach(function() {
            pjdsGetResult = {
                data: []
            };
            enterpriseOrderablePayload.uid = 'someUid';
            req = createReqWithParam({
                uid: 'someUid'
            });
        });

        it('Updates a enterpriseOrderable', function() {
            enterpriseOrderablePayload.uid = 'someUid';
            req.body = enterpriseOrderablePayload;
            enterpriseOrderable.update(req, res);
            expect(pjdsPutOptions.data).to.equal(enterpriseOrderablePayload);
            expect(pjds.put.called).to.be.true();
        });
        it('Returns HTTP-400 bad request if the required uid parameter is missing', function() {
            req = createReqWithParam();
            enterpriseOrderablePayload.uid = 'someUid';
            req.body = enterpriseOrderablePayload;
            enterpriseOrderable.update(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
        it('Returns HTTP-400 bad request if enterpriseOrderable payload is missing', function() {
            req.body = undefined;
            enterpriseOrderable.update(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
        it('Returns HTTP-400 bad request if the enterpriseOrderable payload\'s name is missing', function() {
            enterpriseOrderablePayload.name = undefined;
            req.body = enterpriseOrderablePayload;
            enterpriseOrderable.update(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
        it('Returns HTTP-400 bad request if the enterpriseOrderable payload\'s uid does not match the uid in the url parameter', function() {
            req = createReqWithParam({
                uid: 'aDifferentUid'
            });
            enterpriseOrderablePayload.name = undefined;
            req.body = enterpriseOrderablePayload;
            enterpriseOrderable.update(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
        it('Returns HTTP-409 conflict if there\'s a name collision', function() {
            pjdsGetResult.data = [
                'found one item'
            ]; // mock a name collision
            req.body = enterpriseOrderablePayload;
            enterpriseOrderable.update(req, res);
            expect(res.status.calledWith(rdk.httpstatus.conflict)).to.be.true();
        });
    });
    describe('GET enterpriseOrderable BY UID', function() {
        it('calls pjds-store with the correct options', function() {
            req = createReqWithParam({
                uid: 'someUid'
            });
            enterpriseOrderable.get(req, res);
            expect(pjdsGetOptions.key).to.equal('someUid');
            expect(pjds.get.called).to.be.true();
        });
        it('Returns HTTP-400 bad request if the required uid parameter is missing', function() {
            enterpriseOrderable.get(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });

    });
    describe('DELETE', function() {
        it('calls pjds-store with the correct options', function() {
            req = createReqWithParam({
                uid: 'someUid'
            });
            enterpriseOrderable.delete(req, res);
            expect(pjdsGetOptions.key).to.equal('someUid');
            expect(pjds.delete.called).to.be.true();
        });
        it('Returns HTTP-400 bad request if the required uid parameter is missing', function() {
            enterpriseOrderable.delete(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });

    });
});
