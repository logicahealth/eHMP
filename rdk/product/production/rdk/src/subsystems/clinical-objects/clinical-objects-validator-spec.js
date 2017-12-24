'use strict';

var _ = require('lodash');
var validator = require('./clinical-objects-validator');

var clinicalObjectCleanForCreate = {
    patientUid: 'urn:va:patient:SITE:3:3',
    authorUid: 'urn:va:user:SITE:123',
    domain: 'ehmp-order',
    subDomain: 'laboratory',
    visit: {
       location: '1',
       serviceCategory: 'PSB',
       dateTime: '20160101120000'
    },
    referenceId: '',
    ehmpState: 'draft',
    data: {labTestText: 'test'}
};

var clinicalObjectCleanPass = {
    uid: 'urn:va:ehmp-order:SITE:3:de305d54-75b4-431b-adb2-eb6b9e546014',
    patientUid: 'urn:va:patient:SITE:3:3',
    authorUid: 'urn:va:user:SITE:123',
    domain: 'ehmp-order',
    subDomain: 'laboratory',
    visit: {
       location: '1',
       serviceCategory: 'PSB',
       dateTime: '20160101120000'
    },
    referenceId: '',
    ehmpState: 'draft',
    data: {labTestText: 'test'}
};

var clinicalObjectMissingState = {
    uid: 'urn:va:ehmp-order:SITE:3:de305d54-75b4-431b-adb2-eb6b9e546014',
    patientUid: 'urn:va:patient:SITE:3:3',
    authorUid: 'urn:va:user:SITE:123',
    domain: 'ehmp-order',
    subDomain: 'laboratory',
    visit: {
       location: '1',
       serviceCategory: 'PSB',
       dateTime: '20160101120000'
    },
    referenceId: '',
    data: {labTestText: 'test'}
};

var clinicalObjectMissingDomain = {
    uid: 'urn:va:ehmp-order:SITE:3:de305d54-75b4-431b-adb2-eb6b9e546014',
    patientUid: 'urn:va:patient:SITE:3:3',
    authorUid: 'urn:va:user:SITE:123',
    domain: '',
    subDomain: 'laboratory',
    visit: {
       location: '1',
       serviceCategory: 'PSB',
       dateTime: '20160101120000'
    },
    referenceId: '',
    ehmpState: 'draft',
    data: {labTestText: 'test'}
};

var clinicalObjectMissingPiDNoUID = {
    authorUid: 'urn:va:user:SITE:123',
    domain: 'ehmp-order',
    subDomain: 'laboratory',
    visit: {
       location: '1',
       serviceCategory: 'PSB',
       dateTime: '20160101120000'
    },
    referenceId: '',
    ehmpState: 'draft',
    data: {labTestText: 'test', items: 'ok'}
};

var clinicalObjectMissingUID = {
    uid: '',
    patientUid: 'urn:va:patient:SITE:3:3',
    authorUid: 'urn:va:user:SITE:123',
    domain: 'ehmp-order',
    subDomain: 'laboratory',
    visit: {
       location: '1',
       serviceCategory: 'PSB',
       dateTime: '20160101120000'
    },
    referenceId: '',
    ehmpState: 'draft',
    data: {labTestText: 'test'}
};

var clinicalObjectMissingAuthorIDNoUID = {
    patientUid: 'urn:va:patient:SITE:3:3',
    domain: 'ehmp-order',
    subDomain: 'laboratory',
    authorUid: '',
    visit: {
       location: '1',
       serviceCategory: 'PSB',
       dateTime: '20160101120000'
    },
    referenceId: '',
    ehmpState: 'draft',
    data: {labTestText: 'test'}
};

var clinicalObjectMissingSubDomainNoUID = {
    patientUid: 'urn:va:patient:SITE:3:3',
    authorUid: 'urn:va:user:SITE:123',
    domain: 'ehmp-order',
    subDomain: '',
    visit: {
       location: '1',
       serviceCategory: 'PSB',
       dateTime: '20160101120000'
    },
    referenceId: '',
    ehmpState: 'draft',
    data: {labTestText: 'test'}
};

var clinicalObjectMissingVisit = {
    uid: 'urn:va:ehmp-order:SITE:3:de305d54-75b4-431b-adb2-eb6b9e546014',
    patientUid: 'urn:va:patient:SITE:3:3',
    authorUid: 'urn:va:user:SITE:123',
    domain: 'ehmp-order',
    subDomain: 'laboratory',
    visit: '',
    referenceId: '',
    ehmpState: 'draft',
    data: {labTestText: 'test'}
};

var clinicalObjectMissingVisitDateTime = {
    uid: 'urn:va:ehmp-order:SITE:3:de305d54-75b4-431b-adb2-eb6b9e546014',
    patientUid: 'urn:va:patient:SITE:3:3',
    authorUid: 'urn:va:user:SITE:123',
    domain: 'ehmp-order',
    subDomain: 'laboratory',
    visit: {
       location: '1',
       serviceCategory: 'PSB',
       dateTime: ''
    },
    referenceId: '',
    ehmpState: 'draft',
    data: {labTestText: 'test'}
};

