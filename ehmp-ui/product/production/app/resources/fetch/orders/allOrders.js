define([
    'underscore',
    'app/resources/fetch/orders/model'
], function(_, OrderModel) {
    'use strict';

    var RESOURCE = 'all-orders';

    var Orders = ADK.ResourceService.PageableCollection.extend({
        vpr: 'orders',
        model: OrderModel,
        mode: 'client',
        state: {
            pageSize: 40
        },
        constructor: function(models, options) {
            var _options = _.extend({}, options, {
                isClientInfinite: true
            });
            Orders.__super__.constructor.call(this, _options);
            if (models) {
                this.set(models, _options);
            }
        },
        parse: function(resp) {
            return _.get(resp, 'data.items') || resp;
        },
        fetchOptions: {
            resourceTitle: RESOURCE,
            cache: true
        },
        fetchCollection: function(options) {
            var fetchOptions = _.extend({}, options, this.fetchOptions);
            this.isClientInfinite = Boolean(options.isPageable);

            return ADK.PatientRecordService.fetchCollection(fetchOptions, this);
        }
    });

    return Orders;
});