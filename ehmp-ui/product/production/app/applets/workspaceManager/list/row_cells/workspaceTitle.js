define([
    'underscore',
    'backbone',
    'marionette',
    'handlebars',
    'app/applets/workspaceManager/list/row_cells/inlineEditText'
], function(
    _,
    Backbone,
    Marionette,
    Handlebars,
    InlineEditText
) {
    'use strict';
    var WorkspaceTitle = InlineEditText.extend({
        onRender: function() {
            this.applyInputMasking();
        },
        applyInputMasking: function() {
            this.ui.editInput.inputmask("Regex", {
                regex: "^[a-zA-Z0-9\\s]*$"
            });
        },
        inlineChangeEvent: function(e) {
            InlineEditText.prototype.inlineChangeEvent.apply(this, arguments);
            if (_.isEmpty(this.ui.editInput.val().trim())) {
                this.ui.form.addClass('has-error');
                this.ui.feedbackIcon.addClass('fa-asterisk color-red-dark');
            }
        },
        saveInlineChange: function(e) {
            var value = this.ui.editInput.val().trim();
            if (!_.isEmpty(value) && value !== this.originalValue) {
                this.triggerMethod('saving');
                this.triggerMethod('save:change:title', value);
                return this.saveIndicator();
            }
            return this.model.set('savingWorkspace', false);
        }
    });
    return WorkspaceTitle;
});
