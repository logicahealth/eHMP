define([
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'moment',
    'underscore',
    '../collectionHandler',
    'app/applets/encounters/writeback/saveUtil'
], function(Backbone, Marionette, $, Handlebars, moment, _, collectionHandler, saveUtil) {
    "use strict";

    var appointmentsArray = new Backbone.Collection([{}]);
    var admissionsArray = new Backbone.Collection([{}]);
    var NewVisitModel = Backbone.Model.extend({
        defaults: {
            'locationUid': '',
            'locationDisplayName': '',
            'dateTime': '',
            'formattedDateTime': '',
            'isHistorical': false,
            'existingVisit': false,
            'selectedProvider': {}
        }
    });
    var DATE_TIME_FORMAT = 'YYYYMMDDHHmmss';
    var DISPLAY_FORMAT = 'MM/DD/YYYY HH:mm';
    var NUM_RECENT_LOCATIONS = 5;
    var ALL_LOCATIONS_TEXT = 'All Locations';
    var RECENTLY_USED_LOCATIONS_TEXT = 'Recently Used Locations';
    var NUM_RECENT_PROVIDERS = 5;
    var ALL_PROVIDERS_TEXT = 'All Providers';
    var PROVIDERS_ERROR_MSG = '<p class="font-size-13"><strong>There was an error retrieving the providers list.</strong></p>';
    var RECENTLY_USED_PROVIDERS_TEXT = 'Recently Used Providers';
    var LOADING_ELEMENT = '<i class="loading fa fa-spinner fa-spin visit-loading"></i>';
    var ENCOUNTER_FORM = 'Encounter Form';
    var PROVIDERS_ERROR_NO_RESOURCE_RESPONSE = 'No response was received from the resource server. Contact your System Administrator for assistance.';
    // *********************************************** CONTAINERS ****************************************
    var selectEncounterProviderContainer = {
        control: 'container',
        extraClasses: ['row', 'select-encounter-container', 'top-margin-md'],
        items: [{
            control: 'container',
            extraClasses: ['col-xs-12', 'select-encounter-provider', 'top-margin-sm'],
            template: LOADING_ELEMENT,
            items: [{
                control: 'select',
                label: 'Select Encounter Provider',
                srOnlyLabel: false,
                name: 'selectEncounterProvider',
                placeholder: 'Wait while the list is loading.',
                disabled: true,
                required: true,
                pickList: [],
                showFilter: true,
                groupEnabled: true,
                options: {
                    minimumInputLength: 0,
                    sorter: function(data, params) {
                        var sortedData;
                        var filterText = params.term;
                        // This utilizes an undocumented feature of Select2 version 4.0.0. It may fail if the lib's
                        // future release changes its internal structure of data.
                        if (!_.isEmpty(data) && !_.isUndefined(_.first(data).children)) {
                            sortedData = _.map(data, function(group) {
                                // If this is not the 'Recently Used Providers' list, sort alphabetically,
                                // otherwise this is the 'Recently Used Providers' group of data - don't do
                                // any sorting because we want to preserve the order in which the
                                // providers were recently used.
                                if (group.text !== RECENTLY_USED_PROVIDERS_TEXT) {
                                    // If the user entered text to filter on, display matches beginning
                                    // with the filter text first. Otherwise, display alphabetically.
                                    if (filterText) {
                                        var first = [],
                                            others = [];
                                        for (var i = 0; i < group.children.length; i++) {
                                            var titleString = group.children[i].text.toLowerCase(),
                                                filterTextLower = filterText.toLowerCase();
                                            if (titleString.indexOf(filterTextLower) === 0) {
                                                first.push(group.children[i]);
                                            } else {
                                                others.push(group.children[i]);
                                            }
                                        }
                                        first = _.sortBy(first, function(item) {
                                            return item.text;
                                        });
                                        others = _.sortBy(others, function(item) {
                                            return item.text;
                                        });
                                        group.children = first.concat(others);
                                    } else {
                                        group.children = _.sortBy(group.children, function(item) {
                                            return item.text;
                                        });
                                    }
                                }
                                return group;
                            });
                        } else {
                            sortedData = _.map(data, function(group) {
                                // If this is the 'Recently Used Providers' group of data, don't do
                                // any sorting because we want to preserve the order in which the
                                // providers were recently used.
                                if (group.text === RECENTLY_USED_PROVIDERS_TEXT) {
                                    return group;
                                }
                                // Sort alphabetically
                                group.children = _.sortBy(group.children, function(item) {
                                    return item.text;
                                });
                                return group;
                            });
                        }
                        return sortedData;
                    }
                }
            }]
        }]
    };
    var clinicalAppointmentsTab = {
        title: 'Clinic Appointments',
        items: [{
            control: 'container',
            extraClasses: ['row'],
            items: [{
                control: 'container',
                extraClasses: ['col-xs-12'],
                template: '<p>Viewing <strong>{{clinicAppointmentsFromDate}}</strong> to <strong>{{clinicAppointmentsThroughDate}}</strong><p>'
            }]
        }, {
            control: 'container',
            extraClasses: ['row'],
            items: [{
                control: 'selectableTable',
                name: 'appointmentsModel',
                id: 'selectableTableAppointments',
                collection: appointmentsArray,
                columns: [{
                    title: 'Date',
                    id: 'formattedDateTime'
                }, {
                    title: 'Details',
                    id: 'details'
                }, {
                    title: 'Location',
                    id: 'locationDisplayName'
                }],
                label: 'appointments/visit'
            }]
        }]
    };
    var hospitalAdmissionsTab = {
        title: 'Hospital Admissions',
        items: [{
            control: 'container',
            extraClasses: ['row'],
            items: [{
                control: 'container',
                extraClasses: ['col-xs-12'],
                template: '<p class="top-padding-sm bottom-padding-sm">Recent admissions (up to the last 5)</p>'
            }]
        }, {
            control: 'container',
            extraClasses: ['row'],
            items: [{
                control: 'selectableTable',
                name: 'admissionsModel',
                id: 'selectableTableAdmissions',
                collection: admissionsArray,
                columns: [{
                    title: 'Date',
                    id: 'formattedDateTime'
                }, {
                    title: 'Details',
                    id: 'details'
                }, {
                    title: 'Location',
                    id: 'locationDisplayName'
                }],
                label: 'admission'
            }]
        }]
    };
    var newVisitTab = {
        title: 'New Visit',
        items: [{
            control: 'container',
            extraClasses: ['row'],
            items: [{
                control: 'container',
                extraClasses: ['col-xs-12'],
                template: '<p>New Visit</p>'
            }]
        }, {
            control: 'container',
            extraClasses: ['row', 'select-location-container'],
            items: [{
                control: 'container',
                extraClasses: ['col-xs-12', 'encounter-set'],
                template: LOADING_ELEMENT,
                items: [{
                    control: 'select',
                    label: 'New Encounter Location',
                    srOnlyLabel: false,
                    name: 'selectNewEncounterLocation',
                    disabled: true,
                    required: true,
                    pickList: [],
                    showFilter: true,
                    groupEnabled: true,
                    options: {
                        minimumInputLength: 0,
                        sorter: function(data, params) {
                            var sortedData;
                            var filterText = params.term;
                            // This utilizes an undocumented feature of Select2 version 4.0.0. It may fail if the lib's
                            // future release changes its internal structure of data.
                            if (!_.isEmpty(data) && !_.isUndefined(_.first(data).children)) {
                                sortedData = _.map(data, function(group) {
                                    // If this is not the 'Recently Used Locations' list, sort alphabetically,
                                    // otherwise this is the 'Recently Used Locations' group of data - don't do
                                    // any sorting because we want to preserve the order in which the
                                    // locations were recently used.
                                    if (group.text !== RECENTLY_USED_LOCATIONS_TEXT) {
                                        // If the user entered text to filter on, display matches beginning
                                        // with the filter text first. Otherwise, display alphabetically.
                                        if (filterText) {
                                            var first = [],
                                                others = [];
                                            for (var i = 0; i < group.children.length; i++) {
                                                var titleString = group.children[i].text.toLowerCase(),
                                                    filterTextLower = filterText.toLowerCase();
                                                if (titleString.indexOf(filterTextLower) === 0) {
                                                    first.push(group.children[i]);
                                                } else {
                                                    others.push(group.children[i]);
                                                }
                                            }
                                            first = _.sortBy(first, function(item) {
                                                return item.text;
                                            });
                                            others = _.sortBy(others, function(item) {
                                                return item.text;
                                            });
                                            group.children = first.concat(others);
                                        } else {
                                            group.children = _.sortBy(group.children, function(item) {
                                                return item.text;
                                            });
                                        }
                                    }
                                    return group;
                                });
                            } else {
                                sortedData = _.map(data, function(group) {
                                    // If this is the 'Recently Used Locations' group of data, don't do
                                    // any sorting because we want to preserve the order in which the
                                    // locations were recently used.
                                    if (group.text === RECENTLY_USED_LOCATIONS_TEXT) {
                                        return group;
                                    }
                                    // Sort alphabetically
                                    group.children = _.sortBy(group.children, function(item) {
                                        return item.text;
                                    });
                                    return group;
                                });
                            }
                            return sortedData;
                        }
                    }
                }]
            }]
        }, {
            control: 'container',
            extraClasses: ['row'],
            items: [{
                control: 'container',
                extraClasses: ['col-xs-12', 'all-padding-no'],
                items: [{
                    control: 'container',
                    extraClasses: ['col-xs-6', 'encounter-set'],
                    items: [{
                        control: 'datepicker',
                        name: 'newVisitDate',
                        flexible: true,
                        minPrecision: 'day',
                        srOnlyLabel: false,
                        required: true,
                        disabled: true,
                        label: 'Date',
                        startDate: moment().subtract(100, 'y')
                    }]
                }, {
                    control: 'container',
                    extraClasses: ['col-xs-6', 'encounter-set'],
                    items: [{
                        control: 'timepicker',
                        placeholder: 'HH:MM',
                        name: 'newVisitTime',
                        srOnlyLabel: false,
                        required: true,
                        disabled: true,
                        label: 'Time of Visit'
                    }]
                }]
            }]
        }, {
            control: 'container',
            extraClasses: ['row', 'top-margin-md'],
            items: [{
                control: 'container',
                extraClasses: ['col-xs-12'],
                items: [{
                    control: 'alertBanner',
                    name: 'newVisitDateTimeWarning',
                    type: 'info'
                }]
            }]
        }, {
            control: 'container',
            extraClasses: ['row'],
            items: [{
                control: 'container',
                extraClasses: ['col-xs-12'],
                items: [{
                    control: 'checkbox',
                    name: 'isHistorical',
                    label: 'Historical Visit: a visit that occurred at some time in the past or at some other location (possibly non-VA) but is not used for workload credit.'
                }]
            }]
        }]
    };
    var selectEncounterProviderLocation = {
        control: 'container',
        extraClasses: ['row'],
        items: [{
            control: 'container',
            extraClasses: ['col-xs-12'],
            items: [{
                control: 'container',
                tagName: 'h5',
                extraClasses: ['bottom-padding-no'],
                template: 'Select Encounter Location'
            }, {
                control: 'tabs',
                id: 'tabs-container',
                tabs: [clinicalAppointmentsTab, hospitalAdmissionsTab, newVisitTab]
            }]
        }]
    };
    // *********************************************** END OF CONTAINERS ****************************************
    // *********************************************** FIELDS ***************************************************
    var formFields = [{
        control: 'container',
        extraClasses: ['modal-body'],
        items: [{
            control: 'container',
            extraClasses: ['container-fluid'],
            items: [selectEncounterProviderLocation, selectEncounterProviderContainer]
        }]
    }, {
        control: 'container',
        extraClasses: ['modal-footer'],
        items: [{
            control: 'container',
            extraClasses: ['form-group','display-flex','valign-bottom'],
            items: [
            {
                control: 'popover',
                behaviors: {
                    Confirmation: {
                        title: 'Warning',
                        eventToTrigger: 'encounter-confirm-cancel'
                    }
                },
                label: 'Cancel',
                name: 'encounterConfirmCancel',
                extraClasses: ['btn-default', 'btn-sm','right-margin-xs']
            },
            {
                control: 'button',
                type: 'submit',
                id: 'viewEncounters-btn',
                label: 'Set',
                title: 'Press enter to confirm.',
                disabled: true,
                extraClasses: ['btn-primary', 'btn-sm', 'left-margin-xs'],
                name: 'set'
            }]
        }]
    }];
    // *********************************************** END OF FIELDS ********************************************
    // *********************************************** FORM VIEW ************************************************
    var formView = ADK.UI.Form.extend({
        inTray: null,
        _skipVisitCheck: null,
        onClose: null,
        ui: {
            'selectEncounterProvider': '.selectEncounterProvider select',
            'selectNewEncounterLocation': '.selectNewEncounterLocation select',
            'setCloseButton': '#setClose-btn',
            'encountersButton': '#viewEncounters-btn',
            'newVisitDateTimeWarning': '.newVisitDateTimeWarning',
            'providerLoading': '.select-encounter-container',
            'locationLoading': '.select-location-container',
            'newVisitFields': '.selectNewEncounterLocation, .newVisitDate, .newVisitTime'
        },
        fields: formFields,
        events: {
            'submit': 'submitForm',
            'encounter-confirm-cancel':function(e){
                var footerOptions = {
                    workflow: this.workflow,
                    inTray: this._inTray,
                    onClose: this.onClose,
                    form: this
                };
                if (_.isFunction(footerOptions.onClose)) {
                    _.bind(footerOptions.onClose, footerOptions.workflow)();
                }

                //--- Remove if ENABLING encounter form.
                ADK.UI.Workflow.hide();
                if (!_.isUndefined(footerOptions.workflow)) {
                    footerOptions.workflow.close();
                }
                ADK.Messaging.getChannel('encountersWritebackTray').trigger('encounter:context:cancel', footerOptions);
            },
            'click @ui.encountersButtons': function(e) {
                e.preventDefault();
                this.submitForm(e);
            },
            'show.bs.tab .tab-container': 'tabChanged'
        },
        modelEvents: {
            'change:newVisitDate': 'validateNewVisitDateTime',
            'change:newVisitTime': 'validateNewVisitDateTime',
            'change:selectEncounterProvider': 'validateForm',
            'change:admissionsModel': 'setAdmission',
            'change:appointmentsModel': 'setAppointment',
            'change:selectNewEncounterLocation': 'setNewEncounterLocation'
        },
        submitForm: function(e) {
            e.preventDefault();
            if (!this.dateValidation()) {
                this.model.set('formStatus', {
                    status: 'error',
                    message: this.model.validationError
                });
                this.transferFocusToFirstError();
            } else if (this._skipVisitCheck) {
                this.successfulSubmit();
            } else {
                this.$el.trigger('tray.loaderShow', {
                    loadingString: 'Setting encounter'
                });
                ADK.Checks.run('visit-context', this.successfulSubmit.bind(this));
            }
        },
        successfulSubmit: function () {
            var locationUid = '';
            var currentPatient = ADK.PatientRecordService.getCurrentPatient();
            var isInpatient = (currentPatient.patientStatusClass() === 'Inpatient') ? '1' : '0';
            this.model.unset('formStatus');
            var PatientModel = ADK.PatientRecordService.getCurrentPatient();
            var visit = this.model.get('visit');
            var setEncounterAlertView = new ADK.UI.Notification({
                title: 'Encounter context',
                icon: 'fa-check',
                type: 'success',
                message: 'Successfully set with no errors.'
            });
            this.setProvider(this.model);
            if (!_.isUndefined(this.model.get('visit').get('locationUid')) && this.model.get('visit').get('locationUid') !== '') {
                locationUid = this.model.get('visit').get('locationUid');
            }
            if (this.currentTab.indexOf('New-Visit-tab-panel') >= 0) {
                var datetime = moment(this.model.get('newVisitDate') + ' ' + this.model.get('newVisitTime')).format(DATE_TIME_FORMAT);
                var formateddatetime = moment(datetime, DATE_TIME_FORMAT).format(DISPLAY_FORMAT);
                if (locationUid) {
                    visit.set('locationUid', locationUid);
                }
                visit.set('dateTime', datetime);
                visit.set('formattedDateTime', formateddatetime);
                visit.set('isHistorical', this.model.get('isHistorical'));
            }
            this.setMostRecentLocationsAndProviders(this.model);
            if (locationUid) {
                var isHistorical = false;
                var locName = !_.isUndefined(visit) ? visit.get("locationDisplayName") : '';
                if (this.model.get('visit').newVisit && this.model.get('visit').newVisit.isHistorical) {
                    isHistorical = true;
                }
                var serviceCategory = ADK.utils.contextUtils.getServiceCategory(locName, this.getVisitTabLocationType(this.currentTab), isInpatient);
                this.setServiceCategory(serviceCategory, this.model);
                this.stopListening(ADK.Messaging.getChannel('visit'), 'context:set');
                ADK.Messaging.getChannel('visit').trigger('context:set');
                setEncounterAlertView.show();
                //check if we're in a workflow
                //check if we're the last step in the flow

                if (this._inTray) {
                    this.$el.trigger('tray.loaderHide');
                    ///Uncomment this line if encounter form is re-enabled
                    //this.preloadEncounter();
                }
                if (!this.isLastStep()) {
                    // *** Uncomment this block if encounter form is re-enabled
                    // Reset encounter form done loading indicator.
                    // ADK.Messaging.getChannel('encountersWritebackTray').trigger('encounter:fetch');
                    // Hide the tray.
                    // ADK.Messaging.getChannel('encountersWritebackTray').trigger('encounter:variable:get', function(encounterVars) {
                    //     if (encounterVars.closeOnSet && self._inTray) {
                    //         // Use the encounter channel to animate the growl alert after the tray is done hidding.
                    //         ADK.Messaging.getChannel('encountersWritebackTray').trigger('encounter:context:alert', setEncounterAlertView);
                    //         self.$el.trigger('tray.hide');
                    //     }
                    // });
                    // Close the encounter workflow only if the context was not set AND it was set from clicking the encounter tray button
                    // Otherwise, continue with the workflow. This is need to support the other tray buttons too.
                    // ADK.Messaging.getChannel('encountersWritebackTray').trigger('encounter:variable:get', function(encounterVars) {
                    //     if (encounterVars.trayOpen && encounterVars.isEncounterWorkflow || !encounterVars.isEncounterWorkflow) {
                    //         self.workflow.goToNext();
                    //         ADK.Messaging.getChannel('encountersWritebackTray').trigger('encounter:promise:new');
                    //     } else {
                    //         self.workflow.close();
                    //         self.preloadEncounter();
                    //     }
                    // });
                    // Close the encounter workflow after setting so we can resume our external workflow.
                    this.workflow.goToNext();
                } else {
                    this.$el.trigger('tray.hide');
                    this.workflow.close();
                    ADK.UI.Workflow.hide();
                }
            }
        },
        dateValidation: function() {

            if (!this.model.get('_newVisitDate').get('day')) {
                this.model.errorModel.set({
                    newVisitDate: 'Date must be in MM/DD/YYYY format'
                });
                return false;
            }
            var earliestDate = moment().subtract(100, 'y');
            var latestDate = moment().add(100, 'y');
            var visitDate = moment(this.model.get('newVisitDate'), "MM/DD/YYYY", true);
            if (!visitDate.isBetween(earliestDate, latestDate)) {
                this.model.errorModel.set({
                    newVisitDate: 'Date must be beween ' + earliestDate.format('L') + ' and ' + latestDate.format('L')
                });
                return false;
            }
            return true;
        },
        preloadEncounter: function() {
            ADK.Messaging.getChannel('encountersWritebackTray').trigger('encounter:promise:new');
            //Uncomment this line if encounter form is re-enabled: ADK.Messaging.getChannel('encountersWritebackTray').trigger('encounter:load', true);
        },
        isLastStep: function() {
            var currentStep = this.getCurrentStep();
            if (!_.isUndefined(currentStep) && currentStep.get('numberOfSteps') === currentStep.get('currentIndex')) {
                return true;
            }
            return false;
        },
        getCurrentStep: function() {
            return this.workflow.options.model.get('steps').findWhere({
                currentStep: true
            });
        },
        tabChanged: function(e) {
            this.previousTab = this.currentTab;
            if (e.target.attributes['aria-controls']) {
                this.currentTab = e.target.attributes['aria-controls'].value;
            }
            if (this.currentTab.indexOf('Clinic-Appointments-tab-panel') >= 0) {
                if (this.previousTab.indexOf('Hospital-Admissions-tab-panel') < 0) {
                    this.refreshProviderPicklist();
                }
                this.ui.newVisitFields.trigger('control:disabled', true);
                this.setAppointment(this.model);
            } else if (this.currentTab.indexOf('Hospital-Admissions-tab-panel') >= 0) {
                if (this.previousTab.indexOf('Clinic-Appointments-tab-panel') < 0) {
                    this.refreshProviderPicklist();
                }
                this.ui.newVisitFields.trigger('control:disabled', true);
                this.setAdmission(this.model);
            } else if (this.currentTab.indexOf('New-Visit-tab-panel') >= 0) {
                this.validateNewVisitDateTime();
                this.setNewEncounterLocation(this.model);
                this.ui.newVisitFields.trigger('control:disabled', false);
            }
        },
        refreshProviderPicklist: function(newVisitDateTime) {
            var refreshDateTime = newVisitDateTime || '';
            var self = this;
            //Clear out provider picklist inbetween loading up new ones.
            self.updateprovidersPickList(self, []);

            //Show loading sign in the providers picklist
            self.$el.find(self.ui.selectEncounterProvider.selector).trigger('control:disabled', true);
            if (this.LOADING_ELEMENT_JQUERY) {
                this.LOADING_ELEMENT_JQUERY.appendTo(self.$el.find('.select-encounter-provider'));
            }
            //Keep track of the tab we're on to preserve the correct call
            var currTab = self.currentTab;
            this.providerCollection = collectionHandler.getProvidersPicklist(refreshDateTime, function(collection, response) {
                //This is the correct call if we're still on the same tab or if the tab we're on,
                // and the tab we were on when the call was made are both not the new visit tab.
                var isCorrespondingResponse = (currTab === self.currentTab || (currTab.indexOf('New-Visit-tab-panel') < 0 && self.currentTab.indexOf('New-Visit-tab-panel') < 0));
                if (!self.isDestroyed && response.status == 200 && isCorrespondingResponse) {
                    var parsedCollection = collectionHandler.providerParser(collection);
                    var providers = self.getVerifiedMostRecent('providers', collection);
                    //Determine if there is a most recent list and include if available.
                    if (providers.available) {
                        self.updateprovidersPickList(self, [{
                            group: RECENTLY_USED_PROVIDERS_TEXT,
                            pickList: providers.items
                        }, {
                            group: ALL_PROVIDERS_TEXT,
                            pickList: parsedCollection[0].pickList
                        }]);
                    } else {
                        self.providersQueue = [];
                        self.updateprovidersPickList(self, parsedCollection);
                    }
                    // defaults the select encounter providers field with user logged-in as a provider
                    var user = ADK.UserService.getUserSession();
                    var isProvider = user.get('provider');
                    if (isProvider && _.isEmpty(self.model.get('selectEncounterProvider')) && !_.isUndefined(collection.get(user.get('duz')[user.get('site')]))) {
                        self.model.set('selectEncounterProvider', user.get('duz')[user.get('site')]);
                    } else if (_.isUndefined(collection.get(self.model.get('selectEncounterProvider')))) {
                        self.model.unset('selectEncounterProvider');
                    }
                    // Enable components if there's a context visit with provider and provider select box has selected item
                    self.validateForm();
                    self.$el.find(self.ui.selectEncounterProvider.selector).trigger('control:disabled', false);
                    //If this isn't the corresponding response, either the correct response has already returned or we're still waiting on it.
                } else if (!self.isDestroyed && !_.isUndefined(response) && isCorrespondingResponse) {
                    //Keep user from being able to press set
                    self.model.unset('selectEncounterProvider');
                    //if response text is empty set a descriptive message
                    response.responseText = !_.isEmpty(response.responseText) ? response.responseText : PROVIDERS_ERROR_NO_RESOURCE_RESPONSE;
                    //Alert user that the provider picklist call has errored out.
                    var SimpleAlertItemView = Backbone.Marionette.ItemView.extend({
                        template: Handlebars.compile([
                            PROVIDERS_ERROR_MSG + '<div><strong>Error:</strong> ' + response.status + ' - ' + response.statusText + '<br><strong>Error Response: </strong>' + response.responseText + '</div>'
                        ].join('\n'))
                    });
                    var SimpleAlertFooterItemView = Backbone.Marionette.ItemView.extend({
                        template: Handlebars.compile(['{{ui-button "OK" classes="btn-primary alert-continue btn-sm" title="Press enter to close."}}'].join('\n')),
                        events: {
                            'click button': function() {
                                ADK.UI.Alert.hide();
                            }
                        }
                    });
                    var alertView = new ADK.UI.Alert({
                        title: 'Error',
                        icon: 'icon-circle-exclamation',
                        messageView: SimpleAlertItemView,
                        footerView: SimpleAlertFooterItemView
                    });
                    alertView.show();
                }
                // Clear loading spinner
                if (_.isObject(self.ui.providerLoading) && $(self.ui.providerLoading.selector)) {
                    self.LOADING_ELEMENT_JQUERY = $(self.ui.providerLoading.selector).find('.loading');
                    self.LOADING_ELEMENT_JQUERY.detach();
                }
            });
        },
        getVerifiedMostRecent: function(type, collection) {
            var list = {
                available: false,
                items: []
            };
            var sessionRecentlySelected = ADK.UserService.getUserSession().get('recentlySelected');
            if (sessionRecentlySelected && sessionRecentlySelected.attributes && (list.items = sessionRecentlySelected.get(type)) && list.items.length > 0) {
                list.available = true;
            } else if (sessionRecentlySelected && (list.items = sessionRecentlySelected[type]) && list.items.length > 0) {
                list.available = true;
                //Keep consistent persistence between window refreshes.
                this[type + 'Queue'] = list.items;
            }
            //This should only need to be used for providers not locations.
            if (list.available && !_.isUndefined(collection)) {
                var availableList = [];
                //Want to make sure we're only displaying recent items that are available in the complete list.
                _.each(list.items, function(item) {
                    if (!_.isUndefined(collection.get(item.value))) {
                        availableList.push(item);
                    }
                });
                if (availableList.length > 0) {
                    list.items = availableList;
                } else {
                    list.available = false;
                    list.items = [];
                }
            }
            return list;
        },
        /**
         * Displays a warning if the user selects a new visit date/time that occurs
         * in the future. Hides the warning if the user selects a new visit date/time
         * that occurs in the past. If the New Visit tab is selected, the provider
         * picklist will be repopulated with providers that were active on the date
         * that is selected in the date picker.
         */
        validateNewVisitDateTime: function() {
            var newVisitDateTime = moment(this.model.get('newVisitDate') + ' ' + this.model.get('newVisitTime'));
            var currentDateTime = moment();
            if (this.currentTab.indexOf('New-Visit-tab-panel') >= 0) {
                this.refreshProviderPicklist(newVisitDateTime);
            }
            if (newVisitDateTime.isValid() && newVisitDateTime.isAfter(currentDateTime)) {
                this.$(this.ui.newVisitDateTimeWarning.selector).removeClass('hide');
            } else {
                this.$(this.ui.newVisitDateTimeWarning.selector).addClass('hide');
            }
            this.validateForm();
        },
        validateForm: function() {
            var isValid = {
                //Selected location, exisiting location, or new location
                loc: !_.isUndefined(this.model.get('visit')) && !_.isUndefined(this.model.get('visit').get('locationDisplayName')) && this.model.get('visit').get('locationDisplayName') !== '',
                eloc: !_.isUndefined(this.model.get('contextVisit')) && !_.isUndefined(this.model.get('contextVisit').get('locationDisplayName') && this.model.get('contextVisit').get('locationDisplayName') !== ''),
                nloc: !_.isUndefined(this.model.newVisit.get('existingVisit')) && this.model.newVisit.get('locationDisplayName') !== '',
                //Selected provider
                prov: !_.isUndefined(this.model.get('selectEncounterProvider')) && this.model.get('selectEncounterProvider') !== '',
                //New visit date and time
                nvtime: this.model.get('newVisitTime') !== '',
                nvdate: this.model.get('newVisitDate') !== '',
            };
            var validForm = false;
            if (this.currentTab.indexOf('Clinic-Appointments-tab-panel') >= 0 || this.currentTab.indexOf('Hospital-Admissions-tab-panel') >= 0) {
                if ((isValid.loc || isValid.eloc) && isValid.prov) {
                    validForm = true;
                }
            } else if (this.currentTab.indexOf('New-Visit-tab-panel') >= 0) {
                if ((isValid.nloc) && isValid.prov && isValid.nvtime && isValid.nvdate) {
                    validForm = true;
                }
            } else {
                validForm = false;
            }
            this.$(this.ui.setCloseButton.selector).prop('disabled', !validForm);
            this.$(this.ui.encountersButton.selector).prop('disabled', !validForm);
        },
        setAdmission: function(model) {
            if (model.get('admissionsModel')) {
                model.set('visit', model.get('admissionsModel'));
                model.get('visit').set('existingVisit', true);
            } else {
                model.set('visit', undefined);
            }
            this.validateForm();
        },
        setAppointment: function(model) {
            if (model.get('appointmentsModel')) {
                model.set('visit', model.get('appointmentsModel'));
                model.get('visit').set('existingVisit', true);
            } else {
                model.set('visit', undefined);
            }
            this.validateForm();
        },
        setNewEncounterLocation: function(model) {
            var locationUid = model.get('selectNewEncounterLocation');
            var locationDisplayName = model.get('_labelsForSelectedValues').get('selectNewEncounterLocation');
            var locationModel = this.locationCollection.findWhere({
                uid: locationUid
            });
            if (locationModel) {
                //additional fields
                this.model.newVisit.set({
                    existingVisit: false,
                    locationDisplayName: locationModel.get('displayName'),
                    locationUid: locationUid
                });
            } else {
                this.model.newVisit.unset('existingVisit');
                this.model.newVisit.unset('locationDisplayName');
                this.model.newVisit.unset('locationUid');
                this.model.newVisit.unset('serviceCategory');
            }
            this.model.set('visit', this.model.newVisit);
            this.validateForm();
        },
        setMostRecentLocationsAndProviders: function(model) {
            var locationUid = model.get('selectNewEncounterLocation');
            var locationDisplayName = model.get('_labelsForSelectedValues').get('selectNewEncounterLocation');
            var providerCode = model.get('selectEncounterProvider');
            var providerName = model.get('_labelsForSelectedValues').get('selectEncounterProvider');
            var locationNew = false;
            var providerNew = false;
            var recentLocations = ADK.UserService.getUserSession().get('recentlySelected');
            // If location UID and location name are defined
            if (locationUid && locationDisplayName) {
                locationNew = true;
                var selectedLocation = {
                    'value': locationUid,
                    'label': locationDisplayName
                };
                var locationIndex = -1;
                // Check the user session first for existing list of recent locations.
                if (!_.isUndefined(recentLocations)) {
                    if (recentLocations instanceof Backbone.Model) {
                        this.locationsQueue = recentLocations.get('locations');
                    } else if (!_.isUndefined(recentLocations.locations)) {
                        this.locationsQueue = recentLocations.locations;
                    }
                }

                // Check to see if the selected location is already in the queue. If it is, grab its index.
                _.each(this.locationsQueue, function(queueElement, queueIndex) {
                    if (queueElement.value === locationUid) {
                        locationIndex = queueIndex;
                    }
                });
                // If the selected location is already in the queue,
                // remove the original item and add the location to the top,
                // otherwise just add the selected location to the top
                if (locationIndex >= 0 && !_.isUndefined(recentLocations)) {
                    this.locationsQueue.splice(locationIndex, 1);
                    this.locationsQueue.unshift(selectedLocation);
                } else {
                    if (this.locationsQueue.length < NUM_RECENT_LOCATIONS) {
                        // Add to the beginning of the array
                        this.locationsQueue.unshift(selectedLocation);
                    } else {
                        this.locationsQueue.pop();
                        this.locationsQueue.unshift(selectedLocation);
                    }
                }
            }
            // If provider code and provider name are defined
            if (providerCode && providerName) {
                providerNew = true;
                var selectedProvider = {
                    'value': providerCode,
                    'label': providerName
                };
                var providerIndex = -1;

                if (!_.isUndefined(recentLocations)) {
                    if (recentLocations instanceof Backbone.Model) {
                        this.providersQueue = recentLocations.get('providers');
                    } else if (!_.isUndefined(recentLocations.providers)) {
                        this.providersQueue = recentLocations.providers;
                    }
                }

                // Check to see if the selected provider is already in the queue. If it is, grab its index.
                _.each(this.providersQueue, function(queueElement, queueIndex) {
                    if (queueElement.value === providerCode) {
                        providerIndex = queueIndex;
                    }
                });
                // If the selected provider is already in the queue,
                // remove the original item and add the provider to the top,
                // otherwise just add the selected provider to the top
                if (providerIndex >= 0) {
                    this.providersQueue.splice(providerIndex, 1);
                    this.providersQueue.unshift(selectedProvider);
                } else {
                    if (this.providersQueue.length < NUM_RECENT_PROVIDERS) {
                        // Add to the beginning of the array
                        this.providersQueue.unshift(selectedProvider);
                    } else {
                        this.providersQueue.pop();
                        this.providersQueue.unshift(selectedProvider);
                    }
                }
            }
            // Add recent queues to the "recently selected" session object if we've had to update them.
            if (locationNew || providerNew) {
                var recentlySelected = new Backbone.Model({
                    locations: this.locationsQueue,
                    providers: this.providersQueue
                });
                var userModel = ADK.UserService.getUserSession();
                userModel.set('recentlySelected', recentlySelected);
            }
        },
        setServiceCategory: function(serviceCategory, original) {
            original.get('visit').set('serviceCategory', serviceCategory);
            if (original.get('visit').get('newVisit')) {
                original.get('visit').get('newVisit').serviceCategory = serviceCategory;
            }
            var PatientModel = ADK.PatientRecordService.getCurrentPatient();
            PatientModel.set({
                visit: JSON.parse(JSON.stringify(original.get('visit')))
            });
            ADK.SessionStorage.set.sessionModel('patient', PatientModel, 'session');
        },
        getVisitTabLocationType: function(currentTab) {
            if (currentTab.indexOf('Clinic-Appointments-tab-panel') >= 0 || currentTab.indexOf('New-Visit-tab-panel') >= 0) {
                return 'c';
            } else if (currentTab.indexOf('Hospital-Admissions-tab-panel') >= 0) {
                return 'w';
            }
        },
        setProvider: function(model) {
            var selectedProvider = this.providerCollection.findWhere({
                code: model.get('selectEncounterProvider')
            });
            // Assign the current patient context visit if model does not contain visit object
            if (!_.isObject(model.get('visit')) || _.isUndefined(model.get('visit').get('locationDisplayName')) || model.get('visit').get('locationDisplayName') === "") {
                model.set('visit', model.get('contextVisit'));
            }
            // Set provider
            if (selectedProvider) {
                model.get('visit').set('selectedProvider', selectedProvider.toJSON());
            } else {
                model.get('visit').set('selectedProvider', {});
            }
        },
        setDatesAppointments: function(fromDate, toDate) {
            //filter the collection
            var filteredCollection = collectionHandler.collectionDateFilter(this.apptsCollection, fromDate, toDate);
            appointmentsArray.set(filteredCollection);
        },
        setDatesHospital: function(collection) {
            //filter the collection
            var filteredCollection = collectionHandler.admissionsParser(collection).models;
            admissionsArray.set(filteredCollection);
        },
        currentTab: 'Clinic-Appointments-tab-panel', //initial value
        previousTab: 'Clinic-Appointments-tab-panel',
        loadVisits: function(self) {
            //Clear out old results
            appointmentsArray.reset();
            admissionsArray.reset();
            //Put up loader
            self.onAttach();
            self.$el.trigger('tray.loaderShow', {
                loadingString: 'Loading'
            });
            // appointments
            var criteria = ADK.SessionStorage.get.sessionModel('user', 'SessionStorage');
            var site = criteria.get("site");
            var currentPatient = ADK.PatientRecordService.getCurrentPatient();
            var currentPatientPID = currentPatient.get('pid');
            var fromDate = this.model.get('clinicAppointmentsFromDate');
            var toDate = this.model.get('clinicAppointmentsThroughDate');
            var appointmentsCriteria = {
                pid: currentPatientPID,
                fromDate: fromDate,
                toDate: toDate,
                site: site
            };
            if (!_.has(this, "apptsCollection.xhr") || !_.isFunction(_.get(this, "apptsCollection.xhr.state", null)) || this.apptsCollection.xhr.state() !== "pending") {
                self.apptsCollection = collectionHandler.getAppointments(appointmentsCriteria, function(collection) {
                    var appts = collectionHandler.appointmentsParser(collection);
                    var contextVisit = self.model.get('contextVisit');
                    if (contextVisit && contextVisit.get('formattedDateTime')) {
                        contextVisit = appts.where({
                            formattedDateTime: contextVisit.get('formattedDateTime')
                        })[0];
                        if (contextVisit && contextVisit.get('formattedDateTime')) {
                            self.model.set('appointmentsModel', contextVisit);
                            self.model.set('preSelectSRText', 'Appointment ' + contextVisit.get('formattedDateTime') + ' ' + contextVisit.get('locationDisplayName') + ' ' + contextVisit.get('facilityDisplay') + ' pre-selected from current Encounter.');
                        }
                    }
                    appointmentsArray.set(appts.models);
                    if (collection.length > 0) {
                        self.setDatesAppointments(fromDate, toDate);
                    }
                        self.$el.find('#selectableTableAppointments').trigger('control:loading', false);
                        self.$el.trigger('tray.loaderHide');
                });
            }
            // admissions
            if (!_.has(this, "admissionCollection.xhr") || !_.isFunction(_.get(this, "admissionCollection.xhr.state", null)) || this.admissionCollection.xhr.state() !== "pending") {
                self.admissionCollection = collectionHandler.getAdmissions(function(collection) {
                    var admissions = collectionHandler.admissionsParser(collection);
                    admissionsArray.set(admissions.models);
                    if (collection.length > 0) {
                        self.setDatesHospital(collection);
                    } else {
                        self.$el.find('#selectableTableAdmissions').trigger('control:loading', false);
                        self.$el.trigger('tray.loaderHide');
                    }
                });
            }
        },
        initialize: function(form) {
            this._inTray = _.isBoolean(this.inTray) ? this.inTray : false;
            this._skipVisitCheck = _.isBoolean(this.skipVisitCheck) ? this.skipVisitCheck : false;
            this.listenTo(ADK.Messaging.getChannel('visit'), 'context:set', function() {
                this.stopListening(ADK.Messaging.getChannel('visit'), 'context:set');
                if (this.isLastStep()) {
                    if (this._inTray) {
                        this.workflow.close();
                    } else {
                        ADK.UI.Workflow.hide();
                    }
                } else {
                    this.workflow.goToNext();
                }
            });
            //set recent queues up
            this.locationsQueue = [];
            this.providersQueue = [];
            //clears out the appointments of the previous patient
            appointmentsArray.reset();
            admissionsArray.reset();
            //defaults
            var now = moment();
            var minusThirty = moment();
            var plusThirty = moment();
            var minusTen = moment();
            minusThirty = minusThirty.subtract('days', 30);
            plusThirty = plusThirty.add('days', 30);
            minusTen = minusTen.subtract('years', 10);
            this.model.set('newVisitDate', now.format('MM/DD/YYYY'));
            this.model.newVisit = new NewVisitModel();
            this.model.set({
                'visit': this.model.newVisit,
                'clinicAppointmentsFromDate': minusThirty.format('MM/DD/YYYY'),
                'clinicAppointmentsThroughDate': plusThirty.format('MM/DD/YYYY'),
                'hospitalAdmissionFromDate': minusThirty.format('MM/DD/YYYY'),
                'hospitalAdmissionThroughDate': plusThirty.format('MM/DD/YYYY'),
                'newVisitDateTimeWarning': 'You have selected a future date/time'
            });
            var self = this;
            this._super = ADK.UI.Form.prototype;
            this._super.initialize.apply(this, arguments);
            // the providers picklist
            this.refreshProviderPicklist('');
            //locations picklist
            this.locationCollection = collectionHandler.getLocations(this, function(collection) {
                if (!self.isDestroyed) {
                    var parsedCollection = collectionHandler.locationsParser(collection);
                    var locations = self.getVerifiedMostRecent('locations');
                    if (locations.available) {
                        self.updatelocationsPickList(self, [{
                            group: RECENTLY_USED_LOCATIONS_TEXT,
                            pickList: locations.items
                        }, {
                            group: ALL_LOCATIONS_TEXT,
                            pickList: parsedCollection[0].pickList
                        }]);
                    } else {
                        self.locationsQueue = [];
                        self.updatelocationsPickList(self, parsedCollection);
                    }
                }
                // Clear loading spinner
                if (_.isObject(self.ui.locationLoading) && $(self.ui.locationLoading.selector)) {
                    $(self.ui.locationLoading.selector).find('.loading').detach();
                }
            });
            this.listenTo(self.workflow.parentViewInstance.TrayView, 'tray.show', function() {
                if (self.workflow.model.get('currentIndex') === self.viewIndex) {
                    self.loadVisits(self);
                }
            });
            if (_.isUndefined(self.workflow.parentViewInstance.TrayView) && self.workflow.model.get('currentIndex') === self.viewIndex) {
                self.loadVisits(self);
            }
        },
        onDestroy: function() {
            this.stopListening();
            this.stopListening(this.providerCollection, 'fetch:success');
            this.stopListening(this.providerCollection, 'fetch:error');
            this.stopListening(this.locationCollection, 'fetch:success');
            this.stopListening(this.locationCollection, 'fetch:error');

            var admissionsCollectionXhr = _.get(this.admissionCollection, 'xhr');
            if (admissionsCollectionXhr) {
                admissionsCollectionXhr.abort();
            }

            var apptsCollectionXhr = _.get(this.apptsCollection, 'xhr');
            if (apptsCollectionXhr) {
                apptsCollectionXhr.abort();
            }
        },
        onAttach: function() {
            // Loading...
            this.$el.find('#selectableTableAdmissions').trigger('control:loading', true);
            this.$el.find('#selectableTableAppointments').trigger('control:loading', true);
        },
        updateprovidersPickList: function(form, options) {
            this.$('.selectEncounterProvider').trigger('control:picklist:set', [options]);
        },
        updatelocationsPickList: function(form, options) {
            this.$('.selectNewEncounterLocation').trigger('control:picklist:set', [options]);
        }
    });
    // *********************************************** END OF FORM VIEW *****************************************
    return formView;
});