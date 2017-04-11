define([
    "backbone",
    "marionette",
    "underscore"
], function(Backbone, Marionette, _) {
    "use strict";

    var recentPatientsBlankInputView = Backbone.Marionette.ItemView.extend({
        template: _.template('<div></div>'),
    });

    return recentPatientsBlankInputView;
});