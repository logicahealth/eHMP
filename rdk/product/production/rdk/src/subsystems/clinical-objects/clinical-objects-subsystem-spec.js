'use strict';

var _ = require('lodash');
var clinicalObjects = require('./clinical-objects-subsystem');
var logger = sinon.stub(require('bunyan').createLogger({name: 'clinical-objects-subsystem'}));
var nock = require('nock');

var sample1 = {
    uid: 'urn:va:ehmp-order:SITE:3:de305d54-75b4-431b-adb2-eb6b9e546014',
    patientUid: 'urn:va:patient:SITE:3:3',
    model: {
        patientUid: 'urn:va:patient:SITE:3:3',
        authorUid: 'USER  ',
        domain: 'ehmp-order',
        subDomain: 'laboratory',
        ehmpState: 'active',
        visit: {
            location: 'location',
            serviceCategory: 'serviceCategory',
            dateTime: 'dateTime'
        },
        referenceId: 'urn:va:order:SITE:3:15479',
        data: {
            labTestText: 'Lab Text',
            currentItemCount: 1,
            items: [{
                field1: 'field2'
            }],
            totalItems: 1,
            updated: '201601010111'
        },
    }
};

var clinicalObject = {
    uid: '',
    patientUid: '',
    authorUid: 'urn:va:user:SITE:123',
    domain: 'ehmp-order',
    subDomain: 'laboratory',
    ehmpState: 'active',
    visit: {
       location: '1',
       serviceCategory: 'PSB',
       dateTime: '20160101120000'
    },
    referenceId: 'urn:va:order:SITE:3:15479',
    data: {}
};

var buildSampleObject = function(sample) {
    return _.extend(clinicalObject, {
        uid: sample.uid,
        patientUid: sample.pid,
        authorUid: sample.model.authorUid,
        items: [{
            addendum: 'my note',
            authorUid: 'USER  ',
            data: {
                labTestText: 'Lab Text',
                currentItemCount: 1,
                items: [{
                    field1: 'field2'
                }],
                totalItems: 1,
                updated: '201601010111'
            },
            domain: 'ehmp-order',
            ehmpState: 'active',
            patientUid: 'urn:va:patient:SITE:3:3',
            referenceId: 'urn:va:order:SITE:3:15479',
            subDomain: 'laboratory',
            uid: 'urn:va:ehmp-order:SITE:3:de305d54-75b4-431b-adb2-eb6b9e546014',
            visit: {
                dateTime: '01-25-2018',
                location: 'lab',
                serviceCategory: 'Aloha from Hawaii from Team Neptune'
            }
        }]
    });
};

var buildOrderObject = function(ehmpState, referenceId, domain, subDomain){
    return {
        pid: 'SITE;3',
        model: {
            patientUid: 'urn:va:patient:SITE:3:3',
            authorUid: 'USER  ',
            domain: domain,
            subDomain: subDomain,
            ehmpState: ehmpState,
            visit: {
                location: 'location',
                serviceCategory: 'serviceCategory',
                dateTime: 'dateTime'
            },
            referenceId: referenceId,
            data: {
                labTestText: 'Lab Text',
                currentItemCount: 1,
                items: [{
                    field1: 'field2'
                }],
                totalItems: 1,
                updated: '201601010111'
            },
        }
    };
};

var updatedClinicalObject  = {
    uid: 'urn:va:ehmp-order:SITE:3:de305d54-75b4-431b-adb2-eb6b9e546014',
    patientUid: 'urn:va:patient:SITE:3:3',
    authorUid: 'USER  ',
    domain: 'ehmp-order',
    subDomain: 'laboratory',
    ehmpState: 'active',
    visit: {
        location: 'location',
        serviceCategory: 'serviceCategory',
        dateTime: 'dateTime'
    },
    referenceId: 'referenceId',
    data: {
        labTestText: 'Lab Text',
        currentItemCount: 1,
        items: [{
            field1: 'field2'
        }],
        totalItems: 1,
        updated: '201601010111'
    },
};

var pJDSEndpoint = 'clinicobj';
var vxSyncEndpoint = 'clinicalObject';
var testEndpoint = 'http://IP             ';
var testVxsyncEndpoint = 'http://IP           ';

var appConfig = {
    generalPurposeJdsServer: {
        baseUrl: 'http://IP             '
    },
    vxSyncServer: {
        baseUrl: 'http://IP           '
    }
};

