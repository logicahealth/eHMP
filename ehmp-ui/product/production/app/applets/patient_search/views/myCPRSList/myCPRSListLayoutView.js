define([
     "backbone",
     "marionette",
     "underscore",
     "app/applets/patient_search/views/common/searchResultsCollectionView",
     "hbs!app/applets/patient_search/templates/myCPRSList/myCPRSListResultsTemplate"
 ], function(Backbone, Marionette, _, SearchResultsCollectionView, myCPRSListResultsTemplate) {
    "use strict";

    var MY_CPRS_LIST_TEMPLATE = 'myCprsList';
    var APPOINTMENT_DATE_FORMAT = 'MMDDYYYYHHmmss';
    var MY_SITE = 'mySite';
    var MY_CPRS_LIST_TAB = 'myCprsList';
    var NO_TAB = 'none';
    var NO_RECORD_FOUND_MESSAGE = 'No patient record found. Please make sure your CPRS Default Search is configured properly.';

    /**
    *
    * MyCPRSListLayoutView executes the My CPRS List search.
    *
    */
    var MyCPRSListLayoutView = Backbone.Marionette.LayoutView.extend({
         events: {
            'click #myCprsList': 'displayTab'
         },
         searchApplet: undefined,
         template: myCPRSListResultsTemplate,
         regions: {
             myCPRSSearchResultsRegion: "#my-cprs-search-results"
         },
         initialize: function(options) {
             this.searchApplet = options.searchApplet;
         },
         onRender: function() {
             this.executeSearch();
         },
         displayErrorMessage: function(message) {
             var patientsView = new SearchResultsCollectionView({
                 searchApplet: this.searchApplet,
                 templateName: MY_CPRS_LIST_TEMPLATE
             });
             patientsView.setEmptyMessage(message);
             this.myCPRSSearchResultsRegion.show(patientsView);
         },
         /**
         *
         * Displays the My CPRS List tab.
         *
         */
         displayTab: function() {
            patientsView.searchApplet.searchMainView.changeView(MY_SITE, MY_CPRS_LIST_TAB);
         },
         /**
         *
         * Executes the My CPRS List search. Calls the RDK resource and sets the results
         * on the patientsCollection object. If no results are returned, the My Site search
         * view is displayed.
         *
         */
         executeSearch: function(myCPRSSearchString) {
             var self = this;
             var patientsView = new SearchResultsCollectionView({
                 searchApplet: this.searchApplet,
                 templateName: MY_CPRS_LIST_TEMPLATE
             });
             this.myCPRSSearchResultsRegion.show(patientsView);

             //the entire custom viewModel may be totally unnecessary
             var viewModel = {
                 defaults: {
                     ageYears: 'Unk'
                 }
             };
             var searchOptions = {
                 resourceTitle: 'search-default-search',
                 viewModel: viewModel,
                 cache: true
             };

             searchOptions.onError = function(model, resp) {
                if (resp.status === 200) {
                    patientsView.setEmptyMessage(resp.responseText);
                } else {
                    var errorMessage = self.searchApplet.getSearchErrorMessage(resp, self.searchApplet.getAlertText('unknownErrorText'));
                    patientsView.setEmptyMessage(errorMessage);
                }
                patientsView.render();
             };
             searchOptions.onSuccess = function(resp) {
                 if (patientsCollection.length === 0) {
                    patientsView.setEmptyMessage(NO_RECORD_FOUND_MESSAGE);

                    // If no records are found for the user's My CPRS List and they haven't changed tabs
                    //, display the My Site search view
                    if(patientsView.searchApplet.mySiteTabsView.getTabType() === 'myCprsList'){
                        patientsView.searchApplet.searchMainView.changeView(MY_SITE, NO_TAB);
                        // Setup the patient search instead.
                        patientsView.searchApplet.triggerSearchInput();
                    }
                 } else {
                    patientsCollection.comparator = function(collectionA, collectionB) {
                        var start = moment(collectionA.attributes.appointment, APPOINTMENT_DATE_FORMAT, true);
                        var end = moment(collectionB.attributes.appointment, APPOINTMENT_DATE_FORMAT, true);

                        if (start.isBefore(end)) {
                            return -1;
                        } else if (start.isSame(end)) {
                            return 0;
                        } else {
                            return 1;
                        }
                    };

                    patientsCollection.sort();

                    patientsView.collection = patientsCollection;
                    patientsView.originalCollection = patientsCollection;
                 }
                 patientsView.render();

                 // this has to be checked after render b/c of element availability
                 if (patientsCollection.length > 0){
                    // size the height of the results
                     self.searchApplet.onResize();

                     // apply scrollbar css to column headers for adjustments.
                     if (self.searchApplet.hasScrollbars($('#my-cprs-search-results .results-table .list-group')[0]).vertical){
                        $('#my-cprs-search-results .results-table').toggleClass('data-scroll');
                     }
                 }
             };
             var patientsCollection = ADK.ResourceService.fetchCollection(searchOptions);
         },
         refineSearch: function(filterString) {
             this.clearErrorMessage();
             if ((filterString !== undefined) && (filterString !== '')) {
                 var self = this;
                 this.patientsView.collection = new Backbone.Collection().reset(_.filter(this.patientsView.originalCollection.models, function(model) {
                     if (self.modelAttributeContainsFilterString(model, 'fullName', filterString)) {
                         return model;
                     }
                     if (self.modelAttributeContainsFilterString(model, 'ssn', filterString)) {
                         return model;
                     }
                     if (self.modelAttributeContainsFilterString(model, 'birthDate', filterString)) {
                         return model;
                     }
                 }));
                 if (this.patientsView.collection.length === 0) {
                     this.displayErrorMessage(NO_RECORD_FOUND_MESSAGE);
                 }
             } else {
                 this.patientsView.collection = this.patientsView.originalCollection;
             }
             this.patientsView.render();
         },
         modelAttributeContainsFilterString: function(model, attribute, filterString) {
             if ((model.attributes[attribute] !== undefined) && (model.attributes[attribute].toLowerCase().indexOf(filterString.toLowerCase()) >= 0)) {
                 return true;
             } else {
                 return false;
             }
         }
     });

     return MyCPRSListLayoutView;
 });
