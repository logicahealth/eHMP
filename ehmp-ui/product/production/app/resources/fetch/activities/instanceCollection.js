define([
    'underscore',
    'app/resources/fetch/activities/instanceModel'
], function(_, Activity) {
    'use strict';

    var RESOURCE = 'activity-instance-byid';

    var Activities = ADK.Resources.Collection.extend({
        model: Activity,
        parse: function(resp) {
            return _.get(resp, 'data') || resp;
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
