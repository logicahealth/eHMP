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

    var ButtonControl = ControlService.Control.extend({
        defaults: {
            icon: '',
            type: "submit",
            label: "Submit",
            status: undefined, // error or success
            message: undefined,
            extraClasses: []
        },
        behaviors:_.omit(ControlService.Control.prototype.behaviors, ['ExtraClasses','ErrorMessages']),
        // TODO: REMOVE CLASSNAME
        className: function() {
            return "control inline-display";
        },
        template: Handlebars.compile([
            '{{ui-button label type=type icon=icon disabled=disabled title=title classes=extraClasses id=(clean-for-id id) size=size srOnlyLabel=srOnlyLabel}}',
            '{{#compare type "submit"}}',
            '{{#if value}}{{#if value.status}}',
            '<span class="status pull-right{{#compare value.status "error"}} {{form-class-name "buttonStatusErrorClassName"}}{{/compare}}{{#compare value.status "success"}} {{form-class-name "buttonStatusSuccessClassname"}}{{/compare}}"> {{value.message}}</span>',
            '{{/if}}{{/if}}',
            '{{/compare}}'
        ].join("\n")),
        // TODO: REMOVE INITIALIZE
        initialize: function() {
            ControlService.Control.prototype.initialize.apply(this, arguments);
            this.listenTo(this.field, "change:status", this.render);
            this.listenTo(this.field, "change:message", this.render);
        },
        // TODO: REMOVE KEYPATHACCESSOR (only different is the return line)
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
        // TODO: REROME DEFAULTS
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
        }, ControlService.Control.prototype.events)
    });

    return ButtonControl;
});
