'use strict';

var patientUidResource = require('./patient-uid-resource');
var httpMocks = require('node-mocks-http');
var jds = require('../../subsystems/jds/jds-subsystem');
var _ = require('lodash');

describe('Verify isCheckASU', function() {
    var details;
    var item_data;

    beforeEach(function(done) {
        details = {};
        item_data = {};

        done();
    });

    it('returns false when details are nullish', function() {
        expect(patientUidResource._isCheckASU(null)).to.be('false');
    });

    it('returns false when details.data are nullish', function() {
        _.set(details, 'data', null);
        expect(patientUidResource._isCheckASU(details)).to.be('false');
    });

    it('returns false when details.data.items is empty', function() {
        _.set(details, 'data.items', []);
        expect(patientUidResource._isCheckASU(details)).to.be('false');
    });

    it('returns false when details.data.items is undefined', function() {
        details = {};
        details.data = {};
        expect(patientUidResource._isCheckASU(details)).to.be('false');
    });

    it('returns false when details.data.items is nullish', function() {
        _.set(details, 'data.items', null);
        expect(patientUidResource._isCheckASU(details)).to.be('false');
    });

    it('returns false when details.data.items.documentDefUid is undefinded', function() {
        item_data = {};
        item_data.not_documentDefUid = 'defined';
        _.set(details, 'data.items', [item_data]);
        expect(patientUidResource._isCheckASU(details)).to.be('false');
    });

    it('returns false when details.data.items.documentDefUid is nullish', function() {
        item_data = {};
        item_data.not_documentDefUid = 'defined';
        _.set(details, 'data.items', [item_data]);
        expect(patientUidResource._isCheckASU(details)).to.be('false');
    });

    it('returns true when details.data.items.documentDefUid is defined', function() {
        item_data = {};
        item_data.documentDefUid = 'defined';
        _.set(details, 'data.items', [item_data]);
        expect(patientUidResource._isCheckASU(details)).to.be('true');
    });
});

describe('Verify getPatientUid', function() {
    var req;
    var res;
    var spyStatus;
    var mockJds;
    beforeEach(function(done) {
        req = httpMocks.createRequest();
        req.audit = {};
        _.set(req, 'app.config.vistaSites', {});
        req.query = {};
        res = httpMocks.createResponse();
        _.set(res, 'data.items', {});
        spyStatus = sinon.spy(res, 'status');

        done();
    });

    afterEach(function(done) {
        if (mockJds) {
            jds.getPatientDomainData.restore();
            mockJds = undefined;
        }
        spyStatus.reset();
        done();
    });

    it('returns error when uid param is null', function(done) {
        function tester(response) {
            expect(spyStatus.withArgs(400).called).to.be.true();
            expect(response).to.be('Missing uid parameter');
            done();
        }
        res.rdkSend = tester;
        patientUidResource._getPatientUid(req, res);
    });

    it('returns error when pid param is null', function(done) {
        _.set(req, 'params.uid', 'uid');

        function tester(response) {
            expect(spyStatus.withArgs(400).called).to.be.true();
            expect(response).to.be('Missing pid parameter');
            done();
        }
        res.rdkSend = tester;
        patientUidResource._getPatientUid(req, res);
    });
});
