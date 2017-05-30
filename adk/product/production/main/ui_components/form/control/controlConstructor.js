define([
    'backbone',
    'main/ui_components/form/control/prototype'
], function(
    Backbone,
    ControlPrototype
) {
    "use strict";

    return function(options){
        this.options = _.extend({}, _.result(this, 'options'), options);
        var args = Array.prototype.slice.call(arguments),
            init = this.initialize;
        ControlPrototype._initialize.apply(this, args);
        this.initialize = function() {
            var args = Array.prototype.slice.call(arguments);
            init.apply(this, args);
        };
    };
});