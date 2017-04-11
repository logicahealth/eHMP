'use strict';

var _ = require('lodash');
var clinicalObjects = require('./clinical-objects-subsystem');
var logger = sinon.stub(require('bunyan').createLogger({name: 'clinical-objects-subsystem'}));
var nock = require('nock');

var sample1 = {
    uid: 'urn:va:ehmp-order:9E7A:3:de305d54-75b4-431b-adb2-eb6b9e546014',
    patientUid: 'urn:va:patient:9E7A:3:3',
    model: {
        patientUid: 'urn:va:patient:9E7A:3:3',
        authorUid: 'mx1234',
        domain: 'ehmp-order',
        subDomain: 'laboratory',
        ehmpState: 'active',
        visit: {
            location: 'location',
            serviceCategory: 'serviceCategory',
            dateTime: 'dateTime'
        },
        referenceId: 'urn:va:order:9E7A:3:15479',
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
    authorUid: 'urn:va:user:9E7A:123',
    domain: 'ehmp-order',
    subDomain: 'laboratory',
    ehmpState: 'active',
    visit: {
       location: '1',
       serviceCategory: 'PSB',
       dateTime: '20160101120000'
    },
    referenceId: 'urn:va:order:9E7A:3:15479',
    data: {}
};

var buildSampleObject = function(sample) {
    return _.extend(clinicalObject, {
        uid: sample.uid,
        patientUid: sample.pid,
        authorUid: sample.model.authorUid,
        items: [{
            addendum: 'my note',
            authorUid: 'mx1234',
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
            patientUid: 'urn:va:patient:9E7A:3:3',
            referenceId: 'urn:va:order:9E7A:3:15479',
            subDomain: 'laboratory',
            uid: 'urn:va:ehmp-order:9E7A:3:de305d54-75b4-431b-adb2-eb6b9e546014',
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
        pid: '9E7A;3',
        model: {
            patientUid: 'urn:va:patient:9E7A:3:3',
            authorUid: 'mx1234',
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

var updatedClinincalObject  = {
    uid: 'urn:va:ehmp-order:9E7A:3:de305d54-75b4-431b-adb2-eb6b9e546014',
    patientUid: 'urn:va:patient:9E7A:3:3',
    authorUid: 'mx1234',
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

//THIS SHOULD CHANGE ONCE WE SET THE CORRECT ENDPOINT!!
var endpoint = 'clinicobj';
var activityManagementEndpoint = 'activity-management-event';
var testEndpoint = 'http://IP_ADDRESS:PORT';
var testVxsyncEndpoint = 'http://IPADDRESS:POR';

var appConfig = {
    generalPurposeJdsServer: {
        baseUrl: 'http://IP_ADDRESS:PORT'
    },
    vxSyncServer: {
        baseUrl: 'http://IPADDRESS:POR'
    }
};

describe('Clinical object subsystem resource task tests', function() {

    describe('Create clinical object', function() {

        it('should create a clinical object when called with the correct parameters', function(done) {

            nock(testEndpoint).post('/' + endpoint).reply(200, {});
            nock(testVxsyncEndpoint).post('/' + activityManagementEndpoint).reply(200, {});

            var orderModel = buildOrderObject('active', 'testReferenceID', 'ehmp-order', 'laboratory');
            clinicalObjects.create(logger, appConfig, orderModel.model, function(err, response) {
                expect(response).to.be.an.object();
                expect(err).to.be.null();
                // console.info(response.request.httpModule);
                done();
            });
        });

        it('should fail validation and handle errors if domain is incorrect', function(done) {
            var orderModel = buildOrderObject('active', 'testReferenceID', 'ehmp-123', 'wrong');
            clinicalObjects.create(logger, appConfig, orderModel.model, function(err, response) {
                expect(response).to.be.undefined;
                expect(err).not.to.be.undefined;
                expect(err.pop()).to.be('invalid domain');
                done();
            });
        });

        it('should fail validation and handle errors if called with an invalid model', function(done) {

            clinicalObjects.create(logger, appConfig, sample1.patientUid, function(err, response) {
                expect(response).not.to.be.undefined;
                expect(err).not.to.be.undefined;
                expect(err.pop()).to.be('model is not an object');
                done();
            });
        });

        it('should handle errors when the storage endpoint returns an error', function(done) {

            nock(testEndpoint).post('/' + endpoint).replyWithError('Test Failure');

            clinicalObjects.create(logger, appConfig, sample1.model, function(err, response) {
                expect(response).not.to.be.undefined;
                expect(err).not.to.be.undefined;
                expect(logger.error.called).to.be.true;
                expect(err.message).not.to.be.undefined();
                expect(err.message).to.be('Test Failure');
                done();
            });
        });
    });

    describe('Read clinical object', function() {

        it('should retrieve a clinical object when called with the correct parameters', function(done) {
            var items = [buildSampleObject(sample1)];
            nock(testEndpoint)
                .filteringPath(function(path) {
                    return ('/' + endpoint);
                })
                .get('/' + endpoint)
                .reply(200, buildSampleObject(sample1));

            clinicalObjects.read(logger, appConfig, sample1.uid, false, function(err, response) {
                expect(response.body).not.to.be.undefined;
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

        it('should handle errors when the storage endpoint returns an error', function(done) {

            nock(testEndpoint)
                .filteringPath(function(path) {
                    return ('/' + endpoint);
                })
                .get('/' + endpoint)
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
            nock(testEndpoint)
                .filteringPath(function(path) {
                    return ('/' + endpoint);
                })
                .put('/' + endpoint)
                .reply(200, {});

            nock(testVxsyncEndpoint).post('/' + activityManagementEndpoint).reply(200, {});

            clinicalObjects.update(logger, appConfig, sample1.uid, updatedClinincalObject, function(err, response) {
                expect(response.body).to.be.an.object();
                expect(err).to.be.null();
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

        it('should handle errors when the storage endpoint returns an error', function(done) {

            nock(testEndpoint)
                .filteringPath(function(path) {
                    return ('/' + endpoint);
                })
                .put('/' + endpoint)
                .replyWithError('Test Failure');

            var model = buildSampleObject(sample1);
            clinicalObjects.update(logger, appConfig, sample1.uid, updatedClinincalObject, function(err, response) {
                expect(response).to.be.undefined();
                expect(err).not.to.be.undefined();
                expect(logger.error.called).to.be.true();
                expect(err.message).not.to.be.undefined;
                expect(err.message).to.be('Test Failure');
                done();
            });
        });
    });

    describe('Post clinical object to activity management service.', function() {
        it ('should successfully post clinical object to activity management event service', function(done) {
            nock(testVxsyncEndpoint).post('/' + activityManagementEndpoint).reply(200, {});

            clinicalObjects.postActivityManagementEvent(logger, appConfig, sample1, function(err, response) {
                expect(response).to.be.an.object();
                expect(err).to.be.null();
                done();
            });
        });

        it ('should handle an error when activity management service returns an error', function(done) {
            nock(testVxsyncEndpoint).post('/' + activityManagementEndpoint).replyWithError('Test Failure');

            clinicalObjects.postActivityManagementEvent(logger, appConfig, sample1, function(err, response) {
                expect(response).to.be.undefined();
                expect(err).not.to.be.undefined();
                expect(logger.error.called).to.be.true();
                expect(err.message).not.to.be.undefined();
                expect(err.message).to.be('Test Failure');
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

        it ('should not transform site piece from 9E7A to ICN', function(done) {

            var clinicalObj = {patientUid:'urn:va:patient:9E7A:3:3'};

            clinicalObjects.transformPatientUid(clinicalObj);

            expect(clinicalObj.patientUid).not.to.be.undefined();
            expect(clinicalObj.patientUid).not.to.be('urn:va:patient:ICN:3:3');
            done();
        });
    });
});
