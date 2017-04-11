define([], function() {
    'use strict';

    var commonUtils = {
        // Trigger a refresh in the activities, tasks, and notifications applets.
        triggerRefresh: function() {
            ADK.Messaging.getChannel('activities').trigger('create:success');
        },
        // Compare two versions numbers and return the highest one
        versionCompare: function(v1, v2) {
            // Split version numbers to its parts
            var v1parts = v1.split('.');
            var v2parts = v2.split('.');

            // Shift 0 to the beginning of the version number that might be shorter
            //      ie. 1.2.3 and 1.2.3.4 => 0.1.2.3 and 1.2.3.4
            while (v1parts.length < v2parts.length) v1parts.unshift('0');
            while (v2parts.length < v1parts.length) v2parts.unshift('0');

            // Convert all values to numbers
            v1parts = v1parts.map(Number);
            v2parts = v2parts.map(Number);

            for (var i = 0, l = v1parts.length; i < l; ++i) {
                if (v1parts[i] === v2parts[i]) {
                    continue;
                } else if (v1parts[i] > v2parts[i]) {
                    return 0;
                } else {
                    return 1;
                }
            }

            return -1;
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
        // Find the latest request deployment
        findLatestRequest: function(collection) {
            var requests = [];

            // Get only the request deployments
            collection.each(function(model) {
                if (model.get('id') === 'Order.Request') {
                    requests.push(model);
                }
            });

            // Get the list of just the deployment version numbers
            var modReqs = requests.map(function(model) {
                return model.get('deploymentId').split(':').pop();
            });

            // Find the location, in the array, for the largest value
            var newestReq = 0;
            if (modReqs.length > 1) {
                for (var i = 1, l = modReqs.length; i < l; ++i) {
                    if (this.versionCompare(modReqs[newestReq], modReqs[i])) {
                        newestReq = i;
                    }
                }
            }

            return requests[newestReq];
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
