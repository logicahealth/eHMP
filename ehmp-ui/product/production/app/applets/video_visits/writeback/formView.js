/* global ADK */
define([
    'backbone',
    'marionette',
    'jquery',
    'underscore',
    'handlebars',
    'moment',
    'app/applets/video_visits/writeback/formFields'
], function(Backbone, Marionette, $, _, Handlebars, Moment, FormFields) {
    "use strict";

    var FormView = ADK.UI.Form.extend({
        ui: {
            appointmentDate: '.appointmentDate',
            appointmentTime: '.appointmentTime',
            cancelButton: '#cancelButton',
            createButton: '#createButton',
            dynamicFields: '.instructionsList, .instructionsToPatient',
            dynamicRequiredFields: '.instructionsList, .instructionsToPatient',
            editableInputFields: '.appointment-information .form-group:not(.providerName)',
            errorMessage: '.errorMessage',
            instructionsList: '.instructionsList',
            instructionsToPatient: '.instructionsToPatient',
            phoneInputs: '.providerPhone input, .patientPhone input'
        },
        fields: FormFields,
        basicRequiredFields: ['appointmentDate', 'appointmentTime', 'appointmentDuration', 'patientEmail', 'providerEmail', 'providerPhone'],
        instructionsEvents: {
            'read:success': function(collection, resp, options) {
                this.ui.instructionsList.trigger('control:picklist:set', [collection.toJSON()]);
            }
        },
        patientDemographicsEvents: {
            'read:success': function(collection, resp, options) {
                var patientDemographicsObjValues = {};
                if (!collection.isEmpty()) {
                    patientDemographicsObjValues = collection.at(0).toJSON();
                    _.set(patientDemographicsObjValues, 'isPatientContactInfoChanged', false);

                    var phones = _.get(patientDemographicsObjValues, 'phones');
                    var patientPhoneInfo = {};
                    if (_.isArray(phones) && !_.isEmpty(phones)) {
                        patientPhoneInfo = {
                            patientPhone: this.model.formatPhoneNumber(_.get(phones, '[0].number')),
                            patientPhoneType: _.get(phones, '[0].type')
                        };
                    }
                    this.model.set(_.extend(patientPhoneInfo, {
                        'patientEmail': _.get(patientDemographicsObjValues, 'emailAddress')
                    }));
                }
                this.patientDemographicsObj = new ADK.UIResources.Writeback.VideoVisits.PatientDemographics.Model(patientDemographicsObjValues);
                this.setupEntityEvents(this.patientDemographicsObj, 'patientDemographicsObj', true);
            },
            'read:error': function() {
                this.patientProfileServiceError = true;
                ADK.Messaging.getChannel('video_visits').trigger('patient:demographics:load:error');
            }
        },
        providerContactsEvents: {
            'read:success': function(collection, resp, options) {
                var providerContactInfoValues = {};
                if (!collection.isEmpty()) {
                    providerContactInfoValues = collection.at(0).toJSON();
                    this.model.set({
                        providerEmail: _.get(providerContactInfoValues, 'email'),
                        providerPhone: this.model.formatPhoneNumber(_.get(providerContactInfoValues, 'phone'))
                    });
                }
                this.providerContactInfo = new ADK.UIResources.Writeback.VideoVisits.ProviderContactInfo.Model(providerContactInfoValues);
                this.setupEntityEvents(this.providerContactInfo, 'providerContactInfo', true);
            }
        },
        timezonesEvents: {
            'read:success': function(collection, resp, options) {
                this.timezoneModel = collection.at(0);
                if (!this.timezoneModel) {
                    this.timezoneModel = new Backbone.Model();
                    return;
                }
                this.ui.appointmentTime.trigger('control:update:config', { label: 'Time (' + this.timezoneModel.get('timezone') + ')' });
            },
            'read:error': function() {
                this.model.set('errorMessage', 'Could not retrieve provider timezone information. Please try again later.');
            }
        },
        patientDemographicsObjEvents: {
            'error': function(model, response, options) {
                this.model.trigger('save:error', model, response);
            },
            'sync': function(model, response, options) {
                model.unset('isPatientContactInfoChanged');
                if (!this.patientDemographics.isEmpty()) {
                    this.patientDemographics.shift();
                    this.patientDemographics.unshift(model);
                } else {
                    var values = {};
                    var _id = _.get(resp, 'data.items[0]._id');
                    if (_id) {
                        _.set(values, '_id', _id);
                    }

                    var createdDate = _.get(resp, 'data.items[0].createdDate');
                    if (createdOn) {
                        _.set(values, 'createdDate', createdDate);
                    }

                    model.set(values);
                    this.patientDemographics.add(model);
                }

                if (this.providerContactInfo.hasChanged()) {
                    this.providerContactInfo.save();
                } else {
                    this.createVideoVisit();
                }
            }
        },
        providerContactInfoEvents: {
            'error': function(model, response, options) {
                this.model.trigger('save:error', model, response);
            },
            'sync': function(model, response, options) {
                if (!this.providerContacts.isEmpty()) {
                    this.providerContacts.shift();
                    this.providerContacts.unshift(model);
                } else {
                    var values = {};
                    var _id = _.get(resp, 'data.items[0]._id');
                    if (_id) {
                        _.set(values, '_id', _id);
                    }

                    var createdDate = _.get(resp, 'data.items[0].createdDate');
                    if (createdOn) {
                        _.set(values, 'createdDate', createdDate);
                    }

                    model.set(values);
                    this.providerContacts.add(model);
                }

                this.createVideoVisit();
            }
        },
        appointmentModelEvents: {
            'error': function(model, response, options) {
                this.model.trigger('save:error', model, response);
            },
            'sync': function(model, response, options) {
                this.model.trigger('save:success', this.model, response);
            }
        },
        requiredFetches: {},
        onInitialize: function() {
            var currentPatient = ADK.PatientRecordService.getCurrentPatient();
            this.instructions = new ADK.UIResources.Picklist.VideoVisits.Instructions({
                patient: currentPatient
            });
            this.setupEntityEvents(this.instructions, 'instructions');
            this.timezones = new ADK.UIResources.Fetch.VideoVisits.Timezone({
                patient: currentPatient
            });
            this.setupEntityEvents(this.timezones, 'timezones');
            this.patientDemographics = new ADK.UIResources.Fetch.VideoVisits.PatientDemographics({
                patient: currentPatient
            });
            this.setupEntityEvents(this.patientDemographics, 'patientDemographics');
            this.providerContacts = new ADK.UIResources.Fetch.VideoVisits.ProviderContactInfo({
                patient: currentPatient
            });
            this.setupEntityEvents(this.providerContacts, 'providerContacts');

            this.allRequiredFetchesPromise = $.when.apply(null, _.values(this.requiredFetches));
            this.allRequiredFetchesPromise.done(_.bind(function() {
                this.model.set('loading', false);
                this.startChangeListeners();
                this.$el.trigger('tray.loaderHide');

            }, this)).fail(_.bind(function() {
                this.model.trigger('change:serverSideError');
                this.triggerMethod('abort');
            }, this));
            this.timezones.fetch();
            this.patientDemographics.fetch();
            this.providerContacts.fetch();
            this.instructions.fetch();
        },
        setupEntityEvents: function(entity, entityName, skipPromise) {
            if (!(entity instanceof Backbone.Collection || entity instanceof Backbone.Model) || (!_.isString(entityName) && _.isEmpty(entityName))) return;
            if (!_.isEmpty(this.getOption(entityName + 'Events'))) {
                this.bindEntityEvents(entity, this.getOption(entityName + 'Events'));
            }
            if (!skipPromise) {
                this.bindEntityEvents(entity, {
                    'read:success': function(collection) {
                        _.result(this, ('requiredFetches.' + entityName + 'Deferred.resolve'));
                    },
                    'read:error': function() {
                        _.result(this, ('requiredFetches.' + entityName + 'Deferred.reject'));
                    }
                });
                this.requiredFetches[entityName + 'Deferred'] = $.Deferred();
            }
            this.listenTo(this, 'before:destroy', _.partial(this.unbindEntityEvents, entity));
            this.listenTo(this, 'abort', _.partial(this.abort, entity));
        },
        abort: function(collection) {
            if (collection.xhr) collection.xhr.abort();
        },
        onDestroy: function() {
            this.$el.trigger('tray.loaderHide');
            this.unregisterChecks();
            this.triggerMethod('abort');
            delete this.requiredFetches;
        },
        onBeforeShow: function() {
            this.ui.appointmentDate.trigger('control:endDate', new Moment().add(90, 'days'));
        },
        startChangeListeners: function() {
            this.listenToOnce(this.model, 'change.inputted', this.registerChecks);
            this.listenTo(this.model, 'change', this.adjustCreateButtonProperties);
        },
        handleInput: function(e) {
            this.makeButtonDependOnRequiredFields(this.ui.createButton);
        },
        adjustCreateButtonProperties: function() {
            var errorMessage = this.model.get('errorMessage');
            if (_.isEmpty(errorMessage)) {
                this.makeButtonDependOnRequiredFields(this.ui.createButton);
            }
        },
        onAttach: function() {
            if (this.model.get('loading')) {
                this.$el.trigger('tray.loaderShow', {
                    loadingString: 'Loading'
                });
            }
            this.addInputMasking();
        },
        addInputMasking: function() {
            this.ui.phoneInputs.inputmask("(999) 999-9999");
        },
        registerChecks: function() {
            var checkOptions = {
                id: 'video-visit-creation-in-progress',
                label: 'Video Visit',
                failureMessage: 'Video Visit Appointment Creation In Progress! Any unsaved changes will be lost if you continue.',
                onContinue: _.bind(function() {
                    this.workflow.close();
                }, this)
            };
            ADK.Checks.register([new ADK.Navigation.PatientContextCheck(checkOptions)]);
        },
        unregisterChecks: function() {
            ADK.Checks.unregister({
                id: 'video-visit-creation-in-progress'
            });
        },
        events: {
            'video-visit-add-confirm-cancel': function() {
                this.workflow.close();
            },
            'submit': function(e) {
                e.preventDefault();
                this.submitForm();
                return false;
            },
            'input': 'handleInput',
            'form:view:updated:bound:ui:elements': 'addInputMasking'
        },
        submitForm: function() {
            this.model.unset('errorMessage');
            if (this.model.isValid()) {
                this.enableInputFields(false);
                this.enableFooterButtons(false);

                this.checkServerSideValidations();
            } else {
                this.transferFocusToFirstError();
            }
        },
        checkServerSideValidations: function() {
            //Check for an occurrence of a server side error. If we don't check for the error, the
            //validation loop will spin out of control and never stop. Eventually, we can replace
            //this with the Deferred "fail()" check mechanism.
            if (this.model.get('serverSideError')) {
                return;
            }
            var errorMessage = this.model.get('errorMessage');
            if (errorMessage === undefined) {
                this.proceedToSave();
            } else {
                this.enableInputFields(true);
                this.hideInProgress();
                this.enableFooterButtons(true);
                this.enableCancelButton(true);
            }
        },
        onServerSideError: function() {
            // Once a server-side errorez occurs, we disable everything except the cancel button. We also stop
            // listening to "enable" messages on all the form controls, since the server data retrieval code
            // implements a parallel asynchronous callback handler scheme which might cause fields to be
            // enabled over the top of this code. Eventually, we should move this into a mixin or a behavior.
            this.ui.editableInputFields.trigger('control:disabled', true);
            this.enableFooterButtons(false);
            this.enableCancelButton(true);
            this.ui.errorMessage.trigger('control:update:config', {
                title: 'System Error',
                icon: 'fa-exclamation-circle'
            });
            if (!this.model.get('errorMessage')) {
                this.model.set('errorMessage', 'Unable to complete your action at this time due to a system error. Try again later.');
            }
            this.hideInProgress();

        },
        createVideoVisit: function() {
            var values = {
                appointmentDateTime: new Moment(this.model.get('appointmentDate') + this.model.get('appointmentTime'), 'MM/DD/YYYYHH:mm'),
                bookingNotes: this.model.get('comment'),
                duration: parseInt(this.model.get('appointmentDuration')),
                timezone: this.timezoneModel.get('timezone'),
                patient: {
                    phone: this.model.stripPhoneNumber(this.model.get('patientPhone')),
                    email: this.model.get('patientEmail')
                },
                provider: {
                    phone: this.providerContactInfo.get('phone'),
                    email: this.providerContactInfo.get('email')
                }
            };

            if (_.isEqual(this.model.get('additionalInstructionsOption'), 'yes')) {
                _.extend(values, {
                    instructionsTitle: this.model.get('instructionsList'),
                    instruction: this.model.get('instructionsToPatient'),
                    instructionsOther: _.isEqual(this.model.get('instructionsList'), 'Other')
                });
            }
            var appointmentModel = new ADK.UIResources.Writeback.VideoVisits.Appointment.Model(null, { _initialValues: values, parse: true });
            this.setupEntityEvents(appointmentModel, 'appointmentModel', true);
            appointmentModel.save();
        },
        createAppointment: function() {
            if (this.patientDemographicsObj.get('isPatientContactInfoChanged')) {
                this.patientDemographicsObj.save();
            } else if (this.providerContactInfo.hasChanged()) {
                this.providerContactInfo.save();
            } else {
                this.createVideoVisit();
            }
        },
        proceedToSave: function() {
            this.showInProgress('Creating Video Visit Appointment');
            this.createAppointment(this);
        },
        refreshApplet: function() {
            var channel = ADK.Messaging.getChannel('video_visits');
            if (!_.isUndefined(channel)) {
                channel.trigger('load:appointments');
            }
        },
        hideDynamicFields: function() {
            this.ui.dynamicFields.trigger('control:hidden', true);
        },
        enableCancelButton: function(enabled) {
            this.ui.cancelButton.trigger('control:disabled', !enabled);
        },
        resetDynamicRequiredFields: function() {
            this.ui.dynamicRequiredFields.trigger('control:required', false);
        },
        enableInputFields: function(enabled) {
            this.ui.editableInputFields.trigger('control:disabled', !enabled);
        },
        enableFooterButtons: function(enabled) {
            this.ui.createButton.trigger('control:disabled', !enabled);
        },
        showInProgress: function(message) {
            this.$el.trigger('tray.loaderShow', {
                loadingString: message
            });
        },
        hideInProgress: function() {
            this.$el.trigger('tray.loaderHide');
        },
        validateAppointmentDate: function() {
            this.model.errorModel.unset('appointmentDate');
            if (!_.isEmpty(this.model.get('appointmentDate'))) {
                this.model.validateAppointmentDate();
            }
            this.validateAppointmentTime();
        },
        validateAppointmentTime: function() {
            this.model.errorModel.unset('appointmentTime');
            if (!_.isEmpty(this.model.get('appointmentTime'))) {
                this.model.validateAppointmentTime();
            }
        },
        validatePhoneNumber: function(fieldName) {
            var phoneNumber = this.model.get(fieldName);
            this.model.errorModel.unset(fieldName);
            if (!_.isEmpty(phoneNumber)) {
                this.model.validatePhoneNumber(fieldName);
            }
        },
        validateEmailAddress: function(fieldName) {
            var emailAddress = this.model.get(fieldName);
            this.model.errorModel.unset(fieldName);
            if (!_.isEmpty(emailAddress)) {
                this.model.validateEmailAddress(fieldName);
            }
        },
        validatePatientEmail: function() {
            if (this.model.get('loading')) {
                return;
            }
            this.validateEmailAddress('patientEmail');
            if (!this.patientProfileServiceError && this.patientDemographicsObj) {
                this.patientDemographicsObj.set({
                    emailAddress: this.model.get('patientEmail'),
                    isPatientContactInfoChanged: true
                });
            }
        },
        validatePatientPhone: function() {
            if (this.model.get('loading')) {
                return;
            }
            this.validatePhoneNumber('patientPhone');
            if (!this.patientProfileServiceError && this.patientDemographicsObj) {
                var phones = this.patientDemographicsObj.get('phones');
                _.set(phones, '[0].number', this.model.stripPhoneNumber(this.model.get('patientPhone')));
                this.patientDemographicsObj.set({
                    phones: phones,
                    isPatientContactInfoChanged: true
                });
            }
        },
        handlePatientPhoneType: function() {
            if (this.model.get('loading')) {
                return;
            }

            if (!this.patientProfileServiceError && this.patientDemographicsObj) {
                var phones = this.patientDemographicsObj.get('phones');
                _.set(phones, '[0].type', this.model.get('patientPhoneType'));
                this.patientDemographicsObj.set({
                    phones: phones,
                    isPatientContactInfoChanged: true
                });
            }
        },
        validateProviderEmail: function() {
            if (this.model.get('loading')) {
                return;
            }

            this.validateEmailAddress('providerEmail');
            if (this.providerContactInfo) {
                this.providerContactInfo.set('email', this.model.get('providerEmail'));
            }
        },
        validateProviderPhone: function() {
            if (this.model.get('loading')) {
                return;
            }

            this.validatePhoneNumber('providerPhone');
            if (this.providerContactInfo) {
                this.providerContactInfo.set('phone', this.model.stripPhoneNumber(this.model.get('providerPhone')));
            }
        },
        validateAppointmentDuration: function() {
            this.model.validateAppointmentDuration();
        },
        modelEvents: {
            'change:serverSideError': 'onServerSideError',
            'change:appointmentDate': 'validateAppointmentDate',
            'change:appointmentTime': 'validateAppointmentTime',
            'change:appointmentDuration': 'validateAppointmentDuration',
            'change:patientEmail': 'validatePatientEmail',
            'change:patientPhone': 'validatePatientPhone',
            'change:patientPhoneType': 'handlePatientPhoneType',
            'change:providerEmail': 'validateProviderEmail',
            'change:providerPhone': 'validateProviderPhone',
            'change:additionalInstructionsOption': function(model) {
                if (model.get('additionalInstructionsOption') === 'yes') {
                    this.ui.instructionsList.trigger('control:required', true);
                    this.ui.instructionsList.trigger('control:hidden', false);
                    if (_.isEmpty(model.get('instructionsList'))) {
                        this.ui.instructionsToPatient.trigger('control:hidden', true);
                    } else {
                        this.ui.instructionsToPatient.trigger('control:hidden', false);
                        if (model.get('instructionsList') === 'Other') {
                            this.ui.instructionsToPatient.trigger('control:required', true);
                        }
                    }
                } else {
                    this.ui.instructionsList.trigger('control:required', false);
                    this.ui.instructionsList.trigger('control:hidden', true);
                    this.ui.instructionsToPatient.trigger('control:required', false);
                    this.ui.instructionsToPatient.trigger('control:hidden', true);
                }
            },
            'change:instructionsList': function(model) {
                if (model.get('instructionsList') === '') {
                    this.ui.instructionsToPatient.trigger('control:hidden', true);
                } else {
                    this.ui.instructionsToPatient.trigger('control:hidden', false);
                    if (model.get('instructionsList') === 'Other') {
                        this.model.set('instructionsToPatient', '');
                        this.ui.instructionsToPatient.trigger('control:update:config', {
                            readonly: false,
                            required: true
                        });
                    } else {
                        var instructionModel = this.instructions.findWhere({ title: model.get('instructionsList') });
                        this.model.set('instructionsToPatient', instructionModel.get('instruction'));
                        this.ui.instructionsToPatient.trigger('control:update:config', {
                            readonly: true,
                            required: false
                        });
                    }
                }
            },
            'save:error': function() {
                this.model.set('errorMessage', 'The Video Appointment could not be created. If the server is unavailable you will be unable to create an appointment. You can try again later or try to create the appointment now.');
                this.enableInputFields(true);
                this.enableCancelButton(true);
                this.hideInProgress();
                this.enableFooterButtons(true);
            },
            'save:success': function(model) {
                this.enableInputFields(true);
                this.enableCancelButton(true);
                this.hideInProgress();
                this.unregisterChecks();
                this.workflow.close();
                this.refreshApplet();

                var saveAlertView = new ADK.UI.Notification({
                    title: 'Success',
                    message: 'Appointment successfully booked. Confirmation emails have been sent to Patient and Provider.',
                    type: "success"
                });
                saveAlertView.show();
            }
        },
        makeButtonDependOnRequiredFields: function(button) {
            if (_.every(this.basicRequiredFields, function(fieldName) {
                    if (_.isEmpty(this.$('.' + fieldName + ' input,select').val())) {
                        return false;
                    }
                    return true;
                }, this)) {
                if (this.model.get('additionalInstructionsOption') === 'yes' &&
                    (_.isEmpty(this.model.get('instructionsList')) || (this.model.get('instructionsList') === 'Other' && _.isEmpty(this.model.get('instructionsToPatient'))))) {
                    button.trigger('control:disabled', true);
                } else {
                    button.trigger('control:disabled', false);
                }
            } else {
                button.trigger('control:disabled', true);
            }

            if (!_.isEmpty(this.model.errorModel.attributes) || !_.isEmpty(this.model.get('errorMessage'))) {
                button.trigger('control:disabled', true);
            }
        }
    });

    return FormView;

});
