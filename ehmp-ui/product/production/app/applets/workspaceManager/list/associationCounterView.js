define([
    'underscore',
    'backbone',
    'marionette',
    'handlebars',
    'hbs!app/applets/workspaceManager/list/problems/associationCounterTemplate'
], function(
    _,
    Backbone,
    Marionette,
    Handlebars,
    AssociationCounterTemplate
) {
    'use strict';
    var AssociationCounter = Backbone.Marionette.ItemView.extend({
        template: AssociationCounterTemplate,
        modelEvents: {
            'change:problems': 'render'
        }
    });
    return AssociationCounter;
});
