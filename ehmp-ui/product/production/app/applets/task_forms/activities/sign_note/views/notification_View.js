define([
        'backbone',
        'marionette',
        'underscore',
        'handlebars',
        'app/applets/task_forms/common/utils/utils',
        'hbs!app/applets/task_forms/activities/sign_note/templates/notification_Template',
        'app/applets/task_forms/common/utils/eventHandler'
    ],
    function(Backbone, Marionette, _, Handlebars, Utils, NotificationTemplate, EventHandler) {
        "use strict";

        return Backbone.Marionette.LayoutView.extend({
            template: NotificationTemplate,
            initialize: function() {
                // Add datetime to model to be used on templates
                var expDate = this.model.get('EXPIRATIONTIME');
                if (expDate !== null) {
                    this.model.set('dueDateTime', Utils.formatDueDateTime(expDate));
                } else {
                    this.model.set('dueDateTime', '');
                }
            },
            events: {
                'click #modal-cancel-button': 'fireCloseEvent'
            },
            fireCloseEvent: function(e) {
                EventHandler.fireCloseEvent.call(this, e);
            },
            templateHelpers: function() {
                return {
                    formattedNoteInformation: function() {
                        var noteInformation = this.taskVariables.noteInformation;
                        if (noteInformation) {
                            return noteInformation.replace(/\n/g, '<br>');
                        }

                        return this.DESCRIPTION;
                    }
                };
            }
        });
    });
