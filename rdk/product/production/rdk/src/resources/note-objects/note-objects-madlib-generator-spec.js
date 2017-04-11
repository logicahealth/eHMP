'use strict';

var noteObjectsMadlibGenerator = require('./note-objects-madlib-generator');
var sampleNoteObject;
var sampleClinicalObject;

describe('The note-objects-madlib-generator', function() {
    beforeEach(function() {
        sampleNoteObject = {
            'authorUid': 'urn:va:user:9E7A:10000000270',
            'creationDateTime': '20160224201321+0000',
            'data': {
                'annotation': 'Test by gavin3',
                'problemRelationship': 'urn:va:problem:9E7A:3:183',
                'sourceUid': 'urn:va:ehmp-note:9E7A:3:27ee3356-1aeb-479b-84a3-a45f60460f66'
            },
            'domain': 'ehmp-note',
            'ehmpState': 'active',
            'patientUid': 'urn:va:patient:9E7A:3:3',
            'referenceId': null,
            'subDomain': 'noteObject',
            'uid': 'urn:va:ehmp-note:9E7A:3:04dd71e8-a5dc-4994-85f5-b3c55531ad58',
            'visit': {
                'dateTime': '20160101080000',
                'locationUid': 'urn:va:location:9E7A:64',
                'serviceCategory': 'A'
            }
        };

        sampleClinicalObject = {
            'authorUid': 'urn:va:user:9E7A:10000000272',
            'data': '',
            'displayName': '25 OH VITAMIN D',
            'domain': 'ehmp-order',
            'ehmpState': 'active',
            'patientUid': 'urn:va:patient:9E7A:3:3',
            'referenceId': 'urn:va:order:9E7A:3:12519',
            'subDomain': 'laboratory',
            'uid': 'urn:va:ehmp-order:9E7A:3:43869185-fe18-44e1-bc70-fc34baf91d19',
            'visit': {
                'dateTime': '201602231125',
                'locationUid': 'urn:va:location:9E7A:195',
                'serviceCategory': 'I'
            }
        };
    });

    describe('generateMadlibString is called', function() {
        it('identifies invalid domain/subdomain combination', function() {
            sampleClinicalObject.domain = 'invalid';
            var errorMessages = [];
            noteObjectsMadlibGenerator.generateMadlibString(errorMessages, sampleNoteObject, sampleClinicalObject);
            expect(errorMessages[0]).to.equal('invalid domain/subdomain combination');
        });

        it('identifies valid domain/subdomain combination', function() {
            var errorMessages = [];
            noteObjectsMadlibGenerator.generateMadlibString(errorMessages, sampleNoteObject, sampleClinicalObject);
            expect(sampleNoteObject.data.madlib).to.be.truthy();
        });
    });
});
