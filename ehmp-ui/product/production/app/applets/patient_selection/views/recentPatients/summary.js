define([
    'backbone',
    'handlebars',
    'hbs!app/applets/patient_selection/templates/recentPatient/listItem',
    'hbs!app/applets/patient_selection/templates/recentPatient/list'
], function(Backbone, Handlebars, recentPatientDropDownRowTemplate, recentPatientDropDownTemplate) {
    'use strict';

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