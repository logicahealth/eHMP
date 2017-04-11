'use strict';

var patientSyncResource = require('./patient-sync-resource');
var httpMocks = require('node-mocks-http');
var _ = require('lodash');

describe('patientLoadEndpoint', function() {
    var req;
    var res;
    var app;
    var spyStatus;
    beforeEach(function(done) {
        req = httpMocks.createRequest();
        req.logger = sinon.stub(require('bunyan').createLogger({
            name: 'rdk-jwt-spec'
        }));

        res = httpMocks.createResponse();
        app = {};
        done();
    });

    it.skip('handles a request without an app parameter', function() {
        // 2) Verify patientLoadEndpoint :
        //    TypeError: Cannot read property 'config' of undefined
        //     at Object.patientLoadEndpoint [as _patientLoadEndpoint] (src/resources/patient-record/patient-sync-resource.js:9:4313)
        //     at Context.<anonymous> (src/resources/patient-record/patient-sync-resource-spec.js:32:29)
        //     at Context.<anonymous> (src/resources/patient-record/patient-sync-resource-spec.js:23:9)
        patientSyncResource._patientLoadEndpoint(app, req, res);
    });

    it.skip('handles an app without subsystems', function() {
        // Verify patientLoadEndpoint :
        // TypeError: Cannot read property 'jdsSync' of undefined
        //  at Object.patientLoadEndpoint [as _patientLoadEndpoint] (src/resources/patient-record/patient-sync-resource.js:9:5277)
        //  at Context.<anonymous> (src/resources/patient-record/patient-sync-resource-spec.js:44:29)
        //  at Context.<anonymous> (src/resources/patient-record/patient-sync-resource-spec.js:25:9)
        _.set(req, 'params.immediate', 'true');
        patientSyncResource._patientLoadEndpoint(app, req, res);
    });

    it('uses req.pid when its available', function(done) {
        _.set(req, 'params.immediate', 'true');
        _.set(req, 'params.pid', 'pidtest');
        _.set(req, 'params.dfn', 'dfntest');

        function tester(pid, immediate, req) {
            expect(pid).to.be('pidtest');
            done();
        }
        _.set(app, 'subsystems.jdsSync.loadPatient', tester);
        patientSyncResource._patientLoadEndpoint(app, req, res);
    });

    it('uses req.dfn if req.pid is not available', function(done) {
        _.set(req, 'params.immediate', 'true');
        _.set(req, 'params.dfn', 'dfntest');

        function tester(pid, immediate, req) {
            expect(pid).to.be('dfntest');
            done();
        }
        _.set(app, 'subsystems.jdsSync.loadPatient', tester);
        patientSyncResource._patientLoadEndpoint(app, req, res);
    });
    it('handles if req does not contain a pid or dfn', function(done) {
        _.set(req, 'params.immediate', 'true');

        function tester(pid, immediate, req) {
            expect(pid).to.be('');
            done();
        }
        _.set(app, 'subsystems.jdsSync.loadPatient', tester);
        patientSyncResource._patientLoadEndpoint(app, req, res);
    });

    it('uses settings.timeoutMillis variable when available', function(done) {
        var timeoutVariable = 567;

        function tester(pid, immediate, req) {
            done();
        }

        res.setTimeout = function(timeout) {
            expect(timeout).to.be(timeoutVariable + 3000);
        };
        _.set(req, 'params.immediate', 'false');
        _.set(req, 'app.config.jdsSync.settings.timeoutMillis', timeoutVariable);
        _.set(app, 'subsystems.jdsSync.loadPatient', tester);
        patientSyncResource._patientLoadEndpoint(app, req, res);
    });

    it('uses default timeout when settings.timeoutMillis variable is not available', function(done) {
        function tester(pid, immediate, req) {

        }

        res.setTimeout = function(timeout) {
            expect(timeout).to.be(30000 + 3000);
            done();
        };
        _.set(req, 'params.immediate', 'false');
        _.set(req, 'app.config.jdsSync.settings', {});
        _.set(app, 'subsystems.jdsSync.loadPatient', tester);

        patientSyncResource._patientLoadEndpoint(app, req, res);
    });

    it('calls loadPatientPrioritized when prioritySite is true', function(done) {
        function test_loadPatientPrioritized(pid, prioritySite, req) {
            expect(pid).to.be('testpid');
            expect(prioritySite).to.be(true);
            done();
        }

        _.set(req, 'params.immediate', 'true');
        _.set(req, 'params.pid', 'testpid');
        _.set(req, 'params.prioritySite', true);
        _.set(req, 'app.config.jdsSync.settings', {});
        _.set(app, 'subsystems.jdsSync.loadPatientPrioritized', test_loadPatientPrioritized);
        spyStatus = sinon.spy(app.subsystems.jdsSync, 'loadPatientPrioritized');

        patientSyncResource._patientLoadEndpoint(app, req, res);
        expect(spyStatus.withArgs('testpid', true, req).called).to.be.true();
    });

    it('calls loadPatientForced when forcedSite is true', function(done) {
        function tester(pid, forcedSite, immediate, req) {
            expect(pid).to.be('testpid');
            expect(forcedSite).to.be(true);
            expect(immediate).to.be(true);
            done();
        }
        _.set(req, 'params.immediate', 'true');
        _.set(req, 'params.pid', 'testpid');
        _.set(req, 'params.forcedSite', true);
        _.set(req, 'app.config.jdsSync.settings', {});
        _.set(app, 'subsystems.jdsSync.loadPatientForced', tester);
        spyStatus = sinon.spy(app.subsystems.jdsSync, 'loadPatientForced');
        patientSyncResource._patientLoadEndpoint(app, req, res);
        expect(spyStatus.withArgs('testpid', true, true, req).called).to.be.true();
    });

    it('calls loadPatient if forcedSite & prioritySite are false', function(done) {
        function tester(pid, immediate, req) {
            done();
        }
        _.set(req, 'params.immediate', 'true');
        _.set(req, 'params.pid', 'testpid');
        _.set(req, 'app.config.jdsSync.settings', {});
        _.set(app, 'subsystems.jdsSync.loadPatient', tester);
        spyStatus = sinon.spy(app.subsystems.jdsSync, 'loadPatient');
        patientSyncResource._patientLoadEndpoint(app, req, res);
        expect(spyStatus.withArgs('testpid', true, req).called).to.be.true();
    });
});

