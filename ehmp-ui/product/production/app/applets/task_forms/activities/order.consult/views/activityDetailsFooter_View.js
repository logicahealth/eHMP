define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/applets/task_forms/common/views/action_modal/actionModal_View',
    'app/applets/task_forms/activities/order.consult/utils',
    'hbs!app/applets/task_forms/activities/order.consult/templates/activityDetailsFooter_Template'
], function(Backbone, Marionette, _, Handlebars, ActionModalView, Utils, footerTemplate) {
    'use strict';

    var ConsultFooterView = Backbone.Marionette.ItemView.extend({
        template: footerTemplate,
        initialize: function(options) {
            Utils.setActions(this.model);
        },
        events: {
            'click #activityDetailDiscontinue': function(e) {
                this.model.set('signalName', 'END');
                ActionModalView.launchActionWorkflow(this.model);
            },
            'click #activityDetailClose': function(e) {
                ADK.UI.Modal.hide();
            },
            'click li': function(e) {
                e.preventDefault();
                var signalName = this.$(e.currentTarget).attr('data-signal');
                this.model.set('signalName', signalName);
                ActionModalView.launchActionWorkflow(this.model);
            }
        }
    });
    return ConsultFooterView;
});