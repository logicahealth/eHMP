'use strict';

var _ = require('lodash');
var httpUtil = require('../../core/rdk').utils.http;
var notesValidator = require('./notes-validator');
var writebackContext;

describe('The Notes input validator', function () {
    beforeEach(function() {
        writebackContext = {
            pid: '9E7A;8',
            resourceId: '12345',
            duz: {'9E7A': 'duz1', 'C77A': 'duz2'},
            vistaConfig: {
                host: 'IP        ',
                port: 9210,
                accessCode: 'PW    ',
                verifyCode: 'PW    !!',
                localIP: 'IP      ',
                localAddress: 'localhost',
                context: 'HMP UI CONTEXT'
            },
            appConfig: {
                jdsserver: {}
            },
            model: {
                'authorUid': '10000000255',
                'documentDefUid': 'urn:va:doc-def:9E7A:40',
                'encounterDateTime': '199310131400',
                'encounterCategoryName': 'Appointment',
                'referenceDateTime': '201507101410',
                'locationIEN': '32',
                'patientIcn': '10110V004877',
                'pid': '9E7A;8',
                'status': 'UNSIGNED'
            },
            logger: sinon.stub(require('bunyan').createLogger({name: 'notes-validator'}))
        };
    });

    describe('validates delete function', function() {
        it('adds uid to the writebackContext.model', function(done) {
            notesValidator.delete(writebackContext, function() {
                expect(writebackContext.model.uid).to.eql('12345');
                done();
            });
        });
    });

    describe('validates sign function', function() {
        it('returns an error if the signature code does not exisit', function(done) {
            notesValidator.sign(writebackContext, function(error) {
                expect(error).to.eql('signatureCode is missing from the model. A signature code is required to sign a note.');
                done();
            });
        });

        it('encrypts the signature code and sets the dfn', function(done) {
            writebackContext.model.signatureCode = 'PW    !!';
            notesValidator.sign(writebackContext, function() {
                expect(writebackContext.model.signatureCode).to.be.truthy();
                expect(writebackContext.model.dfn).to.eql('8');
                done();
            });
        });
    });

    describe('validates update function', function() {
        it('returns an error if the pid does not exisit', function(done) {
            delete writebackContext.pid;
            notesValidator.update(writebackContext, function(error) {
                expect(error).to.eql('The note\'s IEN and patient\'s PID are needed to update a note.');
                done();
            });
        });

        it('returns an error if the ien does not exisit', function(done) {
            delete writebackContext.resourceId;
            notesValidator.update(writebackContext, function(error) {
                expect(error).to.eql('The note\'s IEN and patient\'s PID are needed to update a note.');
                done();
            });
        });

        it('sets the pid, siteHash, authorUid, uid, and localId in the writebackContext.model where siteHash is undefined', function(done) {
            notesValidator.update(writebackContext, function() {
                expect(writebackContext.model.pid).to.eql('8');
                expect(writebackContext.model.siteHash).to.be.falsy();
                expect(writebackContext.model.uid).to.eql('12345');
                expect(writebackContext.model.localId).to.eql('12345');
                done();
            });
        });

        it('sets the pid, siteHash, authorUid, uid, and localId in the writebackContext.model where siteHash is defined', function(done) {
            writebackContext.siteHash = '9E7A';
            notesValidator.update(writebackContext, function() {
                expect(writebackContext.model.pid).to.eql('8');
                expect(writebackContext.model.siteHash).to.eql('9E7A');
                expect(writebackContext.model.uid).to.eql('12345');
                expect(writebackContext.model.localId).to.eql('12345');
                done();
            });
        });
    });

    describe('validates unsigned function', function() {
        it('returns an error if the titleId (documentDefUid) does not exisit', function(done) {
            delete writebackContext.model.documentDefUid;
            notesValidator.unsigned(writebackContext, function(error) {
                expect(error).to.eql('documentDefUid is missing from the model. A title is needed to save a note.');
                done();
            });
        });

        // it('calls httpUtil.get with error', function(done) {
        //     writebackContext.siteHash = '9E7A';

        //     sinon.stub(httpUtil, 'get', function(options, callback) {
        //         var err = 'error';
        //         var fakeResponse = {statusCode: 200};
        //         var fakeBody = {data: {currentItemCount: 0, items: []}};
        //         return callback(err, fakeResponse, fakeBody);
        //     });

        //     notesValidator.unsigned(writebackContext, function(error) {
        //         expect(error).to.be.truthy();
        //         done();
        //     });
        // });

        // it('calls httpUtil.get without error using existing Visit', function(done) {
        //     writebackContext.siteHash = '9E7A';

        //     sinon.stub(httpUtil, 'get', function(options, callback) {
        //         var err = null;
        //         var fakeResponse = {statusCode: 200};
        //         var fakeBody = {
        //             data: {
        //                 currentItemCount: 3,
        //                 items: []
        //             }
        //         };
        //         return callback(err, fakeResponse, fakeBody);
        //     });

        //     notesValidator.unsigned(writebackContext, function(error, result) {
        //         expect(error).to.be.falsy();
        //         done();
        //     });
        // });

        // it('calls httpUtil.get without error using new Visit', function(done) {
        //     writebackContext.siteHash = '9E7A';
        //     delete writebackContext.model.encounterCategoryName;
        //     writebackContext.model.encounterServiceCategory = 'A';

        //     sinon.stub(httpUtil, 'get', function(options, callback) {
        //         var err = null;
        //         var fakeResponse = {statusCode: 200};
        //         var fakeBody = {
        //             data: {
        //                 currentItemCount: 3,
        //                 items: []
        //             }
        //         };
        //         return callback(err, fakeResponse, fakeBody);
        //     });

        //     notesValidator.unsigned(writebackContext, function(error, result) {
        //         expect(error).to.be.falsy();
        //         done();
        //     });
        // });

        // it('calls validateVisitExist with error using new Visit where serviceCategory is missing', function(done) {
        //     writebackContext.siteHash = '9E7A';
        //     delete writebackContext.model.encounterCategoryName;

        //     notesValidator.unsigned(writebackContext, function(error, result) {
        //         expect(error).to.eql('The service category is not defined in the associated encounter context. Please check that the encounter context is correct.');
        //         done();
        //     });
        // });

        // it('calls validateVisitExist with error using new Visit where encounterDateTime is missing', function(done) {
        //     writebackContext.siteHash = '9E7A';
        //     delete writebackContext.model.encounterCategoryName;
        //     delete writebackContext.model.encounterDateTime;
        //     writebackContext.model.encounterServiceCategory = 'A';

        //     notesValidator.unsigned(writebackContext, function(error, result) {
        //         expect(error).to.eql('The encounter date/time is not defined in the associated encounter context. Please check that the encounter context is correct.');
        //         done();
        //     });
        // });

        // it('calls validateVisitExist with error using new Visit where locationUid is missing', function(done) {
        //     writebackContext.siteHash = '9E7A';
        //     delete writebackContext.model.encounterCategoryName;
        //     delete writebackContext.model.locationUid;
        //     writebackContext.model.encounterServiceCategory = 'A';

        //     notesValidator.unsigned(writebackContext, function(error, result) {
        //         expect(error).to.eql('The encounter location ID is not defined in the associated encounter context. Please check that the encounter context is correct.');
        //         done();
        //     });
        // });

        // it('calls httpUtil.get with encounter missing error', function(done) {
        //     writebackContext.siteHash = '9E7A';

        //     sinon.stub(httpUtil, 'get', function(options, callback) {
        //         var err = null;
        //         var fakeResponse = {statusCode: 200};
        //         var fakeBody = {
        //             data: {
        //                 currentItemCount: -1,
        //                 items: []
        //             }
        //         };
        //         return callback(err, fakeResponse, fakeBody);
        //     });

        //     notesValidator.unsigned(writebackContext, function(error, result) {
        //         expect(error).to.eql('The encounter that is associated with the note cannot be found.');
        //         done();
        //     });
        // });
    });
});
