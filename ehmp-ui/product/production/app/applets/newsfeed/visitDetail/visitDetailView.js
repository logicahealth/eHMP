define([
    "backbone",
    "hbs!app/applets/newsfeed/visitDetail/visitDetailTemplate",
], function(Backbone, visitDetailTemplate) {
    "use strict";

    return Backbone.Marionette.ItemView.extend({
        template: visitDetailTemplate
    });
});
