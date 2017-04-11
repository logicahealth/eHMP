define([
    "backbone",
    "marionette",
    "handlebars",
    "moment",
    "app/applets/patient_search/views/common/searchResultsCollectionView",
    "app/applets/patient_search/views/mySite/clinics_wards/siteResultsCollectionView",
    "hbs!app/applets/patient_search/templates/mySite/clinics_wards/searchViewTemplate",
    "app/applets/patient_search/views/mySite/clinics_wards/dateRangeSelectorView"
], function(Backbone, Marionette, Handlebars, moment, SearchResultsCollectionView, LocationsListResultsView, SearchViewTemplate, DateRangeSelectorView) {
    "use strict";

    // var APPOINTMENT_DATE_FORMAT = 'MMDDYYYYHHmmss';

    /* objects */
    var LocationsListFilterModel = Backbone.Model.extend({
        defaults: {
            'filterString': '',
            'locationType': ''
        }
    });

    var LocationsListFilterViewWards = Backbone.Marionette.ItemView.extend({
        template: '<div></div>',
        initialize: function(options) {
            this.model = new LocationsListFilterModel();
            this.model.set('locationType', options.locationType);
            this.model.set('filterString', '');
        }
    });

    var LocationsListFilterViewClinics = Backbone.Marionette.LayoutView.extend({
        template: Handlebars.compile("<div id='locationDateRange'></div>"),
        regions: {
            locationDateRange: "#locationDateRange"
        },
        initialize: function(options) {
            this.model = new LocationsListFilterModel();
            this.model.set('locationType', options.locationType);
            this.model.set('filterString', '');
            this.locationDateRangeView = new DateRangeSelectorView({
                parent: options.parent
            });
        },
        onRender: function() {
            this.locationDateRange.show(this.locationDateRangeView);
        }
    });

    var SearchLayoutView = Backbone.Marionette.LayoutView.extend({
        searchApplet: undefined,
        template: SearchViewTemplate,
        templateHelpers: function(){
            var self = this;
            return {
                isClinic: function(){
                    return (self.getOption('locationType')=='clinics');
                }
            };
        },
        regions: {
            patientSearchResults: ".patient-search-results",
        },
        initialize: function(options) {
            this.searchApplet = options.searchApplet;
            this.locationType = options.locationType;
            this.model = new Backbone.Model({
                locationType: this.locationType//,
            });

            /*slimmed down version with just the date filter*/
            this.addRegions({
                locationListFilterRegion: "#" + this.locationType + "-location-list-filter-date-range"
            });
            if (this.locationType === 'clinics') {
                this.locationsListFilterView = new LocationsListFilterViewClinics({
                    locationType: options.locationType,
                    parent: this
                });
            } else {
                this.locationsListFilterView = new LocationsListFilterViewWards({
                    locationType: options.locationType
                });
            }
            this.locationListResultsView = new LocationsListResultsView({
                searchView: this,
                searchApplet: this.searchApplet,
                locationListFilterView: this.locationsListFilterView,
                locationType: options.locationType
            });
            /* end of slimmed down version */
        },
        onBeforeShow: function(){
            this.locationListFilterRegion.show(this.locationsListFilterView);
        },
        executeSearch: function(criteria) {
            this.searchApplet.removePatientSelectionConfirmation();

            if (this.patientsView) {
                this.patientsView.remove = function() {
                    this.collection.on('sync', function() {});
                };
                this.patientsView.remove();
            }

            if (this.locationType === 'clinics') {
                this.patientsView = new SearchResultsCollectionView({
                    searchApplet: this.searchApplet,
                    templateName: 'clinics'
                });
            } else if (this.locationType === 'wards') {
                this.patientsView = new SearchResultsCollectionView({
                    searchApplet: this.searchApplet,
                    templateName: 'roomBedIncluded'
                });
            } else {
                this.patientsView = new SearchResultsCollectionView({
                    searchApplet: this.searchApplet
                });
            }

            this.patientSearchResults.show(this.patientsView);

            var self = this;
            var patientsCollection;

            // If we're on the clinics tab, we need to do some date filtering, otherwise
            // we must be on the wards tab so just do a search based on location
            if (this.locationType === 'clinics') {
                // Set the customFromDate and customToDate on the date range selector view so we can keep
                // track of which dates were searched last and display them when the user clicks away from
                // the Clinics tab and back again
                var startValue = this.$el.find('#filter-from-date-clinic').val();
                var endValue = this.$el.find('#filter-to-date-clinic').val();
                this.locationsListFilterView.locationDateRangeView.model.set('customFromDate', startValue);
                this.locationsListFilterView.locationDateRangeView.model.set('customToDate', endValue);

                criteria['date.start'] = this.locationsListFilterView.locationDateRangeView.model.get('date.start');
                criteria['date.end'] = this.locationsListFilterView.locationDateRangeView.model.get('date.end');

                var startMoment = moment(criteria['date.start'], 'YYYYMMDD');
                var endMoment = moment(criteria['date.end'], 'YYYYMMDD');

                if (criteria['date.start'] === 'Invalid date' || criteria['date.end'] === 'Invalid date' || endMoment.isBefore(startMoment)) {
                    this.$el.find('button').removeClass('active-range');
                    self.patientsView.setEmptyMessage('Invalid dates entered.');
                    self.patientsView.render();
                } else {
                    var clinicSearchOptions = {
                        resourceTitle: 'locations-' + this.locationType + '-search',
                        criteria: criteria,
                        cache: true
                    };

                    clinicSearchOptions.onError = function(model, resp) {
                        if (resp.status === 200) {
                            self.patientsView.setEmptyMessage(resp.responseText);
                        } else {
                            var errorMessage = self.searchApplet.getSearchErrorMessage(resp, self.searchApplet.getAlertText('unknownErrorText'));
                            self.patientsView.setEmptyMessage(errorMessage);
                        }
                        self.patientsView.render();
                    };
                    clinicSearchOptions.onSuccess = function(resp) {

                        self.patientsView.setEmptyMessage(self.searchApplet.getAlertText('noResultsText'));
                        if (patientsCollection.length === 1 &&
                            patientsCollection.at(0).attributes.message) {
                            patientsCollection.reset();
                        }

                        // Sort the collection by appointmentTime
                        if (patientsCollection.length > 0 &&
                            patientsCollection.at(0).attributes.appointmentTime) {
                            patientsCollection.comparator = function(a, b) {
                                var appt = a.attributes.appointmentTime - b.attributes.appointmentTime;
                                if (appt === 0) {
                                    return appt;
                                } else {
                                    return a.attributes.appointmentTime < b.attributes.appointmentTime ? -1 : 1;
                                }
                            };

                            patientsCollection.sort();
                        }

                        self.patientsView.collection = patientsCollection;
                        self.patientsView.originalCollection = patientsCollection;
                        self.patientsView.render();
                    };

                    patientsCollection = ADK.ResourceService.fetchCollection(clinicSearchOptions);
                }
            } else {
                var wardSearchOptions = {
                    resourceTitle: 'locations-' + this.locationType + '-search',
                    criteria: criteria,
                    cache: true
                };

                wardSearchOptions.onError = function(model, resp) {
                    if (resp.status === 200) {
                        self.patientsView.setEmptyMessage(resp.responseText);
                    } else {
                        var errorMessage = self.searchApplet.getSearchErrorMessage(resp, self.searchApplet.getAlertText('unknownErrorText'));
                        self.patientsView.setEmptyMessage(errorMessage);
                    }
                    self.patientsView.render();
                };
                wardSearchOptions.onSuccess = function(resp) {
                    self.patientsView.setEmptyMessage(self.searchApplet.getAlertText('noResultsText'));
                    if (patientsCollection.length === 1 &&
                        patientsCollection.at(0).attributes.message) {
                        patientsCollection.reset();
                    }

                    self.patientsView.collection = patientsCollection;
                    self.patientsView.originalCollection = patientsCollection;
                    self.patientsView.render();
                };

                patientsCollection = ADK.ResourceService.fetchCollection(wardSearchOptions);
            }
        },
        refineSearch: function(filterString, view) {
            if (view && view.originalCollection && !view.originalCollection.isEmpty()) {
                if (filterString !== '') {
                    var self = this;
                    view.collection = new Backbone.Collection();
                    var filteredSet = _.filter(view.originalCollection.models, function(model) {
                        if (self.modelAttributeContainsFilterString(model, 'fullName', filterString)) {
                            return model;
                        }
                        if (self.modelAttributeContainsFilterString(model, 'ssn', filterString)) {
                            return model;
                        }
                        if (self.modelAttributeContainsFilterString(model, 'birthDate', filterString)) {
                            return model;
                        }
                    });
                    view.collection.reset(filteredSet);
                } else {
                    view.collection = view.originalCollection;
                }
                view.render();
            }
        },
        modelAttributeContainsFilterString: function(model, attribute, filterString) {
            if ((model.attributes[attribute] !== undefined) && (model.attributes[attribute].toLowerCase().indexOf(filterString.toLowerCase()) >= 0)) {
                return true;
            } else {
                return false;
            }
        }
    });

    return SearchLayoutView;
});
