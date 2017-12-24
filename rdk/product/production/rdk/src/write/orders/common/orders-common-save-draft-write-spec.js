'use strict';

var bunyan = require('bunyan');
var saveDraftOrder = require('./orders-common-save-draft-write');
var clinicalObjectSubsystem = require('../../../subsystems/clinical-objects/clinical-objects-subsystem');

describe('orders-common-save-draft-write', function() {
    var createStub;
    var updateStub;
    var writebackContext = {
        logger: sinon.stub(bunyan.createLogger({
            name: 'orders-common-save-draft-write-spec'
        })),
        pid: 'SITE;3',
        appConfig: {
            generalPurposeJdsServer: {
                baseUrl: 'localhost'
            }
        },
        model: {
            ehmpState: 'draft'
        }
    };
    var testUid = 'urn:va:ehmp:SITE;3:01234567-1337-dead-beef-fedcba987654';

    describe('Save *CREATES* a clinical object when writebackContext.model.uid is not present', function(done) {
        beforeEach(function() {
            createStub = sinon.stub(clinicalObjectSubsystem, 'create', function (logger, appConfig, model, callback) {
                callback(null, 'PASS');
            });
            updateStub = sinon.stub(clinicalObjectSubsystem, 'update', function(logger, appConfig, muid, odel, callback) {
                callback(null, 'PASS');
            });
        });

        it('calls clinicalObjectSubsystem.create if writebackContext.model.uid is not present', function(done) {
            saveDraftOrder(writebackContext, function(err, resp) {
                expect(createStub.called).to.be.truthy();
                expect(updateStub.called).to.be.false();
                done();
            });
        });

        it('validates that writebackContext.model.ehmpState set to "draft" is acceptable', function(done) {
            writebackContext.model.ehmpState = 'draft';
            saveDraftOrder(writebackContext, function(err, resp) {
                expect(err).to.be.falsy();
                done();
            });
        });

        it('validates that writebackContext.model.ehmpState set to "deleted" is not acceptable', function(done) {
            writebackContext.model.ehmpState = 'deleted';
            saveDraftOrder(writebackContext, function(err, resp) {
                expect(err).to.be.truthy();
                done();
            });
        });

        it('validates that writebackContext.model.ehmpState set to "active" is not acceptable', function(done) {
            writebackContext.model.ehmpState = 'active';
            saveDraftOrder(writebackContext, function(err, resp) {
                expect(err).to.be.truthy();
                done();
            });
        });
    });

    describe('Save *UPDATES* a clinical object when writebackContext.model.uid is present', function(done) {
        beforeEach(function() {
            writebackContext.model.uid = testUid;
            createStub = sinon.stub(clinicalObjectSubsystem, 'create', function (logger, appConfig, model, callback) {
                callback(null, 'PASS');
            });
            updateStub = sinon.stub(clinicalObjectSubsystem, 'update', function(logger, appConfig, muid, odel, callback) {
                callback(null, 'PASS');
            });
        });

        it('calls clinicalObjectSubsystem.update if writebackContext.model.uid is present', function(done) {
            writebackContext.model.ehmpState = 'draft';
            saveDraftOrder(writebackContext, function(err, resp) {
                expect(createStub.called).to.be.falsy();
                expect(updateStub.called).to.be.truthy();
                done();
            });
        });

        it('validates that writebackContext.model.ehmpState set to "draft" is acceptable', function(done) {
            writebackContext.model.ehmpState = 'draft';
            saveDraftOrder(writebackContext, function(err, resp) {
                expect(err).to.be.falsy();
                done();
            });
        });

        it('validates that writebackContext.model.ehmpState set to "deleted" is acceptable', function(done) {
            writebackContext.model.ehmpState = 'deleted';
            saveDraftOrder(writebackContext, function(err, resp) {
                expect(err).to.be.falsy();
                done();
            });
        });

        it('validates that writebackContext.model.ehmpState set to "active" is not acceptable', function(done) {
            writebackContext.model.ehmpState = 'active';
            saveDraftOrder(writebackContext, function(err, resp) {
                expect(err).to.be.truthy();
                done();
            });
        });
    });
});
