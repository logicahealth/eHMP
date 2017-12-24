define([
    'underscore'
], function(_) {
    'use strict';

    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    //  DO NOT ALTER THE NESTING OF THIS ARRAY
    //  as it can mess up the instantiation of the control's view
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    return function(controlName, options) {
        options = _.extend({ required: true }, options);
        controlName += '-';
        return [{
            control: 'container',
            extraClasses: ['row'],
            items: [{
                control: 'radio',
                extraClasses: ['col-xs-12'],
                name: controlName + 'type',
                required: _.get(options, 'required'),
                label: 'Assign to',
                options: []
            }, {
                control: 'select',
                extraClasses: ['col-xs-12'],
                showFilter: true,
                options: {
                    placeholder: 'Select facility',
                    minimumInputLength: 0
                },
                name: controlName + 'facility',
                required: _.get(options, 'required'),
                label: 'Facility',
                pickList: [],
                disabled: true,
                hidden: true
            }, {
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
                name: controlName + 'person',
                required: _.get(options, 'required'),
                label: 'Person',
                pickList: [],
                disabled: true,
                hidden: true
            }, {
                control: 'select',
                extraClasses: ['col-xs-12'],
                showFilter: true,
                groupEnabled: true,
                options: {
                    placeholder: 'Select team',
                    minimumInputLength: 0
                },
                name: controlName + 'team',
                required: _.get(options, 'required'),
                label: 'Team',
                pickList: [],
                disabled: true,
                hidden: true
            }, {
                control: 'select',
                extraClasses: ['col-xs-12'],
                multiple: true,
                showFilter: true,
                options: {
                    placeholder: 'You may select more than one',
                    minimumInputLength: 0
                },
                name: controlName + 'roles',
                required: _.get(options, 'required'),
                label: 'Roles',
                pickList: [],
                disabled: true,
                hidden: true
            }]
        }];
    };
});
