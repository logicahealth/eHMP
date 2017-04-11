define([
    "backbone",
    'app/applets/problems/writeback/ProblemSearch',
    'app/applets/problems/writeback/RequestFreeText',
    'app/applets/visit/writeback/addselectVisit',
    'app/applets/problems/writeback/formModel',
    'app/applets/problems/writeback/parseUtils'
], function(Backbone, ProblemSearchView, RequestFreeTextView, addselectEncounter, FormModel, ParseUtils) {
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

            ADK.utils.writebackUtils.handleVisitWorkflow(workflowOptions, addselectEncounter.extend({
                inTray: true
            }));

            workflowOptions.steps.push({
                view: ProblemSearchView,
                viewModel: formModel,
                stepTitle: 'Add Problem',
                helpMapping: 'problems_form' // may need to change if this step has it's own doc link
            });

            workflowOptions.steps.push({
                    view: RequestFreeTextView,
                    viewModel: formModel,
                    stepTitle: 'Request free text',
                    helpMapping: 'problems_form' // may need to change if this step has it's own doc link
            });

            workflowOptions.steps.push({
                    view: AddEditProblemsView,
                    viewModel: formModel,
                    stepTitle: 'Enter Problem Info',
                    onBeforeShow: function() {
                        var currentForm = this.workflowControllerView.getCurrentFormView();
                        currentForm.stopListening(currentForm.model, 'change.inputted', currentForm.registerChecks);
                        currentForm.unregisterChecks.apply(currentForm);
                        currentForm.listenToOnce(currentForm.model, 'change', currentForm.registerChecks);
                    },
                    helpMapping: 'problems_form' // may need to change if this step has it's own doc link
            });

            var workflowController = new ADK.UI.Workflow(workflowOptions);
            workflowController.show({
                inTray: 'observations'
            });
        },
        startEditProblemsWorkflow: function(AddEditProblemsView, existingProblemModel){
            var formModel = new FormModel();
            ParseUtils.copyModelPropertiesForEdit(existingProblemModel, formModel);

            var workflowOptions = {
                size: 'large',
                title: 'Edit Problem',
                keyboard: false,
                steps: []
            };

            ADK.utils.writebackUtils.handleVisitWorkflow(workflowOptions, addselectEncounter.extend({
                inTray: true
            }));

            workflowOptions.steps.push({
                view: AddEditProblemsView,
                viewModel: formModel,
                stepTitle: 'Edit Problem',
                helpMapping: 'problems_form', // may need to change if this step has it's own doc link
                onBeforeShow: function() {
                    var currentForm = this.workflowControllerView.getCurrentFormView();
                    currentForm.stopListening(currentForm.model, 'change.inputted', currentForm.registerChecks);
                    currentForm.unregisterChecks.apply(currentForm);
                    currentForm.listenToOnce(currentForm.model, 'change', currentForm.registerChecks);
                }                
            });

            var workflowController = new ADK.UI.Workflow(workflowOptions);
            workflowController.show({
                inTray: 'observations'
            });
        }

    };

    return workflowUtils;
});