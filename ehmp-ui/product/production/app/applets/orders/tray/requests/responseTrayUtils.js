define([
    'app/applets/task_forms/activities/requests/views/responseFormView',
    'app/applets/orders/writeback/requests/responseFormModel'
], function(ResponseFormView, ResponseFormModel) {
    'use strict';

    var launchResponseTrayForm = function(options) {
        var paramsForModel = {};
        if (options && options.model && options.model.get('taskVariables') && options.model.get('taskVariables').requestActivity) {
            paramsForModel = options.model.get('taskVariables').requestActivity;
            paramsForModel.taskId = options.taskId;
            paramsForModel.taskStatus = options.model.get('status');
        }
        var formModel = new ResponseFormModel(paramsForModel);

        var formTitle = 'request - response';

        var workflowOptions = {
            title: formTitle,
            showProgress: false,
            keyboard: false,
            steps: []
        };

        workflowOptions.steps.push({
            view: ResponseFormView,
            viewModel: formModel
        });

        var workflowController = new ADK.UI.Workflow(workflowOptions);
        workflowController.show({
            inTray: 'actions'
        });
    };

    var launchResponseForm = function(options) {
        launchResponseTrayForm(options);
    };

    return {
        launchResponseForm: launchResponseForm
    };
});
