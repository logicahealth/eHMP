define([
    'app/applets/visit/writeback/addselectVisit',
], function(AddSelectVisit) {
    'use strict';

    var WORKFLOW_DEFAULTS = {
        size: 'medium',
        showProgress: false,
        keyboard: true
    };

    /**
     * Utility function to launch a visit-context aware ADK Workflow. This function will launch the
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
    var launchWorkflow = function(model, view, options, title, trayTarget, visitNotRequired) {
        if (_.isUndefined(model) || _.isUndefined(view)) {
            return;
        }

        var workflowOptions = _.extend({}, WORKFLOW_DEFAULTS, options);
        workflowOptions.steps = [];
        workflowOptions.title = title;

        if (!visitNotRequired) {
            ADK.utils.writebackUtils.handleVisitWorkflow(workflowOptions, AddSelectVisit.extend({
                inTray: true
            }));
        }

        workflowOptions.steps.push({
            view: view,
            viewModel: model,
            onBeforeShow: _.get(options, 'onBeforeShow')
        });

        var workflow = new ADK.UI.Workflow(workflowOptions);
        if (_.isString(trayTarget)) {
            workflow.show({
                inTray: trayTarget
            });
        } else {
            var showOptions = {
                triggerElement: options.triggerElement
            };
            workflow.show(showOptions);
        }

        return workflow;
    };

    var triggerChannelEvent = function(channelName, eventName) {
        var channel = ADK.Messaging.getChannel(channelName);
        if (!_.isUndefined(channel)) {
            channel.trigger(eventName);
        }
    };

    return {
        launchWorkflow: launchWorkflow,
        refreshApplet: _.partial(triggerChannelEvent, 'orders', 'applet:refresh'),
        refreshActionTrayTasks: _.partial(triggerChannelEvent, 'tray-tasks', 'action:refresh')
    };
});