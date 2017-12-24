define([
    'underscore',
    'backbone',
    'marionette',
    'handlebars'
], function(
    _,
    Backbone,
    Marionette,
    Handlebars
) {
    'use strict';
    var InlineEditText = Backbone.Marionette.ItemView.extend({
        name: 'title', // all defaults are for 'title' view
        lockEnabled: true,
        maxlength: 30,
        className: function() {
            return 'workspace-' + this.getOption('name') + '-container bold-font editor-' + this.getOption('name');
        },
        template: Handlebars.compile(
            '{{#if isLocked}}<i class="fa fa-lock right-padding-xs"></i>{{/if}}' +
            '{{#if isEditable}}' +
            '<div class="form-group has-feedback">' +
            '<form action="#" method="post" class="workspace-editor editor-{{getName}}">' +
            '<label class="control-label sr-only" for="{{getName}}-{{getId}}">Workspace {{getName}}</label>' +
            '<input required id="{{getName}}-{{getId}}" name="{{getName}}-{{getId}}" type="text" class="editor-{{getName}}-element editor-input-element form-control pixel-height-25"' +
            'value="{{getValue}}" maxlength="{{getMaxlength}}" title="{{getTitle}}" placeholder="Add {{getName}}" />' +
            '<i class="form-control-feedback pixel-width-15 fa" aria-hidden="true"></i>' +
            '</form>' +
            '</div>' +
            '{{else if getValue}}' +
            '<span class="workspace-{{getName}}-text predefined-{{getName}}">{{getValue}}</span>' +
            '{{/if}}'
        ),
        templateHelpers: function() {
            return {
                isLocked: this.getOption('lockEnabled') && !!this.model.get('predefined'),
                isEditable: !this.model.get('predefined'),
                getName: this.getOption('name'),
                getValue: this.model.get(this.getOption('name')),
                getMaxlength: this.getOption('maxlength'),
                getTitle: this.getOption('title') || 'Enter in title and then press enter to save',
                getId: this.cid
            };
        },
        ui: {
            'editInput': 'input',
            'form': 'form',
            'feedbackIcon': 'i.form-control-feedback'
        },
        events: {
            'submit form': 'handleEnterSubmit',
            'blur @ui.editInput': 'saveInlineChange',
            'input @ui.editInput': 'inlineChangeEvent'
        },
        initialize: function() {
            this.setOriginalValue(this.model.get(this.getOption('name')));
        },
        saveIndicator: function() {
            this.ui.form.addClass('has-success');
            this.ui.feedbackIcon.addClass('fa-check color-secondary');
        },
        setOriginalValue: function(newValue) {
            this.originalValue = newValue || '';
        },
        updateValue: function(newValue) {
            this.ui.editInput.val(newValue);
            this.setOriginalValue(newValue);
        },
        inlineChangeEvent: function(e) {
            this.ui.form.removeClass('has-success has-error');
            this.ui.feedbackIcon.removeClass('fa-check fa-asterisk color-red-dark color-secondary');
            this.model.set('savingWorkspace', true);
        },
        handleEnterSubmit: function(e) {
            e.preventDefault();
            this.saveInlineChange();
        },
        saveInlineChange: _.noop
    });
    return InlineEditText;
});