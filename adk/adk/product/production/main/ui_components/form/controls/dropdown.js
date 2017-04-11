define([
    'backbone',
    'handlebars',
    'main/ui_components/form/control/controlService'
], function(
    Backbone,
    Handlebars,
    ControlService
) {
    'use strict';

    return ControlService.Control.extend({
        defaults: {
            split: false,
            label: '',
            icon: '',
            id: '',
            type: 'button',
            disabled: false,
            extraClasses: [],
            items: [],
            title: ''
        },
        requiredFields: ['split', 'label', 'items'],
        className: "control inline-block-display",
        template: Handlebars.compile('{{ui-dropdown label split=split icon=icon id=id type=type items=items srOnlyLabel=srOnlyLabel title=title}}'),
        behaviors: _.omit(ControlService.Control.prototype.behaviors, 'ErrorMessages'),
        events: _.defaults({
            'click a': function(e) {
                e.preventDefault();
            },
            'control:disabled': function(e, disableOption) {
                if (_.isBoolean(disableOption)) {
                    this.$('button').prop('disabled', disableOption);
                }
                if (_.isObject(disableOption)) {
                    this.$('.btn-divider').prop('disabled', disableOption.mainButton);
                    this.$('.dropdown-toggle').prop('disabled', disableOption.dropdownToggle);
                }
                e.stopPropagation();
            }
        }, ControlService.Control.prototype.events),
        onRender: function() {
            var field = this.getOption('field') || {};
            this.$el.trigger('control:disabled', field.get('disabled'));
        }
    });
});