define([
], function() {
    'use strict';

    var assignmentTypeFields = [{
        control: 'container',
        extraClasses: ['row', 'bottom-padding-sm'],
        items: [{
            control: 'radio',
            extraClasses: ['col-xs-12', 'request-assignment'],
            name: 'assignment',
            required: true,
            label: 'Assign to',
            title: 'Assign to Me, Person, My Teams, or Any Team Radio',
            options: [{
                label: 'Me',
                value: 'opt_me',
                title: 'Me'
            }, {
                label: 'Person',
                value: 'opt_person',
                title: 'Person'
            }, {
                label: 'My Teams',
                value: 'opt_myteams',
                title: 'My Teams'
            }, {
                label: 'Patient\'s Teams',
                value: 'opt_patientteams',
                title: 'Patient\'s Teams'
            }, {
                label: 'Any Team',
                value: 'opt_anyteam',
                title: 'Any Team'
            }]
        }]
    }, {
        control: 'container',
        hidden: true,
        extraClasses: ['row', 'bottom-padding-sm', 'facility-row'],
        items: [{
            control: 'select',
            extraClasses: ['col-xs-12'],
            showFilter: true,
            options: {
                placeholder: 'Select facility',
                minimumInputLength: 0
            },
            name: 'facility',
            label: 'Facility',
            title: 'Use up and down arrows to view options and then press enter to select',
            attributeMapping: {
                label: 'vistaName',
                value: 'facilityID'
            },
            pickList: [],
            disabled: true,
            hidden: true
        }]
    }, {
        control: 'container',
        hidden: true,
        extraClasses: ['row', 'bottom-padding-sm', 'person-row'],
        items: [{
            control: 'select',
            extraClasses: ['col-xs-12'],
            showFilter: true,
            options: {
                placeholder: 'Select person',
                minimumInputLength: 2,
                language: {
                    inputTooShort: function() {
                        return 'Type at least 2 characters of the person\'s name';
                    }
                }
            },
            name: 'person',
            label: 'Person',
            title: 'Use up and down arrows to view options and then press enter to select',
            attributeMapping: {
                label: 'name',
                value: 'personID'
            },
            pickList: [],
            disabled: true,
            hidden: true
        }]
    }, {
        control: 'container',
        hidden: true,
        extraClasses: ['row', 'bottom-padding-sm', 'team-row'],
        items: [{
            control: 'select',
            extraClasses: ['col-xs-12'],
            showFilter: true,
            groupEnabled: true,
            options: {
                placeholder: 'Select team',
                minimumInputLength: 0
            },
            name: 'team',
            label: 'Team',
            title: 'Use up and down arrows to view options and then press enter to select',
            attributeMapping: {
                label: 'teamName',
                value: 'teamID'
            },
            pickList: [],
            disabled: true,
            hidden: true
        }]
    }, {
        control: 'container',
        hidden: true,
        extraClasses: ['row', 'bottom-padding-sm', 'roles-row'],
        items: [{
            control: 'select',
            extraClasses: ['col-xs-12'],
            multiple: true,
            showFilter: true,
            options: {
                placeholder: 'You may select more than one',
                minimumInputLength: 0
            },
            name: 'roles',
            label: 'Roles',
            title: 'Use up and down arrows to view options and then press enter to select',
            attributeMapping: {
                label: 'name',
                value: 'roleID',
            },
            pickList: [],
            disabled: true,
            hidden: true
        }]
    }];

    return assignmentTypeFields;
});
