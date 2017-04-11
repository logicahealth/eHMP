define([
    'app/resources/picklist/team_management/facilities/collection',
    'app/resources/picklist/team_management/peopleAtAFacility/collection',
    'app/resources/picklist/team_management/teams/resources',
    'app/resources/picklist/team_management/roles/resources'
], function(Facilities, PeopleAtAFacility, Teams, Roles) {
    'use strict';

    return {
        Facilities: Facilities,
        PeopleAtAFacility: PeopleAtAFacility,
        Teams: Teams,
        Roles: Roles
    };
});
