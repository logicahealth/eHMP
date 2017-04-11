define([
    'backbone',
    'marionette',
    'underscore',
    'hbs!app/applets/cds_advice/modal/default/defaultTpl',
    'app/applets/cds_advice/util',
], function(Backbone, Marionette, _, modalTemplate, Util) {
    'use strict';

    function createView(model) {
        var opts = {
            model: model
        };
        var View = Backbone.Marionette.ItemView.extend({
            template: modalTemplate,
            serializeData: function() {
                var data = this.model.toJSON();

                if(_.get(data, 'details.detail')) {
                    data.details.detail = Util.formatDetailText(data.details.detail);
                }
                return data;
            },
            showDetails: function(model) {
                var AdviceModal = require('app/applets/cds_advice/modal/advice/adviceModal');
                var ReminderModal = require('app/applets/cds_advice/modal/reminder/reminderModal');

                switch (model.get('type')) {
                    case Util.ADVICE_TYPE.REMINDER:
                        ReminderModal.show(model);
                        break;

                    case Util.ADVICE_TYPE.ADVICE:
                        AdviceModal.show(model);
                        break;

                    default:
                        showModal(model);
                }
            },
            getDetailsModal: function(model) {
                this.showDetails(model);
            }
        });
        return new View(opts);
    }

    function showModal(model) {
        var view = createView(model);
        var modalOptions = {
            title: 'CDS Advice',
            'nextPreviousCollection': model.collection
        };
        var modal = new ADK.UI.Modal({
            view: view,
            options: modalOptions,
            callbackView: view
        });
        modal.show();
    }

    return {
        /**
         * Shows the Default details modal.
         *
         * @param {BackboneJS.Model} model The model object created for the list item.
         */
        show: function (model) {
            showModal(model);
        },
        createView: createView
    };
});
