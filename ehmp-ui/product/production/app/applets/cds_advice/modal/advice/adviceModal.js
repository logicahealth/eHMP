define([
    'backbone',
    'marionette',
    'underscore',
    'hbs!app/applets/cds_advice/modal/advice/adviceBodyTpl',
], function(Backbone, Marionette, _, bodyTpl) {
    'use strict';

    function createBodyView(model) {
        var opts = model ? {
            model: model
        } : null;
        var View = Backbone.Marionette.ItemView.extend({
            template: bodyTpl
        });
        return new View(opts);
    }


    return {
        /**
         * Shows the Advice details modal.
         *
         * @param {BackboneJS.Model} model The model object created for the list item.
         */
        show: function(model) {
            var view = createBodyView(model);
            var modalOptions = {
                title: 'Advice',
            };
            var modal = new ADK.UI.Modal({
                view: view,
                options: modalOptions
            });
            modal.show();
        }
    };
});