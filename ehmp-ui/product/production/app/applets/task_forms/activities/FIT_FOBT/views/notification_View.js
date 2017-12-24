define([
        'backbone',
        'marionette',
        'underscore',
        'handlebars',
        'moment',
        'hbs!app/applets/task_forms/activities/FIT_FOBT/templates/notification_Template',
        'app/applets/task_forms/common/utils/eventHandler'
    ],
    function(Backbone, Marionette, _, Handlebars, moment, NotificationTemplate, EventHandler) {
        "use strict";

        return ADK.UI.Form.extend({
            fields: [{
                control: 'container',
                extraClasses: ['modal-body'],
                items: [{
                    control: 'container',
                    template: NotificationTemplate,
                    items: []
                }]
            }, {
                control: 'container',
                extraClasses: ['modal-footer'],
                items: [{
                    control: 'button',
                    extraClasses: ['btn', 'btn-default', 'btn-sm'],
                    id: 'modal-cancel-button',
                    type: 'button',
                    label: 'Cancel',
                }, {
                    control: 'button',
                    extraClasses: ['btn', 'btn-success', 'btn-sm'],
                    id: 'modal-save-button',
                    type: 'button',
                    label: 'Complete'
                }]
            }],
            onInitialize: function() {
                var expDate = this.model.get('EXPIRATIONTIME');
                if (expDate !== null) {
                    this.model.set('dueDateTime', moment(expDate).format('lll'));
                } else {
                    this.model.set('dueDateTime', '');
                }
                this.taskModel = this.model;
            },
            events: {
                'click .btn-success': 'completeTask',
                'click #modal-cancel-button': 'fireCloseEvent'
            },
            completeTask: function(e) {
                EventHandler.claimAndCompleteTask.call(this, e, this);
            },
            fireCloseEvent: function(e) {
                EventHandler.fireCloseEvent.call(this, e);
            }
        });

    });