define([
    'backbone',
    'handlebars',
    'hbs!app/applets/patient_selection/templates/recentPatient/listItem',
    'hbs!app/applets/patient_selection/templates/recentPatient/list'
], function(Backbone, Handlebars, recentPatientDropDownRowTemplate, recentPatientDropDownTemplate) {
    'use strict';

    var SENSITIVE_INDICATOR = '*SENSITIVE*';

    var DropdownListView = ADK.UI.AlertDropdown.DropdownListView.extend({
        template: recentPatientDropDownTemplate,
        initialize: function() {
            ADK.PatientRecordService.getRecentPatients(this.collection);
        },
        onRender: function() {
            if (!this.collection.isEmpty()) {
                this.$('.dropdown-body').addClass('hidden');
            }

            this.$('#noRecentPatients').addClass('hidden');
        },
        collectionEvents: {
            'sync': 'onSync'
        },
        onSync: function(collection, response) {
            if (collection.isEmpty()) {
                this.$('#noRecentPatients').removeClass('hidden');
                this.$('.loading').append('<span class="sr-only">'+ response.message || 'No results found.' + '</span>');
            }
            this.$('.loading').addClass('hidden');
            this.$('.dropdown-body').removeClass('hidden');
        }
    });

    var AlertDropdown = ADK.UI.AlertDropdown.extend({
        className: 'patient-selection--recent-patients--dropdown',
        icon: 'fa-chevron-down',
        ButtonTemplate: Handlebars.compile('<i class="fa {{icon}} font-size-16" aria-hidden="true"></i>'),
        dropdownTitle: 'Recent Patients',
        align: 'left',
        backdrop: true,
        onBeforeInitialize: function() {
            this.collection = new Backbone.Collection();
        },
        RowView: ADK.UI.AlertDropdown.RowView.extend({
            template: recentPatientDropDownRowTemplate,
            attributes: {
                'data-dismiss': 'dropdown'
            },
            events: {
                'click': function() {
                    ADK.PatientRecordService.setCurrentPatient(this.model);
                }
            },
            serializeModel: function() {
                if (!this.model) {
                    return {};
                }

                var modelJSON = _.cloneDeep(this.model.attributes);

                // Not all patients have the briefId, last4, or last5 fields especially those patients that
                // have not been synced, DOD only patients, and ICN only patients. The solution is to use
                // the last5 field if it exist, otherwise build the last initial + last 4 SSN digits using the
                // displayName and ssn fields and check for sensitive patients.
                var last5 = '';

                if (_.get(modelJSON, 'last5')) {
                    last5 = _.get(modelJSON, 'last5');
                } else {
                    var ssn = _.get(modelJSON, 'ssn', '');

                    if (ssn === SENSITIVE_INDICATOR) {
                        last5 = SENSITIVE_INDICATOR;
                    } else {
                        last5 = _.get(modelJSON, 'displayName[0]', '') + ssn.substr(-4, 4);
                    }
                }

                _.set(modelJSON, 'lastInitialPlusSsn', last5);
                return modelJSON;
            }
        }),
        DropdownListView: DropdownListView
    });


    function register() {
        ADK.Messaging.trigger('register:component', {
            type: 'applicationHeaderItem',
            group: 'left',
            title: 'Recent patients. Press enter to access and then use the up and down arrows to view options.',
            orderIndex: 0,
            key: 'RecentPatientApplicationHeaderIcon',
            view: AlertDropdown,
            shouldShow: function() {
                return (ADK.UserService.hasPermissions('read-patient-record'));
            }
        });
    }

    return {
        AlertDropdown: AlertDropdown,
        DropdownListView: DropdownListView,
        register: register
    };
});