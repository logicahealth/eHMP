define([
    'underscore',
    'handlebars',
    'backbone',
    'marionette',
    'app/applets/encounters/writeback/modelUtil',
    'app/applets/encounters/writeback/showEncounter',
    'app/applets/encounters/writeback/encounterForm'
], function(_, Handlebars, Backbone, Marionette, formUtil, showEncounter, EncountersForm) {
    'use strict';
    var DEFAULT_ENCOUNTER_TITLE = 'Change Encounter';
    var ENCOUNTER_FORM_LOADED_PROMISE_COUNT = 2;
    var workflow;
    var LoaderField = [{
        control: "container",
        template: Handlebars.compile(['<div class="loading font-size-14 panel-padding all-padding-xs background-color-primary-light"><i class="fa fa-spinner fa-spin"></i> Loading...</div>'].join('\n')),
    }];
    var HandleEncounterLoading = ADK.UI.Form.extend({
        model: new Backbone.Model.extend({}),
        fields: LoaderField
    });
    var EncountersDefaultTrayView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile(['<div class="no-encounter-available"></div>'].join('\n')),
        initialize: function() {
            // Initialize working variables
            this.workflow = {};
            this.visitOpen = false;
            /* Removed in order to Disable Encounter Form:
            this.autoLoad = false;
            this.closeOnCancel = false;
            this.closeOnSet = false;
            this.doneFetch = false;
            this.initialLoad = true;
            this.isEncounterWorkflow = false;
            this.promiseCounter = 0;
            this.trayOpen = false;
            this.viewModel = {};
            this.visitFormModel = {};
            this.saveAlertView = {};
            */
            //Initialize models
            var FormModel = Backbone.Model.extend({
                defaults: {
                    visit: {}
                }
            });
            this.formModel = new FormModel({
                newVisit: ''
            });
            this.patientModel = ADK.PatientRecordService.getCurrentPatient();
            if (this.patientModel && this.patientModel.has('visit')) {
                var visitModel = JSON.parse(JSON.stringify(this.patientModel.get('visit')));
                if (!visitModel.formattedDateTime || visitModel.formattedDateTime === '') {
                    visitModel.dateTime = '';
                }
                if (visitModel && visitModel.locationUid) {
                    this.formModel.set('contextVisit', new Backbone.Model(visitModel));
                }
            }
            /* Removed in order to Disable Encounter Form:
            // Check for writeback in progress
            this.setUpChecks = function() {
                var checkOptions = {
                    id: 'encounter-billing-writeback-in-progress',
                    label: 'Encounter Billing',
                    failureMessage: 'Encounter Billing Writeback Workflow In Progress! Any unsaved changes will be lost if you continue.'
                };
                ADK.Checks.register([new ADK.Navigation.PatientContextCheck(_.defaults({
                    onContinue: _.bind(function(model) {
                        this.close();
                        this.$el.trigger('tray.hide');
                    }, this)
                }, checkOptions)), new ADK.Checks.predefined.VisitContextCheck(checkOptions)]);
            };
            */
            // --- Encounter form listeners
            this.listenTo(ADK.Messaging.getChannel('encountersWritebackTray'), 'encounter:load', function(autoload) {
                // Do nothing if workflow is already active
                if (!_.isUndefined(this.workflow)) {
                    return;
                }
                // Assign workflow and visit form model for control
                this.workflow = new ADK.UI.Workflow(this.encounterWorkflowOptions);
                // Initialize the encounter context model
                this.visitFormModel = this.workflow.model.get('steps').at(0).get('viewModel');

                //FOR ENCOUNTER FORM HIDING ONLY
                this.encounterWorkflowOptions.startAtStep = 0;
                this.workflow.show({
                    inTray: 'encounters'
                });

                /* Removed in order to Disable Encounter Form:
                // Handle encounter flow where visit has not been set (show visit flow first)
                if (!this.getContextSet()) {
                    this.encounterWorkflowOptions.startAtStep = 0;
                    this.closeOnSet = false;
                    this.closeOnCancel = true;
                } else {
                    this.encounterWorkflowOptions.startAtStep = 1;
                }
                this.workflow.show({
                    inTray: 'encounters'
                });
                this.workflow.workflowControllerView.goToIndex(this.encounterWorkflowOptions.startAtStep);
                */
                if (autoload) {
                    this.autoLoad = true;
                    this.workflow.$el.trigger('tray.hide');
                } else {
                    this.autoLoad = false;
                }
            });
            /* Removed in order to Disable Encounter Form:
            this.listenTo(ADK.Messaging.getChannel('encountersWritebackTray'), 'encounter:variable:get', function(callback) {
                if (callback) {
                    var encounterVars = {
                        autoLoad: this.autoLoad,
                        closeOnCancel: this.closeOnCancel,
                        closeOnSet: this.closeOnSet,
                        doneFetch: this.doneFetch,
                        initialLoad: this.initialLoad,
                        isEncounterWorkflow: this.isEncounterWorkflow,
                        promiseCounter: this.promiseCounter,
                        trayOpen: this.trayOpen,
                        visitOpen: this.visitOpen
                    };
                    callback(encounterVars);
                }
            });
             */
            this.listenTo(ADK.Messaging.getChannel('encountersWritebackTray'), 'encounter:context:cancel', function() {
                //--- Remove when ENABLING encounter form.
                this.$el.trigger('tray.hide');
                //--- end remove

                /* Removed in order to Disable Encounter Form:
                var isVisitSet = this.getContextSet();
                if (this.closeOnCancel) {
                    this.workflow.$el.trigger('tray.hide');
                    if (isVisitSet) {
                        if (this.promiseCounter >= ENCOUNTER_FORM_LOADED_PROMISE_COUNT) {
                            this.workflow.goToIndex(2);
                        }
                        ADK.Messaging.getChannel('encountersWritebackTray').trigger('encounter:context:close');
                    }
                }
                */
            });
            /*
            this.listenTo(ADK.Messaging.getChannel('encountersWritebackTray'), 'encounter:context:close', function() {
                this.visitOpen = false;
            });
            this.listenTo(ADK.Messaging.getChannel('encountersWritebackTray'), 'encounter:context:alert', function(alertView) {
                this.saveAlertView = alertView;
            });
            this.listenTo(ADK.Messaging.getChannel('encountersWritebackTray'), 'encounter:fetch', function() {
                this.doneFetch = false;
            });
            this.listenTo(ADK.Messaging.getChannel('encountersWritebackTray'), 'encounter:promise:new', function(callback) {
                this.promiseCounter++;
            });
            this.listenTo(ADK.Messaging.getChannel('encountersWritebackTray'), 'encounter:done', function() {
                this.doneFetch = true;
                this.promiseCounter = 0;
                // Determine whether to show the encounter or not
                if (this.trayOpen && this.workflow.model.get('currentIndex') === 1) {
                    this.workflow.workflowControllerView.goToIndex(2);
                }
            });*/
            this.listenTo(ADK.Messaging.getChannel('encounterButtonTrayView'), 'encounter:clicked', function() {
                this.visitOpen = !this.visitOpen; //FOR ENCOUNTER FORM HIDING ONLY

                /* Removed in order to Disable Encounter Form:
                this.isEncounterWorkflow = true;
                // Switch encounter tray title to encounter form title
                this.workflow.changeHeaderTitle(DEFAULT_ENCOUNTER_TITLE + formUtil.getEncounterDetailTitle());
                // Show the tray content
                if (this.visitOpen && this.getContextSet()) {
                    this.workflow.$el.trigger('tray.show');
                    // Show the encounter form if it's ready
                    if (this.doneFetch) {
                        this.workflow.workflowControllerView.goToIndex(2);
                    } else {
                        this.workflow.workflowControllerView.goToIndex(1);
                    }
                } else {
                    if (this.workflow.model.get('currentIndex') !== 2 && this.doneFetch) {
                        this.workflow.workflowControllerView.goToIndex(2);
                    }
                }
                */
            });
            /* Removed in order to Disable Encounter Form:
            // Encounter form listeners ---
            // --- Tray listeners
            this.listenTo(ADK.Messaging.getChannel('encountersWritebackTray'), 'tray.show', function(event) {
                this.trayOpen = true;
            });
            this.listenTo(ADK.Messaging.getChannel('encountersWritebackTray'), 'tray.hidden', function(event) {
                this.trayOpen = false;
                if (!_.isEmpty(this.saveAlertView)) {
                    this.saveAlertView.show();
                    delete this.saveAlertView;
                }
            });
            // End tray listeners ---
            */
        },
        onBeforeShow: function() {
            this.fetchEncounter();
        },
        fetchEncounter: function() {
            /* Removed in order to Disable Encounter Form:
            // Reset
            this.doneFetch = false;
            this.isEncounterWorkflow = false;
            this.promiseCounter = 0;
            this.viewModel = new Backbone.Model({
                //Service Connected Section
                serviceConnected: '%',
                ratedDisabilities: '',
                //Visit Type Section
                providerList: new ADK.UIResources.Picklist.Encounters.Providers(),
                availableVisitModifiers: new ADK.UIResources.Picklist.Encounters.CptModifiers(),
                visitTypeSelection: '',
                visitCollection: new ADK.UIResources.Picklist.Encounters.VisitType(),
                selectedModifiersForVisit: '',
                //Diagnoses Section
                diagnosesSection: '',
                addOtherDiagnosisSearchString: '',
                addOtherDiagnosisPicklist: new Backbone.Collection(),
                DiagnosisCollection: new ADK.UIResources.Picklist.Encounters.Diagnoses(),
                //Procedure Section
                procedureSection: '',
                addOtherProcedureSearchString: '',
                addOtherProcedurePicklist: new ADK.UIResources.Picklist.Encounters.OtherProcedures(),
                ProcedureCollection: new ADK.UIResources.Picklist.Encounters.Procedures()
            });
            */
            // Setup workflow options.
            // step[0] = visit workflow; step[1] = loading workflow; step[2] = encounter form workflow.
            var self = this;
            this.encounterWorkflowOptions = {
                title: DEFAULT_ENCOUNTER_TITLE,
                size: 'large',
                showProgress: false,
                keyboard: true,
                steps: [{
                    view: ADK.utils.appletUtils.getAppletView('visit', 'writeback').extend({
                        inTray: true
                    }),
                    viewModel: this.formModel,
                    stepTitle: DEFAULT_ENCOUNTER_TITLE,
                    onBeforeShow: function() {
                        //Removed in order to Disable Encounter Form: self.visitOpen = true;
                    }
                }
                /* Removed in order to Disable Encounter Form:
                , {
                    view: HandleEncounterLoading,
                    viewModel: this.viewModel,
                    stepTitle: DEFAULT_ENCOUNTER_TITLE,
                    onBeforeShow: function() {
                        ADK.Checks.unregister({
                            id: 'encounter-billing-writeback-in-progress'
                        });
                        self.visitOpen = false;
                        this.stopListening(self.viewModel, 'change.inputted', self.setUpChecks);
                        self.workflow.changeHeaderTitle(DEFAULT_ENCOUNTER_TITLE + formUtil.getEncounterDetailTitle());
                        showEncounter.handleEncounterWorkflow(self.workflow, self.encounterWorkflowOptions.steps[2].viewModel, self.patientModel.get('visit'));
                    }
                }, {
                    view: EncountersForm,
                    viewModel: this.viewModel,
                    stepTitle: DEFAULT_ENCOUNTER_TITLE,
                    onBeforeShow: function() {
                        self.visitOpen = false;
                        this.stopListening(self.viewModel, 'change.inputted', self.setUpChecks);
                        this.listenToOnce(self.viewModel, 'change.inputted', self.setUpChecks);
                    }
                }*/
                ]
            };
            // Assign workflow and visit form model for control
            delete this.workflow;
            // Initial listen for the visit context flow
            this.listenToOnce(ADK.Messaging.getChannel('visitWriteback'), 'change.visit', function() {
                //this.visitFormModel.fromEncounterFlow = false;
                ADK.Messaging.getChannel('encountersWritebackTray').trigger('tray.show');
                ADK.Messaging.getChannel('visitWriteback').trigger('change.visit');
            });
            // Initial listen of the encounter tray to handle encounter form flow
            this.listenToOnce(ADK.Messaging.getChannel('encountersWritebackTray'), 'tray.show', function() {
                this.isEncounterWorkflow = true;
                ADK.Messaging.getChannel('encountersWritebackTray').trigger('encounter:load');
                // Stop listening to prevent loop
                this.stopListening(ADK.Messaging.getChannel('visitWriteback'), 'change.visit');
                // Listener for visit context flow
                this.listenTo(ADK.Messaging.getChannel('visitWriteback'), 'change.visit', function() {
                    try {
                        this.visitOpen = !this.visitOpen; //FOR ENCOUNTER FORM HIDING ONLY
                        // If the visit button is clicked and it's not open, open it.
                        if (this.visitOpen) { //FOR ENCOUNTER FORM HIDING ONLY
                            //Conditional Removed in order to Disable Encounter Form: !this.visitOpen || this.visitOpen && !this.getContextSet()
                            this.closeOnCancel = true;
                            this.closeOnSet = true;
                            this.workflow.workflowControllerView.goToIndex(0);
                            this.workflow.changeHeaderTitle(DEFAULT_ENCOUNTER_TITLE);
                            if (!this.trayOpen) {
                                this.workflow.$el.trigger('tray.show');
                            }
                        } else {
                            //FOR ENCOUNTER FORM HIDING ONLY
                            if (!_.isUndefined(this.workflow)) {
                                this.workflow.$el.trigger('tray.hide');
                            }
                            // External tray button has been clicked so just show the encounter tray
                            // Removed in order to Disable Encounter Form: this.workflow.$el.trigger('tray.show');
                        }
                    } catch (e) {
                        console.error('Visit writeback error: ' + e.message);
                    }
                });
            });
        },
        getContextSet: function() {
            var visit = ADK.PatientRecordService.getCurrentPatient().get('visit');
            return (_.isObject(visit) && !_.isEmpty(visit.selectedProvider) && !_.isEmpty(visit.locationDisplayName) && !_.isEmpty(visit.dateTime) && !_.isEmpty(visit.locationUid));
        }
    });
    var trayView = ADK.UI.Tray.extend({
        attributes: {
            id: 'patientDemographic-encounter',
        },
        options: {
            tray: EncountersDefaultTrayView,
            position: 'right',
            buttonLabel: 'Encounter',
            buttonClass: 'encounter-tray-btn',
            //Size Removed in order to Disable Encounter Form: widthScale: 0.666,
            eventChannelName: 'encountersWritebackTray',
            iconClass: 'icon icon-icon_encounters'
        },
        events: {
            'click button[data-toggle=sidebar-tray]': function(e) {
                ADK.Messaging.getChannel('encounterButtonTrayView').trigger('encounter:clicked');
            }
        }
    });
    ADK.Messaging.trigger('register:component', {
        type: "tray",
        key: "encounters",
        group: "writeback",
        orderIndex: 10,
        view: trayView,
        shouldShow: function() {
            return ADK.PatientRecordService.isPatientInPrimaryVista();
        }
    });
    return EncountersDefaultTrayView;
});