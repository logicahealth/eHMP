/* global ADK */
define([
    'backbone',
    'marionette',
    'underscore',
    'app/resources/fetch/community_health_summaries/model',
    'app/applets/ccd_grid/util'
], function (Backbone, Marionette, _, CommunityHealthSummaryModel, Util) {
    "use strict";

    var RESOURCE = 'patient-record-vlerdocument';

    var CommunityHealthSummaries = ADK.Resources.Collection.extend({
        resource: RESOURCE,
        model: CommunityHealthSummaryModel,
        parse: function(resp) {
            var ccds = _.get(resp, 'data.items');

            if (ccds) {
                return ccds;
            }

            return resp;
        },
        fetchCollection: function(options) {
            var fetchOptions = {
                resourceTitle: RESOURCE,
                pageable: true,
                cache: true,
            };
            if (options.criteria) {
                fetchOptions.criteria = options.criteria;
            }
            return ADK.PatientRecordService.fetchCollection(fetchOptions, this);
        }
    });

    return CommunityHealthSummaries;
});