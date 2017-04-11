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
                var orderId = Util.getFieldFromUid(params.uid, 'orderId');
                var options = _.extend({
                    orderId: orderId
                }, _.get(params, 'model.attributes', {}));

                var orderDetailModel = new ADK.UIResources.Writeback.Orders.Detail(options);
                var view = ModalContentView;
                var ViewDef = view.extend({
                    model: orderDetailModel,
                    onBeforeShow: function() {
                        this.model.execute();
                    }

                });

                return {
                    view: ViewDef,
                    navHeader: false,
                    showLoading: true,
                    title: orderDetailModel.get('summary'),
                    resourceEntity: orderDetailModel
                };
            });
        }
    };

    return detailCommunicator;
});