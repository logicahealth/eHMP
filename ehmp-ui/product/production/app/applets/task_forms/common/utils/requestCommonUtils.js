define([], function() {
    'use strict';

    var commonUtils = {
        // Trigger a refresh in the activities, tasks, and notifications applets.
        triggerRefresh: function() {
            ADK.Messaging.getChannel('activities').trigger('create:success');
        },
        parseAssignment: function(assignment) {
            if (assignment === 'opt_me') {
                return 'Me';
            } else if (assignment === 'opt_person') {
                return 'Person';
            } else if (assignment === 'opt_myteams') {
                return 'My Teams';
            } else if (assignment === 'opt_anyteam') {
                return 'Any Team';
            } else if (assignment === 'opt_patientteams') {
                return 'Patient\'s Teams';
            } else {
                return null;
            }
        },
        parseUrgencyId: function(urgency) {
            var urgencyId = '';
            if (urgency === 'routine') {
                urgencyId =  9;
            } else if (urgency === 'urgent') {
                urgencyId =  4;
            }
            return urgencyId.toString();
        },

        routingCode: function(formModel, formAction) {
            var assignTo = this.parseAssignment(formModel.get('assignment'));
            var userSession = ADK.UserService.getUserSession().attributes;
            if (assignTo === 'Me') {
                return userSession.site + ';' + userSession.duz[userSession.site];
            } else if (assignTo === 'Person') {
                return formModel.get('person');
            } else {
                var roles = formModel.get('roles');
                var team = formModel.get('team');
                var codes = [];
                _.each(roles, function(role) {
                    codes.push('[TM:(' + team + ')/TR:(' + role + ')]');
                });
                return codes.join();
            }
        },
        lookupRoleName: function(roleList, roleID) {
            if (!roleList) {
                return null;
            }

            var foundRole = _.find(roleList, function(role) {
                if (!role) {
                    return false;
                }

                return ((roleID === role.roleID) || (parseInt(roleID, 10) === role.roleID));
            });

            return foundRole ? foundRole.name : null;
        },
        lookupTeamName: function(teamList, teamID) {
            if (!teamList) {
                return null;
            }

            var foundTeam = _.find(teamList, function(team) {
                if (!team) {
                    return false;
                }

                return ((teamID === team.teamID) || (parseInt(teamID, 10) === team.teamID));
            });

            return foundTeam ? foundTeam.teamName : null;
        },
        removeWhiteSpace: function(s) {
            if (s && _.isString(s)) {
                return s.replace(/ +/g,' ');
            } else {
                return s;
            }
        }
    };

    return commonUtils;
});
