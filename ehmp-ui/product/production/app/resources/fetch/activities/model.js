/* global ADK */

define([
    'backbone',
    'underscore',
    'moment'
], function(Backbone, _, moment) {
    "use strict";

    var ActivitiesModel = Backbone.Model.extend({
        parse: function(response) {
            var facilityMonikers = ADK.Messaging.request('facilityMonikers');
            if (response.CREATEDATID) {
                var createdAtFacility = facilityMonikers.findWhere({
                    facilityCode: response.CREATEDATID
                });
                if (createdAtFacility instanceof Backbone.Model) {
                    response.createdAtName = createdAtFacility.get('facilityName');
                }
            }
            if (response.ASSIGNEDTOFACILITYID) {
                var assignedToFacility = facilityMonikers.findWhere({
                    facilityCode: response.ASSIGNEDTOFACILITYID
                });
                if (assignedToFacility instanceof Backbone.Model) {
                    response.assignedFacilityName = assignedToFacility.get('facilityName');
                }
            }

            switch (response.URGENCY) {
                case 2:
                    response.urgency = 'Emergent';
                    break;
                case 4:
                    response.urgency = 'Urgent';
                    break;
                case 3:
                    response.urgency = 'Pre-op';
                    break;
                case 5:
                    response.urgency = 'Admit';
                    break;
                case 6:
                    response.urgency = 'Outpatient';
                    break;
                case 7:
                    response.urgency = 'Purple Triangle';
                    break;
                case 9:
                    response.urgency = 'Routine';
                    break;
            }
            if (response.CREATEDON) {
                response.createdOn = moment.utc(response.CREATEDON, 'YYYY-MM-DD[T]HH:mm:ss[.]SSS[Z]').local().format('YYYYMMDDHHmmss');
            }
            if (_.isString(response.TASKSTATE)) {
                response.taskState = response.TASKSTATE.split(':')[0];
            }
            if (_.isNull(response.ISACTIVITYHEALTHY)) {
                response.isActivityHealthy = true;
            } else {
                response.isActivityHealthy = response.ISACTIVITYHEALTHY;
            }
            return response;
        }
    });
    return ActivitiesModel;
});