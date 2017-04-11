define([
    "backbone",
    "marionette",
    "underscore",
    "handlebars",
    "moment",
    "hbs!app/applets/patient_selection/templates/confirmation/layout",
    "hbs!app/applets/patient_selection/templates/confirmation/acknowledge",
    "hbs!app/applets/patient_selection/templates/confirmation/patientFlag"
], function (
    Backbone,
    Marionette,
    _,
    Handlebars,
    moment,
    confirmationTemplate,
    acknowledgeTemplate,
    patientFlagTemplate) {
    'use strict';

    var ConfirmationView = Backbone.Marionette.ItemView.extend({
        template: false,
        behaviors: {
            Tooltip: {},
            HelpLink: {
                container: '.help-icon-div',
                mapping: 'patient_search_confirm',
                buttonOptions: {
                    icon: 'fa-question-circle'
                }
            }
        },
        attributes: {
            'id': 'confirmSection',
            'tabindex': '-1'
        },
        events: {
            'click button#ackButton': 'ackPatient',
            'click button#confirmFlaggedPatinetButton': 'confirmPatient',
            'click button#confirmationButton': 'onClickOfConfirm',
            'change input[type="checkbox"]': 'onClickPreviousWorkspaceCheckbox',
            'affixed.bs.affix': function() {
                this.$el.addClass("col-md-3");
                this.$el.parent().addClass("all-padding-no");
            },
            'affix-top.bs.affix': function() {
                if (this.$el.hasClass('col-md-3')) {
                    this.$el.removeClass('col-md-3');
                    this.$el.parent().removeClass("all-padding-no");
                }
            },
            'click button#breakContextButton': 'breakContext',
            'click button#ccowVisitHomePageBtn': 'ccowVisitHomePage'
        },
        templateHelpers: function() {
            return {
                navigationOn: !!this.navigation
            };
        },
        FROM_DATE_FORMAT: "YYYYMMDDHHmm",
        TO_DATE_FORMAT: 'MM/DD/YYYY HH:mm',
        sitesEvents: {
            'sync': function(collection, resp, options) {
                this.sitesFetchComplete = true;
                this.model.trigger('sites:fetch:success');
            }
        },
        patientSearchEvents: {
            'patient-search:success': function(collection, resp) {
                var firstModel;
                var modelData = {};
                if (collection.at(0) && !_.isUndefined(collection.at(0).get('ssn'))) {
                    firstModel = collection.at(0);
                } else {
                    if (!_.isUndefined(_.result(resp, 'data.items', undefined)) && !_.isEmpty(resp.data.items)) {
                        modelData = resp.data.items[0] || {};
                    }
                    firstModel = new Backbone.Model(modelData);
                }
                if (_.isUndefined(firstModel.get('ssn'))) {
                    throw new Error("Error when retrieving full ssn for: " + (this.model.get('displayName') || 'Unknown'));
                }
                this.model.set({
                    'ssn': firstModel.get('ssn') || '',
                    'birthDate': firstModel.get('birthDate') || '',
                    'isMVIOrigin': firstModel.get('isMVIOrigin') || false
                });
                var isCurrentPatient = ADK.PatientRecordService.isMatchingPatient(this.model, ADK.PatientRecordService.getCurrentPatient());
                if (isCurrentPatient === true) {
                    this.model.set('autoCheckLastWorkspaceCheckbox', true);
                }
                this.render();
            },
            'patient-search:error': function(collection, resp) {
                if (resp.status) {
                    this.template = Handlebars.compile('<p class="error-message padding" role="alert">' + ADK.ErrorMessaging.getMessage(resp.status) + ' </p>');
                    this.render();
                }
            }
        },
        ackEvents: {
            'patient-search:success': function(collection, response) {
                var firstModel = collection.at(0);
                if (firstModel) {
                    this.model.set({
                        ssn: firstModel.get('ssn'),
                        birthDate: firstModel.get('birthDate')
                    });
                    this.render();
                }
                this.removeAcknowledgeBox();
            }
        },
        syncEvents: {
            'sync-status:error': function(collection, resp, event) {
                if (resp.status === 404) {
                    this.refreshPatientPhoto();
                    this.$(event.currentTarget).addClass('disabled').attr('disabled', 'disabled');

                    if (this.getOption('displayVisitHomePageBtnOnSync')) {
                        this.$('#ccowVisitHomePageBtn').button('sync');
                        this.$(event.currentTarget).html("<i class='fa fa-spinner fa-spin'></i> <span>Fetching New Patient Records...</span>");
                        this.$el.find('#fetchingPatientRecords').addClass('sr-only').removeClass('hidden').focus();
                    } else {
                        this.$(event.currentTarget).html("<i class='fa fa-spinner fa-spin'></i> <span> Syncing Patient Data...</span>");
                        this.$el.find('#screenReaderSyncing').addClass('sr-only').removeClass('hidden').focus();
                    }
                    //case of external patient not synced yet, invoke demographic sync from MVI in RDK
                    if (!_.isUndefined(this.model.get('isMVIOrigin')) && this.model.get('isMVIOrigin') === true) {
                        var self = this;
                        var criteria = {
                            'pid': this.model.attributes.pid || ''
                        };
                        var syncStatusModel = new Backbone.Model();
                        syncStatusModel.url = ADK.ResourceService.buildUrl('search-mvi-global-patient-sync', criteria);
                        syncStatusModel.save({}, {
                            type: 'GET',
                            contentType: 'application/json',
                            success: function(model, resp) {
                                if (!_.isEmpty(_.result(resp, 'data', '')) && _.result(resp, 'syncInProgress', false) === true) {
                                    self.loadPatientRecord(collection, resp, event);
                                } else {
                                    self.template = Handlebars.compile('<br /><p class="error-message padding" role="alert" tabindex="0">Error syncing MVI record for patient</p>');
                                    self.render();
                                }
                            },
                            error: function(model, resp) {
                                if (resp.status) {
                                    self.template = Handlebars.compile('<br /><p class="error-message padding" role="alert" tabindex="0">' + ADK.ErrorMessaging.getMessage(resp.status) + ' </p>');
                                    self.render();
                                }
                            }
                        });
                    } else {
                        //case of local patient not synced yet
                        this.loadPatientRecord(collection, resp, event);
                    }
                }
            }
        },
        patientEvents: {
            'patient-record:error': function(collection, resp) {
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
                        if (resp.status === 502) {
                            message = '<h4 class="top-margin-no top-padding-no">Error: Patient Loading Failed</h4><p>' + ADK.ErrorMessaging.getMessage('syncTimeout') + '</p>';
                        } else {
                            message = ADK.ErrorMessaging.getMessage('default');
                        }

                    }
                } else {
                    message = ADK.ErrorMessaging.getMessage(resp.status);
                }
                var errorMessage = '<div class="error-message all-padding-md">' + message;
                errorMessage = errorMessage.concat(getSearchErrorMessage(resp), '</div>');
                this.template = Handlebars.compile(errorMessage);
                this.render();

                function getSearchErrorMessage(resp, error) {
                    var errorMessage = error || '';
                    if (resp.logId) {
                        errorMessage = errorMessage.concat('<p class="all-padding-md">For defect reporting:<p>' + resp.logId);
                    }
                    return errorMessage;
                }
            },
            'patient-record:success': function(collection, resp) {
                var successMethod = function(collection, resp) {
                    var patientContext = this.getPatientContext(collection);
                    ADK.SessionStorage.set.sessionModel('patient-domain', new Backbone.Model({
                        data: collection,
                        sites: this.sites
                    }));
                    if (patientContext) {
                        //Minimum defaulted visit object = display name, location ien, provider, date time, formatted date time
                        var visit = {};
                        visit.locationDisplayName = this.model.get('clinicName') || this.model.get('locationName') || patientContext.get('inpatientLocation');
                        visit.dateTime = this.model.get('appointmentTime') || this.model.get('appointment');
                        if (!this.skipSearch) {
                            if (!_.isUndefined(visit.dateTime)) {
                                //Grab location if it's a clinic
                                var clinic = this.searchApplet.clinicsList.fullCollection.findWhere({
                                    displayName: visit.locationDisplayName
                                });
                                if (!_.isUndefined(clinic)) {
                                    visit.locationUid = clinic.get('uid');
                                }
                            } else if (patientContext.get('admissionUid')) {
                                // Get location if default visit is an admission
                                var ward = this.searchApplet.wardsList.findWhere({
                                    name: patientContext.get('inpatientLocation')
                                });
                                //It's possible to have a CPRS list patient that isn't in the ward list
                                //In that case we grab them later when we also grab the admission date.
                                if (!_.isUndefined(ward)) {
                                    visit.locationUid = ward.get('uid');
                                }
                            }
                        }
                        //Grab current user as provider if they are a provider.
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
                        //Patient status
                        var isInpatient = false;
                        //For appointments dateTime is readily available, for admissions we have to do an extra fetch.
                        if (!_.isUndefined(patientContext.get('admissionUid'))) {
                            var settings = {
                                resourceTitle: 'patient-record-visit',
                                patient: this.model,
                                criteria: {
                                    uid: patientContext.get('admissionUid')
                                }
                            };
                            settings.onSuccess = function(collection, resp) {
                                isInpatient = true;
                                collection.trigger('patient-record-visit:success', collection, resp, visit, isInpatient);
                            };
                            ADK.PatientRecordService.fetchCollection(settings, this.visitCollection);
                            this.fetchingAdmissions = true;
                        }
                        if (!_.isUndefined(visit.dateTime)) {
                            visit.formattedDateTime = moment(visit.dateTime, this.FROM_DATE_FORMAT).format(this.TO_DATE_FORMAT);
                        }
                        if (!_.isUndefined(visit.locationUid) && _.isUndefined(visit.serviceCategory)) {
                            visit.serviceCategory = ADK.utils.contextUtils.getServiceCategory(visit.locationDisplayName, this.getLocationType(visit), isInpatient, false);
                        }
                        patientContext.set('visit', visit);
                        patientContext.set('workspaceContext', this.model.get('workspaceContext'));
                        if (this.model.has('acknowledged') && (this.model.get('acknowledged') === true)) {
                            var title, message;
                            title = this.model.get('ackTitle');
                            message = this.model.get('ackMessage');
                            this.model.set(_.defaults({
                                'acknowledged': true,
                                'ackTitle': title,
                                'ackMessage': message
                            }, patientContext.attributes));
                        } else {
                            this.model.set(patientContext.attributes);
                        }
                        if (patientContext.has('patientRecordFlag')) {
                            // for each patient record flag, take its name and replace the spaces with underscores
                            // so we can use the result as the div id on the message panel in the patient flag template
                            _.each(patientContext.get('patientRecordFlag'), function(flag) {
                                var flagName = flag.name;
                                flagName = flagName.replace(/ /g, '_');
                                flag.nameUnderscored = flagName;
                            });
                            this.model.set('patientRecordFlag', _.sortBy(this.model.get('patientRecordFlag'), 'category'));
                            this.showConfirm(patientFlagTemplate);
                            this.$el.trigger('update:help:mapping', 'patient_search_restricted');
                        } else {
                            if (this.fetchingAdmissions) {
                                this.stopListening(this, 'patient:visit:success');
                                this.listenToOnce(this, 'patient:visit:success', function() {
                                    this.patientSearchChannel.command('confirm_' + this.currentPatient);
                                });
                            } else {
                                this.patientSearchChannel.command('confirm_' + this.currentPatient);
                            }
                        }
                    }
                };
                if (this.sitesFetchComplete) {
                    successMethod.call(this, collection, resp);
                } else { //edge case if sites fetch hangs up
                    this.stopListening(this, 'sites:fetch:success');
                    this.listenToOnce(this, 'sites:fetch:success', function() {
                        successMethod.call(this, collection, resp);
                    });
                }
            }
        },
        authorizeEvents: {
            'authorize:error': function(collection, resp, patient) {
                this.model.set(patient.attributes);
                if ((resp.status == 307) || (resp.status == 308)) {
                    var message;
                    try {
                        message = JSON.parse(resp.responseText).message;
                    } catch (e) {
                        message = resp.responseText;
                    }
                    this.model.set({
                        'ackTitle': "Restricted Record",
                        'ackMessage': message.replace(/\s*(\*{3}.*?\*{3})|(?:[*\s]*([^*\s]+ ?)[*\s]*)/g, '$2')
                    });

                    this.stopListening(this.model, 'last-workspace-synced');
                    this.listenTo(this.model, 'last-workspace-synced', function () {
                        if (this.getOption('skipAckPatientConfirmation')) {
                            this.ackPatient();
                            this.showConfirm(confirmationTemplate);
                        } else {
                            this.showConfirm(acknowledgeTemplate);
                            this.$el.trigger('update:help:mapping', 'patient_search_restricted');
                        }
                    });
                    ADK.PatientRecordService.getLastWorkspace(this.model);
                } else if (resp.status == 403) {
                    this.showUnAuthorized();
                } else {
                    this.template = Handlebars.compile('<p class="error-message all-padding-md">' + ADK.ErrorMessaging.getMessage(resp.status) + ' </p>');
                    this.render();
                }
            },
            'authorize:success': function(collection, resp, patient) {
                this.model.set(patient.attributes);
                this.stopListening(this.model, 'change:patientImage');
                this.listenTo(this.model, 'change:patientImage', this.refreshPatientPhoto);
                var self = this;
                this.listenTo(this.model, 'last-workspace-synced', function() {
                    ADK.PatientRecordService.getPatientPhoto(self.model);
                    self.showConfirm(confirmationTemplate);
                    this.$el.trigger('update:help:mapping', 'patient_search_confirm');
                    self.stopListening(self.model, 'last-workspace-synced');
                });
                ADK.PatientRecordService.getLastWorkspace(this.model);
            }
        },
        visitEvents: {
            'patient-record-visit:success': function(collection, resp, visit, isInpatient) {
                if (collection.length > 0) {
                    visit.dateTime = collection.at(0).get('dateTime');
                    if (visit.dateTime) {
                        visit.formattedDateTime = moment(visit.dateTime, this.FROM_DATE_FORMAT).format(this.TO_DATE_FORMAT);
                    }
                    visit.locationUid = collection.at(0).get('locationUid');
                    if (!_.isUndefined(visit.locationUid) && _.isUndefined(visit.serviceCategory)) {
                        visit.serviceCategory = ADK.utils.contextUtils.getServiceCategory(visit.locationDisplayName, this.getLocationType(visit), isInpatient, false);
                    }
                    //we might need to know if it's changed
                    //rather than just manipulating the pointer
                    this.model.unset('visit', {
                        silent: true
                    });
                    this.model.set('visit', visit);
                }
                delete this.fetchingAdmissions;
                this.trigger('patient:visit:success');
            }
        },
        onRender: function(a) {
            if (!_.isUndefined(this.model.get('workspaceContext')) && !_.isUndefined(this.model.get('autoCheckLastWorkspaceCheckbox')) && this.model.get('autoCheckLastWorkspaceCheckbox') === true) {
                this.$el.find('#previousWorkspace').prop('checked', true);
                this.usePreviousWorkspace = this.$el.find('#previousWorkspace').prop('checked') || (_.isBoolean(this.usePreviousWorkspace) ? this.usePreviousWorkspace : true);
            }
            this.addFlagsScrollConfirmation();
        },
        initialize: function(options) {
            options = _.defaults({}, options, {
                navigation: true
            });
            var pluckedOptions = ['workspaceId', 'skipSearch', 'callback', 'searchApplet', 'navigation'];
            this.mergeOptions(options, pluckedOptions);
            this.patientSearchChannel = ADK.Messaging.getChannel('patient_search');
            this.sites = new Backbone.Collection();
            this.patientSearchCollection = new Backbone.Collection();
            this.ackCollection = new Backbone.Collection();
            this.syncCollection = new Backbone.Collection();
            this.patientRecordCollection = new Backbone.Collection();
            this.authorizeCollection = new ADK.ResourceService.DomainCollection();
            this.visitCollection = new Backbone.Collection();
            this.bindEntityEvents(this.sites, this.getOption('sitesEvents'));
            this.bindEntityEvents(this.patientSearchCollection, this.getOption('patientSearchEvents'));
            this.bindEntityEvents(this.ackCollection, this.getOption('ackEvents'));
            this.bindEntityEvents(this.syncCollection, this.getOption('syncEvents'));
            this.bindEntityEvents(this.patientRecordCollection, this.getOption('patientEvents'));
            this.bindEntityEvents(this.authorizeCollection, this.getOption('authorizeEvents'));
            this.bindEntityEvents(this.visitCollection, this.getOption('visitEvents'));
            var siteOptions = {
                resourceTitle: 'authentication-list',
                cache: true
            };
            this.abort(this.sites);
            ADK.ResourceService.fetchCollection(siteOptions, this.sites);
            this.model = new Backbone.Model();
        },
        serializeModel: function(model) {
            var modelJSON = model.toJSON();
            modelJSON.hideCloseX = this.getOption('hideCloseX');
            modelJSON.displayBreakClinicalLink = this.getOption('displayBreakClinicalLink');
            return modelJSON;
        },
        checkFlagConfirmation: function () {
            if (typeof (this.flagsWrapper != 'undefined')) {
                this.addFlagsScrollConfirmation();
            }
        },
        addFlagsScrollConfirmation: function() {
            // check if the flags area is taller than it's viewport and disable button if there is scrolling needed.
            if ((typeof(this.model) != 'undefined') && this.model.has('patientRecordFlag') && this.model.get('patientRecordFlag').length > 0) {
                var wrapper = this.$el;
                this.flagsWrapper = wrapper.find('.flags-wrapper');
                if (this.flagsWrapper.length > 0) {
                    var viewportHeight = this.flagsWrapper.height();
                    var scrollingHeight = this.flagsWrapper[0].scrollHeight;
                    var confirmButton = wrapper.find('#confirmFlaggedPatinetButton');
                    if (scrollingHeight > viewportHeight) {
                        confirmButton.before('<div class="confirmation-scroll-to-confirm text-center font-size-14">Scroll to bottom to confirm patient</div>');
                        confirmButton.addClass('hidden');
                        // add event listener for scrolling till all flags are seen
                        this.flagsWrapper.on('scroll.activateConfirmation', function(e) {
                            var elem = $(e.currentTarget);
                            if (e.currentTarget.scrollHeight - elem.scrollTop() == elem.outerHeight()) {
                                confirmButton.removeClass('hidden').focus();
                                confirmButton.prev().remove();
                            }
                        });
                    } else {
                        confirmButton.removeClass('hidden').focus();
                        this.flagsWrapper.off('scroll.activateConfirmation');
                    }
                }
            }
        },
        updateSelectedPatientModel: function(patient) {
            this.triggerMethod('abort');
            this.currentPatient = patient.get('pid');
            this.showLoading();
            this.stopListening(patient, 'change:patientImage');
            this.listenTo(patient, 'change:patientImage', this.currentPatientChanged);
            if (this.model && this.model.get('fullName')) {
                this.patientSearchChannel.stopComplying('confirm_' + this.model.get('pid'));
            }
            this.model.clear();
            var searchOptions = {
                resourceTitle: 'authorize-authorize',
                patient: patient,
                domainCollection: this.authorizeCollection
            };
            if (patient.has('acknowledged')) {
                patient.unset('acknowledged');
            }
            searchOptions.onError = function(collection, response) {
                collection.trigger('authorize:error', collection, response, patient);
            };
            searchOptions.onSuccess = function(collection, response) {
                collection.trigger('authorize:success', collection, response, patient);
            };
            ADK.PatientRecordService.fetchResponseStatus(searchOptions);
        },
        nonSensitivePatientChanged: function(event) {
            this.render();
        },
        refreshPatientPhoto: function() {
            if (!this.model.get('patientImage')) return;
            this.$('#patient-image').css('background-image', 'url(\'' + this.model.get('patientImage') + '\')');
        },
        getLocationType: function(visit) {
            if (!_.isUndefined(visit.locationUid)) {
                return visit.locationUid.split(':')[4].indexOf('w') > -1 ? 'w' : 'c';
            }
        },
        getFullSSN: function(patientModel) {
            var searchOptions = {
                resourceTitle: 'patient-search-pid',
                patient: patientModel
            };
            searchOptions.onSuccess = function(collection, resp) {
                collection.trigger('patient-search:success', collection, resp);
            };
            searchOptions.onError = function(collection, resp) {
                collection.trigger('patient-search:error', collection, resp);
            };
            ADK.PatientRecordService.fetchCollection(searchOptions, this.patientSearchCollection);
        },
        updateTemplateToBlank: function() {
            this.template = false;
            this.render();
            if (!this.$el.parent().hasClass("hidden")) {
                this.$el.parent().addClass("hidden");
            }
        },
        showUnAuthorized: function() {
            this.template = Handlebars.compile("<div class='unAuthorized well'><h4 class='text-danger'>You are not authorized to view this record. Select another patient.</h4></div>");
            this.render();
            this.$el.find('.unAuthorized').focus();
        },
        showConfirm: function(temp) {
            this.template = temp;
            this.getFullSSN(this.model); //gets the full ssn for the patient's model
            if (this.$el.find('#ackButton').is(':visible')) {
                this.$el.find('#ackMessagePanel').focus();
            } else {
                //confirmFlaggedPatinetButton
                this.$el.find('#confirmationButton').focus();
            }
            this.$el.affix({
                offset: {
                    top: 227
                }
            });
        },
        showLoading: function() {
            if (this.$el.parent().hasClass("hidden")) {
                this.$el.parent().removeClass("hidden");
            }
            this.template = Handlebars.compile('<div class="loading all-padding-md"><i class="fa fa-spinner fa-spin"></i> Loading...</div>');
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
                _ack: true
            };
            this.stopListening(patient, 'change:patientImage');
            this.listenTo(patient, 'change:patientImage', this.currentPatientChanged);
            ADK.PatientRecordService.getPatientPhoto(patient, imageFetchOptions);
            this.model.set({
                'acknowledged': true
            });
            //Once acknowledge, refetch the patient information to remove masking
            var searchOptions = {
                resourceTitle: 'patient-search-pid',
                patient: patient
            };
            searchOptions.onSuccess = function(collection, resp) {
                collection.trigger('patient-search:success', collection, resp);
            };
            searchOptions.onError = function(collection, resp) {
                collection.trigger('patient-search:error', collection, resp);
            };
            ADK.PatientRecordService.fetchCollection(searchOptions, this.ackCollection);
        },
        removeAcknowledgeBox: function(event) {
            var el = this.$el;
            var ackHeading = el.find('#ackMsgTitleId');
            var ackHeadingLink = ackHeading.find('button');
            el.find('#ackMessagePanel').collapse('hide');
            el.find('#ackButton').addClass('hide');
            el.find('.acknowledged').removeClass('hidden');
            el.find('.patientDetails').removeClass('hidden');
            el.find('#confirmationButton').removeClass('hidden');
            el.find('#confirmationButtonContainer').removeClass('hidden');
            el.find('.previous-workspace-confirmation').removeClass('hidden');
            if (ackHeading.is(':visible')) {
                ackHeadingLink.focus();
            } else {
                // a fallback for the focus in case the confirmation label is not there for some reason.
                el.focus();
            }
        },
        onClickPreviousWorkspaceCheckbox: function() {
            var usePreviousWorkspace = this.$el.find('#previousWorkspace').is(':checked');
            this.usePreviousWorkspace = usePreviousWorkspace;
        },
        onClickOfConfirm: function(event) {
            this.model.set('icn', this.model.get('pid'));
            if (this.getOption('displayVisitHomePageBtnOnSync')) {
                this.$('#ccowVisitHomePageContainer').removeClass('hidden');
            }
            var syncOptions = {
                resourceTitle: 'synchronization-datastatus',
                patient: this.model,
                cache: false
            };
            var self = this;
            syncOptions.onSuccess = function(collection, resp) {
                self.loadPatientRecord(collection, resp, event);
            };
            syncOptions.onError = function(collection, resp) {
                collection.trigger('sync-status:error', collection, resp, event);
            };
            ADK.PatientRecordService.fetchCollection(syncOptions, self.syncCollection);
        },
        loadPatientRecord: function(collection, resp, event) {
            var isImageLoaded = true;
            if (!this.model.get('patientImage')) {
                isImageLoaded = false;
            }
            var patientImageModel = new Backbone.Model({
                image: this.model.get('patientImage'),
                isImageLoaded: isImageLoaded
            });
            ADK.SessionStorage.set.sessionModel('patient-image', patientImageModel);
            // Add a check to sync status response to determine if patient is fully synced or not.
            if (!this.isPatientSynced(resp)) {
                if (this.getOption('displayVisitHomePageBtnOnSync')) {
                    this.$(event.currentTarget).button('ccow');
                    this.$(event.currentTarget).addClass('disabled').attr('disabled', 'disabled');
                } else {
                    this.$(event.currentTarget).button('sync');
                }
            } else {
                this.$el.find('#screenReaderLoading').addClass('sr-only').removeClass('hidden').focus();
                this.$(event.currentTarget).button('loading');
            }
            if (this.model.has('acknowledged')) {
                this.model.set({
                    'acknowledged': true
                });
            }
            var searchOptions = {
                resourceTitle: 'patient-record-patient',
                patient: this.model,
                cache: false
            };
            searchOptions.onError = function(collection, resp) {
                collection.trigger('patient-record:error', collection, resp);
            };
            searchOptions.onSuccess = function(collection, resp) {
                collection.trigger('patient-record:success', collection, resp);
            };
            this.patientSearchChannel.comply('confirm_' + this.model.get('pid'), _.bind(function() {
                this.confirmPatient(event);
            }, this));
            var patientModel = ADK.PatientRecordService.fetchCollection(searchOptions, this.patientRecordCollection);
        },
        onDestroy: function() {
            this.patientSearchChannel.stopComplying('confirm');
            this.unbindEntityEvents(this.sites, this.getOption('sitesEvents'));
            this.unbindEntityEvents(this.patientSearchCollection, this.getOption('patientSearchEvents'));
            this.unbindEntityEvents(this.ackCollection, this.getOption('ackEvents'));
            this.unbindEntityEvents(this.syncCollection, this.getOption('syncEvents'));
            this.unbindEntityEvents(this.patientRecordCollection, this.getOption('patientEvents'));
            this.unbindEntityEvents(this.authorizeCollection, this.getOption('authorizeEvents'));
            this.unbindEntityEvents(this.visitCollection, this.getOption('visitEvents'));
        },
        getPatientContext: function(patientDemographicsCollection) {
            var patientDemographics;
            //check and select  if patient is local
            patientDemographics = patientDemographicsCollection.find(function(item) {
                return item.get('pid').indexOf(ADK.UserService.getUserSession().get('site') + ';') === 0;
            });
            if (_.isUndefined(patientDemographics)) {
                // patient is not local --> select MVI/VLER record (DE4076)
                patientDemographics = patientDemographicsCollection.find(function(item) {
                    return item.get('pid').indexOf('VLER;') === 0;
                });
                if (patientDemographics) {
                    patientDemographics.set('pid', this.currentPatient);
                    patientDemographics.set('nonLocalPatient', true);
                } else {
                    console.log("PATIENT_SEARCH------->>> Error, can't find MVI/VLER record for nonlocal patient");
                }
            }
            if (_.isUndefined(patientDemographics)) {
                patientDemographics = patientDemographicsCollection.findWhere({
                    icn: this.currentPatient
                });
                if (patientDemographics) {
                    patientDemographics.set('pid', this.currentPatient);
                }
            }
            if (_.isUndefined(patientDemographics)) {
                patientDemographics = patientDemographicsCollection.at(0);
                if (patientDemographics) {
                    patientDemographics.set('pid', this.currentPatient);
                }
            }
            return patientDemographics;
        },
        ccowPatientContextChange: function(patient, callback) {
            // Only push context change if CCOW is active and the change was initiated by a non-CCOW confirmation
            if ("ActiveXObject" in window && !this.getOption('suspendContextOnError') && ADK.CCOWService.getCcowStatus() === 'Connected') {
                ADK.CCOWService.handleContextChange(patient, _.bind(function (goBack) {
                    if (goBack) {
                        ADK.Navigation.navigate(ADK.WorkspaceContextRepository.userDefaultScreen, {
                            route: {
                                trigger: true
                            }
                        });
                    } else {
                        //Re-enforcing UI change if status is disconnected
                        if (ADK.CCOWService.getCcowStatus() === 'Disconnected') {
                            ADK.CCOWService.updateCcowStatus('Disconnected');
                        }
                        this.updateTemplateToBlank();
                        return callback();
                    }
                }, this));
            } else {
                return callback();
            }
        },
        breakContext: function() {
            ADK.CCOWService.suspendContext();
            ADK.UI.Modal.hide();
        },
        ccowVisitHomePage: function() {
            this.onAbort();
            // Figure out current page and navigate to home page if necessary
            ADK.Messaging.trigger("patient:selected", this.model);
            ADK.UI.Modal.hide();

            var currentScreen = ADK.Messaging.request('get:current:screen');
            if (currentScreen.id !== 'provider-centric-view') {
                ADK.Navigation.navigate('provider-centric-view');
            }
        },
        onAbort: function() {
            this.abort(this.patientSearchCollection);
            this.abort(this.ackCollection);
            this.abort(this.syncCollection);
            this.abort(this.patientRecordCollection);
            this.abort(this.authorizeCollection);
            this.abort(this.visitCollection);
        },
        abort: function(collection) {
            if (collection.xhr) collection.xhr.abort();
        },
        confirmPatient: function(event) {
            this.$(event.currentTarget).button('loading');
            var patient = this.model;
            this.ccowPatientContextChange(patient, _.bind(function () {
                ADK.UserDefinedScreens.screensConfigNullCheck();
                ADK.Messaging.trigger("patient:selected", patient);
                if (!this.navigation) {
                    if (_.isFunction(this.callback)) {
                        this.callback();
                    }
                    ADK.UI.Modal.hide();
                } else {
                    this.navigateToContextDefaultScreen();
                }
            }, this));
        },
        navigateToContextDefaultScreen: function() {
            var options = {
                route: {
                    trigger: true
                }
            };
            if (this.skipSearch) {
                options.callback = this.callback;
            }
            var previousWorkspaceID = null;
            if (!_.isUndefined(this.usePreviousWorkspace) && this.usePreviousWorkspace === true) {
                previousWorkspaceID = this.model.get('workspaceContext').workspaceId;
            }

            var nextWorkspaceId = previousWorkspaceID || this.workspaceId ||
                ADK.UserService.getPreferences('defaultScreen.patient') ||
                ADK.WorkspaceContextRepository.getDefaultScreenOfContext('patient');

            ADK.Navigation.navigate(nextWorkspaceId, options);
        },
        onBeforeDestroy: function() {
            this.sites = null;
            this.patientSearchCollection = null;
            this.ackCollection = null;
            this.syncCollection = null;
            this.patientRecordCollection = null;
            // remove flags event listener for scrolling if there is one
            if (!_.isUndefined(this.flagsWrapper)) {
                this.flagsWrapper.off('scroll.activateConfirmation');
            }
            this.authorizeCollection = null;
            this.visitCollection = null;
            // This is getting routed into something with ```var patient = this.model;```
            // But I can not tell where the leak is ending up so it is easiest to remove here.
            this.model = null;
        },
        // This is a utility function to check to see if a patient is fully synced based on resp from synchronization-datastatus
        isPatientSynced: function(resp) {
            if (_.isUndefined(resp)) { // no resp at all, just return false
                return false;
            }
            if (resp.status && resp.status === 404) { // 404 means the patient is not in JDS at all
                return false;
            }
            if (resp.allSites === true) { // if all sites is set to be true, then fully synced.
                return true;
            }
            if (!_.isUndefined(resp.data) && resp.data.allSites === true) { // if resp has data element and allSites is fully synced.
                return true;
            }
            // any other case, just return false
            return false;
        }
    });
    return ConfirmationView;
});
