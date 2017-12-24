define([
    'app/applets/permission_sets/workflows/permission-sets-abstract-form',
    'hbs!app/applets/permission_sets/templates/create-details-sets',
    'hbs!app/applets/permission_sets/templates/create-details-features'
], function(AbstractForm, setDetailsTemplate, featureDetailsTemplate) {
    'use strict';

    var STEP_INDEX = 2;
    /**
     * Permission Sets Create Form Step Two - Quick Selections
     * Feature: 1285
     *
     * Creates two multi-selects: Permission-Sets, Feature-Categories
     * These are used in step 3 to populate the individual permissions that belong to
     * the groups selected here.
     *
     * Original Specification: https://wiki.vistacore.us/x/o4igAQ
     */
    return AbstractForm.extend({

        onInitialize: function onInitialize() {
            this.bindEntityEvents(this.features, this.featureEvents);
            this.addMultiSelect('Permissions Sets', this.permissionSets, setDetailsTemplate);
            this.addMultiSelect('Feature Categories', this.features, featureDetailsTemplate);
            AbstractForm.prototype.onInitialize.apply(this, arguments);
        },

        onRender: function onRender() {
            this.ui.next.trigger('control:disabled', false);
        },

        onStep: function onStep() {
            if (this.getIndex() === STEP_INDEX) {
                $('#mainWorkflow').focus();
            }
        },

        /**
         * Not a standard function, built/called form AbstractForm
         * @param event
         */
        next: function next(event) {
            event.preventDefault();
            this.workflow.goToNext();
        },

        /**
         * Not a standard function, built/called form AbstractForm
         * @param event
         */
        back: function back(event) {
            event.preventDefault();
            this.workflow.goToPrevious();
        },

        /**
         * Not a standard function, built/called form AbstractForm
         * @param event
         */
        cancel: function cancel(event) {
            event.preventDefault();
            ADK.UI.Workflow.hide();
        }
    });
});