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
            extraClasses: ['col-md-12'],
            modelListeners: ['problemText', 'isFreeTextProblem'],            
            items: [{
                control: 'container',
                template: '<p class="faux-label bottom-margin-xs">Problem Name *</p>{{#unless isFreeTextProblem}}<p>{{problemText}}</p>{{/unless}}',
                extraClasses: ['pull-left', 'form-group', 'top-padding-sm']
            },
            {
                control: 'button',
                extraClasses: ['btn-link', 'left-padding-xl', 'right-padding-xl', 'pull-right'],
                id: 'changeProblemBtn',
                name: 'change-problem-btn',
                label: 'Select a new problem',
                type: 'button'
            }]
        };

        var freeTextContainer = {
            control: 'container',
            extraClasses: ['col-md-12', 'background-color-grey-lighter', 'top-padding-md', 'bottom-padding-sm', 'bottom-margin-md', 'freeTextContainer'],
            items: [
            {
                control: 'container',
                extraClasses: ['col-md-12'],
                modelListeners: ['problemText', 'problemTerm', 'isFreeTextProblem'],
                template: Handlebars.compile('{{#if isFreeTextProblem}}<div><div><strong>Entered as Freetext</strong></div><p>{{problemTerm}}</p><button type="button" id="ftDetailsBtn" class="btn btn-link ft-details-btn left-padding-no" title="Press enter to view to view additional details"><span id="ftDetailsCaret" class="pull-left fa fa-caret-right"></span>Details</button></div>{{/if}}')
            },            
            {
                control: 'container',
                id: 'detailsContainer',
                name: 'details-container',         
                extraClasses: ['col-md-12'],
                modelListeners: ['problemTerm', 'showDetails', 'isFreeTextProblem'],
                template: Handlebars.compile('{{#if isFreeTextProblem}}{{#if showDetails}}<div class="right-padding-lg">A suitable term was not found based on user input and current defaults. if you proceed with this nonspefic term, an ICD code of "<strong>R69-ILLNESS, UNSPECIFIED</strong>" will be filed.</div>{{/if}}{{/if}}')
            }, 
            {
                control: 'checkbox',
                extraClasses: ['col-md-12'],                        
                name: 'requestTermCheckBox',
                label: 'Request New Term',
                hidden: true
            },                                            
            {
                control: 'textarea',
                extraClasses: ['col-md-12'],                         
                name: 'freeTxtTxtArea',
                label: 'New Term Request Comment',
                placeholder: 'Description to help the evaluation of your request',
                hidden: true
            }]
        };        

        var statusContainer = {
            control: "container",
            extraClasses: ["col-md-5"],
            items: [{
                control: "radio",
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
            }]
        };

        var immediacyContainer = {
            control: "container",
            extraClasses: ["col-md-7"],
            items: [{
                control: "radio",
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

        var onsetDateContainer = {
            control: "container",
            extraClasses: ["col-md-5"],
            items: [{
                control: "datepicker",
                id: "onset-date",
                name: "onset-date",
                label: "Onset Date",
                required: true,
                flexible: true,
                options: {
                    endDate: '0d'
                }
            }]
        };

        var clinicContainer = {
            control: "container",
            extraClasses: ["col-md-7"],
            items: [{
                control: 'select',
                name: 'clinic',
                label: 'Clinic',
                showFilter: true,
                pickList: [],
            }]
        };

        var resProviderContainer = {
            control: "container",
            extraClasses: ["col-md-12"],
            items: [{
                control: 'select',
                name: 'resProvider',
                label: 'Responsible Provider',
                showFilter: true,
                required: true,
                pickList: []
            }]
        };

        var treatmentFactorsContainer = {
            control: "container",
            extraClasses: ['col-md-12'],
            items: [{
                control: "container",
                modelListeners: ['noTreatmentFactors'],
                template: Handlebars.compile('<strong>Treatment Factors</strong>{{#if noTreatmentFactors}}<br/><br/><p class="background-color-grey-lighter all-padding-lg">No Treatment Factors Applicable</p>{{/if}}')
            }, {
                control: "container",
                extraClasses: ['col-md-12', 'background-color-grey-lighter'],
                items: [{
                    control: "container",
                    items: [{
                        extraClasses: [],
                        name: "treatmentFactors",
                        control: "yesNoChecklist",
                        label: '',
                        collection: [],
                        options: [{
                            label: "Yes",
                            value: true
                        }, {
                            label: "No",
                            value: false
                        }]                        
                    }]
                }]
            }]
        };

        var annotationsContainer = {
            control: "container",
            extraClasses: ["col-md-12"],
            items: [{
                control: "container",
                template: Handlebars.compile('<strong>Comment</strong>')
            }, {
                control: "commentBox",
                name: "annotations",
                label: "Annotations",
                inputOptions: {maxlength: 200},
                addCommentPosition: "top",
                collection: []
            }]
        };

        var lowerBodyContainer = {
            control: "container",
            extraClasses: [""],
            items: [problemLabelContainer, freeTextContainer, statusContainer, immediacyContainer, onsetDateContainer, clinicContainer, resProviderContainer, treatmentFactorsContainer, annotationsContainer]
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
                extraClasses: [],
                items: [{
                    control: "container",
                    extraClasses: ['col-md-12'],
                    items: [{
                        control: "button",
                        extraClasses: ["btn-default", "btn-sm"],
                        label: "CANCEL",
                        id: "cancelBtnProblem",
                        type: "button",
                        title: "Press enter to close",
                        name:  "cancel-btn"
                    }, {
                        control: "dropdown",
                        extraClasses: ["dropup"],
                        split: true,
                        label: "ADD",
                        id: "addDrpDwnContainer",
                        title: "Press enter to add",
                        type: 'submit',
                        items: [{
                            label: "ADD",
                            id: "add"
                        }, {
                            label: "ADD AND CREATE ANOTHER",
                            id: "add-create"
                        }]
                    }]
                }]
            }]
        }];

        var CancelMessageView = Backbone.Marionette.ItemView.extend({
            template: Handlebars.compile('You will lose all work in progress if you cancel this observation. Would you like to proceed with ending this observation?'),
            tagName: 'p'
        });
        var CancelFooterView = Backbone.Marionette.ItemView.extend({
            template: Handlebars.compile('{{ui-button "Cancel" classes="btn-default" title="Press enter to cancel."}}{{ui-button "Continue" classes="btn-primary" title="Press enter to continue."}}'),
            events: {
                'click .btn-primary': function() {
                    ADK.UI.Alert.hide();
                    ADK.UI.Workflow.hide();
                    this.options.workflow.close();
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
            template: Handlebars.compile('{{ui-button "OK" classes="btn-primary" title="Press enter to close"}}'),
            events: {
                'click .btn-primary': function () {
                    ADK.UI.Alert.hide();
                    if (this.form) {
                        this.form.$(this.form.ui.addDrpDwnContainer).trigger('control:disable', false);
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
                'statusRadioValue': '.statusRadioValue',
                'immediacyRadioValue': '.immediacyRadioValue',
                'requestTermCheckBox': '.requestTermCheckBox',
                'freeTxtTxtArea': '.freeTxtTxtArea',
                'addDrpDwnContainer': '#addDrpDwnContainer',
                'drpDwnSelect' : '#addDrpDwnContainer ~ .dropdown-menu',
                'addBtn': '#addDrpDwnContainer-add',
                'addCreateBtn': '#addDrpDwnContainer-add-create',
                'cancelButton': '#cancelBtnProblem',
                'freeTextContainer': '.freeTextContainer',        
                'annotationsInputBox': '.annotations #inputString',
                'annotationsAddButton': '.add-comment-button'
            },           
            fields: F414_EnterProblemFields,
            onRender: function(){
                retrievePickListData(this);

                var self = this;
                var PatientModel = ADK.PatientRecordService.getCurrentPatient();
                this.listenTo(PatientModel, 'change:visit', function(model){
                    setVisitLocation(self);
                });
                this.listenTo(this.model, 'showFtArea', function(showDetails){
                    this.ui.freeTxtTxtArea.trigger('control:hidden', !showDetails);    
                    this.ui.requestTermCheckBox.trigger('control:hidden', !showDetails);  
                    if(showDetails){
                        this.$el.find('#ftDetailsCaret').addClass('fa-caret-down');   
                        this.$el.find('#ftDetailsCaret').removeClass('fa-caret-right');                     
                    }else{
                        this.$el.find('#ftDetailsCaret').removeClass('fa-caret-down');   
                        this.$el.find('#ftDetailsCaret').addClass('fa-caret-right');                           
                    }
                });

                this.model.get('treatmentFactors').set(ParseUtil.getTreatmentFactors(ADK.PatientRecordService.getCurrentPatient()));

                if(this.model.get('treatmentFactors').length === 0){
                    this.model.set('noTreatmentFactors', 'true');
                    this.ui.treatmentFactors.trigger('control:hidden', true);
                }

                this.model.get('annotations').on('add', function(){
                    self.handleDisableAddButton(true);
                });

                this.ui.addDrpDwnContainer.trigger('control:disable', true);

                this.ui.drpDwnSelect.addClass('dropdown-menu-right');
            },
            events: {
                'click #ftDetailsBtn': function(){   
                    if(this.model.get('showDetails')){
                        this.ui.freeTxtTxtArea.trigger('control:hidden', true);
                        this.ui.requestTermCheckBox.trigger('control:hidden', true
                            );   
                        this.model.set('showDetails', false); 
                        this.$el.find('#ftDetailsCaret').removeClass('fa-caret-down');   
                        this.$el.find('#ftDetailsCaret').addClass('fa-caret-right');  
                    }else{
                        this.model.set('showDetails', true);  
                        this.$el.find('#ftDetailsCaret').addClass('fa-caret-down');   
                        this.$el.find('#ftDetailsCaret').removeClass('fa-caret-right');                          
                        
                        this.ui.freeTxtTxtArea.trigger('control:hidden', !this.model.get('requestTermCheckBox'));  
                        this.ui.requestTermCheckBox.trigger('control:hidden', false);                             
                    }
                },               
                'blur #onset-date': function(){
                    this.validateFormField( 'onset-date', this.ui.onsetDate, validationUtils.validateMeasuredDateAndTime);
                    this.handleDisableAddButton();
                },
                'click #changeProblemBtn': function(){
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
                'input @ui.annotationsInputBox': function(e){
                    this.handleDisableAddButton();
                },
                'keyup @ui.annotationsInputBox': function(e){
                    var inputBox = this.$(this.ui.annotations).find('#inputString');
                    var inputBoxValue = inputBox.val();
                    if(e.keyCode === 13 && inputBoxValue.length > 0){
                        this.$(this.ui.annotations).find('.add-comment-button').click();
                    }
                },
                'submit': function(e) {
                    var self = this;
                    e.preventDefault();
                    if (!this.model.isValid())
                        this.model.set("formStatus", {
                            status: "error",
                            message: self.model.validationError
                        });
                    else {
                        this.model.unset("formStatus");
                        this.ui.addDrpDwnContainer.trigger('control:disable', true);

                        var saveAlertView = new ADK.UI.Notification({
                            title: 'Problem Added',
                            icon: 'fa-check',
                            message: 'Problem successfully submitted with no errors.',
                            type: "success"
                        });

                        writebackUtils.addProblem(self.model, function () {
                                saveAlertView.show();
                                if (self.ui.addDrpDwnContainer.text() === self.ui.addBtn.text()) {
                                    ADK.UI.Workflow.hide();
                                    self.workflow.close();
                                } else {
                                    self.workflow.close();             
                                    workflowUtils.startAddProblemsWorkflow(enterProblemInfoView);                                 
                                }

                                ADK.ResourceService.clearAllCache('problem');
                                ADK.Messaging.getChannel('problems').trigger('refreshGridView');
                            },
                            function () {
                                var errorAlertView = new ADK.UI.Alert({
                                    title: 'Save Failed (System Error)',
                                    icon: 'fa-exclamation-circle font-size-18 color-red',
                                    messageView: ErrorMessageView,
                                    footerView: ErrorFooterView.extend({
                                        form: self
                                    })
                                });
                                errorAlertView.show();
                            });
                    }
                },
                "click #cancelBtnProblem": function(e) {
                    e.preventDefault();
                    var cancelAlertView = new ADK.UI.Alert({
                        title: 'Are you sure you want to cancel?',
                        icon: 'fa-warning color-red',
                        messageView: CancelMessageView,
                        footerView: CancelFooterView,
                        workflow: this.workflow
                    });
                    cancelAlertView.show();
                }
            },
            modelEvents: {
                'change:isFreeTextProblem': function(){
                    if(!this.model.get('isFreeTextProblem')){
                        this.$(this.ui.freeTextContainer).removeClass('background-color-grey-lighter');
                    }
                    else{
                        this.$(this.ui.freeTextContainer).addClass('background-color-grey-lighter');
                    }                    
                },                  
                'change:requestTermCheckBox': function(){
                    this.ui.freeTxtTxtArea.trigger('control:hidden', !this.model.get('requestTermCheckBox'));                      
                },                
                'change:onset-date': function(){
                    this.validateFormField( 'onset-date', this.ui.onsetDate, validationUtils.validateMeasuredDateAndTime);
                    this.handleDisableAddButton();
                },
                'change:immediacyRadioValue': function () {
                    this.handleDisableAddButton();
                },
                'change:statusRadioValue': function(){
                    this.handleDisableAddButton();
                },
                'change:resProvider': function(){
                    this.handleDisableAddButton();
                }
            },
            validateFormField: function(formField, uiElement, validationFunction){
                validationFunction(this.model, this.model.get(formField));

                if(this.model.errorModel.get(formField)){
                    this.$el.find(uiElement.selector + ' input').focus();
                }
            },
            handleDisableAddButton: function(skipCommentCheck){
                var commentBoxInput = this.$(this.ui.annotations).find('#inputString');
                var disable = true;

                if(!_.isEmpty(this.model.get('onset-date')) && !_.isEmpty(this.model.get('immediacyRadioValue')) &&
                    !_.isEmpty(this.model.get('statusRadioValue')) && !_.isEmpty(this.model.get('resProvider'))){
                        disable = false;

                    if(!skipCommentCheck){
                        if(_.isUndefined(commentBoxInput) || _.isUndefined(commentBoxInput.val()) || commentBoxInput.val().length > 0){
                            disable = true;
                        }
                    }
                }

                this.ui.addDrpDwnContainer.trigger('control:disable', disable);
            }
        });

    function setVisitLocation(form){
        var visit = ADK.PatientRecordService.getCurrentPatient().get('visit');

        if(visit && visit.locationUid){
            var locationId = visit.locationUid.split(':').pop();
            var visitLocation = _.findWhere(form.clinics, {value: locationId});

            if(visitLocation){
                form.model.set('clinic', visitLocation.value);
            }
        }
    }

    function retrievePickListData(form){
        var responsibleProviderCollection = new ADK.UIResources.Picklist.Encounters.NewPersons();
        form.listenTo(responsibleProviderCollection, 'read:success', function(collection, response){
            form.responsibleProviderList = collection.toPicklist();
            form.ui.resProvider.trigger('control:picklist:set', [form.responsibleProviderList]);
            var userSession = ADK.UserService.getUserSession();
            var currentUser = ParseUtil.findUser(collection, userSession);
            if (userSession.get('provider') && currentUser) {
                form.model.set('resProvider', currentUser.get('code') + ';' + currentUser.get('name'));
            }
        });
        responsibleProviderCollection.fetch();

        var patient = ADK.PatientRecordService.getCurrentPatient();
        var clinicLabel;
        var patientStatus = patient.get('patientStatusClass');
        var locations;

        if (!_.isUndefined(patientStatus) && patientStatus.toUpperCase() === 'INPATIENT'){
            clinicLabel = 'Service';
            form.model.set('clinicOrService', 'service');
            locations = new ADK.UIResources.Picklist.Locations.Services();
        } else {
            clinicLabel = 'Clinic';
            form.model.set('clinicOrService', 'clinic');
            locations = new ADK.UIResources.Picklist.Locations.Clinics();
        }

        form.ui.clinic.trigger('control:label', clinicLabel);
        form.listenTo(locations, 'read:success', function(collection, response){
            form.clinics = locations.toPicklist();
            form.ui.clinic.trigger('control:picklist:set', [form.clinics]);
            setVisitLocation(form);
        });

        locations.fetch();
    }

    return enterProblemInfoView;
});