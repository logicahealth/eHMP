define([
    'backbone',
    'main/ui_components/form/control/prototype'
], function(
    Backbone,
    ControlPrototype
) {
    "use strict";

    return function(options) {
        this.options = _.extend({}, _.result(this, 'options'), options);
        var args = Array.prototype.slice.call(arguments),
            init = this.initialize;
        ControlPrototype._initialize.apply(this, args);
        this.initialize = function() {
            // mix-in control defaults, with priority being:
            // 1) form instance config 2) control defaults 3) global control defaults
            this.field.defaults = _.extend({}, this.field.defaults, _.result(this, 'defaults'));
            this.field.set(_.extend({}, this.field.defaults, _.get(this, 'field._origAttributes')), { silent: true });
            var args = Array.prototype.slice.call(arguments);
            init.apply(this, args);
        };
    };
});
