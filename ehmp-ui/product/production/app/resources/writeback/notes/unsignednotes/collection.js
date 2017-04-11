define([
    'underscore',
    'app/resources/writeback/notes/model',
    'app/resources/writeback/notes/sortedNotesCollection'
], function(_, Model, SortedNotesCollection) {
    var notes = SortedNotesCollection.extend({
        model: Model.extend({
            vpr: 'unsignedNotes',
            defaults: _.extend({}, Model.prototype.defaults, {
                displayGroup: 'unsigned'
            })
        }),
        vpr: 'unsignedNotes',
        comparator: function(left, right) {
            var l = this.getComparatorValue(left);
            var r = this.getComparatorValue(right);

            // if both notes have the same referenceDateTime compare 'entered' date
            if (l === r) {
                l = left.get('entered') * 1;
                r = right.get('entered') * 1;
            }
            return r - l;
        },
    });

    return notes;
});