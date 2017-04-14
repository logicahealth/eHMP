define([
    'backbone',
    'handlebars',
    'main/ui_components/form/control/controlService',
    'main/ui_components/form/controls/_input'
], function(
    Backbone,
    Handlebars,
    ControlService,
    BaseInputControl
) {
    'use strict';

    var BooleanControl = BaseInputControl.extend({
        defaults: {
            type: "checkbox",
            label: "",
            controlLabel: '&nbsp;',
            extraClasses: []
        },
        behaviors: _.defaults({
          ErrorMessages: {
            behaviorClass: ControlService.Behaviors.ErrorMessages,
            fieldSelector: 'input[type="checkbox"]'
          }
        }, BaseInputControl.prototype.behaviors),
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
        }, BaseInputControl.prototype.events),
        getValueFromDOM: function() {
            return this.formatter.toRaw(this.$("input").is(":checked"), this.model);
        }
    });

    return BooleanControl;
});
