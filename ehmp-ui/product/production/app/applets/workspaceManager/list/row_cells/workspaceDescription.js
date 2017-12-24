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
    var WorkspaceDescription = InlineEditText.extend({
        name: 'description',
        lockEnabled: false,
        maxlength: 144,
        saveInlineChange: function(e) {
            var value = this.ui.editInput.val().trim();
            if (!_.isEqual(value, this.originalValue)) {
                this.triggerMethod('saving');
                this.triggerMethod('save:change:description', value);
                this.setOriginalValue(value);
                return this.saveIndicator();
            }
            return this.model.set('savingWorkspace', false);
        }
    });
    return WorkspaceDescription;
});