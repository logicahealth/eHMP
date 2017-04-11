'use strict';

var _ = require('lodash');
var noteWrapper = require('./clinical-objects-wrapper-note');

describe('Clinical object note wrapper tests', function() {

    var errorMessages = [];
    var model = {};
    var contextArg = {};

    describe('wrapping a note object into a clinical object on create', function() {

        beforeEach(function() {
            errorMessages = [];
            model = create_valid.model;
            contextArg = create_valid;
        });

        it('should create a valid clinical object', function() {
            expect(noteWrapper.wrapCreateNote(errorMessages, contextArg)).to.eql(valid_clinicalObj);
        });

        it('should reject missing error array', function() {
            expect(noteWrapper.wrapCreateNote()).to.eql('Please pass in an empty array for error messages as the first argument.');
        });

        it('should reject an invalid error array', function() {
            expect(noteWrapper.wrapCreateNote(['error array'])).to.eql('Please pass in an empty array for error messages as the first argument.');
        });

        it('should reject missing writebackContext', function() {
            noteWrapper.wrapCreateNote(errorMessages);
            expect(errorMessages.pop()).to.be('writebackContext is empty');
        });

        it('should reject missing model', function() {
            noteWrapper.wrapCreateNote(errorMessages, _.omit(contextArg, 'model'));
            expect(errorMessages.pop()).to.be('writebackContext.model is empty');
        });

        it('should reject missing pid', function() {
            noteWrapper.wrapCreateNote(errorMessages, _.omit(contextArg, 'pid'));
            expect(errorMessages.pop()).to.be('writebackContext does not contain "pid"');
        });

        it('should reject missing authorUid', function() {
            model = _.omit(model, 'authorUid');
            contextArg.model = model;
            noteWrapper.wrapCreateNote(errorMessages, contextArg);
            expect(errorMessages.pop()).to.be('writebackContext.model does not contain "authorUid"');
        });

        it('should reject missing locationIEN', function() {
            model = _.omit(model, 'locationIEN');
            contextArg.model = model;
            noteWrapper.wrapCreateNote(errorMessages, contextArg);
            expect(errorMessages.pop()).to.be('writebackContext.model does not contain "locationIEN"');
        });

        it('should reject missing encounterServiceCategory', function() {
            model = _.omit(model, 'encounterServiceCategory');
            contextArg.model = model;
            noteWrapper.wrapCreateNote(errorMessages, contextArg);
            expect(errorMessages.pop()).to.be('writebackContext.model does not contain "encounterServiceCategory"');
        });

        it('should reject missing encounterDateTime', function() {
            model = _.omit(model, 'encounterDateTime');
            contextArg.model = model;
            noteWrapper.wrapCreateNote(errorMessages, contextArg);
            expect(errorMessages.pop()).to.be('writebackContext.model does not contain "encounterDateTime"');
        });
    });

    describe('wrapping a note object into a clinical object on update', function() {

        beforeEach(function() {
            errorMessages = [];
            contextArg = update_valid;
        });

        it('should create a valid clinical object', function() {
            expect(noteWrapper.wrapUpdateNote(errorMessages, update_valid)).to.eql(valid_clinicalObj);
        });

        it('should reject missing error array', function() {
            expect(noteWrapper.wrapUpdateNote()).to.eql('Please pass in an empty array for error messages as the first argument.');
        });

        it('should reject an invalid error array', function() {
            expect(noteWrapper.wrapUpdateNote(['error array'])).to.eql('Please pass in an empty array for error messages as the first argument.');
        });

        it('should reject missing model', function() {
            noteWrapper.wrapUpdateNote(errorMessages);
            expect(errorMessages.pop()).to.be('model is empty');
        });

        it('should reject missing clinicalObject', function() {
            noteWrapper.wrapUpdateNote(errorMessages, _.omit(contextArg, 'clinicalObject'));
            expect(errorMessages.pop()).to.be('model.clinicalObject is empty');
        });
    });

    describe('unwrapping a note from a clinical object', function() {
        beforeEach(function() {
            errorMessages = [];
        });
        it('should unwrap a clean test case into the new inverted format', function() {
            var sample = noteWrapper.returnClinicialObjectData(errorMessages, clinicalObjectCleanPass);
            var expectation = [{
                test: 'test',
                uid: 'urn:va:ehmp:9E7A;3:de305d54-75b4-431b-adb2-eb6b9e546014',
                clinicalObject: {
                    uid: 'urn:va:ehmp:9E7A;3:de305d54-75b4-431b-adb2-eb6b9e546014',
                    patientUid: '9E7A;3',
                    authorUid: 'urn:va:user:9E7A:123',
                    domain: 'order',
                    subDomain: 'laboratory',
                    visit: {
                        location: 'urn:va:location:9E7A:1',
                        serviceCategory: 'PSB',
                        dateTime: '20160101120000'
                    },
                    referenceId: ''
                }
            }];
            sample = JSON.stringify(sample[0]);
            expectation = JSON.stringify(expectation[0]);
            expect(sample).to.equal(expectation);
        });
        it('should fail gracefully on an undefined object', function() {
            noteWrapper.returnClinicialObjectData(errorMessages, undefined);
            expect(errorMessages.pop()).to.be('ERROR: ClinicalObject::returnClinicialObjectData() called with undefined clinicalObjects argument.');
        });
        it('should fail gracefully on a null object', function() {
            noteWrapper.returnClinicialObjectData(errorMessages, null);
            expect(errorMessages.pop()).to.be('ERROR: ClinicalObject::returnClinicialObjectData() called with null clinicalObjects argument.');
        });
        it('should return an empty array when passed an empty object', function() {
            var sample = noteWrapper.returnClinicialObjectData(errorMessages, []);
            var expectation = [];
            var sampleString = JSON.stringify(sample[0]);
            var expectationString = JSON.stringify(expectation[0]);
            expect(sampleString).to.be(expectationString);
        });
        it('should still return a valid object if the argument`s data field is undefined', function() {
            var sample = noteWrapper.returnClinicialObjectData(errorMessages, clinicalObjectUndefinedData);
            var expectation = [{
                clinicalObject: {
                    uid: 'urn:va:ehmp:9E7A;3:de305d54-75b4-431b-adb2-eb6b9e546014',
                    patientUid: '9E7A;3',
                    authorUid: 'urn:va:user:9E7A:123',
                    domain: 'order',
                    subDomain: 'laboratory',
                    visit: {
                        location: 'urn:va:location:9E7A:1',
                        serviceCategory: 'PSB',
                        dateTime: '20160101120000'
                    },
                    referenceId: ''
                }
            }];
            var sampleString = JSON.stringify(sample[0]);
            var expectationString = JSON.stringify(expectation[0]);
            expect(sampleString).to.equal(expectationString);
        });
        it('should still return a valid object if the argument`s data field is null', function() {
            var sample = noteWrapper.returnClinicialObjectData(errorMessages, clinicalObjectNullData);
            var expectation = [{
                clinicalObject: {
                    uid: 'urn:va:ehmp:9E7A;3:de305d54-75b4-431b-adb2-eb6b9e546014',
                    patientUid: '9E7A;3',
                    authorUid: 'urn:va:user:9E7A:123',
                    domain: 'order',
                    subDomain: 'laboratory',
                    visit: {
                        location: 'urn:va:location:9E7A:1',
                        serviceCategory: 'PSB',
                        dateTime: '20160101120000'
                    },
                    referenceId: ''
                }
            }];
            var sampleString = JSON.stringify(sample[0]);
            var expectationString = JSON.stringify(expectation[0]);
            expect(sampleString).to.be(expectationString);
        });
    });
});

