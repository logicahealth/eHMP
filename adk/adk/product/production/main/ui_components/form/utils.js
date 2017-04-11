define([
    'backbone'
], function(
	Backbone
) {
    "use strict";
    var FormControlRequirePath = 'main/ui_components/form/controls/controls';
    return {
        resolveNameToClass: function(name, suffix) {
            if (_.isString(name)) {
                var key = _.map(name.split('-'), function(e) {
                    return e.slice(0, 1).toUpperCase() + e.slice(1);
                }).join('') + suffix;
                var Class = require(FormControlRequirePath)[key]; // 'this' = the Controls Object
                if (_.isUndefined(Class)) {
                    throw new ReferenceError("Class '" + key + "' not found");
                }
                return Class;
            }
            return name;
        }
    };
});