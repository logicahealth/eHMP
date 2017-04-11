'use strict';

var _ = require('lodash');
var validator = require('./clinical-objects-validator');

var clinicalObjectCleanPass = {
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
    ehmpState: 'draft',
    data: {test: 'test'}
};

var clinicalObjectCleanPassNoUiD = {
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
    ehmpState: 'draft',
    data: {test: 'test'}
};

var clinicalObjectMissingState = {
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
    data: {test: 'test'}
};

var clinicalObjectMissingDomain = {
    uid: 'urn:va:ehmp:9E7A;3:de305d54-75b4-431b-adb2-eb6b9e546014',
    patientUid: '9E7A;3',
    authorUid: 'urn:va:user:9E7A:123',
    domain: '',
    subDomain: 'laboratory',
    visit: {
       location: 'urn:va:location:9E7A:1',
       serviceCategory: 'PSB',
       dateTime: '20160101120000'
    },
    referenceId: '',
    ehmpState: 'draft',
    data: {test: 'test'}
};

var clinicalObjectMissingPiD = {
    uid: 'urn:va:ehmp:9E7A;3:de305d54-75b4-431b-adb2-eb6b9e546014',
    patientUid: '',
    authorUid: 'urn:va:user:9E7A:123',
    domain: 'order',
    subDomain: 'laboratory',
    visit: {
       location: 'urn:va:location:9E7A:1',
       serviceCategory: 'PSB',
       dateTime: '20160101120000'
    },
    referenceId: '',
    ehmpState: 'draft',
    data: {test: 'test', items: 'ok'}
};

var clinicalObjectMissingPiDNoUID = {
    authorUid: 'urn:va:user:9E7A:123',
    domain: 'order',
    subDomain: 'laboratory',
    visit: {
       location: 'urn:va:location:9E7A:1',
       serviceCategory: 'PSB',
       dateTime: '20160101120000'
    },
    referenceId: '',
    ehmpState: 'draft',
    data: {test: 'test', items: 'ok'}
};

var clinicalObjectMissingUID = {
    uid: '',
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
    ehmpState: 'draft',
    data: {test: 'test'}
};

var clinicalObjectMissingAuthorID = {
    uid: 'urn:va:ehmp:9E7A;3:de305d54-75b4-431b-adb2-eb6b9e546014',
    patientUid: '9E7A;3',
    authorUid: '',
    domain: 'order',
    subDomain: 'laboratory',
    visit: {
       location: 'urn:va:location:9E7A:1',
       serviceCategory: 'PSB',
       dateTime: '20160101120000'
    },
    referenceId: '',
    ehmpState: 'draft',
    data: {test: 'test'}
};

var clinicalObjectMissingAuthorIDNoUID = {
    patientUid: '9E7A;3',
    domain: 'order',
    subDomain: 'laboratory',
    authorUid: '',
    visit: {
       location: 'urn:va:location:9E7A:1',
       serviceCategory: 'PSB',
       dateTime: '20160101120000'
    },
    referenceId: '',
    ehmpState: 'draft',
    data: {test: 'test'}
};

var clinicalObjectMissingSubDomain = {
    uid: 'urn:va:ehmp:9E7A;3:de305d54-75b4-431b-adb2-eb6b9e546014',
    patientUid: '9E7A;3',
    authorUid: 'urn:va:user:9E7A:123',
    domain: 'order',
    subDomain: '',
    visit: {
       location: 'urn:va:location:9E7A:1',
       serviceCategory: 'PSB',
       dateTime: '20160101120000'
    },
    referenceId: '',
    ehmpState: 'draft',
    data: {test: 'test'}
};

var clinicalObjectMissingSubDomainNoUID = {
    patientUid: '9E7A;3',
    authorUid: 'urn:va:user:9E7A:123',
    domain: 'order',
    subDomain: '',
    visit: {
       location: 'urn:va:location:9E7A:1',
       serviceCategory: 'PSB',
       dateTime: '20160101120000'
    },
    referenceId: '',
    ehmpState: 'draft',
    data: {test: 'test'}
};

