define([
    'backbone',
    'marionette',
    'handlebars',
    'hbs!app/applets/patient_search/templates/menuTemplate',
    'app/applets/patient_search/views/mySite/clinics_wards/locationsLayoutView',
], function(Backbone, Marionette, Handlebars, menuTemplate, LocationsLayoutView) {
    "use strict";

    // constants
    var MY_CPRS_LIST = 'myCprsList';
    var PATIENT_SEARCH_OUTPUT = 'patient-search-output';
    var MENU_CLASS = 'menu-wrapper';
    //backbone objects
    var MenuModel = Backbone.Model.extend({
        defaults: {
            'template': menuTemplate,
            'activeSelection': MY_CPRS_LIST
        }
    });
    var MenuView = Backbone.Marionette.LayoutView.extend({
        tagName: 'div',
        className: MENU_CLASS,
        template: menuTemplate,
        events: {
            'click .selection-changer': 'changePatientSelection'
        },
        regions: {
            locationClinics: "#locationClinics",
            locationWards: "#locationWards"
        },
        initialize: function(options) {
            this.model = new MenuModel();
        },
        changePatientSelection: function(event) {
            var navItemId = (typeof(event) == 'string' ? event : $(event.currentTarget).attr('id'));
            if (navItemId) {
                // get rid of the autonav (cause we already chose to go somewhere else)
                this.getOption('searchApplet').model.set({
                    'autoNav': false
                });

                this.model.set({
                    'activeSelection': navItemId
                });
                // Reset the left panel search type
                this.$el.parent().siblings('.' + PATIENT_SEARCH_OUTPUT).attr('class', PATIENT_SEARCH_OUTPUT + ' ' + navItemId);

                // remove specific class form the sidebar wrapper
                this.$el.attr('class', MENU_CLASS + ' ' + navItemId);

                // find the active item and remove the active class
                this.$('.active').removeClass('active');

                // get the clicked element and add the class active
                this.$('#' + navItemId).addClass('active');

                //If it is clinincs or wards, display the locations list

                if (navItemId == 'clinics' && !this.getRegion('locationClinics').hasView()) {
                    this.getRegion('locationClinics').show(new LocationsLayoutView({
                        searchApplet: this.getOption('searchApplet'),
                        locationType: 'clinics',
                        mainView: this.getOption('searchApplet').searchMainView.mySiteClinicsSearchLayoutView
                    }));
                }
                if (navItemId == 'wards' && !this.getRegion('locationWards').hasView()) {
                    this.getRegion('locationWards').show(new LocationsLayoutView({
                        searchApplet: this.getOption('searchApplet'),
                        locationType: 'wards',
                        mainView: this.getOption('searchApplet').searchMainView.mySiteWardsSearchLayoutView
                    }));
                }
            }
        },
        getCurrentSelection: function() {
            return this.model.get('activeSelection');
        }
    });

    return MenuView;
});