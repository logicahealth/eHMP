define([
    'backbone',
    'marionette',
    'hbs!app/applets/individual_permissions/templates/details-footer',
    'app/applets/individual_permissions/individual-permissions-assign'
], function(Backbone, Marionette, template, assignWorkFlow) {
    'use strict';

    /**
     * Individual Permission Applet View.
     * Feature: 1285
     *
     * Original Specification: https://wiki.vistacore.us/x/o4igAQ
     */
    return Backbone.Marionette.ItemView.extend({
        behaviors: {
            KeySelect: {}
        },

        template: template,

        ui: {
            assign: '.permissions--assign'
        },

        events: {
            'click @ui.assign': 'launchAssign'
        },

        /**
         * Checks to see if assign should be enabled.
         * @return {{assignDisabled: boolean}}
         */
        serializeModel: function serializeModel(){
            var assignDisabled = !ADK.UserService.hasPermission('edit-permission-sets');

            return {
                assignDisabled: assignDisabled
            };
        },

        /**
         * Starts the Assign Workflow
         */
        launchAssign: function launchAssign() {
            var options = assignWorkFlow(this.model, this.collection);
            var workflowController = new ADK.UI.Workflow(options);
            workflowController.show();
        }
    });
});