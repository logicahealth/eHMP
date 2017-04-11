define([
    'backbone',
    'marionette',
    'underscore',
    'app/applets/notes/writeback/modelUtil'
], function(Backbone, Marionette, _, modelUtil) {
    'use strict';

    var asuHelper = {
        canEdit: function(note) {
            return this.canDo(note, 'EDIT RECORD');
        },
        canSign: function(note) {
            return this.canDo(note, 'SIGNATURE');
        },
        canDelete: function(note) {
            return this.canDo(note, 'DELETE RECORD');
        },
        canChangeTitle: function(note) {
            return this.canDo(note, 'CHANGE TITLE');
        },
        canDo: function(note, action) {
            var can = false;
            if(note.isNew() || (note.get('app') && note.get('app') === 'ehmp')) {
                var permissions = note.get('asuPermissions');
                can = permissions && permissions.length > 0 && permissions.indexOf(action) != -1;
            }
            return can;
        }
    };
    return asuHelper;
});