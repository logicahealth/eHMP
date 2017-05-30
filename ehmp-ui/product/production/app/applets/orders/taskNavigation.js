/* global ADK */
define([
    'underscore',
    'app/applets/orders/modalView/modalViewUtils'
], function (_, ModalViewUtils) {
    "use strict";

    var onError = function (message) {
        throw new Error('**ERROR** Show:Lab-Sign Event: ' + message);
    };

    var onOrderDetailsFetchSuccess = function (callback, options, collection) {
        if (collection.length <= 0) {
            return onError('Order details for requested order do not exist');
        }
        if (_.isFunction(callback)) {
            callback(collection.first(), options);
        }
    };

    var onClinicalObjectFetchSuccess = function (params, model, resp, options) {
        var data = model.get('data');
        if (_.isUndefined(data) || _.isUndefined(data.localId)) {
            return onError('Clinical Object "data.localId" value was invalid');
        }
        var fetchOptions = {
            pageable: false,
            cache: false,
            onSuccess: _.partial(onOrderDetailsFetchSuccess, _.get(options, 'callback'), params),
            onError: _.partial(onError, 'Server error occurred while retrieving order details'),
            criteria: {
                filter: 'eq(localId,"' + data.localId + '")'
            }
        };
        var collection = new ADK.UIResources.Fetch.Orders.Collection();
        collection.fetchCollection(fetchOptions);
    };

    var fetchOrderDetails = function (params, callback) {
        if (_.isUndefined(params.clinicalObjectUid)) {
            return onError('Task Navigation "parameters.clinicalObjectUid" value was invalid');
        }
        var order = new ADK.UIResources.Writeback.Orders.ClinicalObject({
            uid: params.clinicalObjectUid
        });
        this.listenTo(order, 'read:success', _.partial(onClinicalObjectFetchSuccess, params));
        this.listenTo(order, 'read:error', _.partial(onError, 'Server error occurred while retrieving clinical object'));
        order.fetch({
            callback: callback
        });
    };

    var onShowLabSign = _.partialRight(fetchOrderDetails, ModalViewUtils.showOrderDetails);

    return {
        fetchOrderDetails: fetchOrderDetails,
        initialize: function (appletId) {
            var channel = ADK.Messaging.getChannel(appletId);
            this.listenTo(channel, 'show:lab-sign', onShowLabSign);
        }
    };
});