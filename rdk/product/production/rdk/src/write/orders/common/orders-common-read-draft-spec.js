'use strict';

var bunyan = require('bunyan');
var readDraftOrder = require('./orders-common-read-draft');
var clinicalObject = require('../../../subsystems/clinical-objects/clinical-objects-subsystem');

describe('orders-common-save-draft-write', function() {
    var readStub;
    var testUid = 'urn:va:ehmp:9E7A;3:01234567-1337-dead-beef-fedcba987654';
    var writebackContext = {
        logger: sinon.stub(bunyan.createLogger({
            name: 'orders-common-read-draft-spec'
        })),
        pid: '9E7A;3',
        resourceId: testUid,
        appConfig: {
            generalPurposeJdsServer: {
                baseUrl: 'localhost'
            }
        },
        model: {
            ehmpState: 'draft'
        }
    };

    var setupStub = function(error, resp) {
        readStub = sinon.stub(clinicalObject, 'read', function(logger, appConfig, uid, loadReference, callback) {
            callback(error, resp);
        });
    };

    describe('the functionality to read a draft order from the clinical object subsystem', function(done) {
        beforeEach(function() {
            delete writebackContext.vprResponse;
        });

        it('calls clinicalObject.read', function(done) {
            setupStub(null, {clinicalObject: 'success'});
            readDraftOrder(writebackContext, function(err, resp) {
                expect(readStub.called).to.be.truthy();
                done();
            });
        });

        it('returns the requested clinical object if retrieved correctly from pJDS', function(done) {
            setupStub(null, {clinicalObject: 'success'});
            readDraftOrder(writebackContext, function(err, resp) {
                expect(writebackContext.vprResponse).to.eql({clinicalObject: 'success'});
                expect(err).to.be.falsy();
                done();
            });
        });

        it('returns an empty object if the clinical object was not found', function(done) {
            setupStub([clinicalObject.CLINICAL_OBJECT_NOT_FOUND]);
            readDraftOrder(writebackContext, function(err, resp) {
                expect(writebackContext.vprResponse).to.be.empty();
                expect(err).to.be.falsy();
                done();
            });
        });

        it('returns an error if an error occurred during the pJDS query', function(done) {
            setupStub(['FAILED CALL']);
            readDraftOrder(writebackContext, function(err, resp) {
                expect(writebackContext.vprResponse).to.be.falsy();
                expect(err).not.to.be.falsy();
                done();
            });
        });
    });
});
