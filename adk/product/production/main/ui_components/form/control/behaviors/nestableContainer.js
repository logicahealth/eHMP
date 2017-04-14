define([
    'backbone',
    'marionette',
    'main/ui_components/form/control/containerUtils'
], function(
    Backbone,
    Marionette,
    ContainerUtils
) {
    "use strict";

    return Marionette.Behavior.extend({
        events: {
            'control:items:add': function(e, model) {
                this.addModel('collection', model, e);
            },
            'control:items:remove': function(e, model) {
                this.removeModel('collection', model, e);
            },
            'control:items:update': function(e, model) {
                this.updateCollection('collection', model, e);
            }
        },
        addModel: function() {
            ContainerUtils.addModel.apply(this.view, arguments);
        },
        removeModel: function() {
            ContainerUtils.removeModel.apply(this.view, arguments);
        },
        updateCollection: function() {
            ContainerUtils.updateCollection.apply(this.view, arguments);
        }
    });
});