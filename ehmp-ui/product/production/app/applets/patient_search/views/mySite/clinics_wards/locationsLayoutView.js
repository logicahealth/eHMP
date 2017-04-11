define([
    "backbone",
    "marionette",
    "handlebars",
    "hbs!app/applets/patient_search/templates/mySite/clinics_wards/locationsViewTemplate",
    "app/applets/patient_search/views/mySite/clinics_wards/siteResultsCollectionView"
], function(Backbone, Marionette, Handlebars, locationsViewTemplate, LocationsListResultsView) {
    "use strict";

    var LocationsListFilterModel = Backbone.Model.extend({
        defaults: {
            'filterString': '',
            'locationType': ''
        }
    });

    /* clinics locations */
    var LocationsListFilterViewClinics = Backbone.Marionette.LayoutView.extend({
        template: Handlebars.compile("<input type='text' autocomplete='off' class='form-control input-sm location-filter' id='clinicFilter' placeholder='Filter {{locationType}}' title='Begin typing to filter the clinics list below. Press tab to view results.' accesskey='c' />"),
        initialize: function(options) {
            this.model = new LocationsListFilterModel();
            this.model.set('locationType', options.locationType);
            this.model.set('filterString', '');
        },
        events: {
            'keyup input': 'updateClinicListResults',
            'keydown input': 'updateClinicListResults',
            'keypress input': 'updateClinicListResults',
            'input input': 'updateClinicListResults',
            'change': 'updateClinicListResults'
        },
        updateClinicListResults: function(event) {
            var target = event.target.id;
            if (target == 'clinicFilter') {
                this.model.set({
                    'filterString': $(event.target).val()
                });
            }
        }
    });


    /* wards locations */
    var LocationsListFilterViewWards = Backbone.Marionette.ItemView.extend({

        template: Handlebars.compile("<input type='text' autocomplete='off' class='form-control input-sm location-filter' id='wardFilter'  placeholder='Filter {{locationType}}' title='Begin typing to filter the wards list below. Press tab to view results.' accesskey='w' /> "),
        initialize: function(options) {
            this.model = new LocationsListFilterModel();
            this.model.set('locationType', options.locationType);
            this.model.set('filterString', '');
        },
        events: {
            'keyup input': 'updateWardsListResults',
            'keydown input': 'updateWardsListResults',
            'keypress input': 'updateWardsListResults',
            'input input': 'updateWardsListResults',
            'change': 'updateWardsListResults'
        },
        updateWardsListResults: function(event) {
            if (event.currentTarget.id == 'wardFilter') {
                this.model.set({
                    'filterString': this.$(event.currentTarget).val()
                });
            }
        }
    });

    /* locations object */
    var LocationsLayoutView = Backbone.Marionette.LayoutView.extend({
        tagName: 'div',
        className: 'locations-wrapper',
        template: locationsViewTemplate,
        regions: {
            patientSearchResults: ".patient-search-results",
        },
        initialize: function(options) {
            this.searchApplet = options.searchApplet;
            this.locationType = options.locationType;
            this.mainView = options.mainView;
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

            // hello locations
            this.locationListResultsView = new LocationsListResultsView({
                searchView: this,
                searchApplet: this.searchApplet,
                locationListFilterView: this.locationsListFilterView,
                locationType: options.locationType
            });
        },
        onRender: function() {
            var self = this;
            this.locationListFilterRegion.show(this.locationsListFilterView);
            this.locationListResultsRegion.show(this.locationListResultsView);
            this.$el.find('#' + this.locationType + '-location-list-results').on('scroll', function(event) {
                self.locationListResultsView.fetchRows(event);
            });
        },
        locationSelected: function(locationModel) {
            var criteria;
            var flCap = function(string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            };
            criteria = {
                "uid": locationModel.get('uid')
            };
            this.mainView.selectedLocationModel = locationModel;

            this.searchApplet.removePatientSelectionConfirmation();

            this.searchApplet.searchMainView['mySite' + flCap(this.locationType) + 'SearchLayoutView'].executeSearch(criteria);

        },
    });
    return LocationsLayoutView;

});