describe('Clinical object subsystem resource task tests', function() {

    describe('Create clinical object', function() {

        it('should create a clinical object when called with the correct parameters', function(done) {

            nock(testVxsyncEndpoint).post('/' + vxSyncEndpoint).reply(201, {'status': 'OK'});

            var orderModel = buildOrderObject('active', 'testReferenceID', 'ehmp-order', 'laboratory');
            clinicalObjects.create(logger, appConfig, orderModel.model, function(err, response) {
                logger.warn('zzzerror %j', err);
                logger.warn('zzzresponse %j', response);
                expect(response).to.be.an.object();
                expect(err).to.be.null();
                // console.info(response.request.httpModule);
                done();
            });
        });

        it('clinical object create should fail on invalid status code', function(done) {

            var serviceUnavailableStatus = 503;
            nock(testVxsyncEndpoint).post('/' + vxSyncEndpoint).reply(serviceUnavailableStatus, {'status': 'Internal service error'});

            var orderModel = buildOrderObject('active', 'testReferenceID', 'ehmp-order', 'laboratory');
            clinicalObjects.create(logger, appConfig, orderModel.model, function(err, response) {
                expect(response).to.be.undefined();
                // Ensure logged message includes the original status code
                expect(logger.error.calledWithMatch('Received statusCode ' + serviceUnavailableStatus)).to.be.true();
                expect(err).to.be.an.object();
                // Ensure caller receives HTTP 500 rather than original status code
                expect(err.status).to.be(500);
                done();
            });
        });

        it('should fail validation and handle errors if domain is incorrect', function(done) {
            var orderModel = buildOrderObject('active', 'testReferenceID', 'ehmp-123', 'wrong');
            clinicalObjects.create(logger, appConfig, orderModel.model, function(err, response) {
                expect(response).to.be.undefined();
                expect(err).not.to.be.undefined();
                expect(err.pop()).to.be('invalid domain');
                done();
            });
        });

        it('should fail validation and handle errors if called with an invalid model', function(done) {
            clinicalObjects.create(logger, appConfig, sample1.patientUid, function(err, response) {
                expect(response).to.be.undefined();
                expect(err).not.to.be.undefined();
                expect(err.pop()).to.be('model is not an object');
                done();
            });
        });
    });

    describe('Read clinical object', function() {

        it('should retrieve a clinical object when called with the correct parameters', function(done) {
            nock(testEndpoint)
                .filteringPath(function(path) {
                    return ('/' + pJDSEndpoint);
                })
                .get('/' + pJDSEndpoint)
                .reply(200, buildSampleObject(sample1));

            clinicalObjects.read(logger, appConfig, sample1.uid, false, function(err, response) {
                expect(response).not.to.be.undefined();
                expect(response.uid).to.be(sample1.uid);
                expect(response.patientUid).to.be(sample1.patientUid);
                expect(response.authorUid).to.be(sample1.model.authorUid);
                expect(response.domain).to.be(sample1.model.domain);
                expect(response.subDomain).to.be(sample1.model.subDomain);
                expect(response.data).to.be.eql(sample1.model.data);
                expect(err).to.be.null();
                done();
            });
        });

        it('should fail validation and handle errors if called with an invalid UID', function(done) {

            clinicalObjects.read(logger, appConfig, null, false, function(err, response) {
                expect(response).to.be.undefined();
                expect(err).not.to.be.undefined();
                expect(logger.info.calledWithMatch(function(value) {
                    return _.contains((value || {}).validationErrors, 'uid not found');
                })).to.be.true();
                done();
            });
        });

        it('should handle errors when the storage pJDSEndpoint returns an error', function(done) {

            nock(testEndpoint)
                .filteringPath(function(path) {
                    return ('/' + pJDSEndpoint);
                })
                .get('/' + pJDSEndpoint)
                .replyWithError('Test Failure');

            clinicalObjects.read(logger, appConfig, sample1.uid, false, function(err, response) {
                expect(response).to.be.undefined();
                expect(err).not.to.be.undefined();
                expect(logger.error.called).to.be.true();
                expect(err).not.to.be.undefined();
                expect(err[0]).to.be('Unable to reach pJDS');
                done();
            });
        });
    });

    describe('Update clinical object', function() {

        it('should update a clinical object when called with the correct parameters', function(done) {
            nock(testVxsyncEndpoint).post('/' + vxSyncEndpoint).reply(200, {});

            clinicalObjects.update(logger, appConfig, sample1.uid, updatedClinicalObject, function(err, response) {
                expect(response.body).to.be.an.object();
                expect(err).to.be.null();
                done();
            });
        });

        it('clinical object update should fail on invalid status code', function(done) {

            var serviceUnavailableStatus = 503;
            nock(testVxsyncEndpoint).post('/' + vxSyncEndpoint).reply(serviceUnavailableStatus, {'status': 'Internal service error'});

            clinicalObjects.update(logger, appConfig, sample1.uid, updatedClinicalObject, function(err, response) {
                expect(response).to.be.undefined();
                // Ensure logged message includes the original status code
                expect(logger.error.calledWithMatch('Received statusCode ' + serviceUnavailableStatus)).to.be.true();
                expect(err).to.be.an.object();
                // Ensure caller receives HTTP 500 rather than original status code
                expect(err.status).to.be(500);
                done();
            });
        });
        it('should fail validation and handle errors if called with an invalid UID', function(done) {

            var model = buildSampleObject(sample1);
            clinicalObjects.update(logger, appConfig, null, model, function(err, response) {
                expect(response).to.be.undefined();
                expect(err).not.to.be.undefined();
                expect(logger.info.calledWithMatch(function(value) {
                    return _.contains((value || {}).validationErrors, 'uid not found');
                })).to.be.true();
                done();
            });
        });

        it('should fail validation and handle errors if called with an invalid model', function(done) {

            clinicalObjects.update(logger, appConfig, sample1.uid, null, function(err, response) {
                expect(response).to.be.undefined();
                expect(err).not.to.be.undefined();
                expect(logger.error.called).to.be.true();
                done();
            });
        });
    });

    describe('Transform patientUid site piece from VLER or HDR to ICN.', function() {
        it ('should transform site piece from VLER to ICN', function(done) {

            var clinicalObj = {patientUid:'urn:va:patient:VLER:123456789:123456789'};

            clinicalObjects.transformPatientUid(clinicalObj);

            expect(clinicalObj.patientUid).not.to.be.undefined();
            expect(clinicalObj.patientUid).to.be('urn:va:patient:ICN:123456789:123456789');
            done();
        });

        it ('should transform site piece from HDR to ICN', function(done) {

            var clinicalObj = {patientUid:'urn:va:patient:HDR:123456789:123456789'};

            clinicalObjects.transformPatientUid(clinicalObj);

            expect(clinicalObj.patientUid).not.to.be.undefined();
            expect(clinicalObj.patientUid).to.be('urn:va:patient:ICN:123456789:123456789');
            done();
        });

        it ('should not transform site piece from SITE to ICN', function(done) {

            var clinicalObj = {patientUid:'urn:va:patient:SITE:3:3'};

            clinicalObjects.transformPatientUid(clinicalObj);

            expect(clinicalObj.patientUid).not.to.be.undefined();
            expect(clinicalObj.patientUid).not.to.be('urn:va:patient:ICN:3:3');
            done();
        });
    });

    describe('storeToSolr business rule', function() {
        describe('ehmp-activity consult', function() {
            var ehmpActivityConsultClinicalObject  = {
                uid: 'urn:va:ehmp-activity:SITE:3:de305d54-75b4-431b-adb2-eb6b9e546014',
                patientUid: 'urn:va:patient:SITE:3:3',
                authorUid: 'USER  ',
                domain: 'ehmp-activity',
                subDomain: 'consult',
                visit: {
                    location: 'location',
                    serviceCategory: 'serviceCategory',
                    dateTime: 'dateTime'
                }
            };
            it('should return true if ehmp-activity is a consult and active', function() {
                var document = _.extend({}, ehmpActivityConsultClinicalObject, {
                    ehmpState: 'active'
                });
                expect(clinicalObjects.storeToSolr(document)).to.be.true();
            });
            it('should return false if ehmp-activity is a consult and in draft', function() {
                var document = _.extend({}, ehmpActivityConsultClinicalObject, {
                    ehmpState: 'draft'
                });
                expect(clinicalObjects.storeToSolr(document)).to.be.false();
            });
        });
        describe('ehmp-activity request', function() {
            var ehmpActivityRequestClinicalObject  = {
                uid: 'urn:va:ehmp-activity:SITE:3:de305d54-75b4-431b-adb2-eb6b9e546014',
                patientUid: 'urn:va:patient:SITE:3:3',
                authorUid: 'USER  ',
                domain: 'ehmp-activity',
                subDomain: 'request',
                visit: {
                    location: 'location',
                    serviceCategory: 'serviceCategory',
                    dateTime: 'dateTime'
                }
            };
            it('should return true if ehmp-activity is a request and active', function() {
                var document = _.extend({}, ehmpActivityRequestClinicalObject, {
                    ehmpState: 'active'
                });
                expect(clinicalObjects.storeToSolr(document)).to.be.true();
            });

            it('should return false if ehmp-activity is a request and in draft', function() {
                var document = _.extend({}, ehmpActivityRequestClinicalObject, {
                    ehmpState: 'draft'
                });
                expect(clinicalObjects.storeToSolr(document)).to.be.false();
            });
        });
        describe('ehmp-order laboratory', function() {
            var ehmpOrderLaboratoryClinicalObject  = {
                uid: 'urn:va:ehmp-order:SITE:3:de305d54-75b4-431b-adb2-eb6b9e546014',
                patientUid: 'urn:va:patient:SITE:3:3',
                authorUid: 'USER  ',
                domain: 'ehmp-order',
                subDomain: 'laboratory',
                visit: {
                    location: 'location',
                    serviceCategory: 'serviceCategory',
                    dateTime: 'dateTime'
                }
            };
            it('should return false if ehmp-order is a laboratory and active', function() {
                var document = _.extend({}, ehmpOrderLaboratoryClinicalObject, {
                    ehmpState: 'active'
                });
                expect(clinicalObjects.storeToSolr(document)).to.be.false();
            });
            it('should return false if ehmp-order is a laboratory and draft', function() {
                var document = _.extend({}, ehmpOrderLaboratoryClinicalObject, {
                    ehmpState: 'draft'
                });
                expect(clinicalObjects.storeToSolr(document)).to.be.false();
            });
        });
    });
});