var clinicalObjectBadUID1 = {
    uid: 'urn:va:ehmp-order:123412341324',
    patientUid: 'urn:va:patient:SITE:3:3',
    authorUid: 'urn:va:user:SITE:123',
    domain: 'ehmp-order',
    subDomain: 'laboratory',
    visit: {
       location: '1',
       serviceCategory: 'PSB',
       dateTime: '20160101120000'
    },
    referenceId: '',
    ehmpState: 'draft',
    data: {labTestText: 'test'}
};

var clinicalObjectBadUID2 = {
    uid: 'urn:va:ehmp-order:SITE:123123;123412341324',
    patientUid: 'urn:va:patient:SITE:3:3',
    authorUid: 'urn:va:user:SITE:123',
    domain: 'ehmp-order',
    subDomain: 'laboratory',
    visit: {
       location: '1',
       serviceCategory: 'PSB',
       dateTime: '20160101120000'
    },
    referenceId: '',
    ehmpState: 'draft',
    data: {labTestText: 'test'}
};

describe('Clinical object validation tests', function() {

    var errorMessages = [];

    describe('creating a clinical object', function(){

        beforeEach(function() {
            errorMessages = [];
        });

        it('should create a valid clinical object', function(done) {
            validator.validateCreate([], clinicalObjectCleanForCreate, null, function(errorMessages) {
                expect(errorMessages.length).to.be(0);
                done();
            });
        });
        it('should reject missing required ehmpState data for creating a clinical object', function(done) {
            validator.validateCreate([], clinicalObjectMissingState, null, function(errorMessages) {
                expect(_.includes(errorMessages, 'ehmpState cannot be empty')).to.be(true);
                done();
            });
        });
        it('should reject missing required domain data for creating a clinical object', function(done) {
            validator.validateCreate([], clinicalObjectMissingDomain, null, function(errorMessages) {
                expect(_.includes(errorMessages, 'domain cannot be empty')).to.be(true);
                done();
            });
        });
        it('should reject missing required patientUid data for creating a clinical object', function(done) {
            validator.validateCreate([], clinicalObjectMissingPiDNoUID, null, function(errorMessages) {
                expect(_.includes(errorMessages, 'patientUid cannot be empty')).to.be(true);
                done();
            });
        });
        it('should reject missing required authorUiD data for creating a clinical object', function(done) {
            validator.validateCreate([], clinicalObjectMissingAuthorIDNoUID, null, function(errorMessages) {
                expect(_.includes(errorMessages, 'authorUid cannot be empty')).to.be(true);
                done();
            });
        });
        it('should reject missing required subDomain data for creating a clinical object', function(done) {
            validator.validateCreate([], clinicalObjectMissingSubDomainNoUID, null, function(errorMessages) {
                expect(_.includes(errorMessages, 'subDomain cannot be empty')).to.be(true);
                done();
            });
        });
        it('should reject missing required visit data for creating a clinical object', function(done) {
            validator.validateCreate([], clinicalObjectMissingVisit, null, function(errorMessages) {
                var expectedErrors = ['visit.dateTime cannot be empty',
                                      'model does not contain visit.dateTime field',
                                      'visit cannot be empty'];
                _.each(expectedErrors, function(msg) {
                    expect(_.includes(errorMessages, msg)).to.be(true);
                });
                done();
            });
        });
        it('should reject missing required visit date time data for creating a clinical object', function(done) {
            validator.validateCreate([], clinicalObjectMissingVisitDateTime, null, function(errorMessages) {
                expect(_.includes(errorMessages, 'visit.dateTime cannot be empty')).to.be(true);
                done();
            });
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
        it('should update a valid clinical object', function(done) {
            validator.validateUpdate([], clinicalObjectCleanPass.uid, clinicalObjectCleanPass, null, function(errorMessages) {
                expect(errorMessages.length).to.be(0);
                done();
            });
        });
        it('should reject missing required JSON data for updating a clinical object', function(done) {
            validator.validateUpdate([], clinicalObjectMissingUID.uid, clinicalObjectMissingUID, null, function(errorMessages) {
                expect(_.includes(errorMessages, 'uid not found')).to.be(true);
                done();
            });
        });
    });

    describe('get a clinical object list', function(){
        beforeEach(function() {
            errorMessages = [];
        });
        it.skip('should get a list of valid clinical objects', function(){
            expect(validator.validateGetClinicalObjectList(errorMessages, clinicalObjectCleanPass.uid)).to.be.undefined();
        });
        it.skip('should reject missing required uid for clinical objects', function(){
            validator.validateGetClinicalObjectList(errorMessages, clinicalObjectMissingUID.uid);
            expect(errorMessages.pop()).to.be('uid not found');
        });
    });

    describe('find clinical objects', function(){
        beforeEach(function() {
            errorMessages = [];
        });
        it.skip('should get a list of valid clinical objects', function(){
            expect(validator.validateFind(errorMessages, clinicalObjectCleanPass.uid)).to.be.undefined();
        });
        it.skip('should reject missing required fields for clinical objects', function(){
            validator.validateFind(errorMessages, clinicalObjectMissingUID.uid);
            expect(errorMessages.pop()).to.be('uid not found');
        });
    });
});
