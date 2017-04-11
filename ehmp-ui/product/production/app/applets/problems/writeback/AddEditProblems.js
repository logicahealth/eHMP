define([
    'backbone',
    'marionette',
    'jquery',
    'moment',
    'handlebars',
    'app/applets/problems/writeback/parseUtils',
    'app/applets/problems/writeback/validationUtils',
    'app/applets/problems/writeback/writebackUtils',
    'app/applets/problems/writeback/workflowUtils'
], function(Backbone, Marionette, $, Moment, Handlebars, ParseUtil, validationUtils, writebackUtils, workflowUtils) {
    "use strict";

    var problemLabelContainer = {
        control: 'container',
        extraClasses: ['row', 'all-padding-sm', 'top-padding-lg', 'select-problem-container', 'background-color-pure-white'],
        modelListeners: ['problemText', 'isFreeTextProblem'],
        items: [{
                control: 'container',
                extraClasses: ['col-xs-6', 'left-padding-no'],
                template: '<p class="bottom-margin-xs"><strong>Problem name *</strong></p>{{#unless isFreeTextProblem}}<p>{{problemText}}</p>{{/unless}}'
            },
            {
                control: 'container',
                extraClasses: ['col-xs-6', 'all-padding-no', 'left-padding-xl'],
                items: [{
                    control: 'button',
                    extraClasses: ['btn', 'btn-sm', 'btn-primary'],
                    id: 'changeProblemBtn',
                    name: 'change-problem-btn',
                    label: 'Select a new problem',
                    type: 'button',
                    title: 'Press enter to select a new problem'
                }]
            }]
    };

    var freeTextContainer = {
        control: 'container',
        extraClasses: ['row background-color-primary-lightest', 'bottom-margin-md', 'free-text-container'],
        items: [{
            control: 'container',
            extraClasses: ['row', 'left-margin-xs', 'right-margin-xs', 'all-padding-sm'],
            modelListeners: ['problemText', 'problemTerm', 'isFreeTextProblem'],
            template: Handlebars.compile('{{#if isFreeTextProblem}}<p class="col-xs-12"><strong>Entered as Freetext</strong><br />{{problemTerm}}</p><button type="button" id="ftDetailsBtn" class="btn btn-link" title="Press enter to view additional details"><i id="ftDetailsCaret" class="fa fa-caret-right color-primary right-margin-xs"></i>Details</button>{{/if}}')
        }, {
            control: 'container',
            id: 'detailsContainer',
            name: 'details-container',
            extraClasses: ['row'],
            modelListeners: ['problemTerm', 'showDetails', 'isFreeTextProblem'],
            template: Handlebars.compile('{{#if isFreeTextProblem}}{{#if showDetails}}<div class="col-xs-11 left-margin-xl">A suitable term was not found based on user input and current defaults. If you proceed with this nonspecific term, an ICD code of "<strong>R69-ILLNESS, UNSPECIFIED</strong>" will be filed.</div>{{/if}}{{/if}}')
        }, {
            control: 'checkbox',
            extraClasses: ['row', 'left-margin-lg'],
            name: 'requestTermCheckBox',
            label: 'Request New Term',
            hidden: true
        }, {
            control: 'textarea',
            extraClasses: ['row', 'left-margin-lg', 'right-margin-xl'],
            name: 'editableFreeTxtTxtArea',
            label: 'New Term Request Comment',
            placeholder: 'Description to help the evaluation of your request',
            hidden: true
        }]
    };

    var statusAndImmediacyContainer = {
        control: 'container',
        extraClasses: ['row',' bottom-margin-sm'],
        items: [{
            control: "radio",
            extraClasses: ['col-xs-5'],
            required: true,
            name: "statusRadioValue",
            label: "Status",
            options: [{
                label: "Active",
                value: "A^ACTIVE"
            }, {
                label: "Inactive",
                value: "I^INACTIVE"
            }]
        }, {
            control: "radio",
            extraClasses: ['col-xs-7', 'left-padding-no'],
            required: true,
            name: "immediacyRadioValue",
            label: "Acuity",
            options: [{
                label: "Acute",
                value: "A^ACUTE"
            }, {
                label: "Chronic",
                value: "C^CHRONIC"
            }, {
                label: "Unknown",
                value: "U^UNKNOWN"
            }]
        }]
    };

    var onsetAndClinicContainer = {
        control: 'container',
        extraClasses: ['row',' bottom-margin-md'],
        items: [{
            control: "datepicker",
            extraClasses: ['col-xs-5'],
            id: "onsetDate",
            name: "onset-date",
            label: "Onset Date",
            required: true,
            flexible: true,
            options: {
                endDate: '0d'
            }
        }, {
            control: 'select',
            extraClasses: ['col-xs-7'],
            name: 'clinic',
            label: 'Clinic',
            showFilter: true,
            pickList: []
        }]
    };

    var resProviderContainer = {
        control: "container",
        extraClasses: ['row',' bottom-margin-md'],
        items: [{
            control: 'select',
            extraClasses: ['col-xs-12'],
            name: 'resProvider',
            label: 'Responsible Provider',
            showFilter: true,
            required: true,
            pickList: []
        }]
    };

    var treatmentFactorsContainer = {
        control: "container",
        extraClasses: ['row',' bottom-margin-md'],
        items: [{
            extraClasses: ['col-xs-12'],
            name: "treatmentFactors",
            control: "radioList",
            label: 'Treatment Factors',
            collection: [],
            options: [{
                label: "Yes",
                value: true
            }, {
                label: "No",
                value: false
            }]
        },{
            control: "container",
            extraClasses: ['col-xs-12','bottom-margin-no'],
            modelListeners: ['noTreatmentFactors'],
            template: Handlebars.compile('{{#if noTreatmentFactors}}<p class="background-color-primary-lightest all-padding-lg">No Treatment Factors Applicable</p>{{/if}}')
        }]
    };

    function buildCommentBoxControl(isEditMode){
        var control = {
            control: "commentBox",
            name: "annotations",
            label: "Annotations",
            inputOptions: {maxlength: 200},
            collection: []
        };

        control.addCommentPosition = isEditMode ? 'bottom': 'top';

        if(isEditMode){
            control.allowEdit = allowEditRemoveComments;
            control.allowDelete = allowEditRemoveComments;
        } else {
            control.commentTemplate = '{{comment}}';
        }

        return control;
    }

    function allowEditRemoveComments(comment){
        var currentUser = ADK.UserService.getUserSession();

        var site = currentUser.get('site');

        if(!_.isUndefined(site) && !_.isUndefined(currentUser.get('duz')) && !_.isUndefined(comment.get('author')) && !_.isUndefined(comment.get('author').duz)){
            var commentUserId = comment.get('author').duz[site];
            var currentUserId = currentUser.get('duz')[site];

            if(!_.isUndefined(commentUserId) && !_.isUndefined(currentUserId) && commentUserId === currentUserId){
                return true;
            }
        }

        return false;
    }

    var annotationsContainer = {
        control: 'container',
        extraClasses: ['row annotations-container', 'left-padding-md', 'right-padding-md', 'top-padding-md', 'bottom-padding-md', 'background-color-pure-white'],
        items: [{
            control: "container",
            extraClasses: ["color-pure-black"],
            template: Handlebars.compile('<strong>Comment</strong>')
        }]
    };

    var lowerBodyContainer = {
        control: "container",
        extraClasses: [""],
        items: [problemLabelContainer, freeTextContainer, statusAndImmediacyContainer, onsetAndClinicContainer, resProviderContainer, treatmentFactorsContainer, annotationsContainer]
    };

    var F414_EnterProblemFields = [{
        control: "container",
        extraClasses: ["modal-body"],
        items: [{
            control: "container",
            extraClasses: ["container-fluid"],
            items: [lowerBodyContainer]
        }]
    }, {
        control: "container",
        extraClasses: ["modal-footer"],
        items: [{
            control: "container",
            extraClasses: ['row'],
            items: [{
                control: "container",
                extraClasses: ['col-xs-12','display-flex','valign-bottom'],
                items: [
                {
                    control: 'popover',
                    behaviors: {
                        Confirmation: {
                            title: 'Warning',
                            eventToTrigger: 'problem-add-confirm-cancel'
                        }
                    },
                    label: 'Cancel',
                    name: 'problemAddConfirmCancel',
                    extraClasses: ['btn-default', 'btn-sm','right-margin-xs']
                },
                {
                    control: "dropdown",
                    extraClasses: ["dropup"],
                    split: true,
                    label: "Accept",
                    id: "addDrpDwnContainer",
                    title: "Press enter to accept",
                    type: 'submit',
                    items: [{
                        label: "Accept",
                        id: "add"
                    }, {
                        label: "Accept and Create Another",
                        id: "addCreate"
                    }]
                }, {
                    control: 'button',
                    extraClasses: ['btn-primary', 'btn-sm'],
                    label: 'Save',
                    id: 'saveEditProblem',
                    type: 'submit',
                    title: 'Press enter to save problem',
                    name: 'save-edit-btn'
                }]
            }]
        }]
    }];
    var ErrorMessageView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('Unable to save your data at this time due to a system error. Try again later.'),
        tagName: 'p'
    });

    var ErrorFooterView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('{{ui-button "OK" classes="btn-primary btn-sm" title="Press enter to close"}}'),
        events: {
            'click .btn-primary': function() {
                ADK.UI.Alert.hide();
                if (this.form) {
                    this.form.$(this.form.ui.addDrpDwnContainer).trigger('control:disabled', false);
                    this.form.$(this.form.ui.saveEditBtn).trigger('control:disabled', false);
                }
            }
        },
        tagName: 'span'
    });

    var enterProblemInfoView = ADK.UI.Form.extend({
        ui: {
            'clinic': '.clinic',
            'resProvider': '.resProvider',
            'treatmentFactors': '.treatmentFactors',
            'onsetDate': '.onset-date',
            'annotations': '.annotations',
            'annotationsContainer': '.annotations-container',
            'statusRadioValue': '.statusRadioValue',
            'immediacyRadioValue': '.immediacyRadioValue',
            'requestTermCheckBox': '.requestTermCheckBox',
            'editableFreeTxtTxtArea': '.editableFreeTxtTxtArea',
            'addDrpDwnContainer': '#addDrpDwnContainer',
            'drpDwnSelect': '#addDrpDwnContainer ~ .dropdown-menu',
            'addBtn': '#addDrpDwnContainer-add',
            'saveEditBtn': '.save-edit-btn',
            'addCreateBtn': '#addDrpDwnContainer-addCreate',
            'cancelButton': '#cancelBtnProblem',
            'freeTextContainer': '.free-text-container',
            'annotationsInputBox': '.annotations #inputString',
            'annotationsAddButton': '.add-comment-button',
            'changeProblemBtn': '.change-problem-btn'
        },
        fields: F414_EnterProblemFields,
        onRender: function() {
            retrievePickListData(this);

            var self = this;
            this.listenTo(this.model, 'showFtArea', function(showDetails) {
                this.ui.editableFreeTxtTxtArea.trigger('control:hidden', !showDetails);
                this.ui.requestTermCheckBox.trigger('control:hidden', !showDetails);
                if (showDetails) {
                    this.$el.find('#ftDetailsCaret').addClass('fa-caret-down');
                    this.$el.find('#ftDetailsCaret').removeClass('fa-caret-right');
                } else {
                    this.$el.find('#ftDetailsCaret').removeClass('fa-caret-down');
                    this.$el.find('#ftDetailsCaret').addClass('fa-caret-right');
                }
            });

            this.model.get('treatmentFactors').set(ParseUtil.getTreatmentFactors(ADK.PatientRecordService.getCurrentPatient(), this.model.get('existingTreatmentFactors')));

            if (this.model.get('treatmentFactors').length === 0) {
                this.model.set('noTreatmentFactors', 'true');
                this.ui.treatmentFactors.trigger('control:hidden', true);
            }

            if (this.model.get('editMode')) {
                this.ui.changeProblemBtn.trigger('control:hidden', true);
                this.showHideFreeTextContainer();
                this.ui.addDrpDwnContainer.trigger('control:hidden', true);
                this.ui.annotationsContainer.trigger('control:items:add', buildCommentBoxControl(true));
            } else {
                this.ui.addDrpDwnContainer.trigger('control:disabled', true);
                this.ui.drpDwnSelect.addClass('dropdown-menu-right');
                this.ui.saveEditBtn.trigger('control:hidden', true);
                this.ui.annotationsContainer.trigger('control:items:add', buildCommentBoxControl(false));
                var PatientModel = ADK.PatientRecordService.getCurrentPatient();
                this.listenTo(PatientModel, 'change:visit', function(model) {
                    setVisitLocation(self);
                });
            }

            this.listenTo(this.model.get('annotations'), 'add', function() {
                this.handleDisableAddButton(true);
            });
        },
        registerChecks: function() {
            var checkOptions = {
                id: 'problem-writeback-in-progress',
                label: 'Problem',
                failureMessage: 'Problem list changes are in progress! Any unsaved changes will be lost if you continue.',
                onContinue: _.bind(function() {
                    this.workflow.close();
                }, this)
            };
            ADK.Checks.register([new ADK.Navigation.PatientContextCheck(checkOptions),
                new ADK.Checks.predefined.VisitContextCheck(checkOptions)]);
        },
        unregisterChecks: function() {
            writebackUtils.unregisterChecks();
        },
        onDestroy: function() {
            this.unregisterChecks();
        },
        events: {
            'click #ftDetailsBtn': function() {
                if (this.model.get('showDetails')) {
                    this.ui.editableFreeTxtTxtArea.trigger('control:hidden', true);
                    this.ui.requestTermCheckBox.trigger('control:hidden', true);
                    this.model.set('showDetails', false);
                    this.$el.find('#ftDetailsCaret').removeClass('fa-caret-down');
                    this.$el.find('#ftDetailsCaret').addClass('fa-caret-right');
                } else {
                    this.model.set('showDetails', true);
                    this.$el.find('#ftDetailsCaret').addClass('fa-caret-down');
                    this.$el.find('#ftDetailsCaret').removeClass('fa-caret-right');

                    this.ui.editableFreeTxtTxtArea.trigger('control:hidden', !this.model.get('requestTermCheckBox'));
                    this.ui.requestTermCheckBox.trigger('control:hidden', false);
                }
            },
            'blur #onset-date': function() {
                this.validateFormField('onset-date', this.ui.onsetDate, validationUtils.validateMeasuredDateAndTime);
                this.handleDisableAddButton();
            },
            'click #changeProblemBtn': function() {
                this.model.set({
                    'showKeepProblem': true
                });
                this.model.unset('problemTerm');
                this.workflow.goToIndex(this.workflow.model.get('steps').length - 3);
            },
            'click @ui.addBtn': function(e) {
                this.ui.addDrpDwnContainer.text(this.ui.addBtn.text()).focus();
                this.$el.trigger('submit');
            },
            'click @ui.addCreateBtn': function(e) {
                this.ui.addDrpDwnContainer.text(this.ui.addCreateBtn.text()).focus();
                this.$el.trigger('submit');
            },
            'input @ui.annotationsInputBox': function(e) {
                this.handleDisableAddButton();
            },
            'keyup @ui.annotationsInputBox': function(e) {
                var inputBox = this.$(this.ui.annotationsInputBox.selector);
                var inputBoxValue = inputBox.val();
                if (e.keyCode === 13 && inputBoxValue.length > 0) {
                    this.$(this.ui.annotations.selector).find('.add-comment-button').click();
                }
            },
            'submit': function(e) {
                var self = this;
                e.preventDefault();

                if (!this.model.isValid()) {
                    this.model.set("formStatus", {
                        status: "error",
                        message: self.model.validationError
                    });
                    this.transferFocusToFirstError();
                } else {
                    this.initLoader();                    
                    this.model.unset("formStatus");

                    var saveAlertView = new ADK.UI.Notification({
                        title: 'Success',
                        message: 'Problem Submitted',
                        type: "success"
                    });

                    var errorAlertView = new ADK.UI.Alert({
                        title: 'Error',
                        icon: 'icon-circle-exclamation',
                        messageView: ErrorMessageView,
                        footerView: ErrorFooterView.extend({
                            form: self
                        })
                    });

                    if (this.model.get('editMode')) {
                        this.ui.saveEditBtn.trigger('control:disabled', true);
                        writebackUtils.editProblem(self.model, function() {
                                saveAlertView.show();
                                self.$el.trigger('tray.loaderHide');
                                self.workflow.close();
                                ADK.ResourceService.clearAllCache('problem');
                                ADK.Messaging.getChannel('problems').trigger('refreshGridView');
                            },
                            function() {
                                self.$el.trigger('tray.loaderHide');
                                errorAlertView.show();
                            });
                    } else {
                        this.ui.addDrpDwnContainer.trigger('control:disabled', true);
                        writebackUtils.addProblem(self.model, function() {
                                saveAlertView.show();
                                self.$el.trigger('tray.loaderHide');
                                if (self.ui.addDrpDwnContainer.text().toUpperCase() === 'ACCEPT') {
                                    ADK.UI.Workflow.hide();
                                    self.workflow.close();
                                } else {
                                    self.workflow.close();
                                    workflowUtils.startAddProblemsWorkflow(enterProblemInfoView);
                                }
                                ADK.ResourceService.clearAllCache('problem');
                                ADK.Messaging.getChannel('problems').trigger('refreshGridView');
                            },
                            function() {
                                self.$el.trigger('tray.loaderHide');
                                errorAlertView.show();
                            });
                    }
                }
            },
            'problem-add-confirm-cancel': function(e) {
                writebackUtils.unregisterChecks();
                this.workflow.close();
            }
        },
        modelEvents: {
            'change:isFreeTextProblem': function() {
                this.showHideFreeTextContainer();
            },
            'change:requestTermCheckBox': function() {
                this.ui.editableFreeTxtTxtArea.trigger('control:hidden', !this.model.get('requestTermCheckBox'));
            },
            'change:onset-date': function() {
                this.validateFormField('onset-date', this.ui.onsetDate, validationUtils.validateMeasuredDateAndTime);
                this.handleDisableAddButton();
            },
            'change:immediacyRadioValue': function() {
                this.handleDisableAddButton();
            },
            'change:statusRadioValue': function() {
                this.handleDisableAddButton();
            },
            'change:resProvider': function() {
                this.handleDisableAddButton();
            },
            'change:editableFreeTxtTxtArea': function(){
                this.model.set('freeTxtTxtArea', this.model.get('editableFreeTxtTxtArea'));
            }
        },
        initLoader: function() {
            if (this.$('#addDrpDwnContainer').is(':visible')){
                this.$el.trigger('tray.loaderShow',{
                    loadingString:'Accepting'
                });
            } else if (this.$('#saveEditProblem').is(':visible')){
                this.$el.trigger('tray.loaderShow',{
                    loadingString:'Saving'
                });
            }
        },
        showHideFreeTextContainer: function() {
            if (!this.model.get('isFreeTextProblem')) {
                this.$(this.ui.freeTextContainer).removeClass('background-color-primary-lightest');
            } else {
                this.$(this.ui.freeTextContainer).addClass('background-color-primary-lightest');
            }
        },
        validateFormField: function(formField, uiElement, validationFunction) {
            validationFunction(this.model, this.model.get(formField));

            if (this.model.errorModel.get(formField)) {
                this.$el.find(uiElement.selector + ' input').focus();
            }
        },
        handleDisableAddButton: function(skipCommentCheck) {
            var commentBoxInput = this.$(this.ui.annotationsInputBox.selector);
            var disable = true;

            if (!_.isEmpty(this.model.get('onset-date')) && !_.isEmpty(this.model.get('immediacyRadioValue')) &&
                !_.isEmpty(this.model.get('statusRadioValue')) && !_.isEmpty(this.model.get('resProvider')) && this.model.isValid() ) {
                disable = false;

                if (!skipCommentCheck) {
                    if (_.isUndefined(commentBoxInput) || _.isUndefined(commentBoxInput.val()) || commentBoxInput.val().length > 0) {
                        disable = true;
                    }
                }
            }

            if (this.model.get('editMode')) {
                this.ui.saveEditBtn.trigger('control:disabled', disable);
            } else {
                this.ui.addDrpDwnContainer.trigger('control:disabled', disable);
            }
        }
    });

    function setVisitLocation(form) {
        var visit = ADK.PatientRecordService.getCurrentPatient().get('visit');

        if (form.model.get('clinicOrService') === 'clinic' && !_.isUndefined(visit) && !_.isUndefined(visit.locationUid)) {
            var locationId = visit.locationUid.split(':').pop();
            var visitLocation = _.findWhere(form.clinics, { value: locationId });

            if (visitLocation) {
                form.model.set('clinic', visitLocation.value);
            }
        }
    }

    function handleOperationalDataRetrievalComplete(form, type){
        if(type === 'clinics'){
            form.clinicsRequestCompleted = true;
        } else if(type === 'providers'){
            form.providersRequestCompleted = true;
        }
    }

    function retrievePickListData(form) {
        var responsibleProviderCollection = new ADK.UIResources.Picklist.Encounters.NewPersons();
        form.listenTo(responsibleProviderCollection, 'read:success', function(collection, response) {
            form.responsibleProviderList = collection.toPicklist();
            form.ui.resProvider.trigger('control:picklist:set', [form.responsibleProviderList]);

            if (form.model.get('editMode')) {
                var presetUser = collection.findWhere({ code: form.model.get('existingProviderId') });
                if (!_.isUndefined(presetUser)) {
                    form.model.set('resProvider', presetUser.get('code') + ';' + presetUser.get('name'));
                }
            } else {
                var userSession = ADK.UserService.getUserSession();
                var currentUser = ParseUtil.findUser(collection, userSession);
                if (userSession.get('provider') && currentUser) {
                    form.model.set('resProvider', currentUser.get('code') + ';' + currentUser.get('name'));
                }
            }

            handleOperationalDataRetrievalComplete(form, 'providers');
        });
        responsibleProviderCollection.fetch();

        var patient = ADK.PatientRecordService.getCurrentPatient();
        var clinicLabel;
        var patientStatus = patient.patientStatusClass();
        var locations;

        if (!_.isUndefined(patientStatus) && patientStatus.toUpperCase() === 'INPATIENT') {
            clinicLabel = 'Service';
            form.model.set('clinicOrService', 'service');
            locations = new ADK.UIResources.Picklist.Locations.Services();
        } else {
            clinicLabel = 'Clinic';
            form.model.set('clinicOrService', 'clinic');
            locations = new ADK.UIResources.Picklist.Locations.Clinics();
        }

        form.ui.clinic.trigger('control:label', clinicLabel);
        form.listenTo(locations, 'read:success', function(collection, response) {
            form.clinics = locations.toPicklist();
            form.ui.clinic.trigger('control:picklist:set', [form.clinics]);

            if (form.model.get('editMode')) {
                if (!_.isUndefined(form.model.get('existingLocationName'))) {
                    var presetLocation = collection.findWhere({ name: form.model.get('existingLocationName').toUpperCase() });
                    if (!_.isUndefined(presetLocation)) {
                        form.model.set('clinic', presetLocation.get('ien'));
                    }
                } else {
                    form.model.set('clinic', form.model.get('existingLocationId'));
                }
            } else {
                setVisitLocation(form);
            }

            handleOperationalDataRetrievalComplete(form, 'clinics');
        });

        locations.fetch();
    }

    return enterProblemInfoView;
});