var clinicalObjectMissingVisit = {
    uid: 'urn:va:ehmp:9E7A;3:de305d54-75b4-431b-adb2-eb6b9e546014',
    patientUid: '9E7A;3',
    authorUid: 'urn:va:user:9E7A:123',
    domain: 'order',
    subDomain: 'laboratory',
    visit: '',
    referenceId: '',
    ehmpState: 'draft',
    data: {test: 'test'}
};

var clinicalObjectMissingVisitLocation = {
    uid: 'urn:va:ehmp:9E7A;3:de305d54-75b4-431b-adb2-eb6b9e546014',
    patientUid: '9E7A;3',
    authorUid: 'urn:va:user:9E7A:123',
    domain: 'order',
    subDomain: 'laboratory',
    visit: {
       location: '',
       serviceCategory: 'PSB',
       dateTime: '20160101120000'
    },
    referenceId: '',
    ehmpState: 'draft',
    data: {test: 'test'}
};

var clinicalObjectMissingVisitService = {
    uid: 'urn:va:ehmp:9E7A;3:de305d54-75b4-431b-adb2-eb6b9e546014',
    patientUid: '9E7A;3',
    authorUid: 'urn:va:user:9E7A:123',
    domain: 'order',
    subDomain: 'laboratory',
    visit: {
       location: 'urn:va:location:9E7A:1',
       serviceCategory: '',
       dateTime: '20160101120000'
    },
    referenceId: '',
    ehmpState: 'draft',
    data: {test: 'test'}
};

var clinicalObjectMissingVisitDateTime = {
    uid: 'urn:va:ehmp:9E7A;3:de305d54-75b4-431b-adb2-eb6b9e546014',
    patientUid: '9E7A;3',
    authorUid: 'urn:va:user:9E7A:123',
    domain: 'order',
    subDomain: 'laboratory',
    visit: {
       location: 'urn:va:location:9E7A:1',
       serviceCategory: 'PSB',
       dateTime: ''
    },
    referenceId: '',
    ehmpState: 'draft',
    data: {test: 'test'}
};

var clinicalObjectBadUID1 = {
    uid: 'urn:va:ehmp:123412341324',
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
    ehmpState: 'draft',
    data: {test: 'test'}
};

var clinicalObjectBadUID2 = {
    uid: 'urn:va:ehmp:9E7A;123123;123412341324',
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
    ehmpState: 'draft',
    data: {test: 'test'}
};

