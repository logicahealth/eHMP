define([
    'moment',
    'backbone',
    'marionette'
], function(
    moment,
    Backbone,
    Marionette
) {
    'use strict';
    var DATE_FORMAT = 'MM/DD/YYYY';
    var SearchModel = Backbone.Model.extend({
        defaults: {
            firstName: '',
            lastName: '',
            ssn: ''
        },
        validate: function(attributes, options) {
            /*
                options: {
                    silent: true/false (default: false) When true it will not set/display error messages on the form fields.
                }
             */
            var REQUIRED_ERROR_STRING = 'This field is required.';
            var NAME_FORMAT_ERROR_STRING = 'Names may not contain numbers or special characters other than commas, apostrophes, or hyphens.';
            var DOB_FORMAT_ERROR_STRING = 'DOB must be entered in MM/DD/YYYY format.';
            var SSN_FORMAT_ERROR_STRING = 'SSN must match the format: 123-45-6789 or 123456789.';

            var namePattern = /^[- ,a-z A-Z']+$/;
            var dobPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
            var ssnPattern = /^(\d{3})-?(\d{2})-?(\d{4})$/;
            var errors = {};
            var hasAllRequiredFields = true;
            if (_.isEmpty(attributes.lastName)) {
                errors.lastName = REQUIRED_ERROR_STRING;
                hasAllRequiredFields = false;
            } else if (_.isNull(attributes.lastName.match(namePattern))){
                 errors.lastName = NAME_FORMAT_ERROR_STRING;
            }

            if (_.isEmpty(attributes.firstName)) {
                errors.firstName = REQUIRED_ERROR_STRING;
                hasAllRequiredFields = false;
            } else if (_.isNull(attributes.firstName.match(namePattern))){
                 errors.firstName = NAME_FORMAT_ERROR_STRING;
            }

            if (!_.isEmpty(_.get(attributes, 'dob', '').trim()) && _.isNull(attributes.dob.trim().match(dobPattern))){
                 errors.dob = DOB_FORMAT_ERROR_STRING;
            }

            if (_.isEmpty(attributes.ssn)) {
                 errors.ssn = REQUIRED_ERROR_STRING;
                 hasAllRequiredFields = false;
            } else if (!_.isEqual(attributes.ssn.replace(/\D/g, '').length, 9) || _.isNull(attributes.ssn.match(ssnPattern))){
                 errors.ssn = SSN_FORMAT_ERROR_STRING;
            }

            if (hasAllRequiredFields || !_.get(options, 'silent', false)){
                this.errorModel.set(errors);
            }

            if (!_.isEmpty(errors)) {
                return "Validation errors. Please fix.";
            }
        }
    });

    var NationwideSearchForm = ADK.UI.Form.extend({
        fields: [{
            control: 'container',
            extraClasses: ['row'],
            items: [{
                control: 'fieldset',
                legend: 'Enter the patient\'s first name, last name, and SSN to enable search.',
                extraClasses: ['col-xs-12'],
                items: {
                    control: 'container',
                    extraClasses: ['flex-display', 'flex-direction-row', 'flex-align-flex-start'],
                    items: [{
                        control: 'input',
                        name: 'lastName',
                        placeholder: 'Ex: Doe, Smith',
                        label: 'Last Name',
                        extraClasses: ['flex-width-1', 'right-padding-md'],
                        title: 'Enter in patient\'s last name',
                        required: true,
                        changeEvent: 'input'
                    }, {
                        control: 'input',
                        name: 'firstName',
                        placeholder: 'Ex: John, Jane',
                        label: 'First Name',
                        extraClasses: ['flex-width-1', 'right-padding-md'],
                        title: 'Enter in patient\'s first name',
                        required: true,
                        changeEvent: 'input'
                    }, {
                        control: "datepicker",
                        name: "dob",
                        label: "Date of Birth",
                        extraClasses: ['flex-width-1', 'right-padding-md'],
                        outputFormat: 'MM/DD/YYYY',
                        endDate: "0d", //TODO FIX DATEPICKER
                        placeholder: 'MM/DD/YYYY' //TODO FIX DATEPICKER
                    }, {
                        control: 'input',
                        name: 'ssn',
                        placeholder: '###-##-####',
                        label: 'SSN',
                        extraClasses: ['flex-width-1', 'right-padding-md'],
                        title: 'Enter in patient\'s 9 digit social security number without dashes',
                        required: true,
                        changeEvent: 'input'
                    }, {
                        control: 'button',
                        type: 'submit',
                        label: 'Search',
                        extraClasses: ['btn-primary', 'left-margin-md', 'top-margin-md']
                    }]
                }
            }]
        }],
        events: {
            'submit': function(event) {
                event.preventDefault();
                if (this.model.isValid()) {
                    this.onSearch();
                } else {
                    this.transferFocusToFirstError();
                }
            }
        },
        onSearch: function() {
            ADK.Messaging.getChannel(this.getOption('eventChannelName')).trigger('execute-search', this.model);
        },
        onRenderCollection: function() {
            this.bindUIElements();
            // Backslash is the escape character. Javascript weirdness: you have to escape square brackets with TWO backslashes
            this.$('.lastName input').inputmask("Regex", {
                regex: "[^^\"\\\\`~!@#$%&*()_+=|}{/?:;.<>0-9\\[\\]]+"
            });
            this.$('.firstName input').inputmask("Regex", {
                regex: "[^^\"\\\\`~!@#$%&*()_+=|}{/?:;.<>0-9\\[\\]]+"
            });
            this.$('.ssn input').inputmask("999-99-9999");
        }
    });

    var NationwideFilterView = Backbone.Marionette.ItemView.extend({
        template: false,
        className: 'bottom-margin-lg',
        initialize: function(options) {
            this._regionManager = new Backbone.Marionette.RegionManager();
            var SearchRegion = Backbone.Marionette.Region.extend({
                el: this.$el
            });
            this._regionManager.addRegions({
                'searchRegion': SearchRegion
            });
        },
        onBeforeShow: function() {
            this._regionManager.get('searchRegion').show(new NationwideSearchForm(_.extend({}, this.options, {
                model: new SearchModel()
            })));
        },
        onBeforeDestroy: function() {
            this._regionManager.destroy();
        }
    });

    return NationwideFilterView;
});