define(['underscore', 'backbone'], function(_, Backbone) {
    'use strict';

    return Backbone.Collection.extend({
        fetchOptions: {
            resourceTitle: 'permission-sets-categories',
            cache: true,
            pageable: false
        },

        fetchCollection: function fetchCollection(options) {
            return ADK.ResourceService.fetchCollection(_.extend({}, this.fetchOptions, options), this);
        }
    });
});