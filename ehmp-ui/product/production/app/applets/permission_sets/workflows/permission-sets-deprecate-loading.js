define([
    'underscore',
    'app/applets/permission_sets/workflows/permission-sets-fetch-failure',
    'hbs!app/applets/permission_sets/templates/create-loading-view'
], function(_, warningOptions, template) {
    'use strict';


    /**
     * Permission Sets Deprecate Loading View
     * Feature: 1285
     *
     * Original Specification: https://wiki.vistacore.us/x/o4igAQ
     */
    return ADK.UI.Form.extend({

        fields: [{
            control: 'container',
            extraClasses: ['modal-body', 'all-padding-md'],
            items: [{
                control: 'container',
                extraClasses: 'row',
                items: [{
                    control: 'container',
                    extraClasses: 'col-xs-12',
                    template: template
                }]
            }]
        }, {
            control: 'container',
            extraClasses: 'modal-footer'
        }],

        onInitialize: function() {
            this.listenToOnce(this.versions, 'fetch:success', this.fetchSuccess);
            this.listenToOnce(this.versions, 'fetch:error', this.fetchError);
        },

        onBeforeShow: function() {
            this.versions.fetchCollection();
        },

        /**
         * If the view is attached and both collections have returned, start loading multi selects.
         */
        fetchSuccess: function() {
            this.workflow.goToNext();
        },

        fetchError: function() {
            var warning = new ADK.UI.Alert(warningOptions);
            warning.show();

            var footer = _.get(warning, 'FooterRegion.currentView');

            this.listenToOnce(footer, 'fetch:aborted:confirm', function abort() {
                ADK.UI.Workflow.hide();
            });
        }
    });
});