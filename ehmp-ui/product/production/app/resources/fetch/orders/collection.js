define([
    'underscore',
    'app/resources/fetch/orders/model'
], function(_, OrderModel) {
    'use strict';

    var RESOURCE = 'patient-record-order';

    var Orders = ADK.Resources.Collection.extend({
        vpr: 'orders',
        model: OrderModel,
        parse: function(resp) {
            return _.get(resp, 'data.items') || resp;
        },
        fetchOptions: {
            resourceTitle: RESOURCE,
            cache: true
        },
        fetchCollection: function(options) {
            var fetchOptions = _.extend({}, options, this.fetchOptions);

            return ADK.PatientRecordService.fetchCollection(fetchOptions, this);
        }
    });

    return Orders;
});