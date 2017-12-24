/* global ADK */
define([
    'backbone',
    'underscore',
    'app/resources/fetch/activities/activityDetailsModel'
], function(Backbone, _, ActivityDetailsModel) {
    "use strict";

    var ServerCollection = ADK.Collections.ServerCollection;

    var ActivitiesCollection = ServerCollection.extend({
        model: ActivityDetailsModel,
        resourceTitle: 'activities-with-details',
        mode: 'server',
        defaults: {
            mode: 'open'
        },
        fetchOptions: function(options) {
            var criteria = _.extend(this.criteria, _.get(this, 'defaults'), options);
            return {
                'resourceTitle': this.resourceTitle,
                'cache': this.cache,
                'pageable': this.pageable,
                'criteria': criteria,
                'allowDuplicateParams': this.allowDuplicateParams
            };
        },
        cache: false,
        pageable: true,
        criteria: {},
        allowDuplicateParams: true,
        parse: function(response) {
            var activities = _.get(response, 'data.items');
            if (activities) {
                return activities;
            }
            return response;
        },
        fetch: function(options) {
            ServerCollection.prototype.fetch.call(this, this.fetchOptions(_.get(options, 'criteria')));
        }
    });

    return ActivitiesCollection;
});