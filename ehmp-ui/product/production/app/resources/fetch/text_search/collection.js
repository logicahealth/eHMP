define([
    'underscore',
], function(_) {
    'use strict';
    var TextSearchCollection = ADK.Resources.Collection.extend({
        parse: function(response, options) {
            if (!_.isUndefined(response.data)) {
                this.foundItemsTotal = response.data.foundItemsTotal;
            }
            return _.result(response, 'data.items', response);
        },
        getFetchOptions: function(options) {
            return _.defaults({
                criteria: {
                    "query": options.searchTerm,
                    "returnSynonyms": options.getSynonyms || false
                },
                cache: false,
                patient: ADK.PatientRecordService.getCurrentPatient(),
                resourceTitle: 'patient-record-search-text'
            }, _.pick(options, ['onSuccess', 'onError']));
        },
        comparator: 'summary',
        fetchCollection: function(options) {
            return ADK.PatientRecordService.fetchCollection(this.getFetchOptions(options), this);
        }
    });

    return TextSearchCollection;
});