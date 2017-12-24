'use strict';

var bunyan = require('bunyan');
var clinicalObjectsTasks = require('./clinical-objects-tasks');
var clinicalObjectSubsystem = require('../../subsystems/clinical-objects/clinical-objects-subsystem');

describe('clinical-objects-tasks', function() {
    var writebackContext;
    var loadReference;
    beforeEach(function() {
        writebackContext = {};
        writebackContext.logger = sinon.stub(bunyan.createLogger({
            name: 'clinical-objects-tasks-spec'
        }));
        writebackContext.interceptorResults = {
            patientIdentifiers: {
                siteDfn: 'SITE;3',
                site: 'SITE',
                dfn: '3',
                originalID: 'SITE;3'
            }
        };
        writebackContext.uid = 'urn:va:ehmp-order:SITE:231:df6a996f-500b-4815-9772-3d33f519620d';
        writebackContext.appConfig = {
            generalPurposeJdsServer: {
                baseUrl: 'foo'
            }
        };
        loadReference = 'true';
        writebackContext.model = {
            patientUid: 'urn:va:patient:SITE:3:3'
        };
        writebackContext.uidList = {
            uid: 'urn:va:ehmp-order:SITE:231:df6a996f-500b-4815-9772-3d33f519620d'
        };
    });
    describe('.create', function() {
        it('validates that the path pid and body pid are the same', function() {
            // prevent the subsystem create from being called
            // in case the task's own validation fails
            sinon.stub(clinicalObjectSubsystem, 'create');
            writebackContext.model = {
                patientUid: 'urn:va:patient:SITE:3:3'
            };
            clinicalObjectsTasks.create(writebackContext, function(err) {
                expect(err).to.contain('path pid does not correlate to patient represented by patientUid');
            });
        });
        it('calls clinicalObjectSubsystem.create with the correct arguments', function() {
            writebackContext.model = {
                patientUid: 'urn:va:patient:SITE:3:3'
            };
            var response = 'response';
            sinon.stub(clinicalObjectSubsystem, 'create', function(logger, appConfig, model, callback) {
                expect(logger).to.equal(writebackContext.logger);
                expect(appConfig).to.equal(writebackContext.appConfig);
                expect(model).to.equal(writebackContext.model);
                var err = null;
                callback(err, response);
            });
            clinicalObjectsTasks.create(writebackContext, function(err) {
                expect(err).to.be.falsy();
                expect(writebackContext.vprResponse).to.equal(response);
            });
        });
    });
    describe('.read', function() {
        it('validates that the uid is being passed in correctly', function() {
            // prevent the subsystem create from being called
            // in case the task's own validation fails
            sinon.stub(clinicalObjectSubsystem, 'read');
            writebackContext.resourceId = {
                uid: 'SITE:231:df6a996f-500b-4815-9772-3d33f519620d'
            };
            clinicalObjectsTasks.read(writebackContext, function(err) {
                expect(err).to.contain('model uid field is invalid');
            });
        });
        it('calls clinicalObjectSubsystem.read with the correct uid', function() {
            writebackContext.resourceId = {
                uid: 'urn:va:ehmp-order:SITE:231:df6a996f-500b-4815-9772-3d33f519620d'
            };
            var response = 'response';
            sinon.stub(clinicalObjectSubsystem, 'read', function(logger, appConfig, uid, loadReference, callback) {
                expect(logger).to.equal(writebackContext.logger);
                expect(appConfig).to.equal(writebackContext.appConfig);
                expect(uid).to.equal(writebackContext.resourceId);
                expect(loadReference).to.equal(loadReference);
                var err = null;
                callback(err, response);
            });
            clinicalObjectsTasks.read(writebackContext, function(err) {
                expect(err).to.be.falsy();
                expect(writebackContext.vprResponse).to.equal(response);
            });
        });

    });
    describe('.update', function() {
        it('validates update is being passed a correct clinical object', function() {
            // prevent the subsystem create from being called
            // in case the task's own validation fails
            sinon.stub(clinicalObjectSubsystem, 'update');
            writebackContext.uid = {
                uid: 'SITE:231:df6a996f-500b-4815-9772-3d33f519620b'
            };
            clinicalObjectsTasks.read(writebackContext, function(err) {
                expect(err.pop()).to.contain('uid not found');
            });
        });
        it('calls clinicalObjectSubsystem.update with the correct uid', function() {
            writebackContext.resourceId = {
                uid: 'urn:va:ehmp-order:SITE:231:df6a996f-500b-4815-9772-3d33f519620d'
            };
            var response = 'response';
            sinon.stub(clinicalObjectSubsystem, 'update', function(logger, appConfig, uid, body, callback) {
                expect(logger).to.equal(writebackContext.logger);
                expect(appConfig).to.equal(writebackContext.appConfig);
                expect(uid).to.equal(writebackContext.resourceId);
                expect(body).to.equal(writebackContext.model);
                var err = null;
                callback(err, response);
            });
            clinicalObjectsTasks.update(writebackContext, function(err) {
                expect(err).to.be.falsy();
                expect(writebackContext.vprResponse).to.equal(response);
            });
        });

        it('calls clinicalObjectSubsystem.update with a patientUid containing an ICN value', function() {
            writebackContext.resourceId = {
                uid: 'urn:va:ehmp-order:ICN:123456789:df6a996f-500b-4815-9772-3d33f519620d'
            };

            writebackContext.interceptorResults.patientIdentifiers.siteDfn = 'HDR;123456789';
            writebackContext.interceptorResults.patientIdentifiers.originalID = 'HDR;123456789';
            writebackContext.model = {
                patientUid: 'urn:va:patient:ICN:123456789:123456789'
            };
            var response = 'response';
            sinon.stub(clinicalObjectSubsystem, 'update', function(logger, appConfig, uid, body, callback) {
                expect(logger).to.equal(writebackContext.logger);
                expect(appConfig).to.equal(writebackContext.appConfig);
                expect(uid).to.equal(writebackContext.resourceId);
                expect(body).to.equal(writebackContext.model);
                var err = null;
                callback(err, response);
            });
            clinicalObjectsTasks.update(writebackContext, function(err) {
                expect(err).to.be.falsy();
                expect(writebackContext.vprResponse).to.equal(response);
            });
        });

    });
    describe('.find', function() {
        // it('validates find is being passed a correct model', function () {
        //     // prevent the subsystem create from being called
        //     // in case the task's own validation fails
        //     sinon.stub(clinicalObjectSubsystem, 'find');
        //     writebackContext.model = {
        //         model: 'SITE:231:df6a996f-500b-4815-9772-3d33f519620b'
        //     };
        //     clinicalObjectsTasks.read(writebackContext, function (err) {
        //         expect(err.pop()).to.contain('uid not found');
        //     });
        // });
        it('calls clinicalObjectSubsystem.find with the correct uid', function() {
            writebackContext.resourceId = {
                uid: 'urn:va:ehmp-order:SITE:231:df6a996f-500b-4815-9772-3d33f519620d'
            };
            var response = 'response';
            sinon.stub(clinicalObjectSubsystem, 'find', function(logger, appConfig, model, loadReference, callback) {
                expect(logger).to.equal(writebackContext.logger);
                expect(appConfig).to.equal(writebackContext.appConfig);
                expect(model).to.equal(writebackContext.model);
                expect(loadReference).to.equal(loadReference);
                var err = null;
                callback(err, response);
            });
            clinicalObjectsTasks.find(writebackContext, function(err) {
                expect(err).to.be.falsy();
                expect(writebackContext.vprResponse).to.equal(response);
            });
        });

        it('handles clinical object not found error from subsystem', function() {
            sinon.stub(clinicalObjectSubsystem, 'find', function(logger, appConfig, model, loadReference, callback) {
                var err = [clinicalObjectSubsystem.CLINICAL_OBJECT_NOT_FOUND];
                callback(err, {});
            });
            clinicalObjectsTasks.find(writebackContext, function(err) {
                expect(err).to.be.null();
                expect(writebackContext.vprResponse).to.be.empty();
            });
        });
    });
    describe('.getList', function() {
        it('validates find is being passed a correct model', function() {
            // prevent the subsystem create from being called
            // in case the task's own validation fails
            sinon.stub(clinicalObjectSubsystem, 'getList');
            writebackContext.model = {
                model: 'SITE:231:df6a996f-500b-4815-9772-3d33f519620b'
            };
            clinicalObjectsTasks.read(writebackContext, function(err) {
                expect(err.pop()).to.contain('uid not found');
            });
        });
        it('calls clinicalObjectSubsystem.getList with the correct uidList', function() {
            writebackContext.resourceId = {
                uid: 'urn:va:ehmp-order:SITE:231:df6a996f-500b-4815-9772-3d33f519620d'
            };
            var response = 'response';
            sinon.stub(clinicalObjectSubsystem, 'getList', function(logger, appConfig, uidList, loadReference, callback) {
                expect(logger).to.equal(writebackContext.logger);
                expect(appConfig).to.equal(writebackContext.appConfig);
                expect(uidList).to.equal(writebackContext.uidList);
                expect(loadReference).to.equal(loadReference);
                var err = null;
                callback(err, response);
            });
            clinicalObjectsTasks.getList(writebackContext, function(err) {
                expect(err).to.be.falsy();
                expect(writebackContext.vprResponse).to.equal(response);
            });
        });
    });

});
