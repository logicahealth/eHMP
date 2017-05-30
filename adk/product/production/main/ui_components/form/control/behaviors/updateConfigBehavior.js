define([
    'backbone',
    'marionette'
], function(
    Backbone,
    Marionette
) {
    "use strict";

    return Marionette.Behavior.extend({
        events: {
            "control:update:config": "updateConfig"
        },
        updateConfig: function(event, configHash) {
            if (_.isObject(configHash)) {
                if (_.has(configHash, 'name')) console.warn('control:update:config: cannot update \'name\' attribute');
                if (_.has(configHash, 'control')) console.warn('control:update:config: cannot update \'control\' attribute');
                this.view.field.set(_.omit(configHash, ['name', 'control']));
            }
            event.stopPropagation();
        }
    });
});
