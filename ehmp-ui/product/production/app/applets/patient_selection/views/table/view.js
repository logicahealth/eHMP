define([
    "backbone",
    "marionette",
    'underscore',
    "handlebars",
    "app/applets/patient_selection/views/table/row",
    'hbs!app/applets/patient_selection/templates/table/header/default',
    'hbs!app/applets/patient_selection/templates/table/header/clinics',
    'hbs!app/applets/patient_selection/templates/table/header/wards',
    'hbs!app/applets/patient_selection/templates/table/header/myCPRSList'
], function(
    Backbone,
    Marionette,
    _,
    Handlebars,
    PatientSearchResultView,
    PatientSearchResultWrapper,
    clinicsHeaderTemplate,
    wardsHeaderTemplate,
    myCPRSListHeaderTemplate
) {
    "use strict";

    var CLINICS_TEMPLATE = 'clinics';
    var WARD_TEMPLATE = 'wards';
    var MY_CPRS_LIST_TEMPLATE = 'myCprsList';

    /**
     *
     * SearchResultsCollectionView manages the templates for the data collections that get returned
     * by a patient search. This applies to Nationwide, My Site, My CPRS List, Clinics, and Wards.
     * A different template file will be returned based on the kind of search that is being performed.
     *
     */
    var SearchResultsCollectionView = Backbone.Marionette.CompositeView.extend({
        source: '',
        tagName: 'table',
        className: "table-view--patient-selection adjust-table-container percent-height-100",
        /**
         * Returns the data template file that corresponds to the type of search being performed.
         */
        getTemplate: function() {
            var templateName = this.getOption('templateName');
            if (_.isString(templateName)) {
                switch (templateName) {
                    case CLINICS_TEMPLATE:
                        return clinicsHeaderTemplate;
                    case WARD_TEMPLATE:
                        return wardsHeaderTemplate;
                    case MY_CPRS_LIST_TEMPLATE:
                        return myCPRSListHeaderTemplate;
                    default:
                        return PatientSearchResultWrapper;
                }
            } else {
                return PatientSearchResultWrapper;
            }
        },
        templateHelpers: function() {
            return {
                caption: 'Patient selection ' + this.getOption('searchType') + ' search results. Press enter to select patient.'
            };
        },
        getLoadingView: function() {
            return Backbone.Marionette.ItemView.extend({
                tagName: 'tr',
                className: 'all-border-no no-hover-state',
                attributes: {
                    'data-message-type': 'loading'
                },
                template: Handlebars.compile(
                    '<td colspan="' + this.$('thead th').length + '">' + '<i class="fa fa-spinner fa-spin"></i> Loading...</td>')
            });
        },
        setEmptyMessage: function(errorMessage, isError) {
            isError = _.isBoolean(isError) ? isError : false;
            this.emptyView = Backbone.Marionette.ItemView.extend({
                tagName: 'tr',
                className: 'all-border-no no-hover-state',
                attributes: {
                    'data-message-type': isError ? 'error' : 'no-results'
                },
                template: Handlebars.compile(
                    '<td colspan="' + this.$('thead th').length + '">' + errorMessage + '</td>')
            });
        },
        childViewContainer: "tbody",
        childView: PatientSearchResultView,
        childViewOptions: function() {
            return this.options;
        },
        collectionEvents: {
            'sync': function(collection, resp, options) {
                this.updateScroll();
            }
        },
        initialize: function(options) {
            this.emptyView = this.getLoadingView();
        },
        updateScroll: function() {
            var scrollElement = this.$('tbody').removeClass('no-scroll');
            if (!this.hasScrolling(scrollElement)) {
                scrollElement.addClass('no-scroll');
            }
        },
        hasScrolling: function(scrollElement) {
            return scrollElement[0].clientHeight !== scrollElement[0].scrollHeight;
        }
    });

    return SearchResultsCollectionView;
});