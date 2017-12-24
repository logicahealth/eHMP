define([
    'underscore',
    'backgrid',
    'handlebars'
], function(_, Backgrid, Handlebars) {
    'use strict';

    var patientNameColumn = {
        name: 'PATIENTNAME',
        flexWidth: 'flex-width-2',
        label: 'Patient Name',
        bodyTemplate: Handlebars.compile('{{PATIENTNAME}} {{#if PATIENTSSNLASTFOUR}}({{PATIENTSSNLASTFOUR}}){{/if}}'),
        sortKeys: {
            asc: 'activity.patientName asc',
            desc: 'activity.patientName desc'
        }
    };

    var dischargedOnColumn = {
        name: 'dischargedOn',
        flexWidth: 'flex-width-none pixel-width-90',
        label: 'Discharged On',
        bodyTemplate: Handlebars.compile('{{formatDate dischargedOn "MM/DD/YYYY"}}'),
        sortKeys: {
            asc: 'discharge.dateTime asc',
            desc: 'discharge.dateTime desc',
            defaultDirection: 'desc'
        }
    };

    var fromFacilityColumn = {
        name: 'fromFacilityName',
        label: 'From Facility',
        sortKeys: {
            asc: 'discharge.fromFacilityDescription asc',
            desc: 'discharge.fromFacilityDescription desc'
        }
    };

    var dispositionToColumn = {
        name: 'disposition',
        label: 'Disposition To',
        sortKeys: {
            asc: 'discharge.disposition asc',
            desc: 'discharge.disposition desc'
        }
    };

    var assignedPcpColumn = {
        name: 'PCPNAME',
        label: 'Assigned PCP',
        sortKeys: {
            asc: 'discharge.primaryCarePhysicianNameAtDischarge asc',
            desc: 'discharge.primaryCarePhysicianNameAtDischarge desc'
        }
    };

    var primaryCareTeamColumn = {
        name: 'PCTEAM',
        label: 'Primary Care Team',
        flexWidth: 'flex-width-1_5',
        sortKeys: {
            asc: 'discharge.primaryCareTeamAtDischarge asc',
            desc: 'discharge.primaryCareTeamAtDischarge desc'
        }
    };

    var attemptsColumn = {
        name: 'attempts',
        flexWidth: 'flex-width-none pixel-width-65 text-center',
        label: 'Attempts',
        sortKeys: {
            asc: 'contact.attempts asc',
            desc: 'contact.attempts desc'
        }
    };

    var flagColumn = {
        name: 'isActivityHealthy',
        flexWidth: 'flex-width-none pixel-width-40 text-center',
        label: 'Flag',
        bodyTemplate: Handlebars.compile('{{#unless isActivityHealthy}}<i class="fa fa-flag fa-lg color-primary" data-toggle="tooltip" data-placement="auto" title="{{ACTIVITYHEALTHDESCRIPTION}}" aria-hidden="true"></i><span class="sr-only">{{ACTIVITYHEALTHDESCRIPTION}}</span>{{/unless}}'),
        sortKeys: {
            asc: 'activity.activityHealthy asc',
            desc: 'activity.activityHealthy desc'
        }
    };

    var actionColumn = {
        name: 'ACTION',
        flexWidth: 'flex-width-none pixel-width-35',
        label: '',
        ariaLabel: 'Associated Action',
        bodyTemplate: '<div class="action-container"></div>'
    };

    var allColumns = [patientNameColumn, dischargedOnColumn, fromFacilityColumn, dispositionToColumn, assignedPcpColumn, primaryCareTeamColumn, attemptsColumn, flagColumn, actionColumn];

    return {
        columns: allColumns,
        getFilterFields: function() {
            return _.pluck(allColumns, 'name');
        }
    };
});
