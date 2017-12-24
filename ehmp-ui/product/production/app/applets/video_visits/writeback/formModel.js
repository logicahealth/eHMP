define([
    'backbone',
    'underscore',
    'handlebars',
    'moment'
], function(Backbone, _, Handlebars, Moment) {
    "use strict";

    var createAppointmentModel = Backbone.Model.extend({
        defaults: {
            additionalInstructionsOption: 'no',
            appointmentDuration: '20',
            loading: true
        },
        initialize: function() {
            this.patient = ADK.PatientRecordService.getCurrentPatient();
            if (this.patient) {
                this.set('pid', this.patient.get('pid'));
            }
            this.currentUser = ADK.UserService.getUserSession();
            if (this.currentUser) {
                this.siteCode = this.currentUser.get('site');
                this.provider = this.currentUser.get('duz')[this.siteCode];
                this.set('provider', this.provider);
            }

            this.set('providerName', this.currentUser.get('displayName'));
        },
        validate: function(attributes, options) {
            this.errorModel.clear();

            this.validateAppointmentDate();
            this.validateAppointmentTime();
            this.validateAppointmentDuration();
            this.validateEmailAddress('patientEmail');
            if (!_.isEmpty(this.get('patientPhone'))) {
                this.validatePhoneNumber('patientPhone');
            }

            this.validateEmailAddress('providerEmail');
            this.validatePhoneNumber('providerPhone');

            if (this.get('additionalInstructionsOption') === 'yes') {
                if (_.isEmpty(this.get('instructionsList'))) {
                    this.errorModel.set('instructionsList', 'Instructions not selected.');
                } else if (this.get('instructionsList') === 'Other') {
                    if (_.isEmpty(this.get('instructionsToPatient'))) {
                        this.errorModel.set('instructionsToPatient', 'No instructions provided.');
                    }
                }
            }

            if (!_.isEmpty(this.errorModel.toJSON())) {
                return "Validation errors. Please fix.";
            }
        },
        validateAppointmentDate: function() {
            var fieldName = 'appointmentDate';
            var date = this.get(fieldName);
            this.errorModel.unset(fieldName);
            if (!(new Moment(date, 'MM/DD/YYYY').isValid())) {
                this.errorModel.set(fieldName, 'Invalid date');
                return;
            }

            if (_.isEmpty(date)) {
                this.errorModel.set(fieldName, 'Field cannot be left blank');
                return;
            }

            var selectedDate = new Moment(date, 'MM/DD/YYYY');
            if (selectedDate.isBefore(new Moment(), 'day')) {
                this.errorModel.set(fieldName, 'Cannot select a date in the past');
                return;
            }

            var lastDate = new Moment().add(90, 'day');
            if (selectedDate.isAfter(lastDate, 'day')) {
                this.errorModel.set(fieldName, 'Date must occur within the next 90 days');
                return;
            }
        },
        validateAppointmentTime: function() {
            var timeFieldName = 'appointmentTime';
            var time = this.get(timeFieldName);
            this.errorModel.unset(timeFieldName);
            if (_.isEmpty(time)) {
                this.errorModel.set(timeFieldName, 'Field cannot be left blank');
                return;
            }

            var dateFieldName = 'appointmentDate';
            var date = this.get(dateFieldName);
            var dateTime;
            if (!_.isEmpty(date) && new Moment(date, 'MM/DD/YYYY').isValid()) {
                dateTime = new Moment(date + time, 'MM/DD/YYYYHH:mm');

                var currentDateTime = new Moment();
                if (dateTime.isSameOrBefore(currentDateTime)) {
                    var minDateTime = new Moment();
                    minDateTime.hours(currentDateTime.hours());
                    minDateTime.seconds(0);
                    var intervals = Math.floor(currentDateTime.minutes() / 15);
                    if (intervals === 0) {
                        minDateTime.subtract(1, 'hours');
                        intervals = 4;
                    }

                    if (currentDateTime.minutes() % 15 === 0) {
                        intervals = intervals - 1;
                    }

                    minDateTime.minutes((intervals) * 15);
                    if (dateTime.isBefore(minDateTime, 'minute')) {
                        this.errorModel.set(timeFieldName, 'Time cannot be more than 15 minutes in the past');
                        return;
                    }
                }
            } else {
                dateTime = new Moment(time, 'HH:mm');
            }

            if (dateTime.minutes() % 15 !== 0) {
                this.errorModel.set(timeFieldName, 'Time must be in 15 minute increments)');
                return;
            }
        },
        validateAppointmentDuration: function() {
            this.errorModel.unset('appointmentDuration');
            if (_.isEmpty(this.get('appointmentDuration'))) {
                this.errorModel.set('appointmentDuration', 'Field cannot be left blank');
            }
        },
        stripPhoneNumber: function(number) {
            if (number) {
                return number.replace(/\D/g, '');
            }
            return '';
        },
        formatPhoneNumber: function(number) {
            return ADK.utils.stringUtils.formatPhoneNumber(number);
        },
        validatePhoneNumber: function(fieldName) {
            var phoneNumberExp = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
            var phoneNumber = this.get(fieldName);
            this.errorModel.unset(fieldName);
            if (_.isEmpty(phoneNumber)) {
                this.errorModel.set(fieldName, 'Field cannot be left blank');
            } else if (!phoneNumber.match(phoneNumberExp)) {
                this.errorModel.set(fieldName, 'Invalid phone number');
            }
        },
        validateEmailAddress: function(fieldName) {
            var emailAddress = this.get(fieldName);
            this.errorModel.unset(fieldName);
            var isValid = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(emailAddress);
            if (!isValid) {
                this.errorModel.set(fieldName, 'Invalid email');
            }
        }
    });

    return createAppointmentModel;
});
