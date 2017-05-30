define(['underscore'], function (_) {
    'use strict';

    var OperationalDataTypeLaboratory = ADK.Resources.Collection.extend({
        fetchOptions: {
            resourceTitle: 'operational-data-type-laboratory'
        },
        parse: function (response) {
            var data = _.get(response, 'data.items');
            return data;
        },
        fetchCollection: function (options) {
            var labFetchOptions = _.extend({}, options, this.fetchOptions);
            return ADK.ResourceService.fetchCollection(labFetchOptions, this);
        }
    });

    return OperationalDataTypeLaboratory;
});