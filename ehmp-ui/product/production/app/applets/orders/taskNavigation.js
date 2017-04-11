define([
    'app/applets/orders/modalView/modalViewUtils',
], function(ModalViewUtils) {
    "use strict";

    var onError = function(message) {
        throw new Error('**ERROR** Show:Lab-Sign Event: ' + message);
    };

    var onOrderDetailsFetchSuccess = function(callback, collection) {
        if (collection.length <= 0) {
            return onError('Order details for requested order do not exist');
        }
        if (_.isFunction(callback)) {
            callback(collection.first());
        }
    };

    var onClinicalObjectFetchSuccess = function(model, resp, options) {
        var data = model.get('data');
        if (_.isUndefined(data) || _.isUndefined(data.localId)) {
            return onError('Clinical Object "data.localId" value was invalid');
        }
        var fetchOptions = {
            resourceTitle: 'patient-record-order',
            pageable: false,
            cache: false,
            onSuccess: _.partial(onOrderDetailsFetchSuccess, _.get(options, 'callback')),
            onError: _.partial(onError, 'Server error occurred while retrieving order details'),
            criteria: {
                filter: 'eq(localId,"' + data.localId + '")'
            }
        };
        ADK.PatientRecordService.fetchCollection(fetchOptions);
    };

    var fetchOrderDetails = function(params, callback) {
        if (_.isUndefined(params.clinicalObjectUid)) {
            return onError('Task Navigation "parameters.clinicalObjectUid" value was invalid');
        }
        var order = new ADK.UIResources.Writeback.ClinicalObjects.Model({
            uid: params.clinicalObjectUid
        });
        this.listenTo(order, 'read:success', onClinicalObjectFetchSuccess);
        this.listenTo(order, 'read:error', _.partial(onError, 'Server error occurred while retrieving clinical object'));
        order.fetch({
            callback: callback
        });
    };

    var onShowLabSign = _.partialRight(fetchOrderDetails, ModalViewUtils.showOrderDetails);

    return {
        fetchOrderDetails: fetchOrderDetails,
        initialize: function(appletId) {
            var channel = ADK.Messaging.getChannel(appletId);
            this.listenTo(channel, 'show:lab-sign', onShowLabSign);
        }
    };
});