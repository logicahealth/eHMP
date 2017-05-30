define([
    'underscore',
    'app/resources/fetch/orders/enterpriseOrderable'
], function(_, EnterpriseOrderable) {
    'use strict';

    var RESOURCE = 'enterprise-orderable-search';

    var Orderables = ADK.Resources.Collection.extend({
        model: EnterpriseOrderable,
        parse: function(resp) {
            return _.get(resp, 'data.items') || resp;
        },
        fetchOptions: {
            resourceTitle: RESOURCE
        },
        fetchCollection: function(options) {
            var fetchOptions = _.extend({}, options, this.fetchOptions);

            return ADK.PatientRecordService.fetchCollection(fetchOptions, this);
        }
    });

    return Orderables;
});