// Unit test data for unwrapping the clinical object
// Note: The unwrapper only works on arrays, Gavin says we can add singleton support later if needed
var clinicalObjectNull = null;
var clinicalObjectEmpty = [];
var clinicalObjectNoData = [{
    uid: 'urn:va:ehmp:9E7A;3:de305d54-75b4-431b-adb2-eb6b9e546014',
    patientUid: '9E7A;3',
    authorUid: 'urn:va:user:9E7A:123',
    domain: 'order',
    subDomain: 'laboratory',
    visit: {
        location: 'urn:va:location:9E7A:1',
        serviceCategory: 'PSB',
        dateTime: '20160101120000'
    },
    referenceId: '',
    data: {}
}];
var clinicalObjectNullData = [{
    uid: 'urn:va:ehmp:9E7A;3:de305d54-75b4-431b-adb2-eb6b9e546014',
    patientUid: '9E7A;3',
    authorUid: 'urn:va:user:9E7A:123',
    domain: 'order',
    subDomain: 'laboratory',
    visit: {
        location: 'urn:va:location:9E7A:1',
        serviceCategory: 'PSB',
        dateTime: '20160101120000'
    },
    referenceId: '',
    data: null
}];
var clinicalObjectUndefinedData = [{
    uid: 'urn:va:ehmp:9E7A;3:de305d54-75b4-431b-adb2-eb6b9e546014',
    patientUid: '9E7A;3',
    authorUid: 'urn:va:user:9E7A:123',
    domain: 'order',
    subDomain: 'laboratory',
    visit: {
        location: 'urn:va:location:9E7A:1',
        serviceCategory: 'PSB',
        dateTime: '20160101120000'
    },
    referenceId: '',
    data: undefined
}];
var clinicalObjectCleanPass = [{
    uid: 'urn:va:ehmp:9E7A;3:de305d54-75b4-431b-adb2-eb6b9e546014',
    patientUid: '9E7A;3',
    authorUid: 'urn:va:user:9E7A:123',
    domain: 'order',
    subDomain: 'laboratory',
    visit: {
        location: 'urn:va:location:9E7A:1',
        serviceCategory: 'PSB',
        dateTime: '20160101120000'
    },
    referenceId: '',
    data: {
        test: 'test'
    }
}];

