define([
    'backbone',
    'marionette'
], function(Backbone, Marionette) {
    "use strict";

    return Marionette.Behavior.extend({
        initialize: function() {
            var requiredFields = this.requiredFields || [];
            var hasAll = true;
            _.forEach(requiredFields, function(requiredField) {
                if (!_.has(this.field.attributes, requiredField)) {
                    hasAll = false;
                    requiredFields = [];
                    console.error('Missing Control Config Option: ' + requiredField + '\n Your configuration options: ', this.field.attributes);
                }
            }, this);
            return hasAll;
        }
    });
});