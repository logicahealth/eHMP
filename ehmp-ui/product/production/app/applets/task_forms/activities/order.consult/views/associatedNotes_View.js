define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'hbs!app/applets/task_forms/activities/order.consult/templates/associatedNotes_Template',
    'app/applets/notes/writeback/formUtil'
    ], function(Backbone, Marionette, _, Handlebars, associatedNotesTemplate, NotesFormUtil) {
        'use strict';

        var AssociatedNoteChildView = Backbone.Marionette.ItemView.extend({
            template: Handlebars.compile('<a note-uid="{{uid}}">{{title}}</a>'),
            events: {
                'click': 'openNoteModal'
            },
            openNoteModal: function(e){
                e.preventDefault();
                var patient = ADK.PatientRecordService.getCurrentPatient();

                var fetchOptions = {
                    resourceTitle: 'patient-record-notes',
                    criteria: {
                        localPid: patient.get('pid')
                    },
                    onSuccess: function(collection, response){
                        var collectionIndex;

                        if(collection.at(0).get('notes').length > 0){
                            collectionIndex = 0;
                        } else if(collection.at(1).get('notes').length > 0){
                            collectionIndex = 1;
                        } else if(collection.at(2).get('notes').length > 0){
                            collectionIndex = 2;
                        }

                        if(!_.isUndefined(collectionIndex)){
                            var model = new Backbone.Model(collection.at(collectionIndex).get('notes')[0]);
                            NotesFormUtil.launchDraggablePreview(model, true);
                        }
                    }
                };
                ADK.PatientRecordService.fetchCollection(fetchOptions);
            }
        });

        return Backbone.Marionette.CompositeView.extend({
            template: associatedNotesTemplate,
            childView: AssociatedNoteChildView,
            childViewContainer: '#associatedNotesContainer'
        });
    });