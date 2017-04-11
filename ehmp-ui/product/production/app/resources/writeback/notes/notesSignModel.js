define([
    'underscore',
    'app/resources/writeback/esignature/model',
    'app/resources/writeback/notes/model',
    'app/resources/writeback/notes/signednotes/collection',
    'app/applets/notes/writeback/modelUtil'
], function(_, ESignatureModel, NoteModel, SignedNotes, modelUtil) {
    var NotesSignModel = ESignatureModel.extend({
            resource: 'notes-sign',
            parse: function(resp) {
                var successes = resp.data.successes;
                if (successes && successes.signedNotes && successes.signedNotes.length > 0) {
                    var SignedNotesCollection = SignedNotes.extend({
                        model: NoteModel.extend({
                            vpr: 'signedNotes',
                            parse: function(resp, options) {
	                            if (resp._labelsForSelectedValues) {
	                                delete resp._labelsForSelectedValues;
	                            }

	                            _.extend(resp, {
	                            	id: resp.uid,
	                            	app: 'ehmp',
	                            	displayGroup: 'signed',
	                            	documentDefUidUnique: modelUtil.generateDocumentDefUidUnique(resp, 'all')
	                            });

	                            return resp;
	                        }
                        })
                    });
                    resp.data.successes = new SignedNotesCollection(successes.signedNotes);
                }
                return resp.data;
            }
        });

    return NotesSignModel;

});