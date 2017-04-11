define([
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'app/applets/allergy_grid/writeback/validationUtils',
    'app/applets/allergy_grid/writeback/writebackUtils'
], function(Backbone, Marionette, $, Handlebars, validationUtils, writebackUtils) {
    "use strict";

    var patientAllergyCollection;
    var allergenRow = {
        control: 'container',
        extraClasses: ['row'],
        items: [{
            control: 'container',
            extraClasses: ['col-md-12'],
            items: [{
                control: 'select',
                name: 'allergen',
                label: 'Allergen',
                required: true,
                pickList: [],
                showFilter: true,
                groupEnabled: true,
                fetchFunction: function(input, fetchSuccess, fetchFail) {
                    var allergenCollection = new ADK.UIResources.Picklist.Allergies.Allergens();
                    allergenCollection.on('read:success', function(collection, response) {
                        var excludeNoKnownAllergies = false;
                        if((patientAllergyCollection.length === 1 && !_.isUndefined(patientAllergyCollection.at(0).get('name')) &&
                            patientAllergyCollection.at(0).get('name').toUpperCase().indexOf('NO KNOWN ALLERGIES') < 0) || patientAllergyCollection.length > 1){
                            excludeNoKnownAllergies = true;
                        }
                        var picklist = writebackUtils.parseAllergenResponse(this.toPicklist(), excludeNoKnownAllergies);
                        fetchSuccess({
                            results: picklist
                        });
                    });

                    allergenCollection.on('read:error', function(collection) {
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
        extraClasses: ['row'],
        items: [{
            control: 'container',
            extraClasses: ['col-md-12', 'all-padding-no'],
            items: [{
                control: 'radio',
                extraClasses: ['top-padding-xs', 'col-xs-5'],
                name: 'allergyType',
                options: [{
                    value: 'o',
                    label: 'Observed'
                }, {
                    value: 'h',
                    label: 'Historical'
                }],
                label: 'Choose an option',
                required: true,
            }, {
                extraClasses: ['col-xs-4'],
                control: 'datepicker',
                name: 'reaction-date',
                label: 'Reaction Date',
                required: false,
                disabled: true,
                flexible: true,
                options: {
                    endDate: '0d'
                }
            }, {
                extraClasses: ['col-xs-3'],
                control: 'timepicker',
                name: 'reaction-time',
                label: 'Time',
                placeholder: 'HH:MM',
                disabled: true,
                options: {
                    defaultTime: false
                }
            }]
        }, {
            control: 'container',
            extraClasses: ['col-md-12', 'all-padding-no'],
            items: [{
                control: 'select',
                extraClasses: ['col-xs-6'],
                name: 'severity',
                label: 'Severity',
                required: false,
                disabled: true,
                pickList: []
            }, {
                control: 'container',
                extraClasses: ['col-xs-6'],
                items: [{
                    control: 'select',
                    name: 'nature-of-reaction',
                    label: 'Nature of Reaction',
                    required: true,
                    disabled: false,
                    pickList: []
                }]
            }]
        }]
    };

    var SignsAndSymptoms = {
        control: 'multiselectSideBySide',
        name: 'signsSymptoms',
        label: 'Signs / Symptoms',
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
            placeholder: 'HH:MM',
            srOnlyLabel: true,
            options: {
                defaultTime: false
            }
        }],
        selectedCountName: "msbs-Count",
        template: Handlebars.compile("<span class='right-padding-xs pull-right'>Total Selected: {{msbs-Count}}</span>"),
        modelListeners: ["msbs-Count"],
        selectedSize: 7,
        collection: []
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
                title: 'Please enter in comments',
                maxlength: 255
            }]
        }]
    };

    var AllergyFields = [{
        control: 'container',
        extraClasses: ['modal-body'],
        items: [{
            control: 'container',
            extraClasses: ['container-fluid'],
            items: [allergenRow, topFields, {
                control: 'spacer'
            }, SignsAndSymptoms, SignsAndSymptomsRequired, Comments]
        }]
    }, {
        control: 'container',
        extraClasses: ['modal-footer'],
        items: [{
            control: 'container',
            extraClasses: ['row'],
            items: [{
                control: 'container',
                extraClasses: ['col-xs-6'],
                template: Handlebars.compile('<p aria-hidden="true">(* indicates a required field.)</p>{{#if savedTime}}<p><span id="allergies-saved-at">Saved at: {{savedTime}}</span></p>{{/if}}')
            }, {
                control: 'container',
                extraClasses: ['col-xs-6'],
                items: [{
                        control: 'button',
                        id: 'form-cancel-btn',
                        extraClasses: ['btn-default', 'btn-sm', 'right-margin-lg'],
                        label: 'Cancel',
                        type: 'button',
                        title: 'Press enter to cancel',
                        name: 'cancelBtn'
                    },
                    // todo: removed until draft function is working
                    // {
                    //     control: 'button',
                    //     id: 'form-close-btn',
                    //     extraClasses: ['btn-default', 'btn-sm'],
                    //     label: 'Close',
                    //     type: 'button',
                    //     title: 'Press enter to close',
                    //     name: 'closeBtn'
                    // },
                    {
                        control: 'button',
                        extraClasses: ['btn-primary', 'btn-sm'],
                        label: 'Add',
                        name: 'addBtn',
                        title: 'Press enter to add',
                        disabled: true
                    }
                ]
            }]
        }]
    }];

    var CancelMessageView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('You will lose all work in progress if you cancel this task. Would you like to proceed with ending this observation?'),
        tagName: 'p'
    });
    // todo: removed until draft function is working
    // var CloseMessageView = Backbone.Marionette.ItemView.extend({
    //     template: Handlebars.compile('Your progress will be saved and remain in draft status. Would you like to proceed with ending this observation?'),
    //     tagName: 'p'
    // });
    var FooterView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('{{ui-button "Cancel" classes="btn-default btn-sm" title="Press enter to cancel."}}{{ui-button "Continue" classes="btn-primary btn-sm" title="Press enter to continue."}}'),
        events: {
            'click .btn-primary': function() {
                ADK.UI.Alert.hide();
                writebackUtils.unregisterNavigationCheck();
                this.getOption('workflow').close();
            },
            'click .btn-default': function() {
                ADK.UI.Alert.hide();
            }
        },
        tagName: 'span'
    });

    var ErrorMessageView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('Unable to save your data at this time due to a system error. Please try again later.'),
        tagName: 'p'
    });

    var ErrorFooterView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('{{ui-button "OK" classes="btn-primary" title="Click button to close modal"}}'),
        events: {
            'click .btn-primary': function() {
                ADK.UI.Alert.hide();
            }
        },
        tagName: 'span'
    });

    var formView = ADK.UI.Form.extend({
        onInitialize: function() {
            patientAllergyCollection = this.model.get('allergyCollection');
        },
        ui: {
            'inProgressContainer': '.inProgressContainer',
            'dateTimeSeverity': '.reaction-date, .reaction-time, .severity, .signsSymptoms',
            'dateTimeRequired': '.reaction-date, .severity',
            'initialDisabledFields': '.reaction-date, .reaction-time, .signsSymptoms, .moreInfo, .allergyType',
            'allergyType': '.allergyType',
            'severity': '.severity',
            'natureOfReaction': '.nature-of-reaction',
            'signsSymptoms': '.signsSymptoms',
            'addBtn': '.addBtn',
            'signsSymptomsRequired': '.signsSymptomsRequired',
            'moreInfo': '.moreInfo',
        },
        fields: AllergyFields,
        onRender: function() {
            var form = this;
            var operationalData = new ADK.UIResources.Picklist.Allergies.OperationalData();
            form.listenTo(operationalData, 'read:success', function(collection, resp) {
                var natureOfReactionList = writebackUtils.parseOperationalDataList(resp, 'Nature of Reaction');
                form.ui.natureOfReaction.trigger('control:picklist:set', [natureOfReactionList]);
                var severityList = writebackUtils.parseOperationalDataList(resp, 'Severity');
                form.ui.severity.trigger('control:picklist:set', [severityList]);
                var symptomsCollection = writebackUtils.parseSymptomList(resp);
                form.model.get('signsSymptoms').add(symptomsCollection.models);
                this.listenToOnce(this.model, 'change', function() {
                    ADK.Navigation.registerCheck(new ADK.Navigation.PatientContextCheck({
                        id: 'allergy-writeback-in-progress',
                        failureMessage: 'Allergy Writeback Workflow In Progress! Any unsaved changes will be lost if you continue.',
                        onCancel: _.bind(function() {
                            this.$el.trigger('tray.show');
                        }, this)
                    }));
                });
            });
            form.listenTo(operationalData, 'read:error', function(collection) {
                var errorAlertView = new ADK.UI.Alert({
                    title: 'Failed to load picklist data.',
                    icon: 'fa-exclamation-triangle font-size-18 color-red',
                    messageView: ErrorMessageView.extend({
                        msg: 'There was an error loading the form.'
                    }),
                    footerView: ErrorFooterView,

                });
                errorAlertView.show();
            });
            operationalData.fetch();
        },
        onDestroy: function(){
            writebackUtils.unregisterNavigationCheck();
        },
        events: {
            'click #form-cancel-btn': function(e) {
                e.preventDefault();

                var cancelAlertView = new ADK.UI.Alert({
                    title: 'Are you sure you want to cancel?',
                    icon: 'fa-warning color-red',
                    messageView: CancelMessageView,
                    footerView: FooterView,
                    workflow: this.workflow
                });
                cancelAlertView.show();
            },
            // todo: removed until draft function is working
            // 'click #form-close-btn': function(e) {
            //     e.preventDefault();
            //     var closeAlertView = new ADK.UI.Alert({
            //         title: 'Are you sure you want to close this form?',
            //         icon: 'fa-exclamation-triangle font-size-18 color-red',
            //         messageView: CloseMessageView,
            //         footerView: FooterView
            //     });
            //     closeAlertView.show();
            // },
            'submit': function(e) {
                e.preventDefault();
                if (!this.model.isValid())
                    this.model.set('formStatus', {
                        status: 'error',
                        message: this.model.validationError
                    });
                else {
                    this.model.unset('formStatus');
                    var self = this;
                    writebackUtils.addAllergy(this.model,
                        function() {
                            var saveAlertView = new ADK.UI.Notification({
                                title: 'Allergy Submitted',
                                icon: 'fa-check',
                                message: 'Allergy successfully submitted with no errors.',
                                type: 'success'
                            });

                            saveAlertView.show();
                            writebackUtils.unregisterNavigationCheck();
                            self.workflow.close();

                            ADK.ResourceService.clearAllCache('allergy');
                            ADK.Messaging.getChannel('allergy_grid').trigger('refreshGridView');
                        },
                        function(error) {
                            var errorAlertView;

                            if (error.status === 409) {
                                var errorMessage = '';
                                var hbErrorMessage = Handlebars.compile('Something went wrong in the submission.');
                                var errorMessageArray = JSON.parse(error.responseText);

                                if (errorMessageArray && !_.isEmpty(errorMessageArray)) {

                                    if (errorMessageArray.message) {
                                        hbErrorMessage = Handlebars.compile('An error was returned during your submission:<ul><li>' + errorMessageArray.message + '</li></ul>');
                                    } else if (errorMessageArray.data) {
                                        _.each(errorMessageArray.data, function(msg) {
                                            errorMessage += '<li>' + msg + '</li>';
                                        });
                                        hbErrorMessage = Handlebars.compile('Please review the following errors from the submission:<ul>' + errorMessage + '</ul>');
                                    }
                                }

                                var DuplicateErrorMessageView = Backbone.Marionette.ItemView.extend({
                                    template: hbErrorMessage,
                                    tagName: 'p'
                                });

                                errorAlertView = new ADK.UI.Alert({
                                    title: 'Allergy Save Error',
                                    icon: 'fa-exclamation-triangle font-size-18 color-red',
                                    messageView: DuplicateErrorMessageView,
                                    footerView: ErrorFooterView
                                });
                            } else {
                                errorAlertView = new ADK.UI.Alert({
                                    title: 'Save Failed (System Error)',
                                    icon: 'fa-exclamation-circle font-size-18 color-red',
                                    messageView: ErrorMessageView,
                                    footerView: ErrorFooterView
                                });
                            }

                            errorAlertView.show();
                        }
                    );


                }
            },
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

                this.$(this.ui.addBtn.selector).find('button').attr('disabled', !allRequired);
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

                    if (searchAllergies === '132;GMRD(120.82,"D")') {
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
                    } else {
                        this.showInProgress('Loading...');
                        this.$(this.ui.signsSymptoms.selector).trigger('control:hidden', false);
                        this.$(this.ui.allergyType.selector).trigger('control:disabled', false);
                    }
                }
            }
        }
    });

    return formView;
});