define([
    'backbone',
    'marionette',
    'underscore',
], function(Backbone, Marionette, _) {
    "use strict";

    var ShortCutsCollection = Backbone.Collection.extend({
        fetchOptions: {
            resourceTitle: 'shortcuts-get-list',
            pageable: false,
            cache: true,
            onError: function(resp){
                console.error('Short Cuts could not be fetched');
            }
        },
        doFetch: function() {
            return ADK.ResourceService.fetchCollection(this.fetchOptions, this);
        }
    });

    return ShortCutsCollection;
});