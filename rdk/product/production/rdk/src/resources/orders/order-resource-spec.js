'use strict';

var clinicalObjectsResources = require('./order-resource');
var httpMocks = require('node-mocks-http');
var req;
var res;
var logger = sinon.stub(require('bunyan').createLogger({
    name: 'orders-resource'
}));

describe('Unit tests for order resource', function() {
    var resources = clinicalObjectsResources.getResourceConfig();

    it('should show that getResourceConfig() is functioning correctly', function() {
        expect(resources.length).to.equal(1);
        var getListResource = resources[0];

        expect(getListResource.name).to.be('all-orders');
        expect(getListResource.path).to.be('/all-orders');
        expect(getListResource.interceptors).to.eql({
            jdsFilter: true,
            convertPid: true
        });

        expect(getListResource.requiredPermissions).to.be.an.array();
        expect(getListResource.isPatientCentric).to.be(true);
        expect(getListResource.get).not.to.be.undefined();
    });
});

describe('Orders resource getOrders', function() {
    var spyStatus;

    beforeEach(function(done) {
        req = httpMocks.createRequest({
            method: 'GET',
            url: '/test'
        });
        req.query = {
            start: '',
            limit: '',
            order: '',
            filter: '',
            pid: '9E7A;3'
        };
        req.session = {
            user: {
                site: '9E7A',
                duz: {
                    '9E7A': '10000000270',
                    'C77A': 'duz2'
                },
            }
        };
        req.app = {
            config: {
                jdsServer: {
                    baseUrl: ''
                }
            }
        };
        req.logger = logger;
        req.interceptorResults = {
            patientIdentifiers: {
                site: '9E7A',
                dfn: '3',
                icn: '321V123',
                uids: ['urn:va:patient:9E7A:3:3', 'urn:va:patient:icn:321V123:321V123']
            }
        };

        res = httpMocks.createResponse();
        res.rdkSend = sinon.spy();
        spyStatus = sinon.spy(res, 'status');
        done();
    });

    afterEach(function(done) {
        res.rdkSend.reset();
        spyStatus.reset();
        done();
    });

    it('identifies missing patient dfn and icn', function() {
        delete req.interceptorResults.patientIdentifiers.dfn;
        delete req.interceptorResults.patientIdentifiers.icn;
        clinicalObjectsResources._getOrders(req, res);
        expect(spyStatus.calledWith(412)).to.be.true();
        expect(res.rdkSend.calledWith('Patient dfn or icn not found on interceptor results')).to.be.true();
    });

    it('identifies missing patient uids', function() {
        delete req.interceptorResults.patientIdentifiers.uids;
        clinicalObjectsResources._getOrders(req, res);
        expect(spyStatus.calledWith(412)).to.be.true();
        expect(res.rdkSend.calledWith('Patient uids not found on interceptor results')).to.be.true();
    });

    it('identifies missing patient uid for sitedfn', function() {
        delete req.interceptorResults.patientIdentifiers.icn;
        req.interceptorResults.patientIdentifiers.uids = ['urn:va:patient:C877:33:33', 'urn:va:patient:icn:321V123:321V123'];
        clinicalObjectsResources._getOrders(req, res);
        expect(spyStatus.calledWith(412)).to.be.true();
        expect(res.rdkSend.calledWith('Patient uid not found in interceptor results uids array')).to.be.true();
    });

    it('identifies missing patient uid for when missing dfn and icn not found in uids', function() {
        delete req.interceptorResults.patientIdentifiers.dfn;
        req.interceptorResults.patientIdentifiers.uids = ['urn:va:patient:C877:3:3', 'urn:va:patient:icn:3213V1233:3213V1233'];
        clinicalObjectsResources._getOrders(req, res);
        expect(spyStatus.calledWith(412)).to.be.true();
        expect(res.rdkSend.calledWith('Patient uid not found in interceptor results uids array')).to.be.true();
    });

    it('identifies missing patient uid for when missing site and icn', function() {
        delete req.interceptorResults.patientIdentifiers.site;
        delete req.interceptorResults.patientIdentifiers.icn;
        req.interceptorResults.patientIdentifiers.uids = ['urn:va:patient:C877:3:3', 'urn:va:patient:icn:3211V123:3211V123'];
        clinicalObjectsResources._getOrders(req, res);
        expect(spyStatus.calledWith(412)).to.be.true();
        expect(res.rdkSend.calledWith('Patient uid not found in interceptor results uids array')).to.be.true();
    });

    it('identifies missing patient uid for icn when missing site and dfn', function() {
        delete req.interceptorResults.patientIdentifiers.dfn;
        delete req.interceptorResults.patientIdentifiers.site;
        req.interceptorResults.patientIdentifiers.uids = ['urn:va:patient:C877:3:3', 'urn:va:patient:icn:321V321:321V321'];
        clinicalObjectsResources._getOrders(req, res);
        expect(spyStatus.calledWith(412)).to.be.true();
        expect(res.rdkSend.calledWith('Patient uid not found in interceptor results uids array')).to.be.true();
    });
});
