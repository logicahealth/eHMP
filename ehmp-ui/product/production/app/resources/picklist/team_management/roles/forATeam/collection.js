define([
    'app/resources/picklist/team_management/roles/roleModel'
], function(Role) {
    'use strict';

    var Roles = ADK.Resources.Picklist.Collection.extend({
        resource: 'write-pick-list-roles-for-team',
        model: Role,
        params: function(method, options) {
            return {
                teamID: options.teamID || ''
            };
        }
    });

    return Roles;
});