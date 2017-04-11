define([
    'backbone',
    'marionette',
    'app/applets/patient_search/views/myCPRSList/myCPRSListLayoutView',
    'app/applets/patient_search/views/mySite/all/mySiteAllSearchLayoutView',
    'app/applets/patient_search/views/recentPatients/recentPatientsSearchLayoutView',
    'app/applets/patient_search/views/mySite/clinics_wards/clinicsWardsSearchLayoutView',
    'app/applets/patient_search/views/global/globalSearchLayoutView',
    'hbs!app/applets/patient_search/templates/searchMainTemplate'
], function(Backbone, Marionette, MyCPRSListLayoutView, MySiteAllSearchLayoutView, RecentPatientsSearchLayoutView, ClinicsWardsSearchLayoutView, GlobalSearchLayoutView, searchMainTemplate) {
    "use strict";

    var searchApplet;

    // constants
    var MY_SITE = 'mySite';
    var RECENT_PATIENTS = 'recentPatients';
    var NATIONWIDE = 'global';
    var MY_CPRS_LIST_TAB = 'myCprsList';
    var CLINICS_TAB = 'clinics';
    var WARDS_TAB = 'wards';
    var NO_TAB = 'none';
    var BLANK = '';
    var INPUT = 'input';

    var SearchMainView = Backbone.Marionette.LayoutView.extend({
        template: searchMainTemplate,
        regions: {
            mainSearchMyCPRSList: "#main-search-my-cprs-list",
            mainSearchMySiteAllResults: "#main-search-mySiteAll-results",
            mainSearchRecentPatientResults: "#main-search-RecentPatient-results",
            mainSearchMySiteClinics: "#main-search-mySiteClinics",
            mainSearchMySiteWards: "#main-search-mySiteWards",
            mainSearchGlobalResults: "#main-search-global-results"
        },
        initialize: function(options) {
            this.searchApplet = options.searchApplet;
            this.myCPRSListLayoutView = new MyCPRSListLayoutView({
                searchApplet: this.searchApplet
            });
            this.mySiteAllSearchLayoutView = new MySiteAllSearchLayoutView({
                searchApplet: this.searchApplet
            });
            this.recentPatientsLayoutView = new RecentPatientsSearchLayoutView({
                searchApplet: this.searchApplet
            });
            this.mySiteClinicsSearchLayoutView = new ClinicsWardsSearchLayoutView({
                searchApplet: this.searchApplet,
                locationType: CLINICS_TAB
            });
            this.mySiteWardsSearchLayoutView = new ClinicsWardsSearchLayoutView({
                searchApplet: this.searchApplet,
                locationType: WARDS_TAB
            });
            this.globalSearchLayoutView = new GlobalSearchLayoutView({
                searchApplet: this.searchApplet
            });
        },
        onRender: function() {
            this.mySiteAllSearchLayoutView.searchApplet = this.searchApplet;
            this.globalSearchLayoutView.searchApplet = this.searchApplet;
            this.mainSearchMySiteAllResults.show(this.mySiteAllSearchLayoutView);

            // execute the cprs list fetch undercover to see if we have a list
            this.changeView(MY_CPRS_LIST_TAB);
        },
        changeView: function(activeSelection) {
            this.hideAllResultViews();

            if (activeSelection == MY_CPRS_LIST_TAB) {
                this.mainSearchMyCPRSList.show(this.myCPRSListLayoutView);
            } else if (activeSelection == CLINICS_TAB) {
                this.mainSearchMySiteClinics.show(this.mySiteClinicsSearchLayoutView);
                this.searchApplet.selectedLocationModel = this.mySiteClinicsSearchLayoutView.selectedLocationModel;
            } else if (activeSelection == WARDS_TAB) {
                this.mainSearchMySiteWards.show(this.mySiteWardsSearchLayoutView);
                this.searchApplet.selectedLocationModel = this.mySiteWardsSearchLayoutView.selectedLocationModel;
            } else if (activeSelection == MY_SITE) {
                this.mainSearchMySiteAllResults.$el.show();
                this.mainSearchRecentPatientResults.$el.hide();
                this.searchApplet.selectedLocationModel = this.mySiteAllSearchLayoutView.model;
                this.mainSearchMySiteAllResults.show(this.mySiteAllSearchLayoutView, {
                    preventDestroy: true
                });
                this.searchApplet.setupPatientSearch();
                $('#patientSearchInput').focusout();
            } else if (activeSelection == RECENT_PATIENTS) {
                this.mainSearchMySiteAllResults.$el.hide();
                this.mainSearchRecentPatientResults.$el.show();
                this.mainSearchRecentPatientResults.show(this.recentPatientsLayoutView, {
                    preventDestroy: true
                });
                this.recentPatientsLayoutView.fetchRecentPatients();
            } else if (activeSelection == NATIONWIDE) {
                this.mainSearchGlobalResults.$el.show();
                this.mainSearchRecentPatientResults.$el.hide();
                this.mainSearchGlobalResults.show(this.globalSearchLayoutView);
            }
        },
        hideAllResultViews: function() {
            this.clearGlobalSearchErrorMessage();
        },
        clearErrorMessage: function(searchType) {
            if (searchType == NATIONWIDE) {
                this.globalSearchLayoutView.clearSearchResultsRegion();
            }
        },
        clearGlobalSearchErrorMessage: function() {
            // FLAG: [isGlobalSearchErrorMessageDisplayed] is defined on globalModel in inputView.js
            var refGlobalModel = this.searchApplet.patientSearchView.nationwideModel;
            if (refGlobalModel.get('isGlobalSearchErrorMessageDisplayed')) {
                // Note reset All input fields.
                refGlobalModel.clear({
                    silent: true
                });
                this.globalSearchLayoutView.clearSearchResultsRegion();
                refGlobalModel.set('isGlobalSearchErrorMessageDisplayed', false);
            }
        },
        clearPreviousGlobalSearchResults: function(searchType) {
            if (searchType == NATIONWIDE) {
                this.globalSearchLayoutView.clearSearchResultsRegion();
            }
        },
        displayErrorMessage: function(searchType, message) {
            if (searchType == NATIONWIDE) {
                this.globalSearchLayoutView.displayErrorMessage(message);
            }
        },
        executeSearch: function(searchType, searchParameters) {
            if (searchType == MY_SITE) {
                this.mySiteAllSearchLayoutView.executeSearch(searchParameters.searchString);
            } else if (searchType == NATIONWIDE) {
                this.globalSearchLayoutView.executeSearch(searchParameters.globalSearchParameters);
            }
        }
    });

    return SearchMainView;
});