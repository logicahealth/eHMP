define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'hbs!app/applets/task_forms/activities/order.consult/templates/associatedNotes_Template',
    'app/applets/notes/writeback/formUtil',
    'app/applets/notes/writeback/modelUtil',
    'app/applets/notes/preview/preview',
    'app/applets/notes/appConfig'
    ], function(Backbone, Marionette, _, Handlebars, associatedNotesTemplate, NotesFormUtil, NotesModelUtil, PreviewView, CONFIG) {
        'use strict';

        return Backbone.Marionette.ItemView.extend({
            template: associatedNotesTemplate,
            events: {
                'click a': 'openNoteModal'
            },
            templateHelpers: function(){
                return {
                    showNoteLink: function(){
                        if(_.has(this.associatedNoteClinicalObject, 'data.status') && this.associatedNoteClinicalObject.data.status.toUpperCase() === 'COMPLETED'){
                            return true;
                        }

                        return false;
                    }
                };
            },
            openNoteModal: function(e){
                e.preventDefault();
                var noteClinicalObject = new Backbone.Model(this.model.get('associatedNoteClinicalObject'));
                var contextViewType = ADK.WorkspaceContextRepository.currentContext.get('id');
                if(contextViewType === 'staff'){
                    ADK.PatientRecordService.setCurrentPatient(this.model.get('pid'), {
                        confirmationOptions: {
                            reconfirm: false
                        },
                        staffnavAction: {
                            channel: 'notes',
                            event: 'note:detail',
                            data: noteClinicalObject
                        }
                    });
                } else {
                    ADK.Messaging.getChannel('notes').trigger('note:detail', noteClinicalObject);
                }
            }
        });
    });