define([
    'moment'
], function(moment) {
    'use strict';

    return {
        parseResponse: function(response) {
            var facilityMonikers = ADK.Messaging.request('facilityMonikers');

            if (response.CREATEDATID) {
                var createdAtFacility = facilityMonikers.findWhere({
                    facilityCode: response.CREATEDATID
                });
                if (!_.isUndefined(createdAtFacility)) {
                    response.createdAtName = createdAtFacility.get('facilityName');
                }
            }

            if (response.ASSIGNEDTOFACILITYID) {
                var assignedToFacility = facilityMonikers.findWhere({
                    facilityCode: response.ASSIGNEDTOFACILITYID
                });
                if (!_.isUndefined(assignedToFacility)) {
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

            response.name = response.INSTANCENAME;
            response.domain = response.DOMAIN;
            response.createdByName = response.CREATEDBYNAME;
            response.mode = response.MODE;

            if (!_.isUndefined(response.TASKSTATE) && _.isString(response.TASKSTATE)) {
                response.taskState = response.TASKSTATE.split(':')[0];
            }
            response.intendedFor = response.INTENDEDFOR;
            if (response.CREATEDON) {
                response.createdOn = moment.utc(response.CREATEDON, 'YYYY-MM-DD[T]HH:mm[Z]').local().format('YYYYMMDD');
            }
            response.patientName = response.PATIENTNAME;
            response.patientSsnLastFour = response.PATIENTSSNLASTFOUR;
            response.isSensitivePatient = response.ISSENSITIVEPATIENT;
            response.status = response.STATUS;
            response.createdAtId = response.CREATEDATID;
            response.processId = response.PROCESSID;
            response.assignedToFacilityId = response.ASSIGNEDTOFACILITYID;
            response.pid = response.PID;

            if (_.isNull(response.ISACTIVITYHEALTHY)) {
                response.isActivityHealthy = true;
            } else {
                response.isActivityHealthy = response.ISACTIVITYHEALTHY;
            }

            response.activityHealthDescription = response.ACTIVITYHEALTHDESCRIPTION;
        }
    };
});