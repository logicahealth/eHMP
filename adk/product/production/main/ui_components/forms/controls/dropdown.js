/**
 * Created by alexluong on 6/25/15.
 */

define([
    'backbone',
    'puppetForm',
    'handlebars'
], function(Backbone, PuppetForm, Handlebars) {
    'use strict';

    var DropdownPrototype = {
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
        }, PuppetForm.CommonPrototype.events),
        onRender: function() {
            PuppetForm.Control.prototype.onRender.apply(this, arguments);
            var field = this.getOption('field') || {};
            this.$el.trigger('control:disabled', field.get('disabled'));
        }
    };

    var Dropdown = PuppetForm.DropdownControl = PuppetForm.Control.extend(DropdownPrototype);

    return Dropdown;
});