describe('patientClearEndpoint', function() {
    var req;
    var res;
    var app;
    var spyStatus;
    beforeEach(function(done) {
        req = httpMocks.createRequest();
        req.logger = sinon.stub(require('bunyan').createLogger({
            name: 'rdk-jwt-spec'
        }));
        res = httpMocks.createResponse();
        app = {};
        done();
    });

    it('uses req.pid when its available', function(done) {
        function tester(pid, immediate, req) {
            expect(pid).to.be('testpid');
            done();
        }
        _.set(req, 'params.pid', 'testpid');
        _.set(req, 'params.dfn', 'testdfn');
        _.set(app, 'subsystems.jdsSync.clearPatient', tester);
        spyStatus = sinon.spy(app.subsystems.jdsSync, 'clearPatient');
        patientSyncResource._patientClearEndpoint(app, req, res);
        expect(spyStatus.withArgs('testpid', req).called).to.be.true();
    });
    it('uses req.dfn when its available', function(done) {
        function tester(pid, immediate, req) {
            expect(pid).to.be('testdfn');
            done();
        }
        _.set(req, 'params.dfn', 'testdfn');
        _.set(app, 'subsystems.jdsSync.clearPatient', tester);
        spyStatus = sinon.spy(app.subsystems.jdsSync, 'clearPatient');
        patientSyncResource._patientClearEndpoint(app, req, res);
        expect(spyStatus.withArgs('testdfn', req).called).to.be.true();
    });
    it('handles if req does not contain a pid or dfn', function(done) {
        function tester(pid, immediate, req) {
            expect(pid).to.be('');
            done();
        }

        _.set(app, 'subsystems.jdsSync.clearPatient', tester);
        spyStatus = sinon.spy(app.subsystems.jdsSync, 'clearPatient');
        patientSyncResource._patientClearEndpoint(app, req, res);
        expect(spyStatus.withArgs('', req).called).to.be.true();
    });
});

