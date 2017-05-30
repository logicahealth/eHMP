define(['underscore'], function (_) {
    'use strict';

    var OperationalDataTypeVital = ADK.Resources.Collection.extend({
        fetchOptions: {
            resourceTitle: 'operational-data-type-vital'
        },
        parse: function (response) {
            var data = _.get(response, 'data.items');
            return data;
        },
        fetchCollection: function (options) {
            var vitalFetchOptions = _.extend({}, options, this.fetchOptions);
            return ADK.ResourceService.fetchCollection(vitalFetchOptions, this);
        }
    });

    return OperationalDataTypeVital;
});