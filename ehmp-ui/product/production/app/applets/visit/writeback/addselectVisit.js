define([
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'moment',
    '../collectionHandler',
    'app/applets/visit/utils/saveUtil'
], function(Backbone, Marionette, $, Handlebars, moment, collectionHandler, saveUtil) {
    "use strict";

    var appointmentsArray = new Backbone.Collection([{}]);
    var admissionsArray = new Backbone.Collection([{}]);
    var cachedData = {
        'locations': new Backbone.Collection(),
        'providers': new Backbone.Collection(),
        'appointments': new Backbone.Collection([{}]),
        'admissions': new Backbone.Collection([{}])
    };
    var NewVisitModel = Backbone.Model.extend({
        defaults: {
            'locationUid': '',
            'locationDisplayName': '',
            'dateTime': '',
            'formattedDate': '',
            'isHistorical': 'off',
            'existingVisit': false,
            'selectedProvider': {}
        }
    });
    var DATE_TIME_FORMAT = 'YYYYMMDDHHmm';
    var DISPLAY_FORMAT = 'MM/DD/YYYY HH:mm';
    var locationQueue = [];
    var NUM_RECENT_LOCATIONS = 5;
    var ALL_LOCATIONS_TEXT = 'All Locations';
    var RECENTLY_USED_LOCATIONS_TEXT = 'Recently Used Locations';
    var providerQueue = [];
    var NUM_RECENT_PROVIDERS = 5;
    var ALL_PROVIDERS_TEXT = 'All Providers';
    var RECENTLY_USED_PROVIDERS_TEXT = 'Recently Used Providers';
    var LOADING_ELEMENT = '<i class="loading fa fa-spinner fa-spin" style="position: absolute; top: 28px; left: 17px; z-index: 9;"></i>';
    // *********************************************** CONTAINERS ****************************************
    var selectEncounterProviderContainer = {
        control: 'container',
        extraClasses: ['row select-encounter-container'],
        items: [{
            control: 'container',
            extraClasses: ['col-md-6'],
            template: LOADING_ELEMENT,
            items: [{
                control: 'select',
                label: 'Select Encounter Provider',
                srOnlyLabel: false,
                name: 'selectEncounterProvider',
                placeholder: 'Please wait while the list is loading.',
                disabled: true,
                pickList: 'selectEncounterProviderPickList',
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
                extraClasses: ['col-md-12', 'marginTopButtom'],
                template: '<span class="sr-only">{{preSelectSRText}}</span><span>Viewing {{clinicAppointmentsFromDate}} to {{clinicAppointmentsThroughDate}}<span>'
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
                    id: 'formatteddateTime'
                }, {
                    title: 'Details',
                    id: 'details'
                }, {
                    title: 'Location',
                    id: 'locationDisplayName'
                }]
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
                extraClasses: ['col-md-12', 'marginTopButtom'],
                template: '<span>Recent admissions (up to the last 5)</span>'
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
                    id: 'formatteddateTime'
                }, {
                    title: 'Details',
                    id: 'details'
                }, {
                    title: 'Location',
                    id: 'locationDisplayName'
                }]
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
                extraClasses: ['col-md-12'],
                template: '<h6>New Visit</h6>'
            }]
        }, {
            control: 'container',
            extraClasses: ['row select-location-container'],
            items: [{
                control: 'container',
                extraClasses: ['col-md-6'],
                template: LOADING_ELEMENT,
                items: [{
                    control: 'select',
                    label: 'New Encounter Location',
                    srOnlyLabel: false,
                    name: 'selectNewEncounterLocation',
                    disabled: true,
                    pickList: 'selectNewEncounterLocationPickList',
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
            }, {
                control: 'container',
                extraClasses: ['col-md-6'],
                items: [{
                    control: 'container',
                    extraClasses: ['col-md-6'],
                    items: [{
                        control: 'datepicker',
                        name: 'newVisitDate',
                        srOnlyLabel: false,
                        label: 'Date'
                    }]
                }, {
                    control: 'container',
                    extraClasses: ['col-md-6'],
                    items: [{
                        control: 'timepicker',
                        placeholder: 'HH:MM',
                        name: 'newVisitTime',
                        srOnlyLabel: false,
                        label: 'Time of Visit'
                    }]
                }, {
                    control: 'container',
                    extraClasses: ['col-md-12'],
                    items: [{
                        control: 'alertBanner',
                        name: 'newVisitDateTimeWarning',
                        type: 'warning'
                    }]
                }, {
                    control: 'container',
                    extraClasses: ['row'],
                    items: [{
                        control: 'container',
                        extraClasses: ['col-md-12'],
                        items: [{
                            control: 'checkbox',
                            name: 'isHistorical',
                            label: 'Historical Visit: a visit that occurred at some time in the past or at some other location (possibly non-VA) but is not used for workload credit.'
                        }]
                    }]
                }]
            }]
        }]
    };
    var selectEncounterProviderLocation = {
        control: 'container',
        extraClasses: ['row'],
        items: [{
            control: 'container',
            extraClasses: ['col-md-12'],
            items: [{
                control: 'container',
                tagName: 'h5',
                extraClasses: ['encounters-sub-heading'],
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
            extraClasses: ['form-group'],
            items: [{
                control: 'checkbox',
                id: 'viewEncounters-checkbox',
                label: 'View encounter form after setting',
                extraClasses: ['checkbox-inline', 'right-margin-xs'],
                name: 'viewEncounter'
            }, {
                control: 'button',
                type: 'submit',
                id: 'cancel-btn',
                label: 'Cancel',
                disabled: false,
                extraClasses: ['btn-default', 'btn-sm'],
                name: 'cancel'
            }, {
                control: 'button',
                type: 'submit',
                id: 'viewEncounters-btn',
                label: 'Set',
                disabled: true,
                extraClasses: ['btn-default', 'btn-sm', 'left-margin-xs'],
                name: 'set'
            }]
        }]
    }];
    // *********************************************** END OF FIELDS ********************************************
    // *********************************************** FOOTER VIEW **********************************************
    var FooterView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('{{ui-button "Cancel" classes="btn-default" title="Press enter to cancel."}}{{ui-button "Continue" classes="btn-primary" title="Press enter to continue."}}'),
        events: {
            'click .btn-primary': function() {
                var footerOptions = this.getOption('footerOptions');
                if (_.isFunction(footerOptions.onClose)) {
                    _.bind(footerOptions.onClose, footerOptions.workflow)();
                }
                ADK.UI.Alert.hide();
                if (footerOptions.inTray) {
                    footerOptions.workflow.close();
                }
                ADK.UI.Workflow.hide();
            },
            'click .btn-default': function() {
                ADK.UI.Alert.hide();
            }
        },
        tagName: 'span'
    });
    // *********************************************** END OF FOOTER VIEW ***************************************
    // *********************************************** ALERT MESSAGE VIEWS **************************************
    var DeleteMessageView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('You will lose all work in progress if you delete this task. Would you like to proceed?'),
        tagName: 'p'
    });
    var CloseMessageView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('You will lose all work in progress if you close this task. Would you like to proceed?'),
        tagName: 'p'
    });
    // *********************************************** END OF ALERT MESSAGE VIEWS *******************************
    // *********************************************** FORM VIEW ************************************************
    var formView = ADK.UI.Form.extend({
        inTray: null,
        onClose: null,
        ui: {
            'selectEncounterProvider': '#selectEncounterProvider',
            'selectNewEncounterLocation': '#selectNewEncounterLocation',
            'setCloseButton': '#setClose-btn',
            'encountersButton': '#viewEncounters-btn',
            'newVisitDateTimeWarning': '.newVisitDateTimeWarning',
            'providerLoading': '.select-encounter-container',
            'locationLoading': '.select-location-container'
        },
        fields: formFields,
        events: {
            'submit': 'submitForm',
            'click #cancel-btn': function(e) {
                e.preventDefault();
                var deleteAlertView = new ADK.UI.Alert({
                    title: 'Are you sure you want to cancel?',
                    icon: 'fa-exclamation-triangle font-size-18 color-red',
                    messageView: DeleteMessageView,
                    footerView: FooterView,
                    footerOptions: {
                        workflow: this.workflow,
                        inTray: this._inTray,
                        onClose: this.onClose
                    }

                });
                deleteAlertView.show();
            },
            'click @ui.encountersButton': function(e) {
                e.preventDefault();
                $(e.currentTarget).html("<i class='fa fa-spinner fa-spin'></i> <span>Set</span>");
                this.submitForm(e);
            },
            'show.bs.tab .tab-container': 'tabChanged'
        },
        modelEvents: {
            'change:newVisitDate': 'validateNewVisitDateTime',
            'change:newVisitTime': 'validateNewVisitDateTime',
            'change:selectEncounterProvider': 'setNewEncounterProvider',
            'change:admissionsModel': 'setAdmission',
            'change:appointmentsModel': 'setAppointment',
            'change:selectNewEncounterLocation': 'setNewEncounterLocation'
        },
        viewEncounterFormIfSelected: function() {
            if ($('#viewEncounter').is(':checked')) {
                var encounterFormChannel = ADK.Messaging.getChannel('encounterFormRequestChannel');
                encounterFormChannel.command('openEncounterForm');
            }
        },
        submitForm: function(e) {
            var self = this;
            var locationIEN = '';
            var currentPatient = ADK.PatientRecordService.getCurrentPatient();
            var isInpatient = (currentPatient.get('patientStatusClass') === 'Inpatient') ? '1' : '0';
            e.preventDefault();
            if (!this.model.isValid()) this.model.set('formStatus', {
                status: 'error',
                message: self.model.validationError
            });
            else {
                this.model.unset('formStatus');
                var PatientModel = ADK.PatientRecordService.getCurrentPatient();
                var saveAlertView = new ADK.UI.Notification({
                    title: 'Encounter context',
                    icon: 'fa-check',
                    type: 'success',
                    message: 'The encounter context was successfully set.'
                });

                this.setProvider(this.model);
                if (!_.isUndefined(this.model.get('visit').get('refId')) && this.model.get('visit').get('refId') !== '') {
                    locationIEN = this.model.get('visit').get('refId');
                } else if (!_.isUndefined(this.model.get('visit').get('locationIEN')) && this.model.get('visit').get('locationIEN') !== '') {
                    locationIEN = this.model.get('visit').get('locationIEN');
                }
                if (this.currentTab.indexOf('New-Visit-tab-panel') >= 0) {
                    var visit = this.model.get('visit');
                    var datetime = moment(this.model.get('newVisitDate') + ' ' + this.model.get('newVisitTime')).format(DATE_TIME_FORMAT);
                    var formateddatetime = moment(datetime, DATE_TIME_FORMAT).format(DISPLAY_FORMAT);
                    visit.set('newVisit', {
                        isHistorical: this.model.get('isHistorical'),
                        dateTime: datetime,
                        formatteddateTime: formateddatetime
                    });
                    if (locationIEN) {
                        visit.set('locationIEN', locationIEN);
                    }
                    visit.set('visitDateTime', datetime);
                    visit.set('formatteddateTime', formateddatetime);
                }

                if (locationIEN) {

                    collectionHandler.getServiceCategory(this.model.get('visit'), this.currentTab, isInpatient, function(result) {

                        self.setServiceCategory(result, self.model);
                        if (self.model.get('visit').get('newVisit')) {

                            //THIS FUNCTIONALITY IS CURRENTLY DISABLED
                            //PENDING DECISION ABOUT DOUBLE SAVE VISTA ISSUE
                            //TODO:  this.saveNewVisit();
                        }
                        self.stopListening(ADK.Messaging.getChannel('visit'), 'context:set');
                        ADK.Messaging.getChannel('visit').trigger('context:set');
                        //check if we're in a workflow
                        //check if we're the last step in the flow
                        if (self.isLastStep()) {
                            if (self._inTray) {
                                self.workflow.close();
                            } else {
                                ADK.UI.Workflow.hide();
                            }
                        } else {
                            self.workflow.goToNext();
                        }

                        saveAlertView.show();
                        self.viewEncounterFormIfSelected();
                    });

                }
            }
        },
        isLastStep: function() {
            var currentStep = this.workflow.options.model.get('steps').findWhere({
                currentStep: true
            });
            if (!_.isUndefined(currentStep) && currentStep.get('numberOfSteps') === currentStep.get('currentIndex')) {
                return true;
            }
            return false;
        },
        saveNewVisit: function() {
            var currentPatient = ADK.PatientRecordService.getCurrentPatient();
            var patientICN = currentPatient.get('icn');
            var patientPID = currentPatient.get('pid');
            var patientDFN = currentPatient.get('localId');
            var isInpatient = (currentPatient.get('patientStatusClass') === 'Inpatient') ? '1' : '0';
            var locationIEN = this.model.get('visit').get('refId');
            var encounterDateTime = this.model.get('visit').get('newVisit').dateTime;
            var primaryProviderIEN = this.model.get('visit').get('selectedProvider').code;
            var serviceCategory = this.model.get('visit').get('newVisit').serviceCategory;
            var isPrimaryProvider = '1';
            var isHistoricalVisit = (this.model.get('visit').get('newVisit').isHistorical) ? '1' : '0';
            var saveVisitModel = {
                patientICN: patientICN,
                patientPID: patientPID,
                patientDFN: patientDFN,
                isInpatient: isInpatient,
                locationIEN: locationIEN,
                encounterDateTime: encounterDateTime,
                isHistoricalVisit: isHistoricalVisit,
                serviceCategory: serviceCategory,
                providers: [{
                    ien: primaryProviderIEN,
                    name: '',
                    primary: isPrimaryProvider
                }]
            };
            saveUtil.save(saveVisitModel);
        },
        tabChanged: function(e) {
            if (e.target.attributes['aria-controls']) {
                this.currentTab = e.target.attributes['aria-controls'].value;
            }
            if (this.currentTab.indexOf('Clinic-Appointments-tab-panel') >= 0) {
                this.setAppointment(this.model);
            } else if (this.currentTab.indexOf('Hospital-Admissions-tab-panel') >= 0) {
                this.setAdmission(this.model);
            } else if (this.currentTab.indexOf('New-Visit-tab-panel') >= 0) {
                this.validateNewVisitDateTime();
                this.setNewEncounterLocation(this.model);
            }
        },
        /**
         * Displays a warning if the user selects a new visit date/time that occurs
         * in the future. Hides the warning if the user selects a new visit date/time
         * that occurs in the past.
         */
        validateNewVisitDateTime: function() {
            var newVisitDateTime = moment(this.model.get('newVisitDate') + ' ' + this.model.get('newVisitTime'));
            var currentDateTime = moment();
            if (newVisitDateTime.isValid() && newVisitDateTime.isAfter(currentDateTime)) {
                this.$(this.ui.newVisitDateTimeWarning.selector).removeClass('hide');
            } else {
                this.$(this.ui.newVisitDateTimeWarning.selector).addClass('hide');
            }
            this.validateForm();
        },
        isContextSet: function() {
            return (this.model.get('contextVisit') && !_.isUndefined(this.model.get('contextVisit').get('locationDisplayName')) && this.model.get('contextVisit').get('locationDisplayName') !== '');
        },
        isProviderSelectSet: function() {
            return (!_.isUndefined(this.$el.find(this.ui.selectEncounterProvider.selector + ' option:selected')) && !_.isUndefined(this.$el.find(this.ui.selectEncounterProvider.selector + ' option:selected').val()) && this.$el.find(this.ui.selectEncounterProvider.selector + ' option:selected').val() !== '');
        },
        validateForm: function() {
            var isValid = {
                'enc': !_.isUndefined(this.model.get('selectEncounterProvider')) && this.model.get('selectEncounterProvider') !== '',
                'loc': this.model.get('visit') && !_.isUndefined(this.model.get('visit').get('locationDisplayName')) && this.model.get('visit').get('locationDisplayName') !== '',
                'nloc': !_.isUndefined(this.model.newVisit.get('existingVisit')) && this.model.newVisit.get('locationDisplayName') !== '',
                'nvtime': this.model.get('newVisitTime') !== '',
                'nvdate': this.model.get('newVisitDate') !== '',
                'provSelected': this.isProviderSelectSet()
            };
            var validForm = false;
            if (this.currentTab.indexOf('Clinic-Appointments-tab-panel') >= 0 || this.currentTab.indexOf('Hospital-Admissions-tab-panel') >= 0) {
                if ((this.isContextSet() || isValid.enc && isValid.loc) && isValid.provSelected) {
                    validForm = true;
                }
            } else if (this.currentTab.indexOf('New-Visit-tab-panel') >= 0) {
                if ((this.isContextSet() && isValid.enc && isValid.nvtime && isValid.nvdate || !this.isContextSet() && isValid.nloc && isValid.nvtime && isValid.nvdate) && isValid.provSelected) {
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
            var locationModel = cachedData.locations.findWhere({
                uid: locationUid
            });
            if (locationModel) {
                this.model.newVisit.set(locationModel.attributes);
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
            // If location UID and location name are defined
            if (locationUid && locationDisplayName) {
                var selectedLocation = {
                    'value': locationUid,
                    'label': locationDisplayName
                };
                var locationIndex = -1;
                // Check to see if the selected location is already in the queue. If it is, grab its index.
                _.each(locationQueue, function(queueElement, queueIndex) {
                    if (queueElement.value === locationUid) {
                        locationIndex = queueIndex;
                    }
                });
                // If the selected location is already in the queue,
                // remove the original item and add the location to the top,
                // otherwise just add the selected location to the top
                if (locationIndex >= 0) {
                    locationQueue.splice(locationIndex, 1);
                    locationQueue.unshift(selectedLocation);
                } else {
                    if (locationQueue.length < NUM_RECENT_LOCATIONS) {
                        // Add to the beginning of the array
                        locationQueue.unshift(selectedLocation);
                    } else {
                        locationQueue.pop();
                        locationQueue.unshift(selectedLocation);
                    }
                }
                var self = this;
                self.updatelocationsPickList(self, [{
                    group: RECENTLY_USED_LOCATIONS_TEXT,
                    pickList: locationQueue
                }, {
                    group: ALL_LOCATIONS_TEXT,
                    pickList: collectionHandler.locationsParser(cachedData.locations)[0].pickList
                }]);
                // Add selected location to the "recently selected" session object
                var recentlySelected = new Backbone.Model({
                    locations: locationQueue,
                    providers: providerQueue
                });
                var userModel = ADK.UserService.getUserSession();
                userModel.set('recentlySelected', recentlySelected);
            }
            this.model.set('visit', this.model.newVisit);
            this.validateForm();
        },
        setServiceCategory: function(result, original) {
            if (result.data.serviceCategory) {
                original.get('visit').set('serviceCategory', result.data.serviceCategory);
                if (original.get('visit').get('newVisit')) {
                    original.get('visit').get('newVisit').serviceCategory = result.data.serviceCategory;
                }
            }
            var PatientModel = ADK.PatientRecordService.getCurrentPatient();
            PatientModel.set({
                visit: JSON.parse(JSON.stringify(original.get('visit')))
            });
            ADK.SessionStorage.set.sessionModel('patient', PatientModel, 'session');
        },
        setProvider: function(model) {
            var selectedProvider = cachedData.providers.findWhere({
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
        setNewEncounterProvider: function(model) {
            var providerCode = model.get('selectEncounterProvider');
            var providerName = model.get('_labelsForSelectedValues').get('selectEncounterProvider');
            // If provider code and provider name are defined
            if (providerCode && providerName) {
                var selectedProvider = {
                    'value': providerCode,
                    'label': providerName
                };
                var providerIndex = -1;
                // Check to see if the selected provider is already in the queue. If it is, grab its index.
                _.each(providerQueue, function(queueElement, queueIndex) {
                    if (queueElement.value === providerCode) {
                        providerIndex = queueIndex;
                    }
                });
                // If the selected provider is already in the queue,
                // remove the original item and add the provider to the top,
                // otherwise just add the selected provider to the top
                if (providerIndex >= 0) {
                    providerQueue.splice(providerIndex, 1);
                    providerQueue.unshift(selectedProvider);
                } else {
                    if (providerQueue.length < NUM_RECENT_PROVIDERS) {
                        // Add to the beginning of the array
                        providerQueue.unshift(selectedProvider);
                    } else {
                        providerQueue.pop();
                        providerQueue.unshift(selectedProvider);
                    }
                }
                var self = this;
                self.updateprovidersPickList(self, [{
                    group: RECENTLY_USED_PROVIDERS_TEXT,
                    pickList: providerQueue
                }, {
                    group: ALL_PROVIDERS_TEXT,
                    pickList: collectionHandler.providerParser(cachedData.providers)[0].pickList
                }]);
                // Add selected provider to the "recently selected" session object
                var recentlySelected = new Backbone.Model({
                    locations: locationQueue,
                    providers: providerQueue
                });
                var userModel = ADK.UserService.getUserSession();
                userModel.set('recentlySelected', recentlySelected);
            }
            this.validateForm();
        },
        setDatesAppointments: function(form, fromDate, toDate) {
            //filter the collection
            var filteredCollection = collectionHandler.collectionDateFilter(cachedData.appointments, fromDate, toDate);
            appointmentsArray.set(filteredCollection);
            // // No results found.
            if (filteredCollection.length === 0) {
                this.$el.find('#selectableTableAppointments .no-results').text('No appointments/visit found.');
                this.$el.find('#selectableTableAppointments .no-results').show();
            } else {
                this.$el.find('#selectableTableAppointments .no-results').hide();
            }
        },
        setDatesHospital: function(model, collection) {
            //filter the collection
            var filteredCollection = collectionHandler.admissionsParser(collection).models;
            admissionsArray.set(filteredCollection);
            if (filteredCollection.length === 0) {
                this.$el.find('#selectableTableAdmissions .no-results').text('No admissions found.');
                this.$el.find('#selectableTableAdmissions .no-results').show();
            } else {
                this.$el.find('#selectableTableAdmissions .no-results').hide();
            }
        },
        currentTab: 'Clinic-Appointments-tab-panel', //initial value
        initialize: function(form) {
            this._inTray = _.isBoolean(this.inTray) ? this.inTray : false;

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

            // defaults the select encounter providers field with user logged-in as a provider
            var user = ADK.UserService.getUserSession();
            var isProvider = user.get('provider');
            if (isProvider && _.isUndefined(this.model.get('selectEncounterProvider'))) {
                this.model.set('selectEncounterProvider', user.get('duz')[user.get('site')]);
            }
                 
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
                'newVisitDateTimeWarning': 'You have selected a future date/time',
                'selectNewEncounterLocationPickList': new Backbone.Collection(),
                'selectEncounterProviderPickList': new Backbone.Collection()
            });
            var self = this;
            this._super = ADK.UI.Form.prototype;
            this._super.initialize.apply(this, arguments);
            // the providers picklist
            collectionHandler.getProvidersPicklist(function(collection) {
                if (!self.isDestroyed) {
                    var parsedCollection = collectionHandler.providerParser(collection);
                    var sessionRecentlySelected = ADK.UserService.getUserSession().get('recentlySelected');
                    if (sessionRecentlySelected) {
                        var sessionRecentlySelectedProviders;
                        if (sessionRecentlySelected.attributes) {
                            sessionRecentlySelectedProviders = sessionRecentlySelected.attributes.providers;
                        } else {
                            sessionRecentlySelectedProviders = sessionRecentlySelected.providers;
                        }
                        if (sessionRecentlySelectedProviders && sessionRecentlySelectedProviders.length > 0) {
                            self.updateprovidersPickList(self, [{
                                group: RECENTLY_USED_PROVIDERS_TEXT,
                                pickList: sessionRecentlySelectedProviders
                            }, {
                                group: ALL_PROVIDERS_TEXT,
                                pickList: parsedCollection[0].pickList
                            }]);
                        } else {
                            self.updateprovidersPickList(self, parsedCollection);
                        }
                    } else {
                        providerQueue = [];
                        self.updateprovidersPickList(self, parsedCollection);
                    }
                    // Enable components if there's a context visit with provider and provider select box has selected item
                    if (self.isContextSet() && !_.isUndefined(self.model.get('contextVisit').get('selectedProvider')) && self.isProviderSelectSet()) {
                        self.ui.encountersButton.trigger('control:disabled', false);
                    }
                    self.$el.find(self.ui.selectEncounterProvider.selector).trigger('control:disabled', false);
                    cachedData.providers.set(collection.models);
                }
                // Clear loading spinner
                if (_.isObject(self.ui.providerLoading) && $(self.ui.providerLoading.selector)) {
                    $(self.ui.providerLoading.selector).find('.loading').detach();
                }
            });
            //locations picklist
            collectionHandler.getLocations(function(collection) {
                if (!self.isDestroyed) {
                    var parsedCollection = collectionHandler.locationsParser(collection);
                    var sessionRecentlySelected = ADK.UserService.getUserSession().get('recentlySelected');
                    if (sessionRecentlySelected) {
                        var sessionRecentlySelectedLocations;
                        if (sessionRecentlySelected.attributes) {
                            sessionRecentlySelectedLocations = sessionRecentlySelected.attributes.locations;
                        } else {
                            sessionRecentlySelectedLocations = sessionRecentlySelected.locations;
                        }
                        if (sessionRecentlySelectedLocations && sessionRecentlySelectedLocations.length > 0) {
                            self.updatelocationsPickList(self, [{
                                group: RECENTLY_USED_LOCATIONS_TEXT,
                                pickList: sessionRecentlySelectedLocations
                            }, {
                                group: ALL_LOCATIONS_TEXT,
                                pickList: parsedCollection[0].pickList
                            }]);
                        } else {
                            self.updatelocationsPickList(self, parsedCollection);
                        }
                    } else {
                        locationQueue = [];
                        self.updatelocationsPickList(self, parsedCollection);
                    }
                    self.$el.find(self.ui.selectNewEncounterLocation.selector).trigger('control:disabled', false);
                    cachedData.locations.set(collection.models);
                }
                // Clear loading spinner
                if (_.isObject(self.ui.locationLoading) && $(self.ui.locationLoading.selector)) {
                    $(self.ui.locationLoading.selector).find('.loading').detach();
                }
            });
            // admissions
            collectionHandler.getAdmissions(function(collection) {
                var admissions = collectionHandler.admissionsParser(collection);
                cachedData.admissions.set(admissions.models);
                admissionsArray.set(admissions.models);
                if (collection.length > 0) {
                    self.setDatesHospital(form, collection);
                } else {
                    self.$el.find('#selectableTableAdmissions .no-results').text('No admissions found.');
                    self.$el.find('#selectableTableAdmissions .no-results').show();
                }
            });
            // appointments
            var criteria = ADK.SessionStorage.get.sessionModel('user', 'SessionStorage');
            var site = criteria.get("site");
            var currentPatient = ADK.PatientRecordService.getCurrentPatient();
            var currentPatientPID = currentPatient.get('pid');
            var currentPatientDFN = currentPatient.get('localId');
            var fromDate = this.model.get('clinicAppointmentsFromDate');
            var toDate = this.model.get('clinicAppointmentsThroughDate');
            var appointmentsCriteria = {
                pid: currentPatientPID,
                patientDFN: currentPatientDFN,
                fromDate: fromDate,
                toDate: toDate,
                site: site
            };
            collectionHandler.getAppointments(appointmentsCriteria, function(collection) {
                var appts = collectionHandler.appointmentsParser(collection);
                var contextVisit = self.model.get('contextVisit');
                if (contextVisit && contextVisit.get('formatteddateTime')) {
                    contextVisit = appts.where({
                        formatteddateTime: contextVisit.get('formatteddateTime')
                    })[0];
                    if (contextVisit && contextVisit.get('formatteddateTime')) {
                        self.model.set('appointmentsModel', contextVisit);
                        self.model.set('preSelectSRText', 'Appointment ' + contextVisit.get('formatteddateTime') + ' ' + contextVisit.get('locationDisplayName') + ' ' + contextVisit.get('facilityDisplay') + ' pre-selected from current Encounter.');
                    }
                }
                cachedData.appointments.set(appts.models);
                appointmentsArray.set(appts.models);
                if (collection.length > 0) {
                    self.setDatesAppointments(form, fromDate, toDate);
                } else {
                    self.$el.find('#selectableTableAppointments .no-results').text('No appointments/visit found.');
                    self.$el.find('#selectableTableAppointments .no-results').show();
                }
            });
        },
        onAttach: function() {
            // Loading...
            if ($('#selectableTableAppointments .no-results').length === 0) {
                $('#selectableTableAppointments').append('<div class="no-results"> <i class="fa fa-spinner fa-spin"></i> Loading...</div>');
            }
            if ($('#selectableTableAdmissions .no-results').length === 0) {
                $('#selectableTableAdmissions').append('<div class="no-results"> <i class="fa fa-spinner fa-spin"></i> Loading...</div>');
            }
        },
        updateprovidersPickList: function(form, options) {
            // There is an issue with the 'select' component that prevents picklists with groups from
            // being displayed properly when set dynamically. Setting an attribute on the model to keep track
            // of the picklist as a workaround.
            //this.$('.selectEncounterProvider').trigger('control:picklist:set', options);
            this.model.attributes.selectEncounterProviderPickList.set(options);
        },
        updatelocationsPickList: function(form, options) {
            // There is an issue with the 'select' component that prevents picklists with groups from
            // being displayed properly when set dynamically. Setting an attribute on the model to keep track
            // of the picklist as a workaround.
            //this.$('.selectNewEncounterLocation').trigger('control:picklist:set', options);
            this.model.attributes.selectNewEncounterLocationPickList.set(options);
        }
    });
    // *********************************************** END OF FORM VIEW *****************************************
    return formView;
});