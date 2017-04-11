define([
    'backbone',
    'main/ui_components/form/control/prototype'
], function(
    Backbone,
    ControlPrototype
) {
    "use strict";

    return function(){
        this.options = this.options || {};
        var args = Array.prototype.slice.call(arguments),
            init = this.initialize;
        ControlPrototype._initialize.apply(this, args);
        this.initialize = function() {
            var args = Array.prototype.slice.call(arguments);
            init.apply(this, args);
        };
    };
});