define([
    'main/ADK',
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/applets/orders/util',
    'hbs!app/applets/orders/modalView/headerTemplate',
    'app/applets/visit/writeback/addselectVisit',
    'app/applets/orders/writeback/signView'
], function(ADK, Backbone, Marionette, _, Handlebars, ordersUtil, HeaderTemplate, addselectVisit, signView) {
    'use strict';

    //Modal Navigation Item View
    return Backbone.Marionette.ItemView.extend({
        template: HeaderTemplate,
        ui: {
            order_previous: '#ordersPrevious',
            order_next: '#ordersNext'
        },
        events: {
            'click #ordersPrevious, #ordersNext': 'navigateResults',
            'keydown #ordersPrevious, #ordersNext': 'accessibility'
        },

        modelEvents: {
            "change": "render"
        },

        //treat spacebar press as Enter key - 508 requirement
        accessibility: function(event) {
            if (event.keyCode === 32) {
                this.$('#' + event.currentTarget.id).trigger('click');
            }
        },
        disableButton: function() {
            this.model.set('isBusy', true, {silent: true});
            this.ui.order_previous.attr("disabled", "disabled");
            this.ui.order_next.attr("disabled", "disabled");
        },
        enableButton: function() {
            this.model.set('isBusy', false, {silent: true});
            this.ui.order_previous.attr("disabled", false);
            this.ui.order_next.attr("disabled", false);
        },
        navigateResults: function(event) {
            //the collection.prev and collection.next gets the current model and finds
            //the prev or next for it. If none found, it returns the current model back.
            //we save the initial model (currentModel) in the initialize function
            //so that we can use it as the starting point.
            if (event.currentTarget.id === 'ordersPrevious') {
                if (this.modelIndex > 0) {
                    this.modelIndex--;
                }
            } else {
                var modelCount = (this.pageable) ? this.collection.fullCollection.length - 1 : this.collection.length - 1;
                if (this.modelIndex < modelCount) {
                    this.modelIndex++;
                }
            }

            this.currentModel = (this.pageable) ? this.collection.fullCollection.at(this.modelIndex) : this.collection.at(this.modelIndex);
            this.currentModel.set({
                "getDiscontinueBtnStatus": ordersUtil.getDiscontinueBtnStatus(this.currentModel),
                "getSignBtnStatus": ordersUtil.getSignBtnStatus(this.currentModel),
                "index": this.modelIndex
            }, {
                silent: true
            });

            var orderId = this.currentModel.get('localId') + ';1';
            var detailModel = new ADK.UIResources.Writeback.Orders.Detail({
                orderId: orderId
            });

            this.listenTo(detailModel, 'read:success', function(model, resp) {
                this.currentModel.set('detailSummary', model.get('detail'));
                this.model.clear();
                this.model.set(this.currentModel.attributes);

                //After rendering we maintain focus on the button that was clicked - 508 requirement
                this.$('#' + event.currentTarget.id).focus();
            });

            this.listenTo(detailModel, 'read:error', function(model, resp) {
                console.log(resp);
            });

            detailModel.execute();
        }
    });
});
