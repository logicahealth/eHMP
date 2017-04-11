define([], function () {
    'use strict';

    return {
        compareActivityModels: function (modelOne, modelTwo) {
            if (modelOne.get('mode') === modelTwo.get('mode')) {
                if (modelOne.get('urgency') === modelTwo.get('urgency')) {
                    if (!_.isNull(modelOne.get('name')) && !_.isNull(modelTwo.get('name'))) {
                        return modelOne.get('name').localeCompare(modelTwo.get('name'));
                    } else if (_.isNull(modelOne.get('name'))) {
                        return 1;
                    } else if (_.isNull(modelTwo.get('name'))) {
                        return -1;
                    } else {
                        return 0;
                    }
                } else {
                    if (modelOne.get('urgency') === 'Emergent') {
                        return -1;
                    } else if (modelTwo.get('urgency') === 'Emergent') {
                        return 1;
                    } else if (modelOne.get('urgency') === 'Urgent') {
                        return -1;
                    } else if (modelTwo.get('urgency') === 'Urgent') {
                        return 1;
                    }
                }
            } else {
                if (modelOne.get('mode') === 'Open') {
                    return -1;
                } else {
                    return 1;
                }
            }
        },
        parseResponse: function (response) {
            var facilityMonikers = ADK.Messaging.request('facilityMonikers');

            if (response.CREATEDATDIVISIONID) {
                var createdAtFacility = facilityMonikers.findWhere({
                    facilityCode: response.CREATEDATDIVISIONID
                });
                if (!_.isUndefined(createdAtFacility)) {
                    response.createdAtName = createdAtFacility.get('facilityName');
                }
            }

            if (response.ASSIGNEDTODIVISIONID) {
                var assignedToFacility = facilityMonikers.findWhere({
                    facilityCode: response.ASSIGNEDTODIVISIONID
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
            response.assignedTo = response.ASSIGNEDTOID;
            response.intendedFor = response.INTENDEDFOR;
            if (response.CREATEDON) {
                response.createdOn = moment.utc(response.CREATEDON, 'YYYY-MM-DD[T]HH:mm[Z]').format('YYYYMMDD');
            }
            response.patientName = response.PATIENTNAME;
            response.patientSsnLastFour = response.PATIENTSSNLASTFOUR;
            response.isSensitivePatient = response.ISSENSITIVEPATIENT;
            response.status = response.STATUS;
            response.createdById = response.CREATEDBYID;
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

            if(!_.isUndefined(response.TEAMS) && !_.isNull(response.TEAMS)){
                response.teams = response.TEAMS.split(',');
            }

            if(!_.isUndefined(response.TEAMFOCI) && !_.isNull(response.TEAMFOCI)){
                response.teamFoci = response.TEAMFOCI.split(',');
            }

            if(!_.isUndefined(response.INTENDEDFORUSERS) && !_.isNull(response.INTENDEDFORUSERS)){
                response.intendedForUsers = response.INTENDEDFORUSERS.split(',');
            }
        },
        matchTeams: function(userTeams, activityTeamIdsArray, activityFociArray){
            var isMatch = false;

            if(_.isArray(userTeams)){
                var userTeamIds = _.map(userTeams, function(userTeam){
                     return userTeam.teamID ? userTeam.teamID.toString() : '';
                });

                if(_.isArray(userTeamIds) && _.isArray(activityTeamIdsArray) && !_.isEmpty(_.intersection(userTeamIds, activityTeamIdsArray))){
                    isMatch = true;
                } else {
                    _.each(activityFociArray, function(activityFocus){
                        var matchedFocus = _.find(userTeams, function(team){
                            var numberFocus = Number(activityFocus);
                            return team.teamPrimaryFoci === numberFocus || team.teamSecondaryFoci === numberFocus;
                        });

                        if(!_.isUndefined(matchedFocus)){
                            isMatch = true;
                        }
                    });
                }
            }

            return isMatch;
        }
    };
});
