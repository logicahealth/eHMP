define([
    "backbone",
    "marionette",
    "hbs!app/applets/patient_search/templates/mySite/clinics_wards/singleSearchResultTemplate"
], function(Backbone, Marionette, SingleSearchResultTemplate) {
    "use strict";

    var ENTER_KEY = 13;
    var SPACE_KEY = 32;

    var PatientSearchResultView = Backbone.Marionette.ItemView.extend({
        tagName: "a",
        className: "list-group-item row-layout simple",
        template: SingleSearchResultTemplate,
        attributes: {
            href: "",
            onClick: "return false"
        },
        events: {
            "click": "selectItem",
            "keyup": "selectItem"
        },
        initialize: function(options) {
            this.searchView = options.searchView;
            this.locationCollectionView = options.locationCollectionView;
            this.searchApplet = options.searchApplet;
            this.model.set('locationType', options.locationType.substr(0, options.locationType.length-1));
        },
        selectItem: function(event) {
            if (event.keyCode !== undefined && (event.keyCode != ENTER_KEY && event.keyCode != SPACE_KEY)) {
                return;
            }
            var currentLocation = this.model;
            this.searchApplet.removePatientSelectionConfirmation();
            this.searchView.locationSelected(currentLocation);
            this.searchView.selectedLocationModel = currentLocation;
            this.searchApplet.selectedLocationModel = currentLocation;
            this.locationCollectionView.$el.find("a.activeItem").removeClass('activeItem');
            event.currentTarget.classList.add('activeItem');
            this.$el.closest('.patient-search-wrapper').removeClass('confirmation');
        }
    });

    return PatientSearchResultView;

});
