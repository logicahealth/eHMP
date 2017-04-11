'use strict';

var encountersValidator = require('./encounters-validator');

describe('encounters writeback validator', function() {
    var writebackContext;
    beforeEach(function() {
        writebackContext = {};
        writebackContext.logger = sinon.stub(require('bunyan').createLogger({
            name: 'encounters-writeback-validator'
        }));
        writebackContext.model = {
            'patientDFN': '3',
            'isInpatient': '0',
            'locationUid': 'urn:va:location:9E7A:32',
            'encounterDateTime': '201512061112',
            'primaryProviderIEN': '991',
            'isPrimaryProvider': '0'
        };
    });
    it('identifies a valid encounter model', function(done) {
        encountersValidator.save(writebackContext, function(err) {
            expect(err).to.be.falsy();
            done();
        });
    });
    it('identifies an empty encounter model', function(done) {
        writebackContext.model = {};
        encountersValidator.save(writebackContext, function(err) {
            expect(err).to.be.truthy();
            done();
        });
    });
    it('identifies an undefined encounter model', function(done) {
        writebackContext.model = undefined;
        encountersValidator.save(writebackContext, function(err) {
            expect(err).to.be.truthy();
            done();
        });
    });
    it('identifies a null encounter model', function(done) {
        writebackContext.model = null;
        encountersValidator.save(writebackContext, function(err) {
            expect(err).to.be.truthy();
            done();
        });
    });
    it('identifies an invalid patient DFN', function(done) {
        writebackContext.model.patientDFN = undefined;
        encountersValidator.save(writebackContext, function(err) {
            expect(err).to.be.truthy();
            done();
        });
    });
    it('identifies an invalid isInpatient value', function(done) {
        writebackContext.model.isInpatient = undefined;
        encountersValidator.save(writebackContext, function(err) {
            expect(err).to.be.truthy();
            done();
        });
    });
    it('identifies an invalid location Uid', function(done) {
        writebackContext.model.locationUid = undefined;
        encountersValidator.save(writebackContext, function(err) {
            expect(err).to.be.truthy();
            done();
        });
    });
    it('identifies an invalid encounter date/time', function(done) {
        writebackContext.model.encounterDateTime = undefined;
        encountersValidator.save(writebackContext, function(err) {
            expect(err).to.be.truthy();
            done();
        });
    });
    it('identifies an invalid date format for encounter date/time', function(done) {
        writebackContext.model.encounterDateTime = '2015120612:11';
        encountersValidator.save(writebackContext, function(err) {
            expect(err).to.be.truthy();
            done();
        });
    });
});
