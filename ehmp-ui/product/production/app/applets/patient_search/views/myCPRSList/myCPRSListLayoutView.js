define([
     "backbone",
     "marionette",
     "underscore",
     "app/applets/patient_search/views/common/searchResultsCollectionView",
     "hbs!app/applets/patient_search/templates/myCPRSList/myCPRSListResultsTemplate"
 ], function(Backbone, Marionette, _, SearchResultsCollectionView, myCPRSListResultsTemplate) {
    "use strict";

    // constants
    var MY_CPRS_LIST = 'myCprsList';
    var APPOINTMENT_DATE_FORMAT = 'MMDDYYYYHHmmss';
    var MY_SITE = 'mySite';
    var NO_TAB = 'none';
    var NO_RECORD_FOUND_MESSAGE = 'No patient record was found. Verify if search criteria is correct.';

    /**
    *
    * MyCPRSListLayoutView executes the My CPRS List search.
    *
    */
    var MyCPRSListLayoutView = Backbone.Marionette.LayoutView.extend({
         searchApplet: undefined,
         template: myCPRSListResultsTemplate,
         regions: {
             myCPRSSearchResultsRegion: "#myCprsSearchResults"
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
                 templateName: MY_CPRS_LIST
             });
             patientsView.setEmptyMessage(message);
             this.myCPRSSearchResultsRegion.show(patientsView);
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
                 templateName: MY_CPRS_LIST
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
                    if(patientsView.searchApplet.menuView.getCurrentSelection() === MY_CPRS_LIST){

                        // Setup the patient search instead.
                        patientsView.searchApplet.searchMainView.changeView(MY_SITE);
                        patientsView.searchApplet.menuView.changePatientSelection(MY_SITE);
                    }
                 } else {
                    // If records found for the user's My CPRS List and they haven't changed tabs
                    //, display the My CPRS list view
                    if (patientsView.searchApplet.model.get('autoNav')){
                        patientsView.searchApplet.menuView.changePatientSelection(MY_CPRS_LIST);
                        patientsView.searchApplet.model.set({'autoNav':false});
                    }
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
