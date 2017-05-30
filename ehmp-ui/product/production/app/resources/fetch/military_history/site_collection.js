define([
    'underscore'
], function(_) {
    'use strict';

    var RESOURCE = 'authentication-list';

    var sites = ADK.Resources.Collection.extend({
        model: ADK.Resources.Model,
        parse: function(resp) {
            var sites = _.get(resp, 'data.items');
            return sites;
        },
        fetchCollection: function() {
            var fetchOptions = {
                resourceTitle: RESOURCE
            };

            return ADK.PatientRecordService.fetchCollection(fetchOptions, this);
        }
    });

    return sites;
});