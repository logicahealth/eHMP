define([
    'backbone',
    'hbs!app/applets/military_hist/views/modalDetailsTemplate'
], function(Backbone, modalTemplate) {
    "use strict";

    return Backbone.Marionette.ItemView.extend({
        model: new Backbone.Model.extend({}),
        template: modalTemplate
    });
});