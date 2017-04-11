define([
    "backbone",
    "marionette",
    "jquery",
    "hbs!app/applets/patient_search/templates/singleSearchResultTemplate",
    "hbs!app/applets/patient_search/templates/singleSearchResult_clinicsTemplate",
    "hbs!app/applets/patient_search/templates/singleSearchResult_roomBedIncludedTemplate",
    "hbs!app/applets/patient_search/templates/singleSearchResult_myCPRSListTemplate"
], function(Backbone, Marionette, $, singleSearchResultTemplate, singleSearchResult_clinicsTemplate, singleSearchResult_roomBedIncludedTemplate, singleSearchResult_myCPRSListTemplate) {
    "use strict";

    var ENTER_KEY = 13;
    var SPACE_KEY = 32;
    var CLINICS_TEMPLATE = 'clinics';
    var ROOM_BED_INCLUDED_TEMPLATE = 'roomBedIncluded';
    var MY_CPRS_LIST_TEMPLATE = 'myCprsList';

    var base64PatientPhoto;

    /**
     *
     * PatientSearchResultView manages the templates for the data for each patient that gets returned
     * in the search results.
     *
     */
    var PatientSearchResultView = Backbone.Marionette.ItemView.extend({
        source: '',
        className: "list-group-item row-layout",
        template: singleSearchResultTemplate,
        attributes: {
            'role': 'option',
            'aria-selected': 'false',
            'tabindex': '-1'
        },
        events: {
            "click": "selectPatient",
            "keydown": "selectPatient"
        },
        initialize: function(options) {
            this.searchApplet = options.searchApplet;
            if (this.searchApplet.selectedLocationModel) {
                this.model.set('clinicName', this.searchApplet.selectedLocationModel.get('displayName'));
            }
            this.source = options.source;
            if (options.templateName) {
                this.templateName = options.templateName;
            }
            if (options.source) {
                this.source = options.source;
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
                        return singleSearchResult_clinicsTemplate;
                    case ROOM_BED_INCLUDED_TEMPLATE:
                        return singleSearchResult_roomBedIncludedTemplate;
                    case MY_CPRS_LIST_TEMPLATE:
                        return singleSearchResult_myCPRSListTemplate;
                    default:
                        return singleSearchResultTemplate;
                }
            } else {
                return singleSearchResultTemplate;
            }
        },
        /**
         *
         * When a patient is selected from the search results, hide the confirmation view of
         * the previously selected patient (if it is visible) and show the confirmation view
         * for the currently selected patient. If this is a Nationwide search, grab the
         * corresponding patient ids from the MVI.
         *
         */
        selectPatient: function(event) {
            if (/(37|38|39|40)/.test(event.which)) {
                this.triggerMethod('child:keyhander');
                return;
            }
            if (event.keyCode !== undefined && (event.keyCode != ENTER_KEY && event.keyCode != SPACE_KEY)) {
                return;
            }
            var currentPatient = this.model;
            // find all the selections in list and un-highlight the active one (even in other search types)
            this.$el.closest("#patient-search-main").find('.list-group-item.active').removeClass('active').attr('aria-selected', 'false');
            // add class confirmation to the wrapper to avoid IE messing everything up
            this.$el.closest('.patient-search-wrapper').addClass('confirmation');
            //since what was passed is an event, just add class active to the target, also there's no need of jquery here
            event.currentTarget.classList.add('active');
            event.currentTarget.setAttribute('aria-selected', 'true');
            // set the adequate value to the model
            this.searchApplet.patientSelected(this.model);
        }
    });

    return PatientSearchResultView;

});
