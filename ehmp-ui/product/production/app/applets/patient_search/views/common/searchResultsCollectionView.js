define([
    "backbone",
    "marionette",
    "app/applets/patient_search/views/common/loadingView",
    "app/applets/patient_search/views/common/patientSearchResultView",
    'hbs!app/applets/patient_search/templates/patientSearchResultWrapper',
    'hbs!app/applets/patient_search/templates/patientSearchResultsWrapper_clinics',
    'hbs!app/applets/patient_search/templates/patientSearchResultsWrapper_roomBedIncluded',
    'hbs!app/applets/patient_search/templates/patientSearchResultsWrapper_myCPRSList'
], function(Backbone, Marionette, LoadingView, PatientSearchResultView, PatientSearchResultWrapper, patientSearchResultsWrapper_clinics, patientSearchResultsWrapper_roomBedIncluded, patientSearchResultsWrapper_myCPRSList) {
    "use strict";

    var CLINICS_TEMPLATE = 'clinics';
    var ROOM_BED_INCLUDED_TEMPLATE = 'roomBedIncluded';
    var MY_CPRS_LIST_TEMPLATE = 'myCprsList';

    /**
     *
     * SearchResultsCollectionView manages the templates for the data collections that get returned
     * by a patient search. This applies to Nationwide, My Site, My CPRS List, Clinics, and Wards.
     * A different template file will be returned based on the kind of search that is being performed.
     *
     */
    var SearchResultsCollectionView = Backbone.Marionette.CompositeView.extend({
        searchApplet: undefined,
        source: '',
        /**
         *
         * Initializes the SearchResultsCollectionView.
         *
         */
        initialize: function(options) {
            this.searchApplet = options.searchApplet;
            this.source = options.source;
            this.collection = new Backbone.Collection();
            if (options.templateName){
                this.templateName = options.templateName;
            }
        },
        /**
         *
         * Returns the data template file that corresponds to the type of search being performed.
         *
         */
        getTemplate: function() {
            if (this.templateName) {
                switch (this.templateName) {
                    case CLINICS_TEMPLATE:
                        return patientSearchResultsWrapper_clinics;
                    case ROOM_BED_INCLUDED_TEMPLATE:
                        return patientSearchResultsWrapper_roomBedIncluded;
                    case MY_CPRS_LIST_TEMPLATE:
                        return patientSearchResultsWrapper_myCPRSList;
                    default:
                        return PatientSearchResultWrapper;
                }
            } else {
                return PatientSearchResultWrapper;
            }
        },
        emptyView: LoadingView,
        setEmptyMessage: function(errorMessage) {
            this.emptyView = Backbone.Marionette.ItemView.extend({
                template: _.template('<div aria-live="assertive"><p class="error-message padding" role="alert"></div>' + errorMessage + '</p></div>')
            });
        },
        childView: PatientSearchResultView,
        childViewOptions: function() {
            return {
                searchApplet: this.searchApplet,
                templateName: this.templateName,
                source: this.source
            };
        },
        tagName: "div",
        className: "results-table",
        childViewContainer: ".list-group"
    });

    return SearchResultsCollectionView;
});
