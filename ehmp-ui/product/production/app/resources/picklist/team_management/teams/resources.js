define([
    'app/resources/picklist/team_management/teams/forAUser/collection',
    'app/resources/picklist/team_management/teams/forAUser/patientRelated/collection',
    'app/resources/picklist/team_management/teams/forAFacility/collection',
    'app/resources/picklist/team_management/teams/forAFacility/patientRelated/collection',
    'app/resources/picklist/team_management/teams/forAPatient/collection'
], function(TeamsForAUser, PatientRelatedTeamsForAUser, TeamsForAFacility, PatientRelatedTeamsForAFacility, TeamsForAPatient) {
    'use strict';

    return {
        ForAUser: TeamsForAUser,
        PatientRelatedForAUser: PatientRelatedTeamsForAUser,
        ForAFacility: TeamsForAFacility,
        PatientRelatedForAFacility: PatientRelatedTeamsForAFacility,
        ForAPatient: TeamsForAPatient
    };
});
