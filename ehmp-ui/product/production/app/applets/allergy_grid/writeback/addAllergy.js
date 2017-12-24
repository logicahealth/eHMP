define([
    'underscore',
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'moment',
    'app/applets/allergy_grid/writeback/validationUtils',
    'app/applets/allergy_grid/writeback/writebackUtils'
], function(_, Backbone, Marionette, $, Handlebars, moment, validationUtils, writebackUtils) {
    "use strict";

    var NO_KNOWN_ALLERGY_CODE = '132;GMRD(120.82,';

    var patientAllergyArray = [];

    var allergenRow = {
        control: 'container',
        extraClasses: ['row'],
        items: [{
            control: 'container',
            extraClasses: ['col-xs-12'],
            items: [{
                control: 'select',
                name: 'allergen',
                label: 'Allergen',
                required: true,
                disabled: true,
                pickList: [],
                showFilter: true,
                groupEnabled: true,
                fetchFunction: function(input, fetchSuccess, fetchFail) {
                    var allergenCollection = new ADK.UIResources.Picklist.Allergies.Allergens();
                    this.listenToOnce(allergenCollection, 'read:success', function(collection, response) {
                        allergenCollection.off('read:error');
                        var excludeNoKnownAllergies = false;
                        if ((patientAllergyArray.length === 1 && patientAllergyArray[0].toUpperCase().indexOf('NO KNOWN ALLERGIES') < 0) || patientAllergyArray.length > 1) {
                            excludeNoKnownAllergies = true;
                        }
                        var picklist = writebackUtils.parseAllergenResponse(collection.toPicklist(), excludeNoKnownAllergies);
                        fetchSuccess({
                            results: picklist
                        });
                    });

                    this.listenToOnce(allergenCollection, 'read:error', function(collection) {
                        allergenCollection.off('read:success');
                        fetchFail();
                    });

                    allergenCollection.fetch({
                        searchString: input
                    });
                }
            }]
        }]
    };

    var topFields = {
        control: 'container',
        items: [{
            control: 'container',
            extraClasses: 'row',
            items: [{
                control: 'fieldset',
                legend: 'Choose an option *',
                extraClasses: ['col-xs-12'],
                items: [{
                    control: 'radio',
                    name: 'allergyType',
                    options: [{
                        value: 'o',
                        label: 'Observed'
                    }, {
                        value: 'h',
                        label: 'Historical'
                    }],
                    label: 'Choose an option',
                    srOnlyLabel: true,
                    required: true
                }]
            }]
        }, {
            control: 'container',
            extraClasses: 'row',
            items: [{
                control: 'container',
                extraClasses: 'col-xs-6',
                items: [{
                    control: 'datepicker',
                    name: 'reaction-date',
                    label: 'Reaction Date',
                    required: false,
                    disabled: true,
                    flexible: true,
                    options: {
                        endDate: '0d'
                    }
                }]
            }, {
                control: 'container',
                extraClasses: 'col-xs-6',
                items: [{
                    control: 'timepicker',
                    name: 'reaction-time',
                    label: 'Time',
                    title: 'Enter time in HH:MM format',
                    placeholder: 'HH:MM',
                    disabled: true,
                    options: {
                        defaultTime: false
                    }
                }]
            }]
        }, {
            control: 'container',
            extraClasses: 'row',
            items: [{
                control: 'container',
                extraClasses: 'col-xs-5',
                items: [{
                    control: 'select',
                    name: 'severity',
                    label: 'Severity',
                    required: false,
                    disabled: true,
                    pickList: []
                }]
            }, {
                control: 'container',
                extraClasses: 'col-xs-7',
                items: [{
                    control: 'select',
                    name: 'nature-of-reaction',
                    label: 'Nature of Reaction',
                    required: true,
                    disabled: true,
                    pickList: []
                }]
            }]
        }]
    };

    var SignsAndSymptoms = {
        control: 'multiselectSideBySide',
        name: 'signsSymptoms',
        label: 'signs and symptoms',
        srOnlyLabel: true,
        extraClasses: ['top-margin-xs'],
        required: true,
        attributeMapping: {
            id: 'id',
            value: 'booleanValue',
            label: 'description'
        },
        itemColumn: {
            columnClasses: ["flex-width-2"]
        },
        additionalColumns: [{
            columnClasses: ['text-center percent-width-25'],
            columnTitle: 'Date',
            control: 'datepicker',
            extraClasses: ['cell-valign-middle', 'bottom-margin-no'],
            name: 'symptom-date',
            label: 'Symptom Date',
            srOnlyLabel: true,
            flexible: true,
            options: {
                endDate: '0d'
            }
        }, {
            columnClasses: ['text-center'],
            columnTitle: 'Time',
            control: 'timepicker',
            extraClasses: ['cell-valign-middle', 'bottom-margin-no'],
            name: 'symptom-time',
            label: 'Symptom Time',
            title: 'Enter time in HH:MM format',
            placeholder: 'HH:MM',
            srOnlyLabel: true,
            options: {
                defaultTime: false
            }
        }],
        selectedCountName: "msbs-Count",
        template: Handlebars.compile("<span class='right-padding-xs text-right'>Total Selected: {{msbs-Count}}</span>"),
        modelListeners: ["msbs-Count"],
        selectedSize: 12,
        collection: []
    };


    var SignsAndSymptomsFieldset = {
        control: 'fieldset',
        legend: 'Signs/Symptoms * ',
        items: [SignsAndSymptoms],
        extraClasses: ['bottom-margin-md', 'signs-and-symptoms']
    };

    var SignsAndSymptomsRequired = {
        control: 'input',
        name: 'signsSymptomsRequired',
        label: 'None',
        required: true,
        hidden: true
    };

    var Comments = {
        control: 'container',
        extraClasses: ['row'],
        items: [{
            control: 'container',
            extraClasses: ['col-md-12'],
            items: [{
                control: 'textarea',
                rows: 4,
                name: 'moreInfo',
                label: 'Comments',
                title: 'Enter in comments'
            }]
        }]
    };

    var AllergyFields = [{
        control: 'container',
        extraClasses: ['modal-body', 'allergies-writeback-add'],
        items: [{
            control: 'container',
            extraClasses: ['container-fluid'],
            items: [allergenRow, topFields, {
                control: 'spacer'
            }, SignsAndSymptomsFieldset, SignsAndSymptomsRequired, Comments]
        }]
    }, {
        control: 'container',
        extraClasses: ['modal-footer'],
        items: [{
            control: 'container',
            extraClasses: ['row'],
            items: [{
                control: 'container',
                extraClasses: ['col-xs-12'],
                template: Handlebars.compile('{{#if savedTime}}<p><span id="allergies-saved-at">Saved at: {{savedTime}}</span></p>{{/if}}')
            }]
        }, {
            control: 'container',
            extraClasses: ['row'],
            items: [{
                control: 'container',
                extraClasses: ['col-xs-12', 'flex-display', 'valign-bottom'],
                items: [{
                    control: 'popover',
                    behaviors: {
                        Confirmation: {
                            title: 'Warning',
                            eventToTrigger: 'allergies-confirm-cancel'
                        }
                    },
                    label: 'Cancel',
                    name: 'allergiesConfirmCancel',
                    extraClasses: ['btn-default', 'btn-sm']
                }, {
                    control: 'button',
                    extraClasses: ['btn-primary', 'btn-sm', 'left-margin-sm'],
                    label: 'Accept',
                    name: 'addBtn',
                    disabled: true
                }]
            }]
        }]
    }];

    var ErrorMessageView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('Unable to save your data at this time due to a system error. Please try again later.'),
        tagName: 'p'
    });

    var ErrorFooterView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('{{ui-button "OK" classes="btn-primary btn-sm"}}'),
        events: {
            'click .btn-primary': function() {
                ADK.UI.Alert.hide();
            }
        },
        tagName: 'span'
    });

    var formView = ADK.UI.Form.extend({
        ui: {
            'inProgressContainer': '.inProgressContainer',
            'dateTimeSeverity': '.reaction-date, .reaction-time, .severity',
            'dateTimeRequired': '.reaction-date, .severity',
            'initialDisabledFields': '.reaction-date, .reaction-time, .signsSymptoms, .moreInfo, .allergyType',
            'allergyType': '.allergyType',
            'severity': '.severity',
            'natureOfReaction': '.nature-of-reaction',
            'signsSymptoms': '.signsSymptoms',
            'addBtn': '.addBtn',
            'signsSymptomsRequired': '.signsSymptomsRequired',
            'moreInfo': '.moreInfo',
            'allergen': '.allergen'
        },
        fields: AllergyFields,
        allergenCollectionEvents: {
            'read:success': function(collection, response) {
                if (!_.isUndefined(response.data) && !_.isEmpty(response.data.items)) {
                    _.each(response.data.items, function(allergy) {
                        if (!_.isEmpty(allergy.products) && !_.isUndefined(allergy.products[0].name)) {
                            patientAllergyArray.push(allergy.products[0].name);
                        }
                    }, this);
                }

                this.ui.allergen.trigger('control:disabled', false);
            }
        },
        operationalDataEvents: {
            'read:success': function(collection, resp) {
                this.ui.natureOfReaction.trigger('tray.loaderHide');
                var natureOfReactionList = writebackUtils.parseOperationalDataList(resp, 'Nature of Reaction');
                this.ui.natureOfReaction.trigger('control:picklist:set', [natureOfReactionList]);
                var severityList = writebackUtils.parseOperationalDataList(resp, 'Severity');
                this.ui.severity.trigger('control:picklist:set', [severityList]);
                var symptomsCollection = writebackUtils.parseSymptomList(resp);
                this.model.get('signsSymptoms').add(symptomsCollection.models);
            },
            'read:error': function(collection) {
                this.ui.natureOfReaction.trigger('tray.loaderHide');
                var errorAlertView = new ADK.UI.Alert({
                    title: 'Error',
                    icon: 'icon-circle-exclamation',
                    messageView: ErrorMessageView.extend({
                        msg: 'Failed to load picklist data.'
                    }),
                    footerView: ErrorFooterView

                });
                errorAlertView.show();
            }
        },
        onInitialize: function() {
            this.allergyCollection = new ADK.UIResources.Fetch.Allergies.Collection();
            this.operationalData = new ADK.UIResources.Picklist.Allergies.OperationalData();

            this.bindEntityEvents(this.allergyCollection, this.allergenCollectionEvents);
            this.bindEntityEvents(this.operationalData, this.operationalDataEvents);
        },
        onRender: function() {
            var fetchOptions = {
                onSuccess: function(collection, response) {
                    collection.trigger('read:success', collection, response);
                }
            };
            this.allergyCollection.fetchCollection(fetchOptions);

            this.operationalData.fetch();
            this.listenToOnce(this.model, 'change.inputted', this.registerChecks);

        },
        onAttach:function(){
            if (this.ui.allergen.is(':visible')){
                this.$el.trigger('tray.loaderShow',{
                    loadingString:'Loading'
                });
            }
        },
        registerChecks: function() {
            var checkOptions = {
                id: 'allergy-writeback-in-progress',
                label: 'Allergy',
                failureMessage: 'Allergy Writeback Workflow In Progress! Any unsaved changes will be lost if you continue.',
                onContinue: _.bind(function(model) {
                    this.workflow.close();
                }, this)
            };
            ADK.Checks.register([new ADK.Navigation.PatientContextCheck(checkOptions), new ADK.Checks.predefined.VisitContextCheck(checkOptions)]);
        },
        onDestroy: function() {
            writebackUtils.unregisterChecks();
            this.unbindEntityEvents(this.allergyCollection, this.allergenCollectionEvents);
            this.unbindEntityEvents(this.operationalData, this.operationalDataEvents);
        },
        events: {
            'allergies-confirm-cancel': function(e) {
                writebackUtils.unregisterChecks();
                this.workflow.close();
            },
            'submit': function(e) {
                e.preventDefault();
                var self = this;
                if (!this.model.isValid()) {
                    this.model.set('formStatus', {
                        status: 'error',
                        message: this.model.validationError
                    });
                    this.transferFocusToFirstError();
                } else {
                    this.$el.trigger('tray.loaderShow',{
                        loadingString:'Accepting'
                    });
                    this.model.unset('formStatus');
                    this.ui.addBtn.trigger('control:disabled', true);
                    writebackUtils.addAllergy(this.model,
                        function() {
                            self.$el.trigger('tray.loaderHide');
                            var saveAlertView = new ADK.UI.Notification({
                                title: 'Success',
                                message: 'Allergy Submitted',
                                type: 'success'
                            });

                            saveAlertView.show();
                            writebackUtils.unregisterChecks();
                            self.workflow.close();

                            ADK.ResourceService.clearAllCache('allergy');
                            ADK.Messaging.getChannel('allergy_grid').trigger('refreshGridView');
                        },
                        function(error) {
                            var errorAlertView;
                            self.$el.trigger('tray.loaderHide');
                            self.ui.addBtn.trigger('control:disabled', false);

                            if (error.status === 409) {
                                var errorMessage = '';
                                var hbErrorMessage = Handlebars.compile('<p>An error was returned during your submission:</p>');
                                var errorMessageArray = JSON.parse(error.responseText);

                                if (errorMessageArray && !_.isEmpty(errorMessageArray)) {

                                    if (errorMessageArray.message) {
                                        hbErrorMessage = Handlebars.compile('<p>An error was returned during your submission:</p><ul><li>' + errorMessageArray.message + '</li></ul>');
                                    } else if (errorMessageArray.data) {
                                        _.each(errorMessageArray.data, function(msg) {
                                            errorMessage += '<li>' + msg + '</li>';
                                        });
                                        hbErrorMessage = Handlebars.compile('<p>Review the following errors from the submission:</p><ul>' + errorMessage + '</ul>');
                                    }
                                }

                                var DuplicateErrorMessageView = Backbone.Marionette.ItemView.extend({
                                    template: hbErrorMessage
                                });

                                errorAlertView = new ADK.UI.Alert({
                                    title: 'Error',
                                    icon: 'icon-circle-exclamation',
                                    messageView: DuplicateErrorMessageView,
                                    footerView: ErrorFooterView
                                });
                            } else {
                                errorAlertView = new ADK.UI.Alert({
                                    title: 'Error',
                                    icon: 'icon-circle-exclamation',
                                    messageView: ErrorMessageView,
                                    footerView: ErrorFooterView
                                });
                            }

                            errorAlertView.show();
                        }
                    );
                }
            }
        },
        showInProgress: function(message) {
            this.model.set('inProgressMessage', message);
            this.$('.inProgressContainer').removeClass('hidden');
        },
        hideInProgress: function() {
            this.$('.inProgressContainer').addClass('hidden');
            this.model.unset('inProgressMessage');
        },
        modelEvents: {
            'change:msbs-Count': function(model, value, options) {
                this.model.set('signsSymptomsRequired', value);
            },
            'change input,change textarea,change select': function(model) {
                var allRequired = false,
                    that = this;

                this.$('input,textarea,select').filter('[required]').each(function(i, requiredField) {
                    allRequired = true;
                    if (!that.model.get(requiredField.name)) {
                        allRequired = false;
                        return false;
                    }
                });
                this.ui.addBtn.trigger('control:disabled', !allRequired);

            },
            'change:allergyType': function(model) {
                var allergyType = model.get('allergyType');
                this.$(this.ui.natureOfReaction.selector).trigger('control:disabled', false);
                this.$(this.ui.natureOfReaction.selector).trigger('control:required', true);
                if (allergyType === 'o') {
                    this.$(this.ui.dateTimeSeverity.selector).trigger('control:disabled', false);
                    this.$(this.ui.dateTimeRequired.selector).trigger('control:required', true);
                    this.$(this.ui.signsSymptoms.selector).trigger('control:required', true);
                    this.$(this.ui.signsSymptomsRequired.selector).trigger('control:required', true);
                    this.model.set('reaction-date', moment().format('MM/DD/YYYY'));
                } else {
                    this.$(this.ui.dateTimeSeverity.selector).trigger('control:disabled', true);
                    this.$(this.ui.dateTimeRequired.selector).trigger('control:required', false);
                    this.$(this.ui.signsSymptoms.selector).trigger('control:required', false);
                    this.$(this.ui.signsSymptomsRequired.selector).trigger('control:required', false);
                    this.model.unset('reaction-date');
                    this.model.unset('reaction-time');
                    this.model.unset('severity');
                }
            },
            'change:allergen': function(model) {
                var searchAllergies = model.get('allergen');

                if (searchAllergies) {

                    if (searchAllergies === NO_KNOWN_ALLERGY_CODE) {
                        model.set('allergyType', 'h');
                        model.set('nature-of-reaction', 'U');

                        var labelModel = new Backbone.Model();
                        labelModel.set('nature-of-reaction', 'Unknown');
                        labelModel.set('allergen', 'NO KNOWN ALLERGIES <NO ALLERGIES>');
                        model.set('_labelsForSelectedValues', labelModel);

                        this.$(this.ui.allergyType.selector).trigger('control:disabled', true);

                        var signsSymptomsCollection = model.get('signsSymptoms');
                        signsSymptomsCollection.invoke('set', {
                            'booleanValue': false
                        });
                        model.set('signsSymptoms', signsSymptomsCollection);

                        this.$(this.ui.signsSymptoms.selector).trigger('control:hidden', true);
                        this.$(this.ui.signsSymptoms.selector).trigger('control:disabled', true);
                        this.$(this.ui.signsSymptoms.selector).trigger('control:readonly', true);
                        this.$(this.ui.signsSymptomsRequired.selector).trigger('control:disabled', true);
                        this.$(this.ui.natureOfReaction.selector).trigger('control:disabled', true);
                    } else {
                        this.showInProgress('Loading...');
                        this.$(this.ui.signsSymptoms.selector).trigger('control:hidden', false);
                        this.$(this.ui.allergyType.selector).trigger('control:disabled', false);
                        this.$(this.ui.signsSymptoms.selector).trigger('control:disabled', false);
                        this.$(this.ui.signsSymptoms.selector).trigger('control:readonly', false);

                        if (this.model.has('allergyType') && !_.isEmpty(this.model.get('allergyType'))) {
                            this.model.trigger('change:allergyType', this.model);
                        }
                    }
                }
            }
        }
    });

    return formView;
});