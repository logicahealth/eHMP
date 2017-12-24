define([
    'backbone',
    'marionette',
    'underscore',
    'app/applets/cds_advice/util',
    'hbs!app/applets/cds_advice/modal/advice/adviceBodyTpl'
], function(Backbone, Marionette, _, Util, bodyTpl) {
    'use strict';

    function createBodyView(model) {
        var opts = model ? {
            model: model
        } : null;
        var View = Backbone.Marionette.ItemView.extend({
            template: bodyTpl,
            serializeData: function() {
                var data = this.model.toJSON();

                if(_.get(data, 'details.detail')) {
                    data.details.detail = Util.formatDetailText(data.details.detail);
                }
                return data;
            }
        });
        return new View(opts);
    }


    return {
        /**
         * Shows the Advice details modal.
         *
         * @param {BackboneJS.Model} model The model object created for the list item.
         */
        show: function(model, targetElement) {
            var view = createBodyView(model);
            var modalOptions = {
                title: 'Advice',
                triggerElement: targetElement
            };
            var modal = new ADK.UI.Modal({
                view: view,
                options: modalOptions
            });
            modal.show();
        },
        createBodyView: createBodyView
    };
});