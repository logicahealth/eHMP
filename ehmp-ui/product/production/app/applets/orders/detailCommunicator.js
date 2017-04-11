define([
    'main/ADK',
    'app/applets/orders/util',
    'app/applets/orders/modalView/modalContentView'
], function(ADK, Util, ModalContentView) {
    "use strict";

    var detailCommunicator = {

        initialize: function(appletId, resourceTitle) {

            // expose detail view through messaging
            var channel = ADK.Messaging.getChannel(appletId);
            channel.reply('detailView', function(params) {

                var response = $.Deferred();
                var orderId = _.last(_.isString(params.uid) ? params.uid.split(':') : []);
                var options = _.extend({
                    orderId: orderId
                }, _.get(params, 'model.attributes', {}));

                var orderDetailModel = new ADK.UIResources.Writeback.Orders.Detail(options);
                orderDetailModel.on('read:success', function(model) {
                    this.off();
                    var detailView = new ModalContentView({
                        model: new Backbone.Model({
                            detailSummary: model.get('detail')
                        })
                    });
                    response.resolve({
                        title: model.get('summary'),
                        view: detailView
                    });
                });
                orderDetailModel.on('read:error', function(model, resp) {
                    this.off();
                    response.reject(resp);
                });
                orderDetailModel.execute();

                return response.promise();
            });
        }
    };

    return detailCommunicator;
});