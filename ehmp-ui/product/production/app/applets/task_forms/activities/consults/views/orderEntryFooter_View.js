define([
    "backbone",
    "marionette",
    "underscore",
    "app/applets/task_forms/activities/consults/eventHandler",
    "hbs!app/applets/task_forms/activities/consults/templates/orderEntryFooter_Template"
], function(Backbone, Marionette, _, EventHandler, OrderEntryFooterTemplate) {
    'use strict';
    return Backbone.Marionette.ItemView.extend({
        template: OrderEntryFooterTemplate,
        events: {
            'click #modal-delete-button': 'fireDelete',
            'click #modal-save-button': 'fireSaveEvent',
            'click #modal-accept-button': 'fireAcceptEvent',
        },
        initialize: function(options) {
            this.formModel = options.formModel;
            this.taskListView = options.taskListView;
            this.listenTo(this.formModel, 'change:urgency change:requestQuestion change:attention', this.onModelChange, this);
        },
        onModelChange: function() {
            var question = $.trim(this.formModel.get('requestQuestion'));
            var urgency = $.trim(this.formModel.get('urgency'));
            var attention = $.trim(this.formModel.get('attention'));
            if (question !== '' && urgency !== '') {
                this.$('#modal-accept-button').attr('disabled', false);
            } else {
                this.$('#modal-accept-button').attr('disabled', true);
            }
            if(urgency === 'Emergent' && attention === ''){
                this.$('#modal-accept-button').attr('disabled', true);
            }
        },
        onShow: function(){
            this.onModelChange.call(this);
        },
        fireDelete: function(e) {
            EventHandler.deleteTask(e, this.model, this.taskListView);
        },
        fireSaveEvent: function(e) {
            EventHandler.saveTask(e, this.model, this.formModel, this.taskListView);
        },
        fireAcceptEvent: function(e) {
            if (!this.formModel.isValid()) {
                return false;
            }
            EventHandler.signTask(e, this.model, this.formModel, this.taskListView);
        }
    });
});