define([
    'app/resources/picklist/team_management/teams/teamModel'
], function(Team) {
    'use strict';

    var Teams = ADK.Resources.Picklist.Collection.extend({
        type: 'teams-for-patient',
        model: Team,
        params: function(method, options) {
            return {
                patientID: options.patientID || ''
            };
        }
    });

    return Teams;
});
