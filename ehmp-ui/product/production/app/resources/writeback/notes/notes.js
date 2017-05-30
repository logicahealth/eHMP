define([
    'app/resources/writeback/notes/model',
    'app/resources/writeback/notes/unsignednotes/collection',
    'app/resources/writeback/notes/uncosignedNotes/collection',
    'app/resources/writeback/notes/signednotes/collection'
], function(Model, UnsignedNotes, UncosignedNotes, SignedNotes) {
    'use strict';

    var UnsignedNoteTypeModel = Backbone.Model.extend({
        parse: function(data, options) {
            if (!this.notes) {
                this.notes = new UnsignedNotes(data.notes);
            } else {
                this.notes.set.call(this.notes, data.notes, options);
            }
            data.notes = this.notes;
            return data;
        }
    });
    var UncosignedNoteTypeModel = Backbone.Model.extend({
        parse: function(data, options) {
            if (!this.notes) {
                this.notes = new UncosignedNotes(data.notes);
            } else {
                this.notes.set.call(this.notes, data.notes, options);
            }
            data.notes = this.notes;
            return data;
        }
    });
    var SignedNoteTypeModel = Backbone.Model.extend({
        parse: function(data, options) {
            if (!this.notes) {
                this.notes = new SignedNotes(data.notes);
            } else {
                this.notes.set.call(this.notes, data.notes, options);
            }
            data.notes = this.notes;
            return data;
        }
    });
    var AllNotesCollection = ADK.Resources.Writeback.Collection.extend({
        model: function(data, options) {
            switch(data.id) {
                case 'unsigned':
                    return new UnsignedNoteTypeModel(data, options);
                case 'uncosigned':
                    return new UncosignedNoteTypeModel(data, options);
                case 'signed':
                    return new SignedNoteTypeModel(data, options);
            }
        },
        resource: 'patient-record-notes',
        params: function() {
            return {
                pid: this.patient.get('pid'),
                localPid: this.patient.get('pid')
            };
        },
        parse: function(resp, options) {
            return resp.data.items;
        },
        initialize: function() {
            this.pendingFetch = 0;
        },
        fetch: function(options) {
            var self = this;
            self.pendingFetch += 1;
            var opts =  {
                success: function() {
                    self.pendingFetch -= 1;
                    if (options && options.success) {
                        options.success(self);
                    }
                },
                error: function() {
                    self.pendingFetch -= 1;
                    if (options && options.error){
                        options.error(self);
                    }
                }
            };
            return Backbone.Collection.prototype.fetch.call(this, opts);
        }
    });

    return AllNotesCollection;
});
