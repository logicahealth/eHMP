define([
    'backbone',
    'app/applets/visit/writeback/addselectVisit',
    'app/applets/task_forms/activities/requests/views/requestFormView',
    'app/applets/orders/writeback/requests/requestFormModel'
], function(Backbone, AddSelectEncounter, RequestFormView, RequestFormModel) {
    'use strict';
    var requestState = '';
    var launchRequestTrayForm = function(options, requestState) {

        var formModel = new RequestFormModel(options);
        var formTitle = 'request';

        formModel.set('requestState', requestState);
        if (!(_.isEmpty(requestState))) {
            if (requestState == 'Active:PendingResponse') {
                formTitle = formTitle + ' - edit';
            } else if (requestState == 'Active: Clarification Requested' || requestState == 'Active: Declined') {
                formTitle = formTitle + ' - review';
            }
        } else if (_.get(options, 'draft-uid') && !(_.isEmpty(_.get(options, 'draft-uid')))) {
            formTitle = formTitle + ' - draft';
        } else {
            formTitle = formTitle + ' - new';
        }
        var workflowOptions = {
            title: formTitle,
            showProgress: false,
            keyboard: false,
            steps: []
        };

        ADK.utils.writebackUtils.handleVisitWorkflow(workflowOptions, AddSelectEncounter.extend({
            inTray: true
        }));

        workflowOptions.steps.push({
            view: RequestFormView,
            viewModel: formModel,
            stepTitle: 'Step 2',
            helpMapping: 'request_order_form'
        });

        var workflowController = new ADK.UI.Workflow(workflowOptions);
        workflowController.show({
            inTray: 'actions'
        });
    };

    var launchRequestForm = function(options, requestState) {

        launchRequestTrayForm(options, requestState);
    };

    var launchDraftRequestForm = function(draftUid) {
        launchRequestTrayForm({
            'draft-uid': draftUid
        }, null);
    };

    return {
        launchRequestForm: launchRequestForm,
        launchDraftRequestForm: launchDraftRequestForm
    };
});