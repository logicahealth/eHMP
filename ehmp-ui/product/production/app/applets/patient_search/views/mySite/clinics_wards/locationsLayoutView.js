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
        template: Handlebars.compile([
            "<form class='clinic-filter-form'>",
            "<label class='sr-only' for='clinicFilter'></label>",
            "<i class='fa fa-filter font-size-14'></i>",
            "<input type='text' autocomplete='off' class='form-control input-sm clinic-input-filter' id='clinicFilter' placeholder='Filter {{locationType}}' title='Begin typing to filter the clinics list below. Press tab to view results.' accesskey='c' />",
            "<button type='button' class='btn btn-icon btn-sm clear-clinic-filter clear-filter color-grey-darkest' title='Press enter to clear filtered text'><i class='fa fa-times'></i> <span class='sr-only'>Clear.</span></button>",
            "</form>"
            ].join("\n")),
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
            'change': 'updateClinicListResults',
            'click .clear-clinic-filter': 'clearClinicFilter',
        },
        updateClinicListResults: function(event) {
                if (!_.isUndefined(this.$el.find('#clinicFilter').val())) {
                    this.model.set({
                        'filterString': this.$el.find('#clinicFilter').val()
                    });
                }

                this.clearClinicFilterBtnDisplay(this.$el.find('#clinicFilter').val());
        },
        clearClinicFilter: function(e) {
            this.$el.find('#clinicFilter').val('');
            this.updateClinicListResults(e);
            this.$el.find('#clinicFilter').focus();
        },
        clearClinicFilterBtnDisplay: function(val) {
            if (val) {
                this.$('.clear-clinic-filter').show();
            } else {
                this.$('.clear-clinic-filter').hide();
            }
        }
    });


    /* wards locations */
    var LocationsListFilterViewWards = Backbone.Marionette.ItemView.extend({

        template: Handlebars.compile([
            "<form class='ward-filter-form'>",
            "<label class='sr-only' for='wardFilter'></label>",
            "<i class='fa fa-filter font-size-14'></i>",
            "<input type='text' autocomplete='off' class='form-control input-sm ward-input-filter' id='wardFilter'  placeholder='Filter {{locationType}}' title='Begin typing to filter the wards list below. Press tab to view results.' accesskey='w' />",
            "<button type='button' class='btn btn-icon btn-sm clear-ward-filter clear-filter color-grey-darkest' title='Press enter to clear filtered text'><i class='fa fa-times'></i> <span class='sr-only'>Clear.</span></button>",
            "</form>"
            ].join("\n")),
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
            'change': 'updateWardsListResults',
            'click .clear-ward-filter': 'clearWardFilter',
        },
        updateWardsListResults: function(event) {
            if (!_.isUndefined(this.$el.find('#wardFilter').val())) {
                    this.model.set({
                        'filterString': this.$el.find('#wardFilter').val()
                    });
                }

                this.clearWardFilterBtnDisplay(this.$el.find('#wardFilter').val());
        },
        clearWardFilter: function(e) {
            this.$el.find('#wardFilter').val('');
            this.updateWardsListResults(e);
            this.$el.find('#wardFilter').focus();
        },
        clearWardFilterBtnDisplay: function(val) {
            if (val) {
                this.$('.clear-ward-filter').show();
            } else {
                this.$('.clear-ward-filter').hide();
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