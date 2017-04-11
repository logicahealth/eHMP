define([
    'puppetForm',
    'handlebars',
    'backbone',
    'underscore',
    // Make sure to require all NEW PuppetForm Controls!!
    'main/ui_components/forms/controls/toggleOptionsChecklist',
    'main/ui_components/forms/controls/collapsibleContainer',
    'main/ui_components/forms/controls/popover',
    'main/ui_components/forms/controls/input',
    'main/ui_components/forms/controls/checklist',
    'main/ui_components/forms/controls/drilldownChecklist',
    'main/ui_components/forms/controls/searchbar',
    'main/ui_components/forms/controls/fieldset',
    'main/ui_components/forms/controls/container',
    'main/ui_components/forms/controls/multiselectSideBySide',
    'main/ui_components/forms/controls/radioList',
    'main/ui_components/forms/controls/selectList',
    'main/ui_components/forms/controls/typeahead',
    'main/ui_components/forms/controls/datepicker',
    'main/ui_components/forms/controls/datejspicker',
    'main/ui_components/forms/controls/timepicker',
    'main/ui_components/forms/controls/commentBox',
    'main/ui_components/forms/controls/nestedCommentBox',
    'main/ui_components/forms/controls/alertBanner',
    'main/ui_components/forms/controls/rangeSlider',
    'main/ui_components/forms/controls/selectableTable',
    'main/ui_components/forms/controls/tabs',
    'main/ui_components/forms/controls/select',
    'main/ui_components/forms/controls/dropdown',
    'main/ui_components/forms/controls/textarea',
    'main/ui_components/forms/controls/treepicker'
], function(PuppetForm, Handlebars, Backbone, _) {
    'use strict';

    PuppetForm.SpacerControl = Backbone.View.extend({
        tagName: 'hr',
        attributes: {
            "aria-hidden": "true"
        }
    });

    PuppetForm.ButtonControl = PuppetForm.DefaultButtonControl.extend({
        template: Handlebars.compile([
            '{{ui-button label type=type icon=icon disabled=disabled title=title classes=extraClasses id=(clean-for-id id) size=size srOnlyLabel=srOnlyLabel}}',
            '{{#compare type "submit"}}',
            '{{#if value}}{{#if value.status}}',
            '<span class="status pull-right{{#compare value.status "error"}} {{PuppetForm "buttonStatusErrorClassName"}}{{/compare}}{{#compare value.status "success"}} {{PuppetForm "buttonStatusSuccessClassname"}}{{/compare}}"> {{value.message}}</span>',
            '{{/if}}{{/if}}',
            '{{/compare}}'
        ].join("\n")),
        keyPathAccessor: function(obj, path) {
            var res = obj;
            path = path.split('.');
            for (var i = 0; i < path.length; i++) {
                if (_.isNull(res)) return null;
                if (_.isEmpty(path[i])) continue;
                if (!_.isUndefined(res[path[i]])) res = res[path[i]];
            }
            return res;
        },
        events: _.defaults({
            //Events to be Triggered By User
            "control:disabled": function(event, booleanValue) {
                this.setBooleanFieldOption("disabled", booleanValue, event);
            },
            "control:label": function(event, stringValue) {
                this.setStringFieldOption("label", stringValue, event);
            },
            "control:icon": function(event, stringValue) {
                this.setStringFieldOption("icon", stringValue, event);
            },
            "control:title": function(event, stringValue) {
                this.setStringFieldOption("title", stringValue, event);
            }
        }, PuppetForm.DefaultButtonControl.prototype.events),
        className: function() {
            return "control inline-display";
        },
        onRender: function() {
            this.$el.addClass(this.field.get('controlName') + '-control ' + this.field.get('name').split('.').shift());
            this.toggleHidden();
            this.updateInvalid();
        }
    });

    PuppetForm.CheckboxControl = PuppetForm.BooleanControl = PuppetForm.DefaultBooleanControl.extend({
        template: Handlebars.compile([
            '{{ui-form-checkbox label id=(clean-for-id name) name=name title=title checked=value disabled=disabled srOnlyLabel=srOnlyLabel}}'
        ].join("\n")),
        events: _.defaults({
            //Events to be Triggered By User
            "control:disabled": function(event, booleanValue) {
                this.setBooleanFieldOption("disabled", booleanValue, event);
            },
            "control:label": function(event, stringValue) {
                this.setStringFieldOption("label", stringValue, event);
            },
            "control:title": function(event, stringValue) {
                this.setStringFieldOption("title", stringValue, event);
            },
            "control:value": function(e, booleanValue) {
                e.preventDefault();
                if (_.isBoolean(booleanValue)) {
                    var model = this.model,
                        $el = $(e.target),
                        attrArr = this.field.get("name").split('.'),
                        name = attrArr.shift(),
                        path = attrArr.join('.'),
                        value = booleanValue,
                        changes = {};
                    if (this.model.errorModel instanceof Backbone.Model) {
                        if (_.isEmpty(path)) {
                            this.model.errorModel.unset(name);
                        } else {
                            var nestedError = this.model.errorModel.get(name);
                            if (nestedError) {
                                this.keyPathSetter(nestedError, path, null);
                                this.model.errorModel.set(name, nestedError);
                            }
                        }
                    }
                    changes[name] = _.isEmpty(path) ? value : _.clone(model.get(name)) || {};

                    model.set(changes);
                }
            }
        }, PuppetForm.DefaultBooleanControl.prototype.events)
    });

    PuppetForm.RadioControl = PuppetForm.DefaultRadioControl.extend({
        getTemplate: function() {
            return Handlebars.compile([
                '<p class="faux-label bottom-margin-xs {{is-sr-only-label srOnlyLabel}}">{{add-required-indicator label required}}</p>',
                '<fieldset id="{{clean-for-id name}}" class="all-margin-no {{PuppetForm "radioControlsClassName"}}{{#if (has-puppetForm-prop "controlsClassName")}} {{PuppetForm "controlsClassName"}}{{/if}}"{{#if title}} title="{{title}}"{{/if}}>',
                '<legend class="sr-only">{{label}}</legend>',
                '{{#each options}}',
                Handlebars.helpers['ui-form-label'].apply(this, ["{{label}}", {
                    hash: {
                        forID: "{{@root.name}}-{{clean-for-id value}}",
                        classes: [PuppetForm.radioLabelClassName],
                        extraClassLogic: '{{#if disabled}}disabled {{else}}{{#if @root.disabled}}disabled {{/if}}{{/if}}',
                        content: '<input type="{{@root.type}}" id="{{@root.name}}-{{clean-for-id value}}" name="{{@root.name}}" {{#if title}}title="{{title}}"{{else}}title="Press spacebar to select {{label}} for {{@root.label}}"{{/if}} value="{{formatter-from-raw @root.formatter value}}" {{#compare value @root.rawValue}}checked="checked"{{/compare}}{{#if disabled}} disabled{{else}}{{#if @root.disabled}} disabled{{/if}}{{/if}}{{#if @root.required}} required{{/if}}/>'
                    }
                }]),
                '{{/each}}',
                '{{#if helpMessage}} <span {{#if (has-puppetForm-prop "helpMessageClassName")}}class="{{PuppetForm "helpMessageClassName"}}"{{/if}}>{{helpMessage}}</span>{{/if}}',
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
        }, PuppetForm.DefaultRadioControl.prototype.events),
        formatter: PuppetForm.ControlFormatter
    });

    return PuppetForm;
});