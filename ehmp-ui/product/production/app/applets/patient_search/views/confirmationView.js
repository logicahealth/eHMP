define([
    "backbone",
    "marionette",
    "underscore",
    "handlebars",
    "hbs!app/applets/patient_search/templates/confirmationTemplate",
    "hbs!app/applets/patient_search/templates/acknowledgeTemplate",
    "hbs!app/applets/patient_search/templates/patientFlagTemplate",
    "hbs!app/applets/patient_search/templates/common/blankTemplate"
], function(Backbone, Marionette, _, Handlebars, confirmationTemplate, acknowledgeTemplate, patientFlagTemplate, blankTemplate) {
    'use strict';
    var ConfirmationView = Backbone.Marionette.ItemView.extend({
        template: blankTemplate,
        behaviors: {
            Tooltip: {}
        },
        attributes: {
            'id': 'confirmSection'
        },
        events: {
            'click button#ackButton': 'ackPatient',
            'click button#confirmFlaggedPatinetButton': 'confirmPatient',
            'click button#confirmationButton': 'onClickOfConfirm'
        },
        initialize: function(options) {
            this.searchApplet = options.searchApplet;
            this.patientSearchChannel = ADK.Messaging.getChannel('patient_search');
            var that = this;
            var siteOptions = {
                resourceTitle: 'authentication-list',
                cache: true
            };
            siteOptions.onError = function(resp) {};
            siteOptions.onSuccess = function(collection, resp) {
                that.sites = collection;
            };
            ADK.ResourceService.fetchCollection(siteOptions);
        },
        updateSelectedPatientModel: function(patient) {
            this.currentPatient = patient.get('pid');
            this.showLoading();
            patient.on('change:patientImage', this.currentPatientChanged, this);
            if (this.model && this.model.attributes.fullName) {
                this.patientSearchChannel.stopComplying('confirm_' + this.model.get('pid'));
                this.model.clear();
            } else {
                this.model = new Backbone.Model();
            }

            var searchOptions = {
                resourceTitle: 'authorize-authorize',
                patient: patient
            };
            if (patient.has('acknowledged')) {
                patient.unset('acknowledged');
            }

            var self = this;
            var imageFetchOptions = {
                pid: patient.get('icn') || patient.get('pid')
            };
            searchOptions.onError = function(resp) {
                self.model.set(patient.attributes);

                if ((resp.status == 307) || (resp.status == 308)) {
                    var message;
                    try {
                        message = JSON.parse(resp.responseText).message;
                    } catch (e) {
                        message = resp.responseText;
                    }
                    self.model.set({
                        'ackTitle': "Restricted Record",
                        'ackMessage': message.replace(/\s*(\*{3}.*?\*{3})|(?:[*\s]*([^*\s]+ ?)[*\s]*)/g, '$2')
                    });
                    self.showConfirm(acknowledgeTemplate);
                } else if (resp.status == 403) {
                    self.showUnAuthorized();
                } else {
                    self.template = Handlebars.compile('<br /><div aria-live="assertive"><p class="error-message padding" role="alert">' + ADK.ErrorMessaging.getMessage(resp.status) + ' </p></div>');
                    self.render();
                }
            };
            searchOptions.onSuccess = function(resp) {
                self.model.set(patient.attributes);
                self.searchApplet.getPatientPhoto(self.model, imageFetchOptions);
                self.listenTo(self.model, 'change:patientImage', self.refreshPatientPhoto);
                self.showConfirm(confirmationTemplate);
            };
            ADK.PatientRecordService.fetchResponseStatus(searchOptions);
        },
        nonSensitivePatientChanged: function(event) {
            this.render();
        },
        refreshPatientPhoto: function() {
            $('#patient-image').html('<img src="' + this.model.get('patientImage') + '" class="animated fadeIn" alt="Patient Image" />');
        },
        getFullSSN: function(patientModel) {
            var searchOptions = {
                resourceTitle: 'patient-search-pid',
                patient: patientModel
            };
            var self = this;
            searchOptions.onSuccess = function(resp) {
                if (resp.length > 0) {
                    self.model.set('ssn', resp.models[0].get('ssn'));
                    self.model.set('birthDate', resp.models[0].get('birthDate'));
                    self.render();
                } else {
                    console.log("Error when retrieving full ssn for: " + self.model.get('displayName'));
                    self.render();
                }
            };
            ADK.PatientRecordService.fetchCollection(searchOptions);
        },
        maskSSN: function(patientModel) {
            var maskedSSN = patientModel.get('ssn').toString().replace(/(?=\d{5})\d/gmi, '*');
            patientModel.set('ssn', maskedSSN);
        },
        updateTemplateToBlank: function() {
            this.template = blankTemplate;
            this.render();
            if (!this.$el.parent().hasClass("hidden")) {
                this.$el.parent().addClass("hidden");
            }
        },
        showUnAuthorized: function() {
            this.template = Handlebars.compile("<div class='unAuthorized well'><h4 class='text-danger'>You are not authorized to view this record.</h4><h4>Please select another patient.</h4></div>");
            this.render();
            this.$el.find('.unAuthorized').focus();
        },
        showConfirm: function(temp) {
            this.template = temp;
            this.getFullSSN(this.model); //gets the full ssn for the patient's model

            if (this.$el.find('#ackButton').is(':visible')) {
                this.$el.find('#ackMessagePanel').focus();
            } else {
                this.$el.find('#confirmationButton').focus();
            }
            $("#confirmSection").on('affixed.bs.affix', function() {
                $(this).addClass("col-md-3");
                $(this).parent().addClass("noPadding");

            });
            $("#confirmSection").on('affix-top.bs.affix', function() {
                if ($(this).hasClass('col-md-3')) {
                    $(this).removeClass('col-md-3');
                    $(this).parent().removeClass("noPadding");
                }
            });
            $('#confirmSection').affix({
                offset: {
                    top: 227
                }
            });
        },
        showLoading: function() {
            if (this.$el.parent().hasClass("hidden")) {
                this.$el.parent().removeClass("hidden");
            }
            this.template = Handlebars.compile('<h5 class="loading"><i class="fa fa-spinner fa-spin"></i> Loading...</h5>');
            this.render();
        },
        currentPatientChanged: function(event) {
            $("#imageSpinner").hide();
            this.render();
            if (this.model.get('acknowledged')) this.removeAcknowledgeBox();
        },
        ackPatient: function(event) {
            var patient = this.model;
            var imageFetchOptions = {
                pid: patient.get('icn') || patient.get('pid'),
                _ack: true
            };
            this.searchApplet.getPatientPhoto(patient, imageFetchOptions);
            this.listenTo(patient, 'change:patientImage', this.currentPatientChanged);
            this.model.set({
                'acknowledged': true
            });
            //Once acknowledge, refetch the patient information to remove masking
            var searchOptions = {
                resourceTitle: 'patient-search-pid',
                patient: patient
            };
            var self = this;
            searchOptions.onSuccess = function(resp) {
                if (resp.length > 0) {
                    self.model.set('ssn', resp.models[0].get('ssn'));
                    self.model.set('birthDate', resp.models[0].get('birthDate'));
                    self.render();
                }
                self.removeAcknowledgeBox();
            };
            ADK.PatientRecordService.fetchCollection(searchOptions);

        },
        removeAcknowledgeBox: function(event) {
            this.$el.find('#ackMessagePanel').removeClass('in');
            this.$el.find('#ackButton').addClass('hide');
            this.$el.find('.acknowledged').removeClass('hidden');
            this.$el.find('.patientDetails').removeClass('hidden');
            this.$el.find('#confirmationButton').removeClass('hidden');
            if (this.$el.find('#confirmationButton').is(':visible')) {
                this.$el.find('#ackMsgTitleId').focus();
            }
        },
        onClickOfConfirm: function(event) {
            var self = this;
            var confirmationView = this;
            this.maskSSN(this.model);
            if (this.model.get('idClass') === 'EDIPI') {
                var edipi = this.model.get('pid');
                var siteEdipi = 'DOD;' + edipi;
                this.model.set('pid', siteEdipi);
                confirmationView.currentPatient = siteEdipi;
            } else {
                this.model.set('icn', this.model.get('pid'));
            }
            var syncOptions = {
                resourceTitle: 'synchronization-status',
                patient: this.model
            };
            syncOptions.onSuccess = function(collection, resp) {};
            syncOptions.onError = function(collection, resp) {
                if (resp.status === 404) {
                    confirmationView.refreshPatientPhoto();
                    $(event.currentTarget).html("<i class='fa fa-spinner fa-spin'></i> <span> Syncing Patient Data...</span>");
                    $(event.currentTarget).addClass('disabled').attr('disabled');
                    confirmationView.$el.find('#screenReaderSyncing').addClass('sr-only').removeClass('hidden').focus();
                }
            };
            ADK.PatientRecordService.fetchCollection(syncOptions);

            var isImageLoaded = true;
            if (!this.model.get('patientImage')) {
                isImageLoaded = false;
            }
            var patientImageModel = new Backbone.Model({
                image: this.model.get('patientImage'),
                isImageLoaded: isImageLoaded
            });

            ADK.SessionStorage.set.sessionModel('patient-image', patientImageModel);

            $(event.currentTarget).button('loading');
            confirmationView.$el.find('#screenReaderLoading').addClass('sr-only').removeClass('hidden').focus();
            if (this.model.has('acknowledged')) {
                this.model.set({
                    'acknowledged': true
                });
            }
            var searchOptions = {
                resourceTitle: 'patient-record-patient',
                patient: this.model
            };
            searchOptions.onError = function(collection, resp) {
                var message = '';
                if (resp.message !== "" || resp.responseText !== "") {
                    try {
                        var responseText = JSON.parse(resp.responseText);
                        if (_.isObject(responseText.error)) {
                            message = responseText.error.message;
                        } else {
                            message = responseText.data.error.message;
                        }
                    } catch (error) {
                        message = ADK.ErrorMessaging.getMessage('default');
                    }
                } else {
                    message = ADK.ErrorMessaging.getMessage(resp.status);
                }
                var errorMessage = '<br><div aria-live="assertive"><p class="error-message padding" role="alert" tabindex="0">' + message;               
                errorMessage = errorMessage.concat(self.searchApplet.getSearchErrorMessage(resp), '</p></div>');               
                confirmationView.template = Handlebars.compile(errorMessage);
                confirmationView.render();
            };
            searchOptions.onSuccess = function(collection, resp) {
                var patientContext = self.getPatientContext(collection);
                var domainModel = new Backbone.Model({
                    data: collection,
                    sites: confirmationView.sites
                });
                ADK.SessionStorage.set.sessionModel('patient-domain', domainModel);
                if (patientContext) {
                    //Add data to current patient obj
                    var visit = {};
                    visit.dateTime = confirmationView.model.get('appointmentTime') || confirmationView.model.get('appointment');
                    if (visit.dateTime) {
                        visit.formatteddateTime = moment(visit.dateTime, "YYYYMMDDHHmm").format('MM/DD/YYYY HH:mm');
                    }
                    visit.name = visit.locationName = visit.displayName = visit.locationDisplayName =
                        confirmationView.model.get('clinicName') || patientContext.get('inpatientLocation');
                    visit.refId = visit.localId = confirmationView.model.get('localId');
                    // Get location if default visit is an admission
                    if (!_.isEmpty(confirmationView.model.get('roomBed'))) {
                        visit.refId = visit.localId = self.searchApplet.wardsList.findWhere({name: patientContext.get('inpatientLocation')}).get('localId');
                    }
                    visit.pid = visit.uid = confirmationView.model.get('pid');
                    visit.locationUid = visit.localId;

                    var user = ADK.UserService.getUserSession();
                    var isProvider = user.get('provider');
                    if (isProvider) {
                        visit.selectedProvider = {
                            code: user.get('duz')[user.get('site')],
                            name: user.get('lastname') + ',' + user.get('firstname')
                        };
                        visit.selectedProvider.name = visit.selectedProvider.name.toLowerCase().replace(/\b\w/g, function(m) {
                            return m.toUpperCase();
                        });
                    }

                    patientContext.set('visit', visit);

                    if (confirmationView.model.has('acknowledged') && (confirmationView.model.get('acknowledged') === true)) {
                        var title, message;
                        title = confirmationView.model.get('ackTitle');
                        message = confirmationView.model.get('ackMessage');
                        confirmationView.model = patientContext;
                        confirmationView.model.set({
                            'acknowledged': true,
                            'ackTitle': title,
                            'ackMessage': message
                        });
                    } else {
                        confirmationView.model = patientContext;
                    }

                    if (patientContext.has('patientRecordFlag')) {
                        // for each patient record flag, take its name and replace the spaces with underscores
                        // so we can use the result as the div id on the message panel in the patient flag template
                        _.each(patientContext.get('patientRecordFlag'), function(flag){
                            var flagName = flag.name;
                            flagName = flagName.replace(/ /g,'_');
                            flag.nameUnderscored = flagName;
                        });

                        confirmationView.model.set('patientRecordFlag', _.sortBy(confirmationView.model.attributes.patientRecordFlag, 'category'));

                        // add inlineStyle for dynamic confirmation UI height
                        if (confirmationView.model.attributes.patientRecordFlag.length > 1) {
                            confirmationView.model.set('inlineStyle', 'max-height:' + (window.innerHeight - confirmationView.searchApplet.getViewHeightBase('confirmation')) + 'px');
                        }
                        confirmationView.showConfirm(patientFlagTemplate);
                    } else {
                        confirmationView.patientSearchChannel.command('confirm_' + confirmationView.currentPatient);
                    }
                }
            };
            this.searchApplet.closeButtonView.model.clear();
            this.searchApplet.closeButtonView.render();

            this.patientSearchChannel.comply('confirm_' + this.model.get('pid'), function() {
                confirmationView.confirmPatient(event);
            });

            this.listenTo(this, 'destroy', function() {
                this.patientSearchChannel.stopComplying('confirm');
            });

            var patientModel = ADK.PatientRecordService.fetchCollection(searchOptions);
        },
        getPatientContext: function(patientDemographicsCollection) {
            var patientDemographics;
            var confirmationView = this;
            patientDemographics = patientDemographicsCollection.find(function(item) {
                return item.get('pid').indexOf(ADK.UserService.getUserSession().get('site') + ';') === 0;
            });
            if (_.isUndefined(patientDemographics)) {
                patientDemographics = patientDemographicsCollection.findWhere({
                    icn: confirmationView.currentPatient
                });
                if (patientDemographics) {
                    patientDemographics.set('pid', confirmationView.currentPatient);
                }
            }
            if (_.isUndefined(patientDemographics)) {
                patientDemographics = patientDemographicsCollection.at(0);
                if (patientDemographics) {
                    patientDemographics.set('pid', confirmationView.currentPatient);
                }
            }
            return patientDemographics;
        },
        setPatientStatusClass: function(patient) {
            var patientType = 'Outpatient';
            if (patient.get('admissionUid') && patient.get('admissionUid') !== null) {
                patientType = 'Inpatient';
            }
            patient.set('patientStatusClass', patientType);
            return patient;
        },
        ccowPatientContextChange: function(patient, callback) {
            var self = this;
            // update CCOW session with newly selected patient context if allowable
            if ("ActiveXObject" in window && ADK.CCOWService.getCcowStatus() === 'Connected') {
                ADK.CCOWService.handleContextChange(patient, function(goBack) {
                    if (goBack) {
                        ADK.Navigation.navigate(ADK.ADKApp.userSelectedDefaultScreen, {
                            trigger: true
                        });
                    } else {
                        //Re-enforcing UI change if status is disconnected
                        if (ADK.CCOWService.getCcowStatus() === 'Disconnected') {
                            ADK.CCOWService.updateCcowStatus('Disconnected');
                        }
                        self.updateTemplateToBlank();
                        callback();
                    }
                });
            } else {
                callback();
            }

        },
        confirmPatient: function(event) {
            var self = this;
            var patient = this.model;
            //check CCOW Context first if in Windows
            self.ccowPatientContextChange(patient, function() {
                self.searchApplet.resetModels();
                patient = self.setPatientStatusClass(patient);
                ADK.UserDefinedScreens.screensConfigNullCheck();
                ADK.Messaging.trigger("patient:selected", patient);
                ADK.Navigation.navigate(ADK.ADKApp.userSelectedDefaultScreen, {
                    trigger: true
                });
            });

        }
    });

    return ConfirmationView;
});
