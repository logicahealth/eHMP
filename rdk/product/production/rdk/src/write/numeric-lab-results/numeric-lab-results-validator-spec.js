'use strict';

var validator = require('./numeric-lab-results-validator');

describe('numeric lab results validator', function() {
    var saveNoteObjectWritebackContext;

    beforeEach(function() {
        saveNoteObjectWritebackContext = {};
        saveNoteObjectWritebackContext.model = {
            'referenceId': 'urn:va:lab:SITE:8:CH;6859185.83987;381',
            'patientUid': 'urn:va:patient:SITE:100615:100615',
            'authorUid': 'urn:va:user:SITE:10000000238',
            'visit': {
                'location': 'urn:va:location:SITE:285',
                'serviceCategory': 'PSB',
                'dateTime': '20160102123040'
            },
            'data': {
                'madlib': null,
                'annotation': 'bar',
                'problemRelationship': 'urn:va:problem:SITE:100615:183'
            }
        };

    });

    it('identifies good save note object', function(done) {
        validator.saveNoteObject(saveNoteObjectWritebackContext, function(err) {
            expect(err).to.be.falsy();
            done();
        });
    });

    it('identifies bad save note object', function(done) {
        delete saveNoteObjectWritebackContext.model.referenceId;
        validator.saveNoteObject(saveNoteObjectWritebackContext, function(err) {
            expect(err).to.be.truthy();
            done();
        });
    });

});
