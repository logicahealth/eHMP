define([
    'backbone',
    'underscore'
], function(Backbone, _) {
    'use strict';

    var ActivityDetailsModel = Backbone.Model.extend({
        parse: function(response) {
            response.attempts = _.get(response, 'ACTIVITYJSON.contact.attempts');
            var discharge = _.get(response, 'ACTIVITYJSON.discharge');

            if (discharge) {
                response.fromFacilityName = discharge.fromFacilityDescription;
                response.dischargedOn = discharge.dateTime;
                response.disposition = discharge.disposition;
                response.pcpName = discharge.primaryCarePhysicianNameAtDischarge;
                response.primaryCareTeam = discharge.primaryCareTeamAtDischarge;
            }

            if (_.isNull(response.ISACTIVITYHEALTHY)) {
                response.isActivityHealthy = true;
            } else {
                response.isActivityHealthy = response.ISACTIVITYHEALTHY;
            }

            return response;
        }
    });

    return ActivityDetailsModel;
});
