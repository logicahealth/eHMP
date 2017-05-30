'use strict';

var saveNoteObject = require('./save-note-object');
var pjds = require('../../subsystems/clinical-objects/clinical-objects-subsystem');

var writebackContext = {
    pid: '9E7A;100615',
    appConfig: {
        generalPurposeJdsServer: {
            baseUrl: 'foo'
        }
    },
    vistaConfig: {
        host: 'IP        ',
        port: PORT,
        accessCode: 'REDACTED',
        verifyCode: 'REDACTED',
        localIP: 'IP      ',
        localAddress: 'localhost',
        noReconnect: true
    },
    model: {
        'referenceId': 'urn:va:ehmp-observation:9E7A:100615:b5f0e8ff-434a-433f-a4d9-37459d1b419e',
        'patientUid': 'urn:va:patient:9E7A:100615:100615',
        'authorUid': 'urn:va:user:9E7A:10000000238',
        'visit': {
            'location': 'urn:va:location:9E7A:285',
            'serviceCategory': 'PSB',
            'dateTime': '20160102123040'
        },
        'data': {
            'madlib': null,
            'annotation': 'bar',
            'problemRelationship': 'urn:va:problem:9E7A:100615:183'
        }
    },
    logger: sinon.stub(require('bunyan').createLogger({
        name: 'save-note-object-spec'
    }))
};

describe('findClinicalObject', function() {

    afterEach(function() {
        pjds.find.restore();
    });

    it('tests that find clinical object returns not found response', function() {
        sinon.stub(pjds, 'find', function(logger, appConfig, model, loadReference, callback) {
            var err = [pjds.CLINICAL_OBJECT_NOT_FOUND];
            callback(err);
        });

        saveNoteObject._findClinicalObject(writebackContext, function(err, context, result) {
            expect(result).eql(null);
        });
    });

    it('tests that find clinical object returns clinical object UID', function() {
        sinon.stub(pjds, 'find', function(logger, appConfig, model, loadReference, callback) {
            var response = {
                'items': [{
                    'uid': 'urn:va:ehmp-observation:9E7A:100615:b5f0e8ff-434a-433f-a4d9-37459d1b419e'
                }]
            };
            callback(null, response);
        });

        saveNoteObject._findClinicalObject(writebackContext, function(err, context, result) {
            expect(result).eql('urn:va:ehmp-observation:9E7A:100615:b5f0e8ff-434a-433f-a4d9-37459d1b419e');
        });
    });

    it('tests that find clinical object returns error response', function() {
        sinon.stub(pjds, 'find', function(logger, appConfig, model, loadReference, callback) {
            var err = [pjds.PJDS_CONNECTION_ERROR];
            callback(err);
        });

        saveNoteObject._findClinicalObject(writebackContext, function(err, context, result) {
            expect(err).to.be.truthy();
            expect(err[0]).to.equal(pjds.PJDS_CONNECTION_ERROR);
        });
    });
});

describe('getClinicalObjectUid', function() {

    afterEach(function() {
        pjds.create.restore();
    });

    it('tests that get clinical object UID returns existing UID', function() {
        sinon.stub(pjds, 'create', function(logger, appConfig, model, callback) {
            callback(null);
        });

        saveNoteObject._getClinicalObjectUid(writebackContext, 'urn:va:ehmp-observation:9E7A:100615:b5f0e8ff-434a-433f-a4d9-37459d1b419e', function(err, context, result) {
            expect(result).eql('urn:va:ehmp-observation:9E7A:100615:b5f0e8ff-434a-433f-a4d9-37459d1b419e');
        });
    });

    it('tests that get clinical object UID returns newly created clinical object UID', function() {
        sinon.stub(pjds, 'create', function(logger, appConfig, model, callback) {
            var result = {
                headers: {
                    location: 'http://IP             /clinicobj/urn:va:ehmp-observation:9E7A:100615:b5f0e8ff-434a-433f-a4d9-37459d1b419e'
                }
            };
            callback(null, result);
        });

        saveNoteObject._getClinicalObjectUid(writebackContext, null, function(err, context, result) {
            expect(result).eql('urn:va:ehmp-observation:9E7A:100615:b5f0e8ff-434a-433f-a4d9-37459d1b419e');
        });
    });


    it('tests that get clinical object UID returns error response', function() {
        sinon.stub(pjds, 'create', function(logger, appConfig, model, callback) {
            var err = ['Failed to create clinical object'];
            callback(err);
        });

        saveNoteObject._getClinicalObjectUid(writebackContext, null, function(err, context, result) {
            expect(err).to.be.truthy();
            expect(err[0]).to.equal('Failed to create clinical object');
        });
    });
});

describe('createNoteObject', function() {

    afterEach(function() {
        pjds.create.restore();
    });

    it('tests that create note object returns correct note object', function() {
        sinon.stub(pjds, 'create', function(logger, appConfig, model, callback) {
            var result = {
                headers: {
                    location: 'http://IP             /clinicobj/urn:va:ehmp-note:9E7A:100615:67f4ce62-8f0f-4c89-9ec0-4ad83a3645ef'
                }
            };
            callback(null, result);
        });

        saveNoteObject._createNoteObject(writebackContext, 'urn:va:ehmp:9E7A;100615:0babd148-3f0d-4a0f-8c1a-c39ce3be48f4', function(err, result) {
            expect(result).eql('http://IP             /clinicobj/urn:va:ehmp-note:9E7A:100615:67f4ce62-8f0f-4c89-9ec0-4ad83a3645ef');
        });
    });

    it('tests that create note object returns error response', function() {
        sinon.stub(pjds, 'create', function(logger, appConfig, model, callback) {
            var err = ['Failed to create clinical object'];
            callback(err);
        });

        saveNoteObject._createNoteObject(writebackContext, 'urn:va:ehmp:9E7A;100615:0babd148-3f0d-4a0f-8c1a-c39ce3be48f4', function(err, context, result) {
            expect(err).to.be.truthy();
            expect(err[0]).to.equal('Failed to create clinical object');
        });
    });
});
