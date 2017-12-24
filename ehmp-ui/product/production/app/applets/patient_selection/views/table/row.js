define([
    "backbone",
    "marionette",
    "jquery",
    "hbs!app/applets/patient_selection/templates/table/row/default",
    "hbs!app/applets/patient_selection/templates/table/row/clinics",
    "hbs!app/applets/patient_selection/templates/table/row/wards",
    "hbs!app/applets/patient_selection/templates/table/row/myCPRSList"
], function(
    Backbone,
    Marionette,
    $,
    tableRow,
    tableRow_clinics,
    tableRow_wards,
    tableRow_myCPRSList
) {
    "use strict";

    var ENTER_KEY = 13;
    var SPACE_KEY = 32;
    var CLINICS_TEMPLATE = 'clinics';
    var WARDS_TEMPLATE = 'wards';
    var MY_CPRS_LIST_TEMPLATE = 'myCprsList';

    var base64PatientPhoto;

    /**
     *
     * PatientSearchResultView manages the templates for the data for each patient that gets returned
     * in the search results.
     *
     */
    var PatientSearchResultView = Backbone.Marionette.ItemView.extend({
        tagName: 'tr',
        template: tableRow,
        events: {
            "click": "selectPatient",
            "keydown": "selectPatient"
        },
        templateHelpers: {
            'last5': function() {
                var lastFourOfSSN = _.isString(this.ssn) ? this.ssn.replace(/\D/g, '').slice(-4) : '';
                if (lastFourOfSSN.length > 0) {
                    return _.get(this, 'familyName', '').charAt(0) + (_.isUndefined(this.last4) ? (_.isUndefined(this.lastFourSSN) ? lastFourOfSSN : this.lastFourSSN) : this.last4);
                }
                return this.ssn || '';
            },
            'getGenderCode': function() {
                var genderCode = _.get(this, 'genderCode', 'U');
                genderCode = !_.isString(genderCode) || _.isEmpty(genderCode) ? 'U' : genderCode;
                if (genderCode.length > 1) {
                    return _.get(this, 'genderName', 'U').charAt(0);
                }
                return genderCode;
            },
            'getGenderName': function() {
                var genderName = _.get(this, 'genderName', 'Unknown');
                genderName = !_.isString(genderName) || _.isEmpty(genderName) ? 'Unknown' : genderName;
                return genderName;
            }
        },
        /**
         *
         * Returns the data template file that corresponds to the type of search being performed.
         *
         */
        getTemplate: function() {
            var templateName = this.getOption('templateName');
            if (_.isString(templateName)) {
                switch (templateName) {
                    case CLINICS_TEMPLATE:
                        return tableRow_clinics;
                    case WARDS_TEMPLATE:
                        return tableRow_wards;
                    case MY_CPRS_LIST_TEMPLATE:
                        return tableRow_myCPRSList;
                    default:
                        return tableRow;
                }
            } else {
                return tableRow;
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
            //since what was passed is an event, just add class active to the target, also there's no need of jquery here
            event.currentTarget.classList.add('active');
            event.currentTarget.setAttribute('aria-selected', 'true');
            // set the adequate value to the model
            ADK.PatientRecordService.setCurrentPatient(this.model, { confirmationOptions: { reconfirm: true } });
        }
    });

    return PatientSearchResultView;

});
