define([
    'app/resources/picklist/team_management/teams/teamModel'
], function(Team) {
    'use strict';

    var Teams = ADK.Resources.Picklist.Collection.extend({
        type: 'teams-for-facility',
        model: Team,
        params: function(method, options) {
            return {
                facilityID: options.facilityID || ''
            };
        }
    });

    return Teams;
});
