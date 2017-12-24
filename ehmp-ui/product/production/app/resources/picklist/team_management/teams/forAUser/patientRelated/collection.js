define([
    'app/resources/picklist/team_management/teams/teamModel'
], function(Team) {
    'use strict';

    var TeamsGroup = ADK.Resources.Picklist.Group.extend({
        idAttribute: 'groupName',
        groupLabel: 'groupName',
        picklist: 'teams',
        Collection: ADK.Resources.Picklist.Collection.extend({
            model: Team,
            comparator: 'teamName'
        }),
        defaults: {
            groupName: '',
            teams: [] //this will be parsed into a Collection
        }
    });

    var Teams = ADK.Resources.Picklist.Collection.extend({
        resource: 'write-pick-list-teams-for-user-patient-related',
        model: TeamsGroup,
        params: function(method, options) {
            return {
                staffIEN: options.staffIEN || '',
                pid: options.patientID || ''
            };
        },
        parse: function(resp, options) {
            return [{
                groupName: 'My Teams Associated with Patient',
                teams: _.get(resp, 'data', [])
            }];
        }
    });

    return Teams;
});
