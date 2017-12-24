define([
    'underscore',
    'backbone'
], function(
    _,
    Backbone
) {
    'use strict';

    var Appointment = ADK.Models.BaseModel.extend({
        defaults: {
            schedulingRequestType: 'NEXT_AVAILABLE_APPT',
            type: 'REGULAR',
            appointmentKind: 'ADHOC',
            patients: {},
            providers: {}
        },
        fetchOptions: function() {
            return {
                resourceTitle: 'video-visit-appointments-post'
            };
        },
        save: function() {
            var patientCriteria = ADK.utils.patient.setPatientFetchParams(ADK.PatientRecordService.getCurrentPatient(), patientCriteria) || {};
            this.set(_.get(patientCriteria, 'criteria', {}), { silent: true });
            ADK.Models.BaseModel.prototype.save.apply(this, arguments);
        },
        parse: function(data, options) {
            var initialValues = _.get(options, '_initialValues', {});
            if (initialValues) {
                var currentPatient = ADK.PatientRecordService.getCurrentPatient();
                var patientICN = currentPatient.get('icn');
                var words = _.words(currentPatient.get('displayName'));
                var patientLastName = words[0] || '';
                var patientFirstName = words[1] || '';
                var timezone = _.get(initialValues, 'timezone');
                var userSession = ADK.UserService.getUserSession();
                var site = userSession.get('site');
                var userIen = userSession.get('duz')[site];
                var appointmentDateTime = _.get(initialValues, 'appointmentDateTime');
                initialValues = _.extend({
                    dateTime: appointmentDateTime,
                    desiredDate: appointmentDateTime,
                    patients: {
                        patient: [{
                            id: {
                                assigningAuthority: "ICN",
                                uniqueId: patientICN
                            },
                            name: {
                                firstName: patientFirstName,
                                lastName: patientLastName
                            },
                            contactInformation: {
                                mobile: _.get(initialValues, 'patient.phone'),
                                preferredEmail: _.get(initialValues, 'patient.email'),
                                timeZone: timezone
                            },
                            location: {
                                type: 'NonVA',
                                facility: {
                                    name: userSession.get('facility'),
                                    siteCode: userSession.get('division'),
                                    timeZone: timezone
                                }
                            }
                        }]
                    },
                    providers: {
                        provider: [{
                            id: {
                                assigningAuthority: 'ICN', //this value is set temporarily to make it work. Once validation code is removed from video visit resource, it should be set to 'dfn'
                                uniqueId: userIen
                            },
                            name: {
                                firstName: userSession.get('firstname'),
                                lastName: userSession.get('lastname')
                            },
                            contactInformation: {
                                mobile: _.get(initialValues, 'provider.phone'),
                                preferredEmail: _.get(initialValues, 'provider.email'),
                                timeZone: timezone
                            },
                            location: {
                                type: "VA",
                                facility: {
                                    name: userSession.get('facility'),
                                    siteCode: userSession.get('division'),
                                    timeZone: timezone
                                }
                            }
                        }]
                    }
                }, _.pick(initialValues, ['duration', 'bookingNotes', 'instructionsTitle', 'instruction', 'instructionsOther']));
            }
            return _.extend({}, data, initialValues);
        }
    });
    return Appointment;
});
