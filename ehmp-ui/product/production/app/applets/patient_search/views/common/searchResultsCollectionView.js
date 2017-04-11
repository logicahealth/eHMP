define([
    "backbone",
    "marionette",
    'underscore',
    "handlebars",
    "app/applets/patient_search/views/common/loadingView",
    "app/applets/patient_search/views/common/patientSearchResultView",
    'hbs!app/applets/patient_search/templates/patientSearchResultWrapper',
    'hbs!app/applets/patient_search/templates/patientSearchResultsWrapper_clinics',
    'hbs!app/applets/patient_search/templates/patientSearchResultsWrapper_roomBedIncluded',
    'hbs!app/applets/patient_search/templates/patientSearchResultsWrapper_myCPRSList'
], function(Backbone, Marionette, _, Handlebars, LoadingView, PatientSearchResultView, PatientSearchResultWrapper, patientSearchResultsWrapper_clinics, patientSearchResultsWrapper_roomBedIncluded, patientSearchResultsWrapper_myCPRSList) {
    "use strict";

    var CLINICS_TEMPLATE = 'clinics';
    var ROOM_BED_INCLUDED_TEMPLATE = 'roomBedIncluded';
    var MY_CPRS_LIST_TEMPLATE = 'myCprsList';

    /**
     *
     * SearchResultsCollectionView manages the templates for the data collections that get returned
     * by a patient search. This applies to Nationwide, My Site, My CPRS List, Clinics, and Wards.
     * A different template file will be returned based on the kind of search that is being performed.
     *
     */
    var SearchResultsCollectionView = Backbone.Marionette.CompositeView.extend({
        searchApplet: undefined,
        source: '',
        className: "results-table container-fluid",
        attributes: {
            role: 'application'
        },
        /**
         * Initializes the SearchResultsCollectionView.
         */
        initialize: function(options) {
            this.searchApplet = options.searchApplet;
            this.source = options.source;
            this.collection = new Backbone.Collection();
            if (options.templateName) {
                this.templateName = options.templateName;
            }
        },
        onRender: function() {
            if (this.collection.length > 0) {
                this.$('.list-group-item:first').attr('tabindex', '0');
            } else if (this.collection.length === 0) {
                this.$el.find('.list-group').removeAttr('role');
            }
        },
        /**
         * Returns the data template file that corresponds to the type of search being performed.
         */
        getTemplate: function() {
            if (this.templateName) {
                switch (this.templateName) {
                    case CLINICS_TEMPLATE:
                        return patientSearchResultsWrapper_clinics;
                    case ROOM_BED_INCLUDED_TEMPLATE:
                        return patientSearchResultsWrapper_roomBedIncluded;
                    case MY_CPRS_LIST_TEMPLATE:
                        return patientSearchResultsWrapper_myCPRSList;
                    default:
                        return PatientSearchResultWrapper;
                }
            } else {
                return PatientSearchResultWrapper;
            }
        },
        emptyView: LoadingView,
        setEmptyMessage: function(errorMessage) {
            this.emptyView = Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile('<p class="error-message top-padding-sm left-padding-md font-size-14">' + errorMessage + '</p>')
            });
        },
        childViewContainer: ".list-group",
        childView: PatientSearchResultView,
        childViewOptions: function() {
            return {
                searchApplet: this.searchApplet,
                templateName: this.templateName,
                source: this.source
            };
        },
        childEvents: {
            'child:keyhander': function(child) {
                this.childKeyhandler(child);
            }
        },
        childKeyhandler: function(child) {
            var currentIdx = this.collection.indexOf(child.model);
            var refocusEl;
            event.preventDefault();
            switch (event.which) {
                case 37:
                    if (currentIdx === 0) break;
                    refocusEl = child.$el.siblings().first();
                    break;
                case 38:
                    if (currentIdx === 0) break;
                    refocusEl = child.$el.prev();
                    break;
                case 39:
                    if (currentIdx === this.collection.length - 1) break;
                    refocusEl = child.$el.siblings().last();
                    break;
                case 40:
                    if (currentIdx === this.collection.length - 1) break;
                    refocusEl = child.$el.next();
                    break;
            }

            if (!_.isUndefined(refocusEl)) {
                child.$el.attr('tabindex', '-1');
                refocusEl.attr('tabindex', '0').focus();
            }
        }
    });

    return SearchResultsCollectionView;
});