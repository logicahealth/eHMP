define([
    "backbone",
    'app/applets/problems/writeback/ProblemSearch',
    'app/applets/problems/writeback/RequestFreeText',    
    'app/applets/visit/writeback/addselectVisit',
    'app/applets/problems/writeback/formModel'
], function(Backbone, ProblemSearchView, RequestFreeTextView, addselectEncounter, FormModel) {
    "use strict";

    var workflowUtils = {
        startAddProblemsWorkflow: function(AddEditProblemsView) {
            var formModel = new FormModel();
            var workflowOptions = {
                size: 'large',
                title: 'Add Problem',
                keyboard: false,
                steps: []
            };

             ADK.utils.writebackUtils.handleVisitWorkflow(workflowOptions, addselectEncounter);

             workflowOptions.steps.push({
                view: ProblemSearchView,
                viewModel: formModel,
                stepTitle: 'Add Problem'
             });

             workflowOptions.steps.push({
                    view: RequestFreeTextView,
                    viewModel: formModel,
                    stepTitle: 'Request free text'
            });

            workflowOptions.steps.push({
                    view: AddEditProblemsView,
                    viewModel: formModel,
                    stepTitle: 'Enter Problem Info'
            });


            var workflowController = new ADK.UI.Workflow(workflowOptions);
            workflowController.show({
                inTray: 'observations'
            });

            ADK.utils.writebackUtils.applyModalCloseHandler(workflowController);
        }
    };

    return workflowUtils;
});