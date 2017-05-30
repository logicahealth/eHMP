define([], function() {
    'use strict';
    var Model = Backbone.Model.extend({
        defaults: {
            "complexNote": ""
        }
    });

    return Model;
});