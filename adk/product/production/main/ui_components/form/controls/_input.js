define([
    'backbone',
    'handlebars',
    'underscore',
    'main/ui_components/form/control/controlService'
], function(
    Backbone,
    Handlebars,
    _,
    ControlService
) {
    'use strict';

    var BaseInputControl = ControlService.Control.extend({
        defaults: {
            type: "text",
            label: "",
            maxlength: 255,
            extraClasses: [],
            helpMessage: ''
        },
        template: Handlebars.compile([
            '<label class="{{form-class-name "controlLabelClassName"}}">{{label}}</label>',
            '<div class="{{form-class-name "controlsClassName"}}">',
            '  <input type="{{type}}" class="{{form-class-name "controlClassName"}}{{if extraClasses}}{{extraClasses}}{{/if}}" name="{{name}}" maxlength="{{maxlength}}" value="{{value}}" placeholder="{{placeholder}}" {{if disabled}} "disabled"{{/if}}{{if required}} "required"{{/if}} autocomplete="off"/>',
            '  {{if helpMessage}}<span class="{{form-class-name "helpMessageClassName"}}">{{helpMessage}}</span>{{/if}}',
            '</div>'
        ].join("\n")),
        events: _.defaults({
            "change input": function() {
                this.onChange.apply(this, arguments);
                this.onUserInput.apply(this, arguments);
            }
        }, ControlService.Control.prototype.events),
        getValueFromDOM: function() {
            return this.formatter.toRaw(this.$("input").val(), this.model);
        }
    });

    return BaseInputControl;
});
