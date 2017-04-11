define([
    'backbone',
    'handlebars',
    'main/ui_components/form/controls/_input',
    'main/ui_components/form/control/controlService'
], function(
    Backbone,
    Handlebars,
    BaseInputControl,
    ControlService
) {
    'use strict';

    var RadioControl = BaseInputControl.extend({
        defaults: {
            type: "radio",
            label: "",
            options: [],
            extraClasses: []
        },
        getTemplate: function() {
            return Handlebars.compile([
                '<p class="faux-label bottom-margin-xs {{is-sr-only-label srOnlyLabel}}">{{add-required-indicator label required}}</p>',
                '<fieldset id="{{clean-for-id name}}" class="all-margin-no {{form-class-name "radioControlsClassName"}}{{#if (has-form-class "controlsClassName")}} {{form-class-name "controlsClassName"}}{{/if}}"{{#if title}} title="{{title}}"{{/if}}>',
                '<legend class="sr-only">{{label}}</legend>',
                '{{#each options}}',
                Handlebars.helpers['ui-form-label'].apply(this, ["{{label}}", {
                    hash: {
                        forID: "{{@root.name}}-{{clean-for-id value}}",
                        classes: [ControlService.radioLabelClassName],
                        extraClassLogic: '{{#if disabled}}disabled {{else}}{{#if @root.disabled}}disabled {{/if}}{{/if}}',
                        content: '<input type="{{@root.type}}" id="{{@root.name}}-{{clean-for-id value}}" name="{{@root.name}}" {{#if title}}title="{{title}}"{{else}}title="Press spacebar to select {{label}} for {{@root.label}}"{{/if}} value="{{formatter-from-raw @root.formatter value}}" {{#compare value @root.rawValue}}checked="checked"{{/compare}}{{#if disabled}} disabled{{else}}{{#if @root.disabled}} disabled{{/if}}{{/if}}{{#if @root.required}} required{{/if}}/>'
                    }
                }]),
                '{{/each}}',
                '{{#if helpMessage}} <span {{#if (has-form-class "helpMessageClassName")}}class="{{form-class-name "helpMessageClassName"}}"{{/if}}>{{helpMessage}}</span>{{/if}}',
                '</fieldset>'
            ].join("\n"));
        },
        events: _.defaults({
            //Events to be Triggered By User
            "control:disabled": function(event, booleanValue) {
                this.setBooleanFieldOption("disabled", booleanValue, event);
            },
            "control:required": function(event, booleanValue) {
                this.setBooleanFieldOption("required", booleanValue, event);
            },
            "control:label": function(event, stringValue) {
                this.setStringFieldOption("label", stringValue, event);
            },
            "control:helpMessage": function(event, stringValue) {
                this.setStringFieldOption("helpMessage", stringValue, event);
            }
        }, BaseInputControl.prototype.events),
        formatter: ControlService.ControlFormatter,
        getValueFromDOM: function() {
            return this.formatter.toRaw(this.$("input:checked").val(), this.model);
        },
        behaviors: _.defaults({
            ErrorMessages: {
                behaviorClass: ControlService.Behaviors.ErrorMessages,
                fieldSelector: 'input[type="radio"]'
            }
        }, BaseInputControl.prototype.behaviors)
    });

    return RadioControl;
});