describe('Clinical object validation tests', function() {

    var errorMessages = [];

    describe('creating a clinical object', function(){

        beforeEach(function() {
            errorMessages = [];
        });

        it('should create a valid clinical object', function(){
            expect(validator.validateCreate(errorMessages, clinicalObjectCleanPass)).to.be.undefined();
        });
        it('should reject missing required ehmpState data for creating a clinical object', function(){
            validator.validateCreate(errorMessages, clinicalObjectMissingState);
            expect(errorMessages.pop()).to.be('ehmpState cannot be empty');
        });
        it('should reject missing required domain data for creating a clinical object', function(){
            validator.validateCreate(errorMessages, clinicalObjectMissingDomain);
            expect(errorMessages.pop()).to.be('domain cannot be empty');
        });
        it('should reject missing required patientUid data for creating a clinical object', function(){
            validator.validateCreate(errorMessages, clinicalObjectMissingPiDNoUID);
            expect(errorMessages.pop()).to.be('patientUid cannot be empty');
        });
        it('should reject missing required authorUiD data for creating a clinical object', function(){
            validator.validateCreate(errorMessages, clinicalObjectMissingAuthorIDNoUID);
            expect(errorMessages.pop()).to.be('authorUid cannot be empty');
        });
        it('should reject missing required subDomain data for creating a clinical object', function(){
            validator.validateCreate(errorMessages, clinicalObjectMissingSubDomainNoUID);
            expect(errorMessages.pop()).to.be('subDomain cannot be empty');
        });
        it('should reject missing required visit data for creating a clinical object', function(){
            validator.validateCreate(errorMessages, clinicalObjectMissingVisit);
            expect(errorMessages.pop()).to.be('visit.dateTime cannot be empty');
            expect(errorMessages.pop()).to.be('model does not contain visit.dateTime field');
            expect(errorMessages.pop()).to.be('visit.serviceCategory cannot be empty');
            expect(errorMessages.pop()).to.be('model does not contain visit.serviceCategory field');
            expect(errorMessages.pop()).to.be('visit.location cannot be empty');
            expect(errorMessages.pop()).to.be('model does not contain visit.location field');
            expect(errorMessages.pop()).to.be('visit cannot be empty');
        });
        it('should reject missing required visit location data for creating a clinical object', function(){
            validator.validateCreate(errorMessages, clinicalObjectMissingVisitLocation);
            expect(errorMessages.pop()).to.be('visit.location cannot be empty');
        });
        it('should reject missing required visit service data for creating a clinical object', function(){
            validator.validateCreate(errorMessages, clinicalObjectMissingVisitService);
            expect(errorMessages.pop()).to.be('visit.serviceCategory cannot be empty');
        });
        it('should reject missing required visit date time data for creating a clinical object', function(){
            validator.validateCreate(errorMessages, clinicalObjectMissingVisitDateTime);
            expect(errorMessages.pop()).to.be('visit.dateTime cannot be empty');
        });
    });

    describe('read a clinical object', function(){
        beforeEach(function() {
            errorMessages = [];
        });
        it('should read a valid clinical object', function(){
            expect(validator.validateRead(errorMessages, clinicalObjectCleanPass.uid)).to.be.undefined();
        });
        it('should reject missing required JSON data for reading a clinical object', function(){
            validator.validateRead(errorMessages, clinicalObjectMissingUID.uid);
            expect(errorMessages.pop()).to.be('uid not found');
        });
        it('should reject malformed uid for reading a clinical object', function(){
            validator.validateRead(errorMessages, clinicalObjectBadUID1.uid);
            expect(errorMessages.pop()).to.be('model uid field is invalid');
        });
        it('should reject malformed uid for reading a clinical object', function(){
            validator.validateRead(errorMessages, clinicalObjectBadUID2.uid);
            expect(errorMessages.pop()).to.be('model uid field is invalid');
        });
    });

    describe('update a clinical object', function(){
        beforeEach(function() {
            errorMessages = [];
        });
        it('should update a valid clinical object', function(){
            expect(validator.validateUpdate(errorMessages, clinicalObjectCleanPass.uid, clinicalObjectCleanPass)).to.be.undefined();
        });
        it('should reject missing required JSON data for updating a clinical object', function(){
            validator.validateUpdate(errorMessages, clinicalObjectMissingUID.uid, clinicalObjectMissingUID);
            expect(errorMessages.pop()).to.be('uid not found');
        });
    });

    describe('delete a clinical object', function(){
        beforeEach(function() {
            errorMessages = [];
        });
        it('should delete a valid clinical object', function(){
            expect(validator.validateDelete(errorMessages, clinicalObjectCleanPass.uid)).to.be.undefined();
        });
        it('should reject missing required JSON data for deleting a clinical object', function(){
            validator.validateDelete(errorMessages, clinicalObjectMissingUID.uid);
            expect(errorMessages.pop()).to.be('uid not found');
        });
    });

    describe('get a clinical object list', function(){
        beforeEach(function() {
            errorMessages = [];
        });
        it('should get a list of valid clinical objects', function(){
            expect(validator.validateDelete(errorMessages, clinicalObjectCleanPass.uid)).to.be.undefined();
        });
        it('should reject missing required uid for clinical objects', function(){
            validator.validateDelete(errorMessages, clinicalObjectMissingUID.uid);
            expect(errorMessages.pop()).to.be('uid not found');
        });
    });

    describe('find clinical objects', function(){
        beforeEach(function() {
            errorMessages = [];
        });
        it('should get a list of valid clinical objects', function(){
            expect(validator.validateDelete(errorMessages, clinicalObjectCleanPass.uid)).to.be.undefined();
        });
        it('should reject missing required fields for clinical objects', function(){
            validator.validateDelete(errorMessages, clinicalObjectMissingUID.uid);
            expect(errorMessages.pop()).to.be('uid not found');
        });
    });
});
