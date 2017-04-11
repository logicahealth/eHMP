define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/applets/task_forms/common/views/action_modal/actionModal_View',
    'app/applets/task_forms/activities/order.request/utils',
    'app/applets/task_forms/activities/order.request/views/discontinueAction_View',
    'hbs!app/applets/task_forms/activities/order.request/templates/activityDetailsFooter_Template'
    ], function(Backbone, Marionette, _, Handlebars, ActionModalView, Utils, DiscontinueView, footerTemplate) {
        'use strict';

        var ConsultFooterView = Backbone.Marionette.ItemView.extend({
            template: footerTemplate,
            initialize: function(options){
                var user = ADK.UserService.getUserSession();
                Utils.setActions(this.model, user);
            },
            events: {
                'click #activityDetailDiscontinue': function(e){
                    e.preventDefault();
                    var activityModel = this.model;
                    var processId = Number(activityModel.get('processId'));

                    var RequestSignalModel = Backbone.Model.extend({
                        validate: function(attributes, options){
                            this.errorModel.clear();

                            if (!_.isEmpty(this.errorModel.toJSON())) {
                                return "Validation errors. Please fix.";
                            }
                        }
                    });

                    var model = new RequestSignalModel({
                        instanceName: activityModel.get('instanceName'),
                        processInstanceId: processId,
                        deploymentId: activityModel.get('deploymentId'),
                        signalName: 'END'
                    });

                    var workflow = new ADK.UI.Workflow({
                        title: 'Discontinue Request',
                        size: 'small',
                        steps: {
                            view: DiscontinueView,
                            viewModel: model
                        },
                        backdrop: true
                    });

                    workflow.show();

                },
                'click #activityDetailClose': function(e){
                    ADK.UI.Modal.hide();
                },
                'click li[data-signal="EDIT"]': function(e){
                    e.preventDefault();
                    ADK.UI.Modal.hide();
                    var params = Utils.buidEditParametersForActivities(this.model);
                    ADK.Messaging.getChannel('task_forms').request('edit:request', params);
                }
            }
        });
        return ConsultFooterView;
});