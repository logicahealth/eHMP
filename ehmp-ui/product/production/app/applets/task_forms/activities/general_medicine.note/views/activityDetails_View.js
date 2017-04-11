define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'hbs!app/applets/task_forms/activities/general_medicine.note/templates/activityDetails_Template'
    ], function(Backbone, Marionette, _, Handlebars, NoteDetailsTemplate) {
        'use strict';
        return Backbone.Marionette.ItemView.extend({
            template: NoteDetailsTemplate,
            initialize: function(){
                var noteBody = '';
                var clinicalObject = this.model.get('clinicalObject');

                if(!_.isUndefined(clinicalObject) && !_.isUndefined(clinicalObject.data) && _.isArray(clinicalObject.data.text) && clinicalObject.data.text.length > 0){
                    var textNote = clinicalObject.data.text[clinicalObject.data.text.length - 1];
                    noteBody = textNote.content;
                }

                this.model.set('noteBody', noteBody);
            }
        });
    });