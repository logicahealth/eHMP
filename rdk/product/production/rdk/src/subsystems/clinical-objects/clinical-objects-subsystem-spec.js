'use strict';

var _ = require('lodash');
var clinicalObjects = require('./clinical-objects-subsystem');
var logger = sinon.stub(require('bunyan').createLogger({name: 'clinical-objects-subsystem'}));
var nock = require('nock');

var sample1 = {
    uid: 'urn:va:ehmp:9E7A;3:de305d54-75b4-431b-adb2-eb6b9e546014',
    pid: '9E7A;3',
    model: {
        patientUid: '9E7A;3',
        authorUid: 'PW    ',
        domain: 'order',
        subDomain: 'laboratory',
        ehmpState: 'active',
        visit: {
            location: 'location',
            serviceCategory: 'serviceCategory',
            dateTime: 'dateTime'
        },
        data: {
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
    domain: 'order',
    subDomain: 'laboratory',
    ehmpState: 'active',
    visit: {
       location: 'urn:va:location:9E7A:1',
       serviceCategory: 'PSB',
       dateTime: '20160101120000'
    },
    referenceId: '',
    data: {}
};

var buildSampleObject = function(sample) {
    return _.extend(clinicalObject, {
        uid: sample.uid,
        patientUid: sample.pid,
        authorUid: sample.model.authorUid,
        items: [{
            addendum: 'my note',
            authorUid: 'PW    ',
            data: {
                currentItemCount: 1,
                items: [{
                    field1: 'field2'
                }],
                totalItems: 1,
                updated: '201601010111'
            },
            domain: 'order',
            ehmpState: 'active',
            patientUid: '9E7A;3',
            referenceId: 'urn:va:order:9E7A:3:15479',
            subDomain: 'laboratory',
            uid: 'urn:va:ehmp:9E7A;3:de305d54-75b4-431b-adb2-eb6b9e546014',
            visit: {
                dateTime: '01-25-2018',
                location: 'lab',
                serviceCategory: 'Aloha from Hawaii from Team Neptune'
            }
        }]
    });
};

//THIS SHOULD CHANGE ONCE WE SET THE CORRECT ENDPOINT!!
var endpoint = 'clinicobj';
var testEndpoint = 'http://IP             ';

var appConfig = {
    generalPurposeJdsServer: {
        baseUrl: 'http://IP             '
    }
};

describe('Clinical object subsystem resource task tests', function() {

    describe('Create clinical object', function() {

        it('should create a clinical object when called with the correct parameters', function(done) {

            nock(testEndpoint).post('/' + endpoint).reply(200, {});

            clinicalObjects.create(logger, appConfig, sample1.model, function(err, response) {
                expect(response.body).to.be.an.object();
                expect(err).to.be.null();
                done();
            });
        });

        it('should fail validation and handle errors if called with an invalid model', function(done) {

            clinicalObjects.create(logger, appConfig, sample1.pid, function(err, response) {
                expect(response).to.be.undefined();
                expect(err).not.to.be.undefined();
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
                expect(err.message).not.to.be.undefined;
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
                expect(response.patientUid).to.be(sample1.pid);
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

            var model = buildSampleObject(sample1);
            clinicalObjects.update(logger, appConfig, sample1.uid, model, function(err, response) {
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
            clinicalObjects.update(logger, appConfig, sample1.uid, model, function(err, response) {
                expect(response).to.be.undefined();
                expect(err).not.to.be.undefined();
                expect(logger.error.called).to.be.true();
                expect(err.message).not.to.be.undefined();
                expect(err.message).to.be('Test Failure');
                done();
            });
        });
    });

    describe('Delete clinical object', function() {

        it('should delete a clinical object when called with the correct parameters', function(done) {
            nock(testEndpoint)
                .filteringPath(function(path) {
                    return ('/' + endpoint);
                })
                .delete('/' + endpoint)
                .reply(200, {});

            clinicalObjects.delete(logger, appConfig, sample1.uid, function(err, response) {
                expect(response).not.to.be.undefined();
                // expect(response).to.be('200');
                done();
            });
        });

        it('should fail validation and handle errors if called with an invalid UID', function(done) {

            clinicalObjects.delete(logger, appConfig, null, function(err, response) {
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
                .delete('/' + endpoint)
                .replyWithError('Test Failure');

            clinicalObjects.delete(logger, appConfig, sample1.uid, function(err, response) {
                expect(response).to.be.undefined();
                expect(err).not.to.be.undefined();
                expect(logger.error.called).to.be.true();
                expect(err.message).not.to.be.undefined();
                expect(err.message).to.be('Test Failure');
                done();
            });
        });
    });
});
