define([
    'underscore',
    'app/resources/writeback/notes/model',
    'app/resources/writeback/notes/sortedNotesCollection'
], function(_, Model, SortedNotesCollection) {
    var notes = SortedNotesCollection.extend({
        model: Model.extend({
            vpr: 'signedNotes',
            defaults: _.extend({}, Model.prototype.defaults, {
                displayGroup: 'signed'
            })
        }),
        vpr: 'signedNotes'
    });

    return notes;
});