describe('patientStatusEndpoint', function() {
    var req;
    var res;
    var app;
    var spyStatus;
    beforeEach(function(done) {
        req = httpMocks.createRequest();
        req.logger = sinon.stub(require('bunyan').createLogger({
            name: 'rdk-jwt-spec'
        }));
        res = httpMocks.createResponse();
        app = {};
        done();
    });

    it('uses req.pid when its available', function(done) {
        function tester(pid, immediate, req) {
            expect(pid).to.be('testpid');
            done();
        }
        _.set(req, 'params.pid', 'testpid');
        _.set(req, 'params.dfn', 'testdfn');
        _.set(app, 'subsystems.jdsSync.getPatientStatus', tester);
        spyStatus = sinon.spy(app.subsystems.jdsSync, 'getPatientStatus');
        patientSyncResource._patientStatusEndpoint(app, req, res);
        expect(spyStatus.withArgs('testpid', req).called).to.be.true();
    });
    it('uses req.dfn when its available', function(done) {
        function tester(pid, immediate, req) {
            expect(pid).to.be('testdfn');
            done();
        }
        _.set(req, 'params.dfn', 'testdfn');
        _.set(app, 'subsystems.jdsSync.getPatientStatus', tester);
        spyStatus = sinon.spy(app.subsystems.jdsSync, 'getPatientStatus');
        patientSyncResource._patientStatusEndpoint(app, req, res);
        expect(spyStatus.withArgs('testdfn', req).called).to.be.true();
    });
    it('handles if req does not contain a pid or dfn', function(done) {
        function tester(pid, immediate, req) {
            expect(pid).to.be('');
            done();
        }

        _.set(app, 'subsystems.jdsSync.getPatientStatus', tester);
        spyStatus = sinon.spy(app.subsystems.jdsSync, 'getPatientStatus');
        patientSyncResource._patientStatusEndpoint(app, req, res);
        expect(spyStatus.withArgs('', req).called).to.be.true();
    });
});

describe('patientDataStatusEndpoint', function() {
    var req;
    var res;
    var app;
    var spyStatus;
    beforeEach(function(done) {
        req = httpMocks.createRequest();
        req.logger = sinon.stub(require('bunyan').createLogger({
            name: 'rdk-jwt-spec'
        }));
        res = httpMocks.createResponse();
        app = {};
        done();
    });

    it('uses req.pid when its available', function(done) {
        function tester(pid, immediate, req) {
            expect(pid).to.be('testpid');
            done();
        }
        _.set(req, 'params.pid', 'testpid');
        _.set(req, 'params.dfn', 'testdfn');
        _.set(app, 'subsystems.jdsSync.getPatientDataStatusSimple', tester);
        spyStatus = sinon.spy(app.subsystems.jdsSync, 'getPatientDataStatusSimple');
        patientSyncResource._patientDataStatusEndpoint(app, req, res);
        expect(spyStatus.withArgs('testpid', req).called).to.be.true();
    });
    it('uses req.dfn when its available', function(done) {
        function tester(pid, immediate, req) {
            expect(pid).to.be('testdfn');
            done();
        }
        _.set(req, 'params.dfn', 'testdfn');
        _.set(app, 'subsystems.jdsSync.getPatientDataStatusSimple', tester);
        spyStatus = sinon.spy(app.subsystems.jdsSync, 'getPatientDataStatusSimple');
        patientSyncResource._patientDataStatusEndpoint(app, req, res);
        expect(spyStatus.withArgs('testdfn', req).called).to.be.true();
    });
    it('handles if req does not contain a pid or dfn', function(done) {
        function tester(pid, immediate, req) {
            expect(pid).to.be('');
            done();
        }

        _.set(app, 'subsystems.jdsSync.getPatientDataStatusSimple', tester);
        spyStatus = sinon.spy(app.subsystems.jdsSync, 'getPatientDataStatusSimple');
        patientSyncResource._patientDataStatusEndpoint(app, req, res);
        expect(spyStatus.withArgs('', req).called).to.be.true();
    });
});

