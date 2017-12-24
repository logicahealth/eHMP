define([
    'underscore',
    'backbone',
    'marionette',
    'handlebars',
    'moment',
    'hbs!app/applets/patient_selection/templates/confirmation/layout',
    'app/applets/patient_selection/views/confirmation/confirmationStep',
    'app/applets/patient_selection/views/confirmation/restrictedRecordText',
    'app/applets/patient_selection/views/confirmation/confirmationButton'
], function(
    _,
    Backbone,
    Marionette,
    Handlebars,
    Moment,
    PatientTemplate,
    ConfirmationStep,
    RestrictedRecordText,
    ConfirmationButton
) {
    'use strict';

    var PatientInfoBody = Backbone.Marionette.LayoutView.extend({
        template: PatientTemplate,
        regions: {
            SensitiveText: '.sensitive-text-container'
        },
        modelEvents: {
            'change:ssn change:birthDate change:patientImage': 'render'
        },
        onRender: function() {
            var SensitiveDisclaimer = RestrictedRecordText.extend({
                skipAttribute: 'confirmed'
            });
            this.showChildView('SensitiveText', new SensitiveDisclaimer(this.options));
        }
    });

    var PreviousWorkspace = Backbone.Marionette.ItemView.extend({
        className: 'checkbox all-margin-no',
        template: Handlebars.compile(
            '{{#if shouldShow}}' +
            '<label for="previousWorkspace" class="bottom-padding-sm">' +
            '<input type="checkbox" id="previousWorkspace" name="previousWorkspace"' +
            '{{#if isChecked}} checked{{/if}}>' +
            'Resume most recent workspace for this patient' +
            '</label>' +
            '{{/if}}'
        ),
        templateHelpers: function() {
            return {
                shouldShow: !!this.getOption('navigateToPatient') && !!this.model.get('workspaceContext'),
                isChecked: !!this.model.get('usePreviousWorkspace')
            };
        },
        events: {
            'change input': function() {
                this.model.set('usePreviousWorkspace', this.$('input').is(':checked'));
            }
        },
        modelEvents: {
            'change:usePreviousWorkspace': 'render'
        }
    });

    var CCOWButtons = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile(
            '{{#if shouldShowVisitHome}}' +
            '<div id="ccowVisitHomePageContainer" class="top-margin-sm">' +
            '<button type="button" id="ccowVisitHomePageBtn"' +
            ' class="visit-home-page confirm btn btn-primary btn-block btn-lg prevent-default-styling"' +
            '>{{getVisitHomeText}}</button>' +
            '</div>' +
            '{{/if}}' +
            '{{#if ccowWorkflow}}' +
            '<div class="text-center">' +
            '<button type="button" id="breakContextButton" class="break-context-link btn btn-link top-margin-xs font-size-13 confirm"><strong>Break Clinical link</strong></button>' +
            '</div>' +
            '{{/if}}'
        ),
        templateHelpers: function() {
            var state = this.buttonModel.get('state');
            return {
                shouldShowVisitHome: !!this.getOption('visitHomeLink') &&
                    (_.isEqual(state, 'syncing') || _.isEqual(state, 'loading')),
                ccowWorkflow: !!this.getOption('ccowWorkflow'),
                getVisitHomeText: _.isEqual(state, 'syncing') ? 'Fetch Records in the Background' : 'Visit Home Page'
            };
        },
        ui: {
            VisitHomeButton: 'button.visit-home-page',
            BreakContextLinkButton: 'button.break-context-link'
        },
        events: {
            'click @ui.VisitHomeButton': '_ccowVisitHomePage',
            'click @ui.BreakContextLinkButton': '_breakContext'
        },
        buttonModelEvents: {
            'change:state': 'render'
        },
        initialize: function() {
            this.buttonModel = this.getOption('buttonModel');
            if (!!this.getOption('ccowWorkflow') || !!this.getOption('visitHomeLink')) {
                this.bindEntityEvents(this.buttonModel, this.getOption('buttonModelEvents'));
            }
        },
        _ccowVisitHomePage: function() {
            this.triggerMethod('abort');
            // Figure out current page and navigate to home page if necessary
            ADK.Messaging.trigger('patient:selected', this.model);
            ADK.UI.Workflow.hide();

            var currentScreen = ADK.Messaging.request('get:current:screen');
            // TODO this should just go to Staff default
            if (currentScreen.id !== 'provider-centric-view') {
                ADK.Navigation.navigate('provider-centric-view');
            }
        },
        _breakContext: function() {
            ADK.CCOWService.suspendContext();
            ADK.UI.Workflow.hide();
        },
        onDestroy: function() {
            if (!!this.getOption('ccowWorkflow') || !!this.getOption('visitHomeLink')) {
                this.unbindEntityEvents(this.buttonModel, this.getOption('buttonModelEvents'));
            }
        }
    });

    var PatientInfoFooter = Backbone.Marionette.LayoutView.extend({
        className: 'confirmation-div',
        PreviousWorkspace: PreviousWorkspace,
        CCOWButtons: CCOWButtons,
        template: Handlebars.compile(
            '<div class="previous-workspace-confirmation text-left"></div>' +
            '<div class="confirmation-button-container"></div>' +
            '<div class="ccow-buttons-container"></div>'
        ),
        childEvents: {
            'confirmation': function(child) {
                this.triggerMethod('action:complete');
            },
            'abort': function(child) {
                this.triggerMethod('abort');
            }
        },
        ui: {
            ConfirmationButtonContainer: '.confirmation-button-container',
            PreviousWorkspaceInputContainer: '.previous-workspace-confirmation',
            CCOWButtonsContainer: '.ccow-buttons-container'
        },
        regions: {
            ConfirmationButtonRegion: '@ui.ConfirmationButtonContainer',
            PreviousWorkspaceRegion: '@ui.PreviousWorkspaceInputContainer',
            CCOWButtonsRegion: '@ui.CCOWButtonsContainer'
        },
        onRender: function() {
            this.showChildView('ConfirmationButtonRegion', new ConfirmationButton({
                buttonId: 'confirmationButton',
                model: this.getOption('model'),
                buttonModel: this.getOption('buttonModel'),
                ccowWorkflow: this.getOption('ccowWorkflow'),
                visitHomeLink: this.getOption('visitHomeLink')
            }));
            var PreviousWorkspace = this.getOption('PreviousWorkspace');
            this.showChildView('PreviousWorkspaceRegion', new PreviousWorkspace({
                model: this.getOption('model'),
                navigateToPatient: this.getOption('navigateToPatient')
            }));
            var CCOWButtons = this.getOption('CCOWButtons');
            this.showChildView('CCOWButtonsRegion', new CCOWButtons({
                model: this.getOption('model'),
                buttonModel: this.getOption('buttonModel'),
                ccowWorkflow: this.getOption('ccowWorkflow'),
                visitHomeLink: this.getOption('visitHomeLink')
            }));
        }
    });

    var PatientConfirmation = ConfirmationStep.extend({
        skipAttribute: 'confirmed',
        FROM_DATE_FORMAT: "YYYYMMDDHHmm",
        TO_DATE_FORMAT: 'MM/DD/YYYY HH:mm',
        Body: PatientInfoBody,
        Footer: PatientInfoFooter,
        patientSearchEvents: {
            'read:success': function(collection, response) {
                var firstModel = collection.at(0);
                if (firstModel) {
                    this.model.set(firstModel.pick(['ssn', 'birthDate', 'isMVIOrigin']));
                }
            }
        },
        lastWorkspaceEvents: {
            'read:success': function(collection, response) {
                if (collection.length) {
                    this.model.set('workspaceContext', collection.at(0).get('workspaceContext'));
                }
                var hasLastWorkspace = !_.isEmpty(this.model.get('workspaceContext'));
                this.model.set('usePreviousWorkspace', hasLastWorkspace && !!ADK.PatientRecordService.isMatchingPatient(this.model, ADK.PatientRecordService.getCurrentPatient()));
                this.showAll();
            },
            'read:error': function(collection, response) {
                this.showAll();
            }
        },
        syncEvents: {
            'read:error': function(collection, resp) {
                if (resp.status === 404) {
                    this.buttonModel.set('state', 'syncing');
                    //case of external patient not synced yet, invoke demographic sync from MVI in RDK
                    if (!_.isUndefined(this.model.get('isMVIOrigin')) && this.model.get('isMVIOrigin') === true) {
                        var syncStatusModel = new ADK.UIResources.Fetch.PatientSelection.Confirmation.MviSync({ patient: this.model });
                        this.setupEntityEvents(syncStatusModel, this.getOption('mviSyncEvents'));
                        syncStatusModel.fetch();
                    } else {
                        // case of local patient not synced yet
                        this._fetchPatientRecord(collection, resp);
                    }
                }
            },
            'read:success': function(collection, resp) {
                this._fetchPatientRecord(collection, resp);
            }
        },
        mviSyncEvents: {
            'read:success': function(model, resp) {
                if (!_.isEmpty(_.result(resp, 'data', '')) && _.result(resp, 'syncInProgress', false) === true) {
                    this._fetchPatientRecord(this.syncCollection, resp);
                } else {
                    this.showError({
                        message: 'Error syncing MVI record for patient'
                    });
                }
            },
            'read:error': function(model, resp) {
                if (resp.status) {
                    this.showError(resp);
                }
            }
        },
        sitesEvents: {
            'read:success': function(collection, resp, options) {
                this.sitesFetchComplete = true;
                this.trigger('sites:fetch:success');
            },
            'read:error': function(collection, resp, options) {
                if (resp.status) {
                    this.showError(resp);
                }
            }
        },
        visitEvents: {
            'read:success': function(collection, resp) {
                if (!collection.isEmpty()) {
                    var visit = collection.at(0).pick(['dateTime', 'locationUid']);
                    if (visit.dateTime) {
                        visit.formattedDateTime = new Moment(visit.dateTime, this.FROM_DATE_FORMAT).format(this.TO_DATE_FORMAT);
                    }
                    if (!_.isUndefined(visit.locationUid)) {
                        visit.serviceCategory = ADK.utils.contextUtils.getServiceCategory(_.get(this.model.attributes, 'visit.locationDisplayName', collection.at(0).get('locationDisplayName')), this._getLocationType(visit), true, false);
                    }
                    //we might need to know if it's changed
                    //rather than just manipulating the pointer
                    var partialVisit = this.model.get('visit');
                    this.model.unset('visit', {
                        silent: true
                    });
                    this.model.set('visit', _.extend({}, partialVisit, visit));
                }
                this.trigger('patient:visit:success');
            }
        },
        patientEvents: {
            'read:error': function(collection, resp) {
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
                            message = 'Error: Patient Loading Failed - ' + ADK.ErrorMessaging.getMessage('syncTimeout');
                        } else {
                            message = ADK.ErrorMessaging.getMessage('default');
                        }

                    }
                }
                this.showError(_.defaults({ message: message }, resp));
            },
            'read:success': function(collection, resp) {
                var successMethod = function(collection, resp) {
                    var patientContext = this._getPatientContext(collection);
                    ADK.SessionStorage.set.sessionModel('patient-domain', new Backbone.Model({
                        data: collection,
                        sites: this.sites
                    }));
                    if (patientContext) {
                        //Minimum defaulted visit object = display name, location ien, provider, date time, formatted date time
                        var visit = {};
                        visit.locationDisplayName = this.model.get('clinicName') || this.model.get('locationName') || patientContext.get('inpatientLocation');
                        visit.dateTime = this.model.get('appointmentTime') || this.model.get('appointment');
                        if (!_.isUndefined(visit.dateTime)) {
                            visit.formattedDateTime = new Moment(visit.dateTime, this.FROM_DATE_FORMAT).format(this.TO_DATE_FORMAT);
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
                        patientContext.set({
                            visit: visit,
                            workspaceContext: this.model.get('workspaceContext')
                        });
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
                        if (!_.isUndefined(this.model.get('admissionUid'))) {
                            this.stopListening(this, 'patient:visit:success');
                            this.listenToOnce(this, 'patient:visit:success', function() {
                                this.model.set(this.getOption('skipAttribute'), true);
                                this.goToNextStep({ continuation: true });
                            });
                            this.visitCollection.fetch({ criteria: { uid: this.model.get('admissionUid') } });
                        } else {
                            this.model.set(this.getOption('skipAttribute'), true);
                            this.goToNextStep({ continuation: true });
                        }
                    }
                };
                if (this.sitesFetchComplete) {
                    successMethod.call(this, collection, resp);
                } else {
                    this.stopListening(this, 'sites:fetch:success');
                    this.listenToOnce(this, 'sites:fetch:success', function() {
                        successMethod.call(this, collection, resp);
                    });
                }
            }
        },
        initialize: function() {
            this.buttonModel = new ConfirmationButton.prototype.ButtonModel();
            this.patientSearchCollection = new ADK.UIResources.Fetch.PatientSelection.Confirmation.PatientMetaData({ patient: this.model });
            this.setupEntityEvents(this.patientSearchCollection, this.getOption('patientSearchEvents'));
            this.lastWorkspaceCollection = new ADK.UIResources.Fetch.PatientSelection.Confirmation.LastWorkspace({ patient: this.model });
            this.setupEntityEvents(this.lastWorkspaceCollection, this.getOption('lastWorkspaceEvents'));
            this.syncCollection = new ADK.UIResources.Fetch.PatientSelection.Confirmation.SyncStatus({ patient: this.model });
            this.setupEntityEvents(this.syncCollection, this.getOption('syncEvents'));
            this.sites = new ADK.UIResources.Fetch.PatientSelection.Confirmation.Sites();
            this.setupEntityEvents(this.sites, this.getOption('sitesEvents'));
            this.visitCollection = new ADK.UIResources.Fetch.PatientSelection.Confirmation.Visits({ patient: this.model });
            this.setupEntityEvents(this.visitCollection, this.getOption('visitEvents'));
            this.patientRecordCollection = new ADK.UIResources.Fetch.PatientSelection.Confirmation.PatientRecord({ patient: this.model });
            this.setupEntityEvents(this.patientRecordCollection, this.getOption('patientEvents'));
        },
        showFooter: function() {
            ConfirmationStep.prototype.showFooter.call(this, _.extend({ buttonModel: this.buttonModel }, this.getOption('confirmationOptions')));
        },
        initShow: function() {
            this.showLoading();
            this._fetchImage();
            this._fetchUnmaskedPatient();
            // this shows the body/footer (AKA "all")
            this._fetchLastWorkspace();
        },
        completeStepAction: function() {
            this._checkIfSynced();
        },
        _isAcknowledged: function() {
            return !!this.model.get('acknowledged');
        },
        _fetchImage: function() {
            var imageOptions;
            if (this._isAcknowledged()) {
                imageOptions = { _ack: true };
            }
            ADK.PatientRecordService.getPatientPhoto(this.model, imageOptions);
        },
        _fetchUnmaskedPatient: function() {
            this.patientSearchCollection.fetch();
        },
        _fetchLastWorkspace: function() {
            this.lastWorkspaceCollection.fetch();
        },
        _checkIfSynced: function() {
            var pid = this.model.get('pid');
            var icn = this.model.get('icn');
            if (!icn && pid) {
                this.model.set('icn', pid);
            }
            this.syncCollection.fetch();
        },
        _fetchPatientRecord: function(collection, resp) {
            // Add a check to sync status response to determine if patient is fully synced or not.
            if (!this._isPatientSynced(resp)) {
                this.buttonModel.set('state', 'syncing');
            } else {
                this.buttonModel.set('state', 'loading');
            }
            if (this.model.has(this.getOption('skipAttribute'))) {
                this.model.set(this.getOption('skipAttribute'), true);
            }
            this._fetchSites();
            this.patientRecordCollection.fetch();
        },
        _fetchSites: function() {
            this.abort(this.sites);
            this.sites.fetch({ cache: true });
        },
        // This is a utility function to check to see if a patient is fully synced based on resp from synchronization-datastatus
        _isPatientSynced: function(resp) {
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
        },
        _getPatientContext: function(patientDemographicsCollection) {
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
                    patientDemographics.set('pid', this.model.get('pid'));
                    patientDemographics.set('nonLocalPatient', true);
                } else {
                    console.log("PATIENT_SEARCH------->>> Error, can't find MVI/VLER record for nonlocal patient");
                }
            }
            if (_.isUndefined(patientDemographics)) {
                patientDemographics = patientDemographicsCollection.findWhere({
                    icn: this.model.get('pid')
                });
                if (patientDemographics) {
                    patientDemographics.set('pid', this.model.get('pid'));
                }
            }
            if (_.isUndefined(patientDemographics)) {
                patientDemographics = patientDemographicsCollection.at(0);
                if (patientDemographics) {
                    patientDemographics.set('pid', this.model.get('pid'));
                }
            }
            return patientDemographics;
        },
        _getLocationType: function(visit) {
            if (_.isString(visit.locationUid)) {
                return visit.locationUid.split(':')[4].indexOf('w') > -1 ? 'w' : 'c';
            }
        }
    });

    return PatientConfirmation;
});
