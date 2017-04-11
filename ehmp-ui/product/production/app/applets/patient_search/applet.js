define([
    'backbone',
    'marionette',
    'underscore',
    'hbs!app/applets/patient_search/templates/patientSearchTemplate',
    'app/applets/patient_search/views/tabView',
    'app/applets/patient_search/views/inputView',
    'app/applets/patient_search/views/pillsView',
    'app/applets/patient_search/views/searchMainView',
    'app/applets/patient_search/views/confirmationView',
    'app/applets/patient_search/views/closeButtonView',
], function(Backbone, Marionette, _, patientSearchTemplate, TabView, InputView, PillsView, SearchMainView, ConfirmationView, CloseButtonView) {
    "use strict";

    // constants
    var MY_SITE = 'mySite';
    var NATIONWIDE = 'global';
    var BLANK = '';
    var CLINIC_VIEW_HEIGHT_BASE = 415;
    var WARD_VIEW_HEIGHT_BASE = 325;
    var RESULTS_VIEW_HEIGHT_BASE = 295;
    var CONFIRMATION_VIEW_HEIGHT_BASE = 300;
    var SEARCH_NAV = '#patient-search-pills';
    var SEARCH_NAV_CLINIC_COL = '#main-search-mySiteClinics .smallColumn';
    var SEARCH_NAV_WARD_COL = '#main-search-mySiteWards .smallColumn';
    var PATIENT_SEARCH_INPUT = '#patientSearchInput';
    var PATIENT_SEARCH_CONFIRM = '#patient-search-confirmation';
    var PATIENT_SEARCH_OUTPUT = 'patient-search-output';
    var PANEL_WIDE = 'wide';
    var NO_RESULTS_TEXT = 'No results found.';
    var UNKNOWN_ERROR_TEXT = 'There was an error retreiving the patient list.  Please try again later.';
    var UNKNOWN_ERROR_LOG_TEXT = '<pre class="all-border-no">status: {{status}}\nstatusText: {{statusText}}\nstate: {{state}}\nresponseText: {{responseText}}</pre>';

    // variables
    var htmlElement = null;
    var patientImageRequest = null;
    var browser = '';
    var PatientSearchModel = Backbone.Model.extend({
        defaults: {}
    });
    var resultAlerts = {
        'noResultsText': NO_RESULTS_TEXT,
        'unknownErrorText': UNKNOWN_ERROR_TEXT,
        'unknownErrorLogText': UNKNOWN_ERROR_LOG_TEXT
    };

    var resizeHeight = function() {
        // clinic list viewable height
        $('#main-search-mySiteClinics .list-result-container').height(window.innerHeight - CLINIC_VIEW_HEIGHT_BASE);
        // ward list viewable height
        $('#main-search-mySiteWards .list-result-container').height(window.innerHeight - WARD_VIEW_HEIGHT_BASE);
        // result list viewable height
        $('#patient-search-main .results-table .list-group').css('max-height', window.innerHeight - RESULTS_VIEW_HEIGHT_BASE);
        // confirmation viewable height
        $('#patient-search-confirmation .fixedHeightZone').css('max-height', window.innerHeight - CONFIRMATION_VIEW_HEIGHT_BASE);
    };

    var AppletLayoutView = Backbone.Marionette.LayoutView.extend({
        events: {
            'click #global': 'changePatientSearchScope',
            'click #mySite': 'changePatientSearchScope',
            'focus #patientSearchInput': 'setupPatientSearch'
        },
        className: 'searchApplet',
        template: patientSearchTemplate,
        regions: {
            closeButton: '#close-button-container',
            patientSearchInput: '#patient-search-input',
            searchType: '#patient-search-tab',
            mySiteTabs: '#patient-search-pills',
            searchMain: '#patient-search-main',
            patientSelectionConfirmation: '#patient-search-confirmation'
        },
        initialize: function() {
            // Add IE class to HTML element for CSS targeting
            if (htmlElement === null) {
                htmlElement = $('html');
                // Determine OS
                if (navigator.userAgent.indexOf('Windows') > -1) {
                    htmlElement.addClass('windows');
                }
                if (navigator.userAgent.indexOf('Machintosh') > -1) {
                    htmlElement.addClass('machintosh');
                }

                // Determine browser
                if (navigator.userAgent.indexOf('MSIE') > -1 || navigator.userAgent.indexOf('Trident') > -1 || navigator.userAgent.indexOf('Edge') > -1) {
                    browser = 'ie';
                }
                if (navigator.userAgent.indexOf('Chrome') > -1 || navigator.userAgent.indexOf('Safari') > -1) {
                    browser = 'webkit';
                }
                if (navigator.userAgent.indexOf('Firefox') > -1) {
                    browser = 'firefox';
                }
                htmlElement.addClass(browser);
            }

            // Watch the browser window size
            $(window).on("resize.patientsearch",function() {
                resizeHeight();
            });

            this.initializeViews();
            this.initializeListeners();
        },
        initializeViews: function() {
            this.closeButtonView = new CloseButtonView();
            this.patientSearchView = new InputView();
            this.searchTypeView = new TabView();
            this.mySiteTabsView = new PillsView();
            this.searchMainView = new SearchMainView({
                searchApplet: this
            });
            this.patientSelectionConfirmationView = new ConfirmationView({
                searchApplet: this
            });
        },
        initializeListeners: function() {
            this.listenTo(this.searchTypeView.model, 'change:searchType', this.changeSearchInput);
            this.listenTo(this.mySiteTabsView.model, 'change:pillsType', this.changeSubTab);
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
        onResize: function() {
            resizeHeight();
        },
        onRender: function() {
            this.patientSearchInput.show(this.patientSearchView);
            this.closeButton.show(this.closeButtonView);
            this.searchType.show(this.searchTypeView);
            this.mySiteTabs.show(this.mySiteTabsView);
            this.searchMain.show(this.searchMainView);
            this.patientSelectionConfirmation.show(this.patientSelectionConfirmationView);
            this.patientSelectionConfirmation.$el.addClass('hide');
        },
        onDestroy: function() {
            $(window).off("resize.patientsearch");
        },
        whichTransitionEvent: function() {
            // Used to determine the browser transition event
            var t;
            var el = document.createElement('fakeelement');
            var transitions = {
                'transition': 'transitionend',
                'OTransition': 'oTransitionEnd',
                'MozTransition': 'transitionend',
                'WebkitTransition': 'webkitTransitionEnd'
            };

            for (t in transitions) {
                if (el.style[t] !== undefined) {
                    return transitions[t];
                }
            }
        },
        onShow: function() {
            $('ul a[role="tab"]').attr('tabindex', 0);

            // Watch side panel transition and
            // show side panel items when transition ends.
            var transitionEnd = this.whichTransitionEvent();
            $(SEARCH_NAV)[0].addEventListener(transitionEnd, function(event) {
                $(SEARCH_NAV_CLINIC_COL).show();
                $(SEARCH_NAV_WARD_COL).show();
            }, false);
        },
        displayErrorMessage: function(messagePayload) {
            this.searchMainView.clearErrorMessage();
            var scope = messagePayload[0];
            var message = messagePayload[1];
            this.searchMainView.displayErrorMessage(scope, message);
        },
        triggerSearchInput: function() {
            this.patientSearchView.$('#patientSearchInput').focus();
        },
        setupPatientSearch: function() {
            this.mySiteTabsView.clearAllTabs();
            this.mySiteTabsView.resetModels();
        },
        clearPreviousGlobalSearchResults: function() {
            this.searchMainView.clearPreviousGlobalSearchResults(this.searchTypeView.model.get('searchType'));
        },
        getPatientPhoto: function(patient, imageFetchOptions) {
            var self = this;
            var patientImageUrl;
            patientImageUrl = ADK.ResourceService.buildUrl('patientphoto-getPatientPhoto', imageFetchOptions);
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
            var searchType = this.searchTypeView.model.get('searchType');
            this.patientSearchView.changeView(searchType);
            // reset side panel
            if (searchType == 'global') {
                $(SEARCH_NAV).removeClass(PANEL_WIDE);
            }
            $('.' + PATIENT_SEARCH_OUTPUT)[0].className = PATIENT_SEARCH_OUTPUT;
        },
        changeSubTab: function(event) {
            // check to see if the side panel should be wide or not
            if (event.attributes.pillsType === 'clinics') {
                $(SEARCH_NAV).addClass(PANEL_WIDE);
            } else {
                $(SEARCH_NAV).removeClass(PANEL_WIDE);
            }
            // hide search sidebar for all site search
            if (event.attributes.pillsType !== 'none') {
                $(SEARCH_NAV_CLINIC_COL).hide();
                // handle if prev type was my cprs list and wards was selected
                if ($('.' + PATIENT_SEARCH_OUTPUT).hasClass('clinics')) {
                    $(SEARCH_NAV_WARD_COL).hide();
                } else {
                    $(SEARCH_NAV_WARD_COL).show();
                }
            } else {
                // remove the patient search type since this is All/Nationwide search
                $('.' + PATIENT_SEARCH_OUTPUT)[0].className = PATIENT_SEARCH_OUTPUT;
            }

            // reset patient search input.
            $(PATIENT_SEARCH_CONFIRM).addClass('hide');
            $(PATIENT_SEARCH_INPUT).first().val(BLANK);
            this.patientSearchView.mySiteModel.set('searchString', BLANK);
            var instructions = this.$el.find('.instructions p span');
            if (!instructions.hasClass('hidden')) {
                instructions.addClass('hidden');
            }
            this.searchMainView.changeView(this.searchTypeView.model.get('searchType'), this.mySiteTabsView.getTabType());
            this.searchMainView.mySiteAllSearchLayoutView.clearSearchResultsRegion();

            // set the correct focus
            if ($(PATIENT_SEARCH_INPUT)[0] !== document.activeElement) {
                $(PATIENT_SEARCH_INPUT).blur();
            } else {
                $(PATIENT_SEARCH_INPUT).focus(); // trigger focus for element highlighting.
            }
        },
        changeSearchInput: function() {
            this.patientSelectionConfirmationView.updateTemplateToBlank();
            $('a.active').removeClass('active');
            var scope = this.searchTypeView.model.get('searchType');
            this.patientSearchView.changeView(scope);
            this.mySiteTabsView.changeTemplate(scope);
            this.searchMainView.changeView(scope, this.mySiteTabsView.getTabType());
            $(PATIENT_SEARCH_INPUT).first().focus();
        },
        removePatientSelectionConfirmation: function() {
            this.patientSelectionConfirmationView.updateTemplateToBlank();
        },
        resetModels: function() {
            this.mySiteTabsView.resetModels();
            this.patientSearchView.resetModels();
        },
        executeSearch: function() {
            var searchType = this.searchTypeView.model.get('searchType');
            var searchParameters = {};

            if (searchType == MY_SITE) {
                searchParameters.tabType = this.mySiteTabsView.getTabType();
                if (searchParameters.tabType === 'none') {
                    searchParameters.searchString = this.patientSearchView.mySiteModel.get('searchString');
                    this.patientSearchView.mySiteModel.set('searchString', searchParameters.searchString, {
                        silent: true
                    });
                }
            } else if (searchType == NATIONWIDE) {
                searchParameters.globalSearchParameters = this.patientSearchView.nationwideModel.get('globalSearchParameters');
            }

            this.patientSelectionConfirmationView.updateTemplateToBlank();
            this.searchMainView.clearErrorMessage(searchType);
            this.searchMainView.executeSearch(searchType, searchParameters);
        },
        hasScrollbars: function(element) {
            var scrollbars = {
                vertical: false,
                horizontal: false
            };

            // element must be actual html element, not a jQuery object.
            try {
                scrollbars.vertical = element.scrollHeight > element.clientHeight + 1;
                scrollbars.horizontal = element.scrollWidth > element.clientWidth;
            } catch (e) {
                console.log('Error hasScrollbars(): element is not a HTML element.');
                return false;
            }

            return scrollbars;
        },
        getViewHeightBase: function(view) {
            if (view === 'results') view = RESULTS_VIEW_HEIGHT_BASE;
            if (view === 'clinic') view = CLINIC_VIEW_HEIGHT_BASE;
            if (view === 'ward') view = WARD_VIEW_HEIGHT_BASE;
            if (view === 'confirmation') view = CONFIRMATION_VIEW_HEIGHT_BASE;
            return view;
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
        }
    };

    return applet;
});