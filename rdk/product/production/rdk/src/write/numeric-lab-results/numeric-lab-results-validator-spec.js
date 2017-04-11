'use strict';

var validator = require('./numeric-lab-results-validator');

describe('numeric lab results validator', function() {
    var saveNoteObjectWritebackContext;

    beforeEach(function() {
        saveNoteObjectWritebackContext = {};
        saveNoteObjectWritebackContext.model = {
            'referenceId': 'urn:va:lab:9E7A:8:CH;6859185.83987;381',
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
