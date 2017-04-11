define([
    'app/applets/visit/writeback/addselectVisit',
], function(AddSelectVisit) {
    'use strict';

    return (function() {

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
        var launchWorkflow = function(model, view, options, title, trayTarget) {
            if (_.isUndefined(model) || _.isUndefined(view)) {
                return;
            }

            var workflowOptions = _.extend({}, WORKFLOW_DEFAULTS, options);
            workflowOptions.steps = [];
            workflowOptions.title = title;

            ADK.utils.writebackUtils.handleVisitWorkflow(workflowOptions, AddSelectVisit);

            workflowOptions.steps.push({
                view: view,
                viewModel: model
            });

            var workflow = new ADK.UI.Workflow(workflowOptions);
            if (_.isString(trayTarget)) {
                workflow.show({
                    inTray: trayTarget
                });
            }
            else {
                workflow.show();
            }

            return workflow;
        };

        /**
         * Trigger an 'Orders' applet refresh using ADK messaging
         */
        var refreshApplet = function() {
            //We still need to add a timeout for the refresh call to account for the JDS sync delay. However, with this utility function
            //approach, at least we limit the wonky-ness to one place, which is easy to fix once the JDS sync happens properly.     
            setTimeout(function() {
                var channel = ADK.Messaging.getChannel('orders');
                if (channel) {
                    channel.trigger('applet:refresh');
                }
            }, 1000);
        };

        return {
            launchWorkflow: launchWorkflow,
            refreshApplet: refreshApplet
        };
    })();
});