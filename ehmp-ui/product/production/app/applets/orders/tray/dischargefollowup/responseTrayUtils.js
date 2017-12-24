define([
    'underscore',
    'backbone',
    'app/applets/task_forms/activities/order.dischargefollowup/views/responseFormView',
    'app/applets/visit/writeback/addselectVisit'
], function(_, Backbone, ResponseFormView, addselectEncounter) {
    'use strict';

    var launchResponseTrayForm = function(options) {
        var formModel = _.get(options, 'formModel', new Backbone.Model());
        var formTitle = 'Discharge Follow-Up';

        var workflowOptions = {
            title: formTitle,
            showProgress: false,
            keyboard: false,
            steps: []
        };

        ADK.utils.writebackUtils.handleVisitWorkflow(workflowOptions, addselectEncounter.extend({
            inTray: true
        }));

        workflowOptions.steps.push({
            view: ResponseFormView,
            viewModel: formModel,
            helpMapping: 'discharge_followup_response_form'
        });

        var workflowController = new ADK.UI.Workflow(workflowOptions);
        workflowController.show({
            inTray: 'actions'
        });
    };

    return {
        launchResponseTrayForm: launchResponseTrayForm
    };
});