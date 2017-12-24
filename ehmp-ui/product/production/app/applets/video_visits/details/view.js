define([
    'backbone',
    'marionette',
    'underscore',
    'hbs!app/applets/video_visits/details/templates/details',
    'app/applets/video_visits/details/additionalInstructionsAlert'
], function(Backbone, Marionette, _, DetailsTemplate, AdditionalInstructionsAlert) {
    'use strict';

    var ModalView = Backbone.Marionette.ItemView.extend({
        template: DetailsTemplate,
        ui: {
            AdditionalInstructionsLink: 'button[data-link="additional-instructions"]'
        },
        events: {
            'click @ui.AdditionalInstructionsLink': 'onAdditionalInstructions'
        },
        templateHelpers: function() {
            var patient = _.get(this.model.get('patients'), 'patient[0]');
            var provider = _.get(this.model.get('providers'), 'provider[0]');
            return {
                phoneNumber: _.get(patient, 'contactInformation.mobile'),
                emailAddress: _.get(patient, 'contactInformation.preferredEmail'),
                firstName: _.get(patient, 'name.firstName'),
                lastName: _.get(patient, 'name.lastName'),
                providerFirstName: _.get(provider, 'name.firstName'),
                providerLastName: _.get(provider, 'name.lastName'),
                commaSeparate: function(item1, item2, separator) {
                    separator = separator || ', ';
                    var formattedString = _.isString(item1) ? item1 : '';
                    if (_.isString(item2) && !_.isEmpty(item2)) {
                        formattedString += !_.isEmpty(item1) ? separator : '';
                        formattedString += item2;
                    }
                    return formattedString;
                },
                stripPhoneNumber: function(number) {
                    if (number) {
                        return number.replace(/\D/g, '');
                    }
                    return '';
                },
                comments: function() {
                    return this.bookingNotes;
                },
                facility_clinic: function() {
                    return this.commaSeparate(this.facility, this.clinic);
                },
                displayName: function() {
                    return this.commaSeparate(this.lastName, this.firstName);
                },
                providerName: function() {
                    return this.commaSeparate(this.providerLastName, this.providerFirstName);
                },
                emergencyContactFormatted: function() {
                    var emergencyContact = this.emergencyContact;
                    var firstName = _.get(emergencyContact, 'firstName');
                    var lastName = _.get(emergencyContact, 'lastName');
                    var emergencyContactPhoneNumber = ADK.utils.stringUtils.formatPhoneNumber(this.stripPhoneNumber(_.get(emergencyContact, 'phones[0].number')));
                    return this.commaSeparate(this.commaSeparate(firstName, lastName, ' '), emergencyContactPhoneNumber);
                }
            };
        },
        modelEvents: {
            'change:emergencyContact': 'render'
        },
        emergencyContactInfoEvents: {
            'read:success': function(collection) {
                if (!collection.isEmpty()) {
                    var contacts = collection.at(0).get('contacts');
                    if (_.isArray(contacts)) {
                        this.model.set('emergencyContact', _.find(contacts, { "type": "Emergency" }));
                    }
                }
            }
        },
        initialize: function(options) {
            var currentPatient = ADK.PatientRecordService.getCurrentPatient();
            this.emergencyContactInfo = new ADK.UIResources.Fetch.VideoVisits.PatientEmergencyContact({
                patient: currentPatient
            });
            this.bindEntityEvents(this.emergencyContactInfo, this.getOption('emergencyContactInfoEvents'));
            this.emergencyContactInfo.fetch();
        },
        onDestroy: function() {
            this.unbindEntityEvents(this.emergencyContactInfo, this.getOption('emergencyContactInfoEvents'));
        },
        onAdditionalInstructions: function() {
            var alert = new AdditionalInstructionsAlert({
                model: this.model
            });
            alert.show();
        }
    });

    return ModalView;
});
