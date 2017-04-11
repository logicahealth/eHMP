define([
    'backbone',
    'marionette',
    'jquery',
    'underscore',
    'handlebars',
    'app/applets/encounters/writeback/formFields',
    'app/applets/encounters/writeback/modelUtil'
], function(Backbone, Marionette, $, _, Handlebars, formFields, util, selectedDiagnosisBodyTemplate, selectedProceduresTemplate) {
    "use strict";

    var DeleteMessageView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('You will lose all work in progress if you delete this task. Would you like to proceed?'),
        tagName: 'p'
    });
    var CloseMessageView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('You will lose all work in progress if you close this task. Would you like to proceed?'),
        tagName: 'p'
    });
    var FooterView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('{{ui-button "Cancel" id="alert-cancel-btn" classes="btn-default" title="Press enter to cancel."}}{{ui-button "Continue" id="alert-continue-btn" classes="btn-primary" title="Press enter to continue."}}'),
        events: {
            'click #alert-continue-btn': function() {
                ADK.UI.Alert.hide();
                ADK.UI.Workflow.hide();
            },
            'click #alert-cancel-btn': function() {
                ADK.UI.Alert.hide();
            }
        },
        tagName: 'span'
    });
    var primaryProviderSelected = false;
    var formView = ADK.UI.Form.extend({
        ui: {
            //Diagnoses Section
            'SearchAddOtherDiagnosis': '.add-other-diagnosis-popover #add-other-diagnosis-search-btn',
            'SelectAddOtherDiagnosis': '.add-other-diagnosis-popover #addOtherDiagnosisSelect',
            'CancelAddOtherDiagnosis': '.add-other-diagnosis-popover #add-other-diagnosis-cancel-btn',
            'AddOtherDiagnosisPopover': '.add-other-diagnosis-popover #add-other-diagnosis-add-btn',
            'DiagnosisSearchString': '.add-other-diagnosis-popover #addOtherDiagnosisSearchString',
            //VisitType Section
            'ModifiersPopover': '#visit-modifiers-popover',
            'CloseAddVisitModifiers': '.add-visit-modifiers-popover #add-visit-modifiers-close-btn',
            //Procedure Section
            'ProcedureSearchString': '.add-other-procedure-popover #addOtherProcedureSearchString',
            'SearchAddOtherProcedure': '.add-other-procedure-popover #add-other-procedure-search-btn',
            'SelectAddOtherProcedure': '.add-other-procedure-popover #addOtherProcedureSelect',
            'CancelAddOtherProcedure': '.add-other-procedure-popover #add-other-procedure-cancel-btn',
            'AddOtherProcedurePopover': '#add-other-procedure-add-btn',
            'CloseAddProcedureModifiers': '#add-procedure-modifiers-close-btn',
            //Footer
            'OkButton': '#ok-btn',
            'CancelButton': '#cancel-btn',
            'Popovers': '.popover-control',
            'Treepicker': '.treepicker-control'
        },
        fields: formFields,
        PRIMARY_PROVIDER_CHECK: 'primaryProviderCheck',
        onInitialize: function(options) {
            util.retrieveServiceRelatedToValues(this);
            this.setModelListeners();
        },
        modelEvents: {
            'change:visitModifiersCount': function() {
                this.model.set('selectedModifiersForVisit', _.map(this.model.get('availableVisitModifiers').where({
                    value: true
                }), function(model) {
                    return model.toJSON();
                }));
            },
            'change:selectAddOtherDiagnosis': function() {
                if (this.model.get('selectAddOtherDiagnosis') !== '' && this.model.get('selectAddOtherDiagnosis') !== 'None') {
                    this.ui.AddOtherDiagnosisPopover.trigger('control:disabled', false);
                } else {
                    this.ui.AddOtherDiagnosisPopover.trigger('control:disabled', true);
                }
            },
            'change:selectAddOtherProcedure': function() {
                //Would use component trigger, but it doesn't seem to be working right.
                if (this.model.get('selectAddOtherProcedure') && this.model.get('selectAddOtherProcedure') !== '' && this.model.get('selectAddOtherProcedure') !== 'None') {
                    this.$('#add-other-procedure-add-btn').prop('disabled', false);
                } else {
                    this.$('#add-other-procedure-add-btn').prop('disabled', true);
                }
            }
        },
        events: {
            'keydown @ui.ProcedureSearchString': function(e) {
                if (e.which === 13) {
                    //Need the change in focus for the entered string to make it to the model
                    this.$(e.target).trigger('blur');
                    this.searchForOther('Procedure');
                }
            },
            'keydown @ui.DiagnosisSearchString': function(e) {
                if (e.which === 13) {
                    //Need the blur for the entered string to make it to the model
                    this.$(e.target).trigger('blur');
                    this.searchForOther('Diagnosis');
                }
            },
            'click @ui.Popovers': function(e) {
                e.preventDefault();
                // hide any open popover
                var self = this;
                this.$('.control.popover-control').each(function(index, el) {
                    if (el !== e.currentTarget) {
                        self.$(el).trigger('control:popover:hidden', true);
                    }
                });
                // set popover title - This is necessary because we want each popover of the procedure ncb
                // to have a different title, and have the title be the appropriate procedure.
                if (this.$(e.currentTarget).hasClass('itemModifiers')) {
                    var popTitle = this.$(e.target).closest('.ncb-row-item').find('.ncb-descriptive-text-region span').html();
                    this.$('.popover .popover-title').html(popTitle);
                }
            },
            'submit': function(e) {
                e.preventDefault();
                var self = this;
                //Checking if User has Permission to access the Encounter Page
                if (ADK.UserService.hasPermission('add-encounter') || ADK.UserService.hasPermission('edit-encounter')) {
                    var validForm = true;

                    //Checking to see if a Primary Provider is Selected
                    if (this.getPrimaryProviderSelected() === false) {
                        //No Primary Provider Selected
                        this.$el.find('.providerList input').focus();
                        this.model.errorModel.set('providerList', 'Please select a Primary Provider.');
                        validForm = false;
                    }

                    //Verifying All Procedures have a Provider Assigned
                    if (!this.procedureHasProvider()) {
                        //A Selected Procedure is Missing a Provider
                        this.model.errorModel.set('ProcedureCollection', 'A Selected Procedure does not have an assigned Provider.');
                        validForm = false;
                    }

                    //Form Model Validation
                    if (!this.model.isValid() || !validForm) this.model.set('formStatus', {
                        status: 'error',
                        message: self.model.validationError
                    });
                    else {
                        this.model.unset('formStatus');
                        util.saveEncounterData(self);
                        var saveAlertView = new ADK.UI.Notification({
                            title: 'Encounter Submitted',
                            icon: 'fa-check',
                            message: 'Encounter successfully submitted with no errors.',
                            type: 'success'
                        });
                        saveAlertView.show();
                        ADK.UI.Workflow.hide();
                    }
                } else {
                    //User Failed to have the appropriate access requirements for Encounter form
                    var errorPermissionsAlertView = new ADK.UI.Notification({

                        title: 'Error Saving Encounter Data',
                        icon: 'fa-exclamation-triangle',
                        message: 'User does not have required permissions.',
                        type: 'warning'
                    });
                    errorPermissionsAlertView.show();
                }
            },
            'click @ui.CancelButton': function(e) {
                e.preventDefault();
                var deleteAlertView = new ADK.UI.Alert({
                    title: 'Are you sure you want to cancel?',
                    icon: 'fa-warning color-red',
                    messageView: DeleteMessageView,
                    footerView: FooterView
                });
                deleteAlertView.show();
            },
            'click @ui.CancelAddOtherDiagnosis': function(e) {
                e.preventDefault();
                this.closeAddOtherPopover('Diagnosis');
            },
            'click @ui.CancelAddOtherProcedure': function(e) {
                e.preventDefault();
                this.closeAddOtherPopover('Procedure');
            },
            'click @ui.CloseAddVisitModifiers': function(e) {
                e.preventDefault();
                this.ui.ModifiersPopover.trigger('control:popover:hidden', true);
            },
            'click @ui.CloseAddProcedureModifiers': function(e) {
                e.preventDefault();
                this.$('.procedure-modifier-popover').trigger('control:popover:hidden', true);
            },
            'click @ui.SearchAddOtherDiagnosis': function(e) {
                e.preventDefault();
                this.searchForOther('Diagnosis');
            },
            'click @ui.SearchAddOtherProcedure': function(e) {
                e.preventDefault();
                this.searchForOther('Procedure');
            },
            'click @ui.AddOtherDiagnosisPopover': function(e) {
                e.preventDefault();
                this.addAddOtherPopover('Diagnosis');
            },
            'click #add-other-procedure-add-btn': function(e) {
                e.preventDefault();
                this.addAddOtherPopover('Procedure');
            }
        },
        setModelListeners: function() {
            /* PROVIDER LIST */
            var providerList = this.model.get('providerList');
            //When we pick a new Primary, uncheck previous primary.
            this.listenTo(providerList, 'change:' + this.PRIMARY_PROVIDER_CHECK,
                function(changed) {
                    var previous = this.model.get('primaryProvider');
                    if (previous && changed.get('code') !== previous.get('code')) {
                        providerList.get(previous).set(this.PRIMARY_PROVIDER_CHECK, false);
                        this.model.set('primaryProvider', changed);
                    } else if (!previous) {
                        this.model.set('primaryProvider', changed);
                    } else {
                        this.model.unset('primaryProvider');
                    }
                    if (!_.isUndefined(changed) && changed.get(this.PRIMARY_PROVIDER_CHECK)) {
                        this.setPrimaryProviderSelected(true);
                    } else {
                        this.setPrimaryProviderSelected(false);
                    }
                }
            );

            //When we remove a primary provider, make it not primary.
            this.listenTo(providerList, 'change:value', function(changed) {
                if (!changed.get('value') && changed.get(this.PRIMARY_PROVIDER_CHECK)) {
                    changed.set(this.PRIMARY_PROVIDER_CHECK, false, {
                        silent: true
                    });
                    this.model.set('primaryProvider', undefined);
                    this.setPrimaryProviderSelected(false);
                }
            });

            /* DIAGNOSES COLLECTION */
            var diagnosesCollection = this.model.get('DiagnosisCollection');
            //On add or Remove item from NCB, moderate selected primary diagnosis.
            this.listenTo(diagnosesCollection, 'diagnoses:change', function(changed) {
                var primaryDiag = this.model.get('primaryDiag');
                //If it was added
                if (changed.get('value')) {
                    //If a Primary wasn't already selected select the just added one.
                    if (!primaryDiag) {
                        //Passive checking to avoid throwing more events than necessary.
                        changed.set('primary', true, {
                            silent: true
                        });
                        this.model.set('primaryDiag', changed);
                    }
                } else { //If it was removed
                    //If the removed is the current primary turn it off.
                    if (primaryDiag.cid === changed.cid) {
                        changed.set('primary', false, {
                            silent: true
                        });
                        //Look for next in list if applicable and make it primary.
                        var newPrimary = diagnosesCollection.findWhere({
                            value: true
                        });
                        this.model.set('primaryDiag', newPrimary);
                        if (newPrimary) {
                            newPrimary.set('primary', true, {
                                silent: true
                            });
                            var primId = ('#' + newPrimary.cid + '-primary').replace('.', '-');
                            this.$(primId).prop('checked', true);
                        }
                    }
                }
            });
            //On selection of a new Primary Diagnoses uncheck previous.
            this.listenTo(diagnosesCollection, 'primaryDiag:change', function(changed) {
                var primaryDiag = this.model.get('primaryDiag');
                if (primaryDiag) {
                    if (primaryDiag.cid === changed.cid) {
                        //If they clicked on the one already checked don't uncheck it.
                        changed.set('primary', true, {
                            silent: true
                        });
                        var id = ('#' + primaryDiag.cid + '-primary').replace('.', '-');
                        this.$(id).prop('checked', true);
                    } else {
                        //Uncheck previous primary and set currently checked as current primary.
                        this.model.set('primaryDiag', changed);
                        primaryDiag.set('primary', false, {
                            silent: true
                        });
                        var primId = ('#' + primaryDiag.cid + '-primary').replace('.', '-');
                        this.$(primId).prop('checked', false);
                    }
                }
            });



            /* VISIT TYPE COLLECTION */
            var visitTypeCollection = this.model.get('visitCollection');
            var visit = ADK.PatientRecordService.getCurrentPatient().get('visit');
            //When the user changes currently selected visit type, populate the modifiers and keep track of it.
            this.listenTo(visitTypeCollection, 'visit:change', function(changed) {
                var modifiers = this.model.get('availableVisitModifiers');
                if (changed.get('value')) {
                    _.each(modifiers.where({
                        value: true
                    }), function(mod) {
                        mod.set('value', false);
                    });
                    modifiers.fetch({
                        dateTime: visit.visitDateTime,
                        cpt: changed.get('ien')
                    });
                } else {
                    modifiers.fetch({
                        dateTime: visit.visitDateTime,
                        cpt: '0'
                    });
                    this.model.set('visitModifiersCount', 0);
                }
                var prev = this.model.get('currentVisitType');
                if (prev && prev.cid !== changed.cid) {
                    prev.set('value', false, {
                        silent: true
                    });
                    if (this.model.get('prevVisitCategory') === this.model.get('visitTypeSelection')) {
                        this.$('#cptCodes-' + prev.cid).prop('checked', false);
                    }
                }
                this.model.set('currentVisitType', changed);
                this.model.set('prevVisitCategory', this.model.get('visitTypeSelection'));
            });


            /* PROCEDURE COLLECTION */
            var procedures = this.model.get('ProcedureCollection');
            //When new procedure added to ncb populate modifiers and providers.
            this.listenTo(procedures, 'procedure:change', function(changed) {
                if (changed.get('value')) {
                    var providerPickList = changed.get('providerPickList');
                    providerPickList.set(providerList.where({
                        value: true
                    }));
                    if (this.model.get('primaryProvider') && !changed.get('provider')) {
                        changed.set('provider', this.model.get('primaryProvider').get('code'));
                    }
                    changed.listenTo(providerList, 'change:value', function(changedProvider) {
                        if (changedProvider.get('value')) {
                            providerPickList.add(changedProvider);
                        } else {
                            providerPickList.remove(changedProvider);
                        }
                    });
                    changed.get('modifiers').fetch({
                        dateTime: visit.visitDateTime,
                        cpt: changed.get('ien')
                    });
                } else {
                    changed.stopListening();
                }
            });
        },
        closeAddOtherPopover: function(context) {
            this.model.unset('addOther' + context + 'SearchString');
            //Need to use these this way to avoid infobutton error.
            this.model.unset('selectAddOther' + context, {
                silent: true
            });
            this.$('#add-other-' + context.toLowerCase() + '-add-btn').prop('disabled', true);
            this.$('.add-other-' + context.toLowerCase() + '-popover').trigger('control:popover:hidden', true);
            this.$('#addOther' + context + 'Btn').focus();
            this.$('.selectAddOther' + context).trigger('control:picklist:error', '{"message": ""}');
        },
        searchForOther: function(context) {
            var searchString = this.model.get('addOther' + context + 'SearchString');
            if (searchString && searchString.length > 0) {
                this.$('.selectAddOther' + context).trigger('control:loading:show');
                if (context === 'Diagnosis') {
                    util.retrieveDiagnosisTree(this, searchString, context);
                } else {
                    this.model.get('addOtherProcedurePicklist').fetch({
                        searchString: searchString
                    });
                }
            }
        },
        addAddOtherPopover: function(context) {
            var itemToAddValue = this.model.get('selectAddOther' + context);
            var itemToAdd = this.model.get('addOtherProcedurePicklist').get(itemToAddValue);
            if (context === 'Procedure') {
                var checklist = this.model.get('ProcedureCollection').get('OTHER PROCEDURES');
                checklist.get('cptCodes').add({
                    id: itemToAddValue,
                    ien: itemToAdd.get('conceptId'),
                    name: itemToAdd.get('prefText'),
                    label: itemToAdd.get('label'),
                    value: false,
                    quantity: 1,
                    provider: '',
                    comments: new Backbone.Collection(),
                    modifiers: new ADK.UIResources.Picklist.Encounters.CptModifiers(),
                    providerPickList: new Backbone.Collection()
                });
                checklist.get('cptCodes').get(itemToAddValue).set('value', true);
            } else {
                var selectedDiagnosis = new Backbone.Model({
                    icdCode: itemToAddValue.get('icdCode'),
                    label: itemToAddValue.get('preferredText'),
                    name: itemToAddValue.get('preferredText'),
                    value: false,
                    addToCL: false,
                    comments: new Backbone.Collection(),
                    primary: false
                });

                selectedDiagnosis.set('id', selectedDiagnosis.cid);
                var diagnosisCollection = this.model.get(context + 'Collection');
                var newDiagnosesGroupName = 'OTHER DIAGNOSES';

                if (diagnosisCollection.length > 0) {
                    var otherDiagnoses = diagnosisCollection.get(newDiagnosesGroupName);
                    var listItems;
                    if (!(_.isUndefined(otherDiagnoses))) {
                        listItems = otherDiagnoses.get('values');
                        // todo: fix NestedCommentBox so value doesn't have to be set to true after adding to listItems
                        listItems.add(selectedDiagnosis);
                        listItems.get(selectedDiagnosis).set('value', true);
                    }
                }
            }
            this.closeAddOtherPopover(context);
        },
        setPrimaryProviderSelected: function(state) {
            this.primaryProviderSelected = state;
        },
        getPrimaryProviderSelected: function() {
            this.primaryProviderSelected = ((primaryProviderSelected || this.model.get('primaryProvider')) ? true : false);
            return this.primaryProviderSelected;
        },
        procedureHasProvider: function() {
            var procedureList = this.model.get('ProcedureCollection');
            var hasProvider = true;
            procedureList.each(function(category) {
                var subList = category.get('cptCodes').where({
                    value: true
                });
                for (var j = 0; j < subList.length; ++j) {
                    if (_.isEmpty(subList[j].get('provider')) || _.isUndefined(subList[j].get('provider')) ){
                        hasProvider = false;
                        return;
                    }
                }
            });
            return hasProvider;
        },

    });
    return formView;
});
