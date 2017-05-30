define([
    'underscore'
], function(_) {
    'use strict';

    var RESOURCE = 'activities-start';

    var Activities = ADK.Resources.Collection.extend({
        parse: function(resp) {
            return _.get(resp, 'data.items') || resp;
        },
        fetchOptions: {
            resourceTitle: RESOURCE,
            fetchType: 'POST'
        },
        fetchCollection: function(options) {
            var fetchOptions = _.extend({}, options, this.fetchOptions);

            return ADK.PatientRecordService.fetchCollection(fetchOptions, this);
        }
    });

    return Activities;
});