var create_valid = {
    'logger': {},
    'siteHash': '9E7A',
    'duz': {
        '9E7A': '10000000272'
    },
    'model': {
        'app': 'ehmp',
        'author': 'KHAN,VIHAAN',
        'authorDisplayName': 'Khan,Vihaan',
        'authorUid': 'urn:va:user:9E7A:10000000272',
        'documentClass': 'PROGRESS NOTES',
        'documentDefUid': 'urn:va:doc-def:9E7A:17',
        'documentTypeName': 'Progress Note',
        'encounterName': 'ALCOHOL04/10/1994 08:00',
        'encounterServiceCategory': 'I',
        'encounterDateTime': '19940410080000',
        'locationIEN': '6',
        'patientStatus': 'OUTPATIENT',
        'entered': '20160128154148',
        'formUid': '0',
        'isInterdisciplinary': 'false',
        'lastUpdateTime': '20160128154148',
        'localId': null,
        'localTitle': 'ALLERGY  <ADVERSE REACTION/ALLERGY>',
        'nationalTitle': {
            'name': '',
            'vuid': ''
        },
        'patientIcn': '10110V004877',
        'pid': '8',
        'patientName': 'Ten,Patient',
        'patientBirthDate': '19350407',
        'referenceDateTime': '201601281541',
        'signedDateTime': null,
        'signer': null,
        'signerDisplayName': null,
        'signerUid': null,
        'status': 'UNSIGNED',
        'statusDisplayName': 'Unsigned',
        'summary': '',
        'text': [{
            'author': 'KHAN,VIHAAN',
            'authorDisplayName': 'KHAN,VIHAAN',
            'authorUid': 'urn:va:user:9E7A:10000000272',
            'content': 'teadsf',
            'dateTime': '2016-01-28T15:41:48-05:00',
            'signer': null,
            'signerDisplayName': null,
            'signerUid': null,
            'status': 'UNSIGNED'
        }],
        'value': true,
        '_labelsForSelectedValues': {
            'documentDefUidUnique': 'ALLERGY  <ADVERSE REACTION/ALLERGY>'
        },
        'derivReferenceDate': '01/28/2016',
        'derivReferenceTime': '15:41',
        'lastSavedDisplayTime': '',
        'encounterDisplayName': 'ALCOHOL: 04/10/1994',
        'documentDefUidUnique': 'urn:va:doc-def:9E7A:17---ALLERGY__<ADVERSE_REACTION/ALLERGY>---all',
        'lastSavedTime': '20160128154148',
        'siteHash': '9E7A',
        'uid': '8be59740-c5ff-11e5-ae7a-3f55edc16583'
    },
    'pid': '9E7A;8'
};

