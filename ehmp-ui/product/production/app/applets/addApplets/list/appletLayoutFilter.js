define([
    'underscore',
    'jquery',
    'backbone',
    'hbs!app/applets/addApplets/templates/appletFilter'
], function(_, $, Backbone, template) {
    'use strict';

    /**
     * IT would be nice if this was just an
     * ADK.UI.Form However it an new component would have to
     * be created in order to achieve the filter design.
     *
     * This was the best solution given the time constrains to refactor
     * addApplets.
     */
    return Backbone.Marionette.ItemView.extend({
        tagName: 'form',

        template: template,

        ui: {
            input: '#searchApplets',
            clear: 'button.editor-clear-filter'
        },

        events: {
            'keyup @ui.input': 'onInputChange',
            'click @ui.clear': 'onClickClear'
        },

        /**
         * Triggers a filter change event for appletLayout to pass to the slider
         * @param event
         * @return {boolean} False to prevent the form from submitting and reloading the screen
         */
        onInputChange: function onInputChange(event) {
            event.preventDefault();
            var text = this.ui.input.val();
            this.ui.clear.show();
            this.triggerMethod('filter:change', text);
            return false;
        },

        onClickClear: function onClickClear() {
            this.ui.input.val('');
            this.triggerMethod('filter:change', '');
            this.ui.clear.hide();
        },

        focusInput: function focusInput() {
            this.ui.input.focus();
        }
    });
});