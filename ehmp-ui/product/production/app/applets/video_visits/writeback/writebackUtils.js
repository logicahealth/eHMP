define([
    'app/applets/video_visits/writeback/formView',
    'app/applets/video_visits/writeback/formModel'
], function(TrayView, FormModel) {
    'use strict';

    var WORKFLOW_DEFAULTS = {
        size: 'medium',
        showProgress: false,
        keyboard: true
    };

    /**
     * Utility function to launch a ADK Workflow. This function will launch the
     * desired workflow either in the tray or modally, depending on the parameters passed in (see below).
     * @param  {Backbone Model}  model      The workflow 'viewModel' option attribute.
     * @param  {Marionette View} view       The workflow 'view' option attribute.
     * @param  {Object}          options    Any additional ADK workflow options.
     * @param  {String}          title      Workflow title. Call without or as 'null' for no workflow title.
     * @param  {String}          trayTarget Target tray description. Specifying a value here will cause the
     *                                      workflow to be opened in the tray. No parameter or 'null' will cause
     *                                      the workflow to be launched modally.
     * @return {ADK.UI.Workflow}            The ADK Workflow object created.
     */
    var launchWorkflow = function(model, view, options, title, trayTarget) {
        if (_.isUndefined(model) || _.isUndefined(view)) {
            return;
        }

        var workflowOptions = _.extend({}, WORKFLOW_DEFAULTS, {
            steps: [{
                view: view,
                viewModel: model,
                onBeforeShow: _.get(options, 'onBeforeShow'),
                helpMapping: _.get(options, 'helpMapping')
            }],
            title: title
        }, _.omit(options, 'helpMapping'));

        var workflow = new ADK.UI.Workflow(workflowOptions);
        if (_.isString(trayTarget)) {
            workflow.show({
                inTray: trayTarget
            });
        } else {
            var showOptions = {
                triggerElement: _.get(options, 'triggerElement')
            };
            workflow.show(showOptions);
        }

        return workflow;
    };

    var launchForm = function(options) {
        var formModel = new FormModel(options);
        var workflowOptions = {
            helpMapping: 'video_visit_appointment_form'
        };
        launchWorkflow(formModel, TrayView, workflowOptions, 'Create Video Visit Appointment', 'actions');
    };

    return {
        launchForm: launchForm,
        launchWorkflow: launchWorkflow
    };
});
