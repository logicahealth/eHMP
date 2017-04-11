define([
    "backbone",
    "marionette",
    "handlebars",
    "moment", 
    "app/applets/patient_search/views/common/searchResultsCollectionView",
    "app/applets/patient_search/views/common/errorMessageView",
    "app/applets/patient_search/views/common/blankView",
    "app/applets/patient_search/views/mySite/clinics_wards/siteResultsCollectionView",
    "hbs!app/applets/patient_search/templates/mySite/clinics_wards/searchViewTemplate",
    "app/applets/patient_search/views/mySite/clinics_wards/dateRangeSelectorView"
], function(Backbone, Marionette, Handlebars, Moment, SearchResultsCollectionView, ErrorMessageView, BlankView, LocationsListResultsView, SearchViewTemplate, DateRangeSelectorView) {
    "use strict";

    var LocationsListFilterModel = Backbone.Model.extend({
        defaults: {
            'filterString': '',
            'locationType': ''
        }
    });
    var locationsListFilterModel = new LocationsListFilterModel();
    var locationsListFilterModelClinics = new LocationsListFilterModel();

    var APPOINTMENT_DATE_FORMAT = 'MMDDYYYYHHmmss';

    var LocationsListFilterViewWards = Backbone.Marionette.ItemView.extend({

        template: Handlebars.compile("<input type='text' autocomplete='off' class='form-control' id='wardFilter'  placeholder='Filter {{locationType}}' title='Please enter in text to filter wards.'></input>"),
        model: locationsListFilterModel,
        initialize: function(options) {
            this.model.set('locationType', options.locationType);
            this.model.set('filterString', '');
        },
        events: {
            'keyup input': 'updateWardsListResults',
            'keydown input': 'updateWardsListResults',
            'keypress input': 'updateWardsListResults',
            'input input' : 'updateWardsListResults',
            'change': 'updateWardsListResults'
        },
        updateWardsListResults: function(event) {
            var self = this;
            if (event.currentTarget.id == 'wardFilter') {
                self.model.set({
                    'filterString': $(event.currentTarget).val()
                });
            }
        }
    });
    var LocationsListFilterViewClinics = Backbone.Marionette.LayoutView.extend({
        template: Handlebars.compile("<input type='text' autocomplete='off' class='form-control' id='clinicFilter' placeholder='Filter {{locationType}}' title='Please enter in text to filter clinics.'></input><div id='locationDateRange'></div>"),
        model: locationsListFilterModelClinics,
        regions: {
            locationDateRange: "#locationDateRange"
        },
        initialize: function(options) {
            this.model.set('locationType', options.locationType);
            this.model.set('filterString', '');
            this.locationDateRangeView = new DateRangeSelectorView({
                parent: options.parent
            });
        },
        onRender: function() {
            this.locationDateRange.show(this.locationDateRangeView);
        },
        events: {
            'keyup input': 'updateClinicListResults',
            'keydown input': 'updateClinicListResults',
            'keypress input': 'updateClinicListResults',
            'input input' : 'updateClinicListResults',
            'change': 'updateClinicListResults'
        },
        updateClinicListResults: function(event) {
            if (this.setModel) clearTimeout(this.setModel);
            var self = this;
            var target = event.target.id;
            if (target == 'clinicFilter') {
                this.setModel = setTimeout(function() {
                    self.model.set({
                        'filterString': $(event.target).val()

                    });
                }, 200);
            }
        }
    });

    var SearchLayoutView = Backbone.Marionette.LayoutView.extend({
        searchApplet: undefined,
        template: SearchViewTemplate,
        regions: {
            patientSearchResults: ".patient-search-results",
        },
        initialize: function(options) {
            this.searchApplet = options.searchApplet;
            this.locationType = options.locationType;
            this.model = new Backbone.Model({
                locationType: this.locationType
            });
            this.addRegions({
                locationListFilterRegion: "#" + this.locationType + "-location-list-filter-input",
                locationListResultsRegion: "#" + this.locationType + "-location-list-results"
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
        },
        onAttach: function() {
            this.searchApplet.onResize();
        },

        onRender: function() {
            var self = this;
            this.locationListFilterRegion.show(this.locationsListFilterView);
            this.locationListResultsRegion.show(this.locationListResultsView);
            this.$el.find('#' + this.locationType + 'location-list-results').on('scroll', function(event) {
                self.locationListResultsView.fetchRows(event);
            });
        },
        locationSelected: function(locationModel) {
            var criteria;
            if (this.locationType === 'clinics') {
                criteria = {
                    "uid": locationModel.attributes.uid
                };
            } else {
                criteria = {
                    "ref.id": locationModel.attributes.refId,
                    "uid": locationModel.attributes.uid
                };
            }
            this.searchApplet.removePatientSelectionConfirmation();
            this.executeSearch(criteria);
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
                    if (this.$el.find('#filter-from-date-clinic').val() !== '' && this.$el.find('#filter-to-date-clinic').val() !== '') {
                        this.$el.find('button').removeClass('active-range');
                    } else {
                        this.$el.find('#filter-from-date-clinic').val('');
                        this.$el.find('#filter-to-date-clinic').val('');
                    }
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

                        // this has to be checked after render b/c of element availability
                        if (patientsCollection.length > 0){
                            // size the height of the results
                            self.searchApplet.onResize();

                            // apply scrollbar css to column headers for adjustments.
                            if (self.searchApplet.hasScrollbars($('#main-search-mySiteClinics .results-table .list-group')[0]).vertical){
                                $('#main-search-mySiteClinics .results-table').toggleClass('data-scroll');
                            }
                        }
                    };

                    patientsCollection = ADK.ResourceService.fetchCollection(clinicSearchOptions);
                }
            }
            else
            {
                var wardSearchOptions = {
                    resourceTitle: 'locations-' + this.locationType + '-search',
                    criteria: criteria,
                    cache: true
                };

                wardSearchOptions.onError = function(model, resp) {
                    if (resp.status === 200) {
                        self.patientsView.setEmptyMessage(resp.responseText);
                    } else {
                        var error = self.searchApplet.getAlertText('unknownErrorText');
                        var errorLog = self.searchApplet.formatAlertUnknownResponse(resp);
                        self.patientsView.setEmptyMessage(error + errorLog);
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

                    // this has to be checked after render b/c of element availability
                    if (patientsCollection.length > 0){
                        // size the height of the results
                        self.searchApplet.onResize();

                        // apply scrollbar css to column headers for adjustments.
                        if (self.searchApplet.hasScrollbars($('#main-search-mySiteWards .results-table .list-group')[0]).vertical){
                            $('#main-search-mySiteWards .results-table').toggleClass('data-scroll');
                        }
                    }
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