describe('patientSyncStatusDetailEndpoint', function() {
    var req;
    var res;
    var app;
    var spyStatus;
    beforeEach(function(done) {
        req = httpMocks.createRequest();
        req.logger = sinon.stub(require('bunyan').createLogger({
            name: 'rdk-jwt-spec'
        }));
        res = httpMocks.createResponse();
        app = {};
        done();
    });

    it('uses req.pid when its available', function(done) {
        function tester(pid, immediate, req) {
            expect(pid).to.be('testpid');
            done();
        }
        _.set(req, 'params.pid', 'testpid');
        _.set(req, 'params.dfn', 'testdfn');
        _.set(app, 'subsystems.jdsSync.getPatientStatusDetail', tester);
        spyStatus = sinon.spy(app.subsystems.jdsSync, 'getPatientStatusDetail');
        patientSyncResource._patientSyncStatusDetailEndpoint(app, req, res);
        expect(spyStatus.withArgs('testpid', req).called).to.be.true();
    });
    it('uses req.dfn when its available', function(done) {
        function tester(pid, immediate, req) {
            expect(pid).to.be('testdfn');
            done();
        }
        _.set(req, 'params.dfn', 'testdfn');
        _.set(app, 'subsystems.jdsSync.getPatientStatusDetail', tester);
        spyStatus = sinon.spy(app.subsystems.jdsSync, 'getPatientStatusDetail');
        patientSyncResource._patientSyncStatusDetailEndpoint(app, req, res);
        expect(spyStatus.withArgs('testdfn', req).called).to.be.true();
    });
    it('handles if req does not contain a pid or dfn', function(done) {
        function tester(pid, immediate, req) {
            expect(pid).to.be('');
            done();
        }

        _.set(app, 'subsystems.jdsSync.getPatientStatusDetail', tester);
        spyStatus = sinon.spy(app.subsystems.jdsSync, 'getPatientStatusDetail');
        patientSyncResource._patientSyncStatusDetailEndpoint(app, req, res);
        expect(spyStatus.withArgs('', req).called).to.be.true();
    });
});

describe('patientDemographicsLoadEndpoint', function() {
    var req;
    var res;
    var app;
    var spyStatus;
    beforeEach(function(done) {
        req = httpMocks.createRequest();
        req.logger = sinon.stub(require('bunyan').createLogger({
            name: 'rdk-jwt-spec'
        }));
        res = httpMocks.createResponse();
        app = {};
        done();
    });

    it('calls syncPatientDemographics', function(done) {
        function tester(body, req) {
            done();
        }
        _.set(req, 'params.demographics', 'temp');
        _.set(app, 'subsystems.jdsSync.syncPatientDemographics', tester);
        spyStatus = sinon.spy(app.subsystems.jdsSync, 'syncPatientDemographics');
        patientSyncResource._patientDemographicsLoadEndpoint(app, req, res);
        expect(spyStatus.withArgs({}, req).called).to.be.true();
    });

    it('returns 500 when demographics is undefined', function(done) {
        function tester(body, req) {
            done();
        }

        function responseCall(response) {
            expect(response.error.code).to.be(500);
            expect(response.error.message).to.be('Demographics are required');
            done();
        }
        res.rdkSend = responseCall;

        _.set(app, 'subsystems.jdsSync.syncPatientDemographics', tester);
        spyStatus = sinon.spy(res, 'rdkSend');
        patientSyncResource._patientDemographicsLoadEndpoint(app, req, res);
        expect(spyStatus.called).to.be.true();
    });

    it('returns 500 when passed a EDIPI in the edipi field', function(done) {
        function tester(body, req) {
            done();
        }

        function responseCall(response) {
            expect(response.error.code).to.be(500);
            expect(response.error.message).to.be('A dod pid is invalid, please use an edipi or icn.');
            done();
        }
        res.rdkSend = responseCall;
        _.set(req, 'params.demographics', 'temp');
        _.set(req, 'body.edipi', 'DOD;1');

        _.set(app, 'subsystems.jdsSync.syncPatientDemographics', tester);
        spyStatus = sinon.spy(res, 'rdkSend');
        patientSyncResource._patientDemographicsLoadEndpoint(app, req, res);
        expect(spyStatus.called).to.be.true();
    });

    it('returns 500 when passed a EDIPI in the pid field', function(done) {
        function tester(body, req) {
            done();
        }

        function responseCall(response) {
            expect(response.error.code).to.be(500);
            expect(response.error.message).to.be('A dod pid is invalid, please use an edipi or icn.');
            done();
        }
        res.rdkSend = responseCall;
        _.set(req, 'params.demographics', 'temp');
        _.set(req, 'body.pid', 'DOD;1');

        _.set(app, 'subsystems.jdsSync.syncPatientDemographics', tester);
        spyStatus = sinon.spy(res, 'rdkSend');
        patientSyncResource._patientDemographicsLoadEndpoint(app, req, res);
        expect(spyStatus.called).to.be.true();
    });
});

