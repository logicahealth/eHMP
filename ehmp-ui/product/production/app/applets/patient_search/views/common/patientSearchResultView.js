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
        tagName: "a",
        className: "list-group-item row-layout",
        template: singleSearchResultTemplate,
        attributes: {
            onclick: "return false",
            href: ""
        },
        events: {
            "click": "selectPatient",
            "keyup": "selectPatient"
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
            if (event.keyCode !== undefined && (event.keyCode != ENTER_KEY && event.keyCode != SPACE_KEY)) {
                return;
            }
            var currentPatient = this.model;
            if (this.source === 'global') {
                this.mviGetCorrespondingIds();
            }
            $(".patient-search-results a.active").removeClass('active');
            $("#patient-search-confirmation").removeClass('hide');
            $("#global-search-results a.active").removeClass('active');
            $("#global-search-confirmation").removeClass('hide');

            $(event.currentTarget).siblings('.active').removeClass('active');
            $(event.currentTarget).addClass('active');
             this.searchApplet.patientSelected(this.model);
        },
        /**
         *
         * Grab the corresponding patient ids from the MVI (Master Veteran Index) for a
         * given patient.
         *
         */
        mviGetCorrespondingIds: function() {
            var response = $.Deferred();

            var dataToBeSent = this.model.attributes;
            dataToBeSent.dob = dataToBeSent.birthDate;

            var PostModel;
            if (dataToBeSent.idClass === 'EDIPI') {
                var siteEdipi = 'DOD;' + dataToBeSent.pid;
                PostModel = Backbone.Model.extend({
                    url: ADK.ResourceService.buildUrl('search-mvi-patient-sync'),
                    defaults: {
                        pid: siteEdipi,
                        edipi: dataToBeSent.pid,
                        demographics: dataToBeSent
                    }
                });
            } else {
                PostModel = Backbone.Model.extend({
                    url: ADK.ResourceService.buildUrl('search-mvi-patient-sync'),
                    defaults: {
                        pid: dataToBeSent.pid,
                        icn: dataToBeSent.pid,
                        demographics: dataToBeSent
                    }
                });
            }

            var postModel = new PostModel();
            postModel.save({}, {
                success: function(model, resp, options) {
                    response.resolve(resp);
                }
            });

            return response.promise();
        }
    });

    return PatientSearchResultView;

});
