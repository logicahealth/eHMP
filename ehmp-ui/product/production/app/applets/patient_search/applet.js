define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'hbs!app/applets/patient_search/templates/patientSearchTemplate',
    'app/applets/patient_search/views/mainMenu/menuView',
    'app/applets/patient_search/views/inputView',
    'app/applets/patient_search/views/searchMainView',
    'app/applets/patient_search/views/confirmationView',
    'app/applets/patient_search/views/recentPatientsView'
], function(
    Backbone,
    Marionette,
    _,
    Handlebars,
    patientSearchTemplate,
    MenuView,
    InputView,
    SearchMainView,
    ConfirmationView,
    RecentPatientsView) {
    "use strict";

    // constants
    var MY_SITE = 'mySite';
    var NATIONWIDE = 'global';
    var PATIENT_SEARCH_INPUT = '#patientSearchInput';
    var PATIENT_SEARCH_OUTPUT = 'patient-search-output';
    var PATIENT_SEARCH_WRAPPER = '.patient-search-wrapper';
    var NO_RESULTS_TEXT = 'No results were found.';
    var UNKNOWN_ERROR_TEXT = 'There was an error retrieving the patient list.  Try again later.';
    var UNKNOWN_ERROR_LOG_TEXT = '<pre class="all-border-no">status: {{status}}\nstatusText: {{statusText}}\nstate: {{state}}\nresponseText: {{responseText}}</pre>';

    // variables
    var patientImageRequest = null;
    var resultAlerts = {
        'noResultsText': NO_RESULTS_TEXT,
        'unknownErrorText': UNKNOWN_ERROR_TEXT,
        'unknownErrorLogText': UNKNOWN_ERROR_LOG_TEXT
    };
    // backbone objects
    var PatientSearchModel = Backbone.Model.extend({
        defaults: {
            'autoNav': true
        }
    });
    var AppletLayoutView = Backbone.Marionette.LayoutView.extend({
        events: {
            'click #global': 'changePatientSearchScope',
            'click #mySite': 'changePatientSearchScope',
            'focus #patientSearchInput': 'setupPatientSearch',
        },
        className: 'searchApplet',
        template: patientSearchTemplate,
        regions: {
            mainSidebar: '#mainSidebar',
            patientSearchInput: '#patient-search-input',
            searchMain: '#patient-search-main',
            patientSelectionConfirmation: '#patient-search-confirmation'
        },
        initialize: function() {
            this.model = new PatientSearchModel();
            this.initializeViews();
            this.initializeListeners();
        },
        initializeViews: function() {
            this.menuView = new MenuView({
                searchApplet: this
            });
            this.patientSearchView = new InputView();
            this.searchMainView = new SearchMainView({
                searchApplet: this
            });
            this.patientSelectionConfirmationView = new ConfirmationView({
                searchApplet: this
            });
        },
        initializeListeners: function() {
            this.listenTo(this.menuView.model, 'change:activeSelection', this.changeSearchInput);
            this.listenTo(this.patientSearchView.mySiteModel, 'change:searchString', this.executeSearch);
            this.listenTo(this.patientSearchView.nationwideModel, 'change:globalSearchParameters', this.executeSearch);
            this.listenTo(this.patientSearchView.nationwideModel, 'errorMessage', this.displayErrorMessage);
            this.listenTo(this.patientSearchView.nationwideModel, 'newGlobalSearch', this.clearPreviousGlobalSearchResults);

            this.listenTo(ADK.Messaging, 'notifications:realtime', function(notification) {
                var url = '/resource/fhir/communicationrequest/' + notification.target + '?status=received&count=true';
                $.ajax({
                    type: 'GET',
                    url: url,
                    dataType: 'json',
                    success: function(data, status, xhr) {
                        console.log(data.count + ' unread notification(s) for ' + notification.target);
                    }
                });
            });
        },
        onBeforeShow: function() {
            this.showChildView('patientSearchInput', this.patientSearchView);
            this.showChildView('mainSidebar', this.menuView);
            this.showChildView('searchMain', this.searchMainView);
            this.showChildView('patientSelectionConfirmation', this.patientSelectionConfirmationView);
            this.$(PATIENT_SEARCH_WRAPPER).removeClass('confirmation'); // class added to make internet explorer play nice with the width of the search area when there are 4 inputs in nationwide serch (flexbox scenario)
        },
        displayErrorMessage: function(messagePayload) {
            var scope = messagePayload[0];
            var message = messagePayload[1];
            this.searchMainView.clearErrorMessage();
            this.searchMainView.displayErrorMessage(scope, message);
        },
        triggerSearchInput: function() {
            this.patientSearchView.$('#patientSearchInput').focus();
        },
        setupPatientSearch: function() {
            this.menuView.changePatientSelection(MY_SITE);
        },
        clearPreviousGlobalSearchResults: function() {
            this.searchMainView.clearPreviousGlobalSearchResults(this.menuView.model.get('activeSelection'));
        },
        getPatientPhoto: function(patient, imageFetchOptions) {
            var patientImageUrl = ADK.ResourceService.buildUrl('patientphoto-getPatientPhoto', imageFetchOptions);
            //If a prior image request has been made, make sure we abort it so we don't clobber the request we're about to make
            if (patientImageRequest) {
                patientImageRequest.abort();
            }
            patientImageRequest = $.ajax({
                url: patientImageUrl,
                success: function(data, statusMessage, xhr) {
                    var base64PatientPhoto = 'data:image/jpeg;base64,' + data + '';
                    patient.set({
                        patientImage: base64PatientPhoto
                    });
                },
                async: true
            });
        },
        patientSelected: function(patient) {
            this.patientSelectionConfirmationView.updateSelectedPatientModel(patient);
        },
        changePatientSearchScope: function(event) {
            var searchType = this.menuView.model.get('activeSelection');
            this.patientSearchView.changeView(searchType);
            this.$('.' + PATIENT_SEARCH_OUTPUT).attr('class', PATIENT_SEARCH_OUTPUT + ' ' + searchType);
        },
        changeSearchInput: function(scope) {
            // find who's active
            if (typeof(scope) == 'undefined') {
                scope = this.menuView.model;
            }
            var activeSelection = scope.attributes.activeSelection;
            // reset confirmation
            this.patientSelectionConfirmationView.updateTemplateToBlank();
            // set adequate classes to the wrappers
            this.$('.' + PATIENT_SEARCH_OUTPUT).attr('class', PATIENT_SEARCH_OUTPUT + ' ' + activeSelection);
            // set the adequate view for the patients lists
            this.patientSearchView.changeView(activeSelection);
            this.searchMainView.changeView(activeSelection);
            // focus on the input
            this.$(PATIENT_SEARCH_INPUT).first().focus();
        },
        removePatientSelectionConfirmation: function() {
            this.patientSelectionConfirmationView.updateTemplateToBlank();
        },
        executeSearch: function() {
            var searchType = this.menuView.model.get('activeSelection');
            var searchParameters = {};

            if (searchType == MY_SITE) {
                searchParameters.searchString = this.patientSearchView.mySiteModel.get('searchString');
                this.patientSearchView.mySiteModel.set('searchString', searchParameters.searchString, {
                    silent: true
                });
            } else if (searchType == NATIONWIDE) {
                searchParameters.globalSearchParameters = this.patientSearchView.nationwideModel.get('globalSearchParameters');
            }

            this.patientSelectionConfirmationView.updateTemplateToBlank();
            this.searchMainView.clearErrorMessage(searchType);
            this.searchMainView.executeSearch(searchType, searchParameters);
        },
        getAlertText: function(alert) {
            return resultAlerts[alert];
        },
        formatAlertUnknownResponse: function(resp) {
            var unknownText = UNKNOWN_ERROR_LOG_TEXT;
            try {
                unknownText = unknownText.replace('{{status}}', resp.status);
                unknownText = unknownText.replace('{{statusText}}', resp.statusText);
                unknownText = unknownText.replace('{{state}}', resp.state());
                unknownText = unknownText.replace('{{responseText}}', resp.responseText);
            } catch (e) {
                unknownText = '<pre class="all-border-no">' + e.message + '</pre>';
            }
            console.log(UNKNOWN_ERROR_TEXT);
            console.log(resp);
            return unknownText;
        },
        getSearchErrorMessage: function(resp, error) {
            var errorMessage = error || '';
            if (resp.logId) {
                errorMessage = errorMessage.concat('<br><br>For defect reporting:<br>' + resp.logId);
            }
            return errorMessage;
        }
    });

    var applet = {
        id: 'patient_search',
        getRootView: function() {
            return AppletLayoutView;
        },
        viewTypes: [{
            type: 'full',
            view: AppletLayoutView,
            chromeEnabled: false
        }, {
            type: 'recent-patients',
            view: RecentPatientsView,
            chromeEnabled: false
        }]
    };

    ADK.Messaging.on('context:patient:change', function(patient, options) {
        options = _.extend({
            skipSearch: true,
            reconfirm: true,
            navigation: true
        }, options);

        var snaChannel = _.get(options, 'staffnavAction.channel');
        var snaEvent = _.get(options, 'staffnavAction.event');
        var snaData = _.get(options, 'staffnavAction.data');

        if (snaChannel && snaEvent && snaData) {
            var callback = options.callback;
            var staffnavActionCallback = function() {
                var channel = ADK.Messaging.getChannel(snaChannel);
                channel.trigger(snaEvent, snaData);
            };
            options.callback = callback ? function() {
                callback.apply(this, arguments);
                staffnavActionCallback.apply(this, arguments);
            } : staffnavActionCallback;
        }

        var workspaceId = options.workspaceId || ADK.WorkspaceContextRepository.getDefaultScreenOfContext('patient');
        if (!options.reconfirm && ADK.PatientRecordService.isMatchingPatient(patient)) {
            // Skip the confirmation modal for current patient case
            if (options.navigation) {
                ADK.Navigation.navigate(workspaceId, {
                    route: {
                        trigger: true
                    },
                    callback: options.callback
                });
            } else {
                options.callback();
            }
            return;
        }

        ADK.Checks.run('navigation', function() {
            if (_.isString(patient)) {
                var pid = patient;
                var fetchOptions = {
                    resourceTitle: 'patient-search-pid',
                    criteria: {
                        pid: pid
                    }
                };

                fetchOptions.onSuccess = function(resp) {
                    if (resp.length > 0) {
                        var patientModel = resp.at(0);
                        // patientModel.set('navigationSkip', !options.navigation);
                        openConfirmationModal(patientModel);
                    } else {
                        console.log("Error when retrieving full ssn for: " + pid);
                    }
                };

                ADK.ResourceService.fetchCollection(fetchOptions);
            } else {
                openConfirmationModal(patient);
            }
        }, {
            screenName: workspaceId,
            forceFail: _.isEqual(workspaceId, ADK.WorkspaceContextRepository.currentWorkspaceAndContext.get('workspace'))
        });

        function openConfirmationModal(model) {
            var confirmationView = new ConfirmationView(options);

            var headerView = Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile(''),
                model: model
            });

            var modalOptions = {
                title: model.get('name'),
                size: 'small',
                draggable: false,
                headerView: headerView,
                footerView: 'none',
                wrapperClasses: ['patient-confirmation-modal']
            };

            var modalView = new ADK.UI.Modal({
                view: confirmationView,
                options: modalOptions
            });

            modalView.show();
            confirmationView.updateSelectedPatientModel(model);
        }
    });
    return applet;
});