var update_valid = {
    'app': 'ehmp',
    'author': 'KHAN,VIHAAN',
    'authorDisplayName': 'Khan,Vihaan',
    'authorUid': 'urn:va:user:9E7A:10000000272',
    'documentClass': 'PROGRESS NOTES',
    'documentDefUid': 'urn:va:doc-def:9E7A:17',
    'documentTypeName': 'Progress Note',
    'encounterName': 'ALCOHOL04/10/1994 08:00',
    'encounterServiceCategory': 'I',
    'encounterDateTime': '19940410080000',
    'locationIEN': '6',
    'patientStatus': 'OUTPATIENT',
    'entered': '20160128154148',
    'formUid': '0',
    'isInterdisciplinary': 'false',
    'lastUpdateTime': '20160128154148',
    'localId': null,
    'localTitle': 'ALLERGY  <ADVERSE REACTION/ALLERGY>',
    'nationalTitle': {
        'name': '',
        'vuid': ''
    },
    'patientIcn': '10110V004877',
    'pid': '8',
    'patientName': 'Ten,Patient',
    'patientBirthDate': '19350407',
    'referenceDateTime': '201601281541',
    'signedDateTime': null,
    'signer': null,
    'signerDisplayName': null,
    'signerUid': null,
    'status': 'UNSIGNED',
    'statusDisplayName': 'Unsigned',
    'summary': '',
    'text': [{
        'author': 'KHAN,VIHAAN',
        'authorDisplayName': 'KHAN,VIHAAN',
        'authorUid': 'urn:va:user:9E7A:10000000272',
        'content': 'teadsf',
        'dateTime': '2016-01-28T15:41:48-05:00',
        'signer': null,
        'signerDisplayName': null,
        'signerUid': null,
        'status': 'UNSIGNED'
    }],
    'value': true,
    '_labelsForSelectedValues': {
        'documentDefUidUnique': 'ALLERGY  <ADVERSE REACTION/ALLERGY>'
    },
    'derivReferenceDate': '01/28/2016',
    'derivReferenceTime': '15:41',
    'lastSavedDisplayTime': '',
    'encounterDisplayName': 'ALCOHOL: 04/10/1994',
    'documentDefUidUnique': 'urn:va:doc-def:9E7A:17---ALLERGY__<ADVERSE_REACTION/ALLERGY>---all',
    'lastSavedTime': '20160128154148',
    'siteHash': '9E7A',
    'uid': '8be59740-c5ff-11e5-ae7a-3f55edc16583',
    clinicalObject: {
        patientUid: '9E7A;8',
        authorUid: 'urn:va:user:9E7A:10000000272',
        domain: 'note',
        subDomain: 'tiu',
        visit: {
            location: '6',
            serviceCategory: 'I',
            dateTime: '19940410080000'
        },
        ehmpState: 'draft'
    }
};

var valid_clinicalObj = {
    patientUid: '9E7A;8',
    authorUid: 'urn:va:user:9E7A:10000000272',
    domain: 'note',
    subDomain: 'tiu',
    visit: {
        location: '6',
        serviceCategory: 'I',
        dateTime: '19940410080000'
    },
    ehmpState: 'draft',
    data: {
        app: 'ehmp',
        author: 'KHAN,VIHAAN',
        authorDisplayName: 'Khan,Vihaan',
        authorUid: 'urn:va:user:9E7A:10000000272',
        documentClass: 'PROGRESS NOTES',
        documentDefUid: 'urn:va:doc-def:9E7A:17',
        documentTypeName: 'Progress Note',
        encounterName: 'ALCOHOL04/10/1994 08:00',
        encounterServiceCategory: 'I',
        encounterDateTime: '19940410080000',
        locationIEN: '6',
        patientStatus: 'OUTPATIENT',
        entered: '20160128154148',
        formUid: '0',
        isInterdisciplinary: 'false',
        lastUpdateTime: '20160128154148',
        localId: null,
        localTitle: 'ALLERGY  <ADVERSE REACTION/ALLERGY>',
        nationalTitle: {
            name: '',
            vuid: ''
        },
        patientIcn: '10110V004877',
        pid: '8',
        patientName: 'Ten,Patient',
        patientBirthDate: '19350407',
        referenceDateTime: '201601281541',
        signedDateTime: null,
        signer: null,
        signerDisplayName: null,
        signerUid: null,
        status: 'UNSIGNED',
        statusDisplayName: 'Unsigned',
        summary: '',
        text: [{
            'author': 'KHAN,VIHAAN',
            'authorDisplayName': 'KHAN,VIHAAN',
            'authorUid': 'urn:va:user:9E7A:10000000272',
            'content': 'teadsf',
            'dateTime': '2016-01-28T15:41:48-05:00',
            'signer': null,
            'signerDisplayName': null,
            'signerUid': null,
            'status': 'UNSIGNED'
        }],
        value: true,
        _labelsForSelectedValues: {
            documentDefUidUnique: 'ALLERGY  <ADVERSE REACTION/ALLERGY>'
        },
        derivReferenceDate: '01/28/2016',
        derivReferenceTime: '15:41',
        lastSavedDisplayTime: '',
        encounterDisplayName: 'ALCOHOL: 04/10/1994',
        documentDefUidUnique: 'urn:va:doc-def:9E7A:17---ALLERGY__<ADVERSE_REACTION/ALLERGY>---all',
        lastSavedTime: '20160128154148',
        siteHash: '9E7A',
        uid: '8be59740-c5ff-11e5-ae7a-3f55edc16583'
    }
};
