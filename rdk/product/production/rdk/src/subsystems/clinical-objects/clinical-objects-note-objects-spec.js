'use strict';

var noteObject = require('./clinical-objects-note-objects');

describe('Clinical object note object tests', function() {
    var errorMessages = [];

    describe('verify the verifier', function() {
        it('should return NO ERRORS on an exactly correct clinical object', function() {
            errorMessages = [];
            var validClinicalObject = spawnClinicalObject();
            noteObject.validateCreateModel(errorMessages, validClinicalObject);
            expect(errorMessages.length).to.eql(0);
        });
        it('should have no missing fields (all fields except referenceId will be non-null, and non-undefined)', function() {
            errorMessages = [];
            var clinicalObjectMissingData = spawnClinicalObject();
            delete clinicalObjectMissingData.data;
            noteObject.validateCreateModel(errorMessages, clinicalObjectMissingData);
            expect(errorMessages[0]).to.eql('clinical object is missing data element');
        });
        it('should have its domain set exactly to "ehmp-note"', function() {
            errorMessages = [];
            var clinicalObjectBadDomain = spawnClinicalObject();
            clinicalObjectBadDomain.domain = 'the gremlins domain';
            noteObject.validateCreateModel(errorMessages, clinicalObjectBadDomain);
            expect(errorMessages[0]).to.eql('domain field must be exact string: "ehmp-note"');
        });
        it('should have its subdomain set exactly to "noteObject"', function() {
            errorMessages = [];
            var clinicalObjectBadSubdomain = spawnClinicalObject();
            clinicalObjectBadSubdomain.subDomain = 'the gremlins slightly less important domain but with a better coffee maker';
            noteObject.validateCreateModel(errorMessages, clinicalObjectBadSubdomain);
            expect(errorMessages[0]).to.eql('subDomain field must be exact string: "noteObject"');
        });
        it('should have visit.dateTime in the format of YYYYMMDDHHmmss', function() {
            errorMessages = [];
            var clinicalObjectBadVisitDateTime = spawnClinicalObject();
            clinicalObjectBadVisitDateTime.visit.dateTime = 'time to get a watch';
            noteObject.validateCreateModel(errorMessages, clinicalObjectBadVisitDateTime);
            expect(errorMessages[0]).to.eql('visit has malformed dateTime field');
        });
        it('should have ehmpState set to "active"', function() {
            errorMessages = [];
            var clinicalObjectInactiveEhmpState = spawnClinicalObject();
            clinicalObjectInactiveEhmpState.ehmpState = 'snorlax';
            noteObject.validateCreateModel(errorMessages, clinicalObjectInactiveEhmpState);
            expect(errorMessages[0]).to.eql('ehmp state is not set to active');
        });
        it('should have its referenceId either null or undefined', function() {
            errorMessages = [];
            var clinicalObjectGarbageInReferenceId = spawnClinicalObject();
            clinicalObjectGarbageInReferenceId.referenceId = 'null';
            noteObject.validateCreateModel(errorMessages, clinicalObjectGarbageInReferenceId);
            expect(errorMessages[0]).to.eql('referenceId is not used for note objects. Exclude or set to null.');
        });
        it('should have its data.sourceUid in the format of urn:va:[clincal object domain]:[site]:[patient id]:[uuid]', function() {
            errorMessages = [];
            var clinicalObjectBadDataSourceUid = spawnClinicalObject();
            clinicalObjectBadDataSourceUid.data.sourceUid = 'gremlins:all:up:in:my:sourceUid';
            noteObject.validateCreateModel(errorMessages, clinicalObjectBadDataSourceUid);
            expect(errorMessages[0]).to.eql('data subfield must have sourceUid that starts with urn:va:ehmp-');
        });
        it('should fail gracefully when the visit field is not set', function() {
            errorMessages = [];
            var clinicalObjectNoVisit = spawnClinicalObject();
            delete clinicalObjectNoVisit.visit;
            noteObject.validateCreateModel(errorMessages, clinicalObjectNoVisit);
            expect(errorMessages[0]).to.eql('clinical object is missing visit data element');
        });
        it('should fail gracefully when the data field is not set', function() {
            errorMessages = [];
            var clinicalObjectNoData = spawnClinicalObject();
            delete clinicalObjectNoData.data;
            noteObject.validateCreateModel(errorMessages, clinicalObjectNoData);
            expect(errorMessages[0]).to.eql('clinical object is missing data element');
        });
    });
});

function spawnClinicalObject() {
    return {
        uid: 'urn:va:ehmp-note:[<patient identifier>]:[UUID]',
        patientUid: '<patient identifier>',
        authorUid: 'urn:va:user:SITE:123',
        domain: 'ehmp-note',
        subDomain: 'noteObject',
        ehmpState: 'active',
        visit: {
            location: 'urn:va:location:[site]:[IEN]',
            serviceCategory: '<PSB|etc>',
            dateTime: '20160101120000'
        },
        referenceId: null,
        data: {
            sourceUid: 'urn:va:ehmp-note:[<patient identifier>]:[UUID]',
            madlib: 'aMadLib',
            problemRelationship: '[OptionalProbRel]',
            annotation: '[OptionalAnnotation]'
        },
        createdDateTime: '20160101120000'
    };
}