describe('operationalStatusEndpoint', function() {
    var req;
    var res;
    var app;
    var spyStatus;
    beforeEach(function(done) {
        req = httpMocks.createRequest();
        req.logger = sinon.stub(require('bunyan').createLogger({
            name: 'rdk-jwt-spec'
        }));
        res = httpMocks.createResponse();


        app = {};
        done();
    });

    it('calls operationalStatusEndpoint', function(done) {
        function tester(one, req) {
            expect(one).to.be(null);
            done();
        }
        _.set(app, 'subsystems.jdsSync.getOperationalStatus', tester);
        spyStatus = sinon.spy(app.subsystems.jdsSync, 'getOperationalStatus');
        patientSyncResource._operationalStatusEndpoint(app, req, res);
        expect(spyStatus.called).to.be.true();
    });
});

describe('toResponseCallback', function() {
    var req;
    var res;
    var result;
    var error;
    var expectedResult;
    beforeEach(function(done) {
        req = httpMocks.createRequest();
        req.logger = sinon.stub(require('bunyan').createLogger({
            name: 'rdk-jwt-spec'
        }));
        res = httpMocks.createResponse();
        error = {};
        expectedResult = {};
        result = {};
        done();
    });

    it('uses result variables when they are set ', function(done) {
        function testResStatus(status) {
            expect(status).to.be('fakestatus');
            return res;
        }

        function testRdkSend(response) {
            expect(response).to.be('fakedata');
            done();
        }

        res.status = testResStatus;
        res.rdkSend = testRdkSend;
        result = {};
        _.set(result, 'data', 'fakedata');
        _.set(result, 'status', 'fakestatus');
        patientSyncResource._toResponseCallback(res, null, result);
    });

    it('handles undefined result and undefined error', function(done) {
        _.set(expectedResult, 'error.code', 500);
        _.set(expectedResult, 'error.message', 'There was an error processing your request. The error has been logged.');

        function testResStatus(status) {
            expect(status).to.be(500);
            return res;
        }

        function testRdkSend(response) {
            expect(response.error.code).to.be(expectedResult.error.code);
            expect(response.error.message).to.be(expectedResult.error.message);
            done();
        }

        res.status = testResStatus;
        res.rdkSend = testRdkSend;
        patientSyncResource._toResponseCallback(res);
    });

    it('handles undefined result and Number error', function(done) {
        error = 567;
        _.set(expectedResult, 'error.code', 567);
        _.set(expectedResult, 'error.message', 'There was an error processing your request. The error has been logged.');

        function testResStatus(status) {
            expect(status).to.be(error);
            return res;
        }

        function testRdkSend(response) {
            expect(response.error.code).to.be(expectedResult.error.code);
            expect(response.error.message).to.be(expectedResult.error.message);
            done();
        }

        res.status = testResStatus;
        res.rdkSend = testRdkSend;
        patientSyncResource._toResponseCallback(res, error);
    });

    it('handles undefined result and not a Number error', function(done) {
        error = 'not a number';
        _.set(expectedResult, 'error.code', 500);
        _.set(expectedResult, 'error.message', 'There was an error processing your request. The error has been logged.');

        function testResStatus(status) {
            expect(status).to.be(500);
            return res;
        }

        function testRdkSend(response) {
            expect(response).to.be(error);
            done();
        }

        res.status = testResStatus;
        res.rdkSend = testRdkSend;
        patientSyncResource._toResponseCallback(res, error);
    });

    it('handles result', function(done) {
        error = 'not a number';
        _.set(expectedResult, 'error.code', 500);
        _.set(expectedResult, 'error.message', 'There was an error processing your request. The error has been logged.');

        function testResStatus(status) {
            expect(status).to.be(500);
            return res;
        }

        function testRdkSend(response) {
            expect(response).to.be(result);
            done();
        }

        res.status = testResStatus;
        res.rdkSend = testRdkSend;
        _.set(result, 'unexpected', 'field');
        patientSyncResource._toResponseCallback(res, error, result);
    });
});
