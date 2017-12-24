define([
    'backbone',
    'marionette',
    'hbs!app/applets/task_forms/activities/order.dischargefollowup/templates/activityDetailsFooter_Template',
    'app/applets/task_forms/activities/order.dischargefollowup/views/discontinueAction_View'
], function(Backbone, Marionette, FooterTemplate, DiscontinueFollowupView) {
    'use strict';

    var FooterView = Backbone.Marionette.ItemView.extend({
        template: FooterTemplate,
        initialize: function(options) {
            var state = this.model.get('state');
            var assignDisabled = !(state.toUpperCase() === 'ACTIVE' && ADK.UserService.hasPermission('discontinue-discharge-followup'));
            this.model.set('assignDisabled', assignDisabled);
        },
        ui: {
            activityDetailDiscontinueBtn: '#activityDetailDiscontinue',
            activityDetailCloseBtn: '#activityDetailClose'
        },
        events: {
            'click @ui.activityDetailDiscontinueBtn': function(e) {
                e.preventDefault();
                this.model.set('comment', '');

                var workflow = new ADK.UI.Workflow({
                    title: 'Discontinue - Administrative',
                    size: 'small',
                    steps: {
                        view: DiscontinueFollowupView,
                        viewModel: this.model,
                        helpMapping: 'discharge_followup_response_form'
                    },
                    backdrop: true
                });

                workflow.show();
            },
            'click @ui.activityDetailCloseBtn': function(e) {
                ADK.UI.Modal.hide();
            }
        }
    });

    return FooterView;
});
