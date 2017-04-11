define([
    "backbone",
    "marionette",
    "underscore",
    "app/applets/task_forms/activities/consults/eventHandler",
    "hbs!app/applets/task_forms/activities/consults/templates/requestFooter_Template"
], function(Backbone, Marionette, _, EventHandler, RequestFooterTemplate) {
    'use strict';
    return Backbone.Marionette.ItemView.extend({
        template: RequestFooterTemplate,
        events: {
            'click #modal-close-button': 'fireCloseEvent',
            'click #modal-discontinue-button': 'fireDiscontinueEvent',
            'click #modal-done-button': 'fireDoneEvent',
        },
        initialize: function(options) {
            this.formModel = options.formModel;
            this.taskListView = options.taskListView;

            // Listen to changes on required fields
            this.listenTo(this.formModel,
                'change:action change:reason change:attention change:attempt change:scheduledDate change:clinic change:provider', 
                this.onModelChange, this);
        },
        onShow: function() {
            this.onModelChange();
        },
        onModelChange: function() {
            var activate = true;
            var requiredFields = [];
            var action = $.trim(this.formModel.get('action'));
            if (action) {
                switch(action) {
                    case 'discontinued':
                        requiredFields = [
                            $.trim(this.formModel.get('reason')),
                        ];
                        break;
                    case 'assigned':
                        requiredFields = [
                            $.trim(this.formModel.get('attention')),
                        ];
                        break;
                    case 'scheduled':
                        requiredFields = [
                            $.trim(this.formModel.get('scheduledDate')),
                            $.trim(this.formModel.get('clinic')),
                            $.trim(this.formModel.get('provider'))
                        ];
                        break;
                    case 'contacted':
                        requiredFields = [
                            $.trim(this.formModel.get('attempt'))
                        ];
                        break;
                }

                for (var x = 0, length = requiredFields.length; x < length; ++x) {
                    if (requiredFields[x] === '') {
                        activate = false;
                        break;
                    }
                }
            } else {
                activate = false;
            }

            if (activate) {
                this.$('#modal-done-button').attr('disabled', false);
            } else {
                this.$('#modal-done-button').attr('disabled', true);
            }
        },
        fireCloseEvent: function(e){
            EventHandler.releaseTask(e, this.model);
        },
        fireDiscontinueEvent: function(e) {
            EventHandler.discontinueTask(e);
        },
        fireDoneEvent: function(e) {
            if (!this.formModel.isValid()) {
                return false;
            }
            EventHandler.completeTask(e, this.model, this.formModel, this.taskListView);
        }
    });
});
