define([
    'backbone',
    'marionette',
    'app/applets/orders/writeback/requests/requestFormFields',
    'app/applets/orders/writeback/requests/requestFormUtils',
    'app/applets/orders/writeback/common/assignmentType/assignmentTypeUtils',
    'app/applets/orders/writeback/common/buttons/buttonUtils',
    'app/applets/orders/writeback/common/requiredFields/requiredFieldsUtils',
    'app/applets/orders/behaviors/draftRequest',
    'app/applets/orders/viewUtils',
    'app/applets/task_forms/activities/requests/requestEventHandler'
], function(Backbone, Marionette, FormFields, FormUtils, AssignmentTypeUtils, ButtonUtils, RequiredFieldsUtils, DraftBehavior, ViewUtils, EventHandler) {
    'use strict';

    var requestState='';

    var formView = ADK.UI.Form.extend({

         fields: FormFields,
        basicRequiredFields: ['urgency', 'earliest', 'latest', 'title', 'assignment'],
        events: {
            'click #requestDeleteButton': 'fireDelete',
            'click #requestCancelButton': 'fireCancel',
            'click #requestDraftButton': 'fireDraft',
            'click #requestAcceptButton': 'fireAccept',
            'input .title': 'handleTitleInput',
            'click #activityDetails': 'fireDetail'
        },
        modelEvents: {
            'change:urgency': 'updateDates',
            'change:earliest': 'handleEarliestDateChange',
            'change:latest': 'handleLatestDateChange',
            'change:assignment': 'changeAssignment',
            'change:facility': 'handleFacilityChange',
            'change:draft-data': 'processDraftRequest',
            'change:team': 'handleTeamChange',
            'change:roles' : 'adjustAcceptButtonProperties'
        },
        ui: {
            'urgencyField': '.urgency',
            'earliestField': '.earliest',
            'latestField': '.latest',
            'titleField': '.title',
            'assignmentField': '.assignment',
            'requestDetailsField': '.requestDetails',
            'facilityField': '.facility',
            'personField': '.person',
            'teamField': '.team',
            'rolesField': '.roles',
            'facilityContainer': '.facility-row',
            'personContainer': '.person-row',
            'teamContainer': '.team-row',
            'rolesContainer': '.roles-row',
            'deleteButton': '#requestDeleteButton',
            'cancelButton': '#requestCancelButton',
            'draftButton': '#requestDraftButton',
            'acceptButton': '#requestAcceptButton',
            'activityDetailsContainer': '.activityDetailsContainer'
        },
        onRender: function() {
            if (_.isEmpty(this.model.get('urgency'))) {
                this.model.set('urgency', 'routine');
            }
            if (_.isEmpty(this.model.get('assignment'))) {
                this.model.set('assignment', 'opt_me');
            }

            RequiredFieldsUtils.requireFields(this);

            this.setupFormStatus();
            this.adjustButtonProperties();
            this.listenTo(this.model, 'change', this.adjustButtonProperties);
            this.listenToOnce(this.model, 'change.inputted', this.registerChecks);

            this.listenTo(this.model.errorModel, 'change:latest', function(e) {
                if (!this.model.errorModel.get('latest')) {
                    //Double-check in case this was an error model clear triggered by the draft behavior.
                    this.validateDates();
                }
            });
        },
        onDestroy: function() {
            this.unregisterChecks();
        },
        registerChecks: function() {
            var checkOptions = {
                id: 'request-activity-writeback-in-progress',
                label: 'Request',
                failureMessage: 'Request Writeback Workflow In Progress! Any unsaved changes will be lost if you continue.',
                onContinue: _.bind(function(model) {
                    this.workflow.close();
                }, this)
            };
            ADK.Checks.register([
                new ADK.Navigation.PatientContextCheck(checkOptions),
                new ADK.Checks.predefined.VisitContextCheck(checkOptions)
            ]);
        },
        unregisterChecks: function() {
            ADK.Checks.unregister({
                id: 'request-activity-writeback-in-progress'
            });
        },
        handleFacilityChange: function() {
            AssignmentTypeUtils.handleFacilityChange(this);
        },
        handleTeamChange: function() {
            AssignmentTypeUtils.handleTeamChange(this);
            this.adjustAcceptButtonProperties();
        },
        adjustButtonProperties: function() {
            this.adjustDraftButtonProperties();
            this.adjustAcceptButtonProperties();
        },
        behaviors: {
            draft: {
                behaviorClass: DraftBehavior,
                type: 'request'
            },
            Tooltip: {
                placement: 'bottom'
            }
        },
        setupFormStatus: function() {
            var requestState=this.model.get('requestState');

            // set details button visibility
            if(_.startsWith(requestState, 'Active')) {
                this.ui.activityDetailsContainer.trigger('control:hidden', false);
            } else {
                this.ui.activityDetailsContainer.trigger('control:hidden', true);
            }

            if (_.isEmpty(this.model.get('draft-uid')) || (!_.isEmpty(requestState) && (requestState=='Active:PendingResponse')) ) {


                this.ui.deleteButton.trigger('control:hidden', true);
                this.model.set('formStatus', 'new');
            } else {

                this.ui.deleteButton.trigger('control:hidden', false);
                this.model.set('formStatus', 'draft');
            }

            if((!_.isEmpty(requestState) &&
                (requestState=='Active:PendingResponse' || requestState=='Active: Clarification Requested' || requestState=='Active: Declined'
                ))){

                this.model.set('formStatus', 'Active');

                if(requestState=='Active:PendingResponse'){
                    this.model.set('formStatusDescription', 'Pending Response');
                }
                else if(requestState=='Active: Clarification Requested'){
                    this.model.set('formStatusDescription', 'Clarification Requested');
                }
                else if(requestState=='Active: Declined'){
                    this.model.set('formStatusDescription', 'Declined');
                }
                this.ui.deleteButton.trigger('control:hidden', true);
                this.ui.draftButton.trigger('control:hidden', true);

                this.changeAssignment();
            }else {
                this.ui.deleteButton.trigger('control:hidden', false);
            }
        },
        adjustDraftButtonProperties: function() {
            if (_.isEmpty(this.model.get('title'))) {
                ButtonUtils.disable(this.ui.draftButton);
            } else {
                ButtonUtils.enable(this.ui.draftButton);
            }
        },
        adjustAcceptButtonProperties: function() {
            RequiredFieldsUtils.makeButtonDependOnRequiredFields(this, this.ui.acceptButton);
        },
        processDraftRequest: function() {
            var draftData = this.model.get('draft-data');
            var attributes = _.pick(draftData, function(value) {
                return (!_.isEmpty(value));
            });
            this.model.set(attributes);
        },
        changeAssignment: function() {
            AssignmentTypeUtils.changeAssignment(this);
        },
        handleTitleInput: function(e) {
            this.model.set('title', e.target.value, {silent: true});

            //We updated the model in silent mode, so we need to manually trigger the listeners we actually want to 'hear' our update.
            this.adjustButtonProperties();
            this.registerChecks();
        },
        updateDates: function(e) {
            //Update the datepickers based on the urgency
            var urgency = e.get('urgency');
            if (!urgency) {
                return 0;
            }

            urgency = urgency && urgency.toLowerCase();
            var date = moment();

            if (urgency === 'urgent') {
                this.setDates(date.format('L'), date.add(7, 'd').format('L'));
            } else if (urgency === 'routine') {
                this.setDates(date.format('L'), date.add(30, 'd').format('L'));
            }
        },
        setDates: function(earliestDate, latestDate) {
            this.model.set({
                'earliest': earliestDate,
                'latest': latestDate
            });
        },
        handleEarliestDateChange: function(e) {
            if (e && e.changed && e.changed.earliest) {
                this.ui.latestField.trigger('control:startDate', e.changed.earliest);
            } else {
                this.ui.latestField.trigger('control:startDate', moment());
            }

            this.validateDates(e);
        },
        handleLatestDateChange: function(e) {
            if (e && e.changed && e.changed.latest) {
                this.ui.earliestField.trigger('control:endDate', e.changed.latest);
            } else {
                this.ui.earliestField.trigger('control:endDate', moment().add(100, 'y'));
            }

            this.validateDates(e);
        },
        validateDates: function(e) {
            this.model.errorModel.set({
                'earliest': undefined,
                'latest': undefined
            }, {
                unset: true
            });

            if (this.model.get('earliest')) {
                if (this.model.get('latest')) {
                    if (moment(this.model.get('earliest')).isAfter(this.model.get('latest'), 'day')) {
                        if (e && e.changed && e.changed.latest) {
                            this.model.errorModel.set({'latest': 'Latest Date cannot be before Earliest Date.'});
                        }
                        else {
                            this.model.errorModel.set({'earliest': 'Earliest Date cannot be after Latest Date.'});
                        }
                    }
                }

                if (moment().isAfter(this.model.get('earliest'), 'day')) {
                    this.model.errorModel.set({'earliest': 'Earliest Date cannot be in the past.'});
                }
            }

            if (this.model.get('latest')) {
                if (moment().isAfter(this.model.get('latest'), 'day')) {
                    this.model.errorModel.set({'latest': 'Latest Date cannot be in the past.'});
                }
            }
        },
        fireDelete: function(e) {
            var self = this;
            var deleteConfirmation = new ViewUtils.DialogBox({
                title: 'Delete Request',
                message: 'Are you sure you want to delete?',
                confirmButton: 'Yes',
                cancelButton: 'No',
                confirmTitle: 'Press enter to delete',
                cancelTitle: 'Press enter to go back',
                onConfirm: function() {
                    EventHandler.sendSignal(e, self.model, 'deleted');
                }
            });
            deleteConfirmation.show();
        },
        fireCancel: function(e) {
            e.preventDefault();
            var closeAlertView = new ViewUtils.DialogBox({
                title: 'Cancel Request',
                message: 'All unsaved changes will be lost. Are you sure you want to cancel?',
                confirmButton: 'Yes',
                cancelButton: 'No',
                confirmTitle: 'Press enter to cancel',
                cancelTitle: 'Press enter to go back',
                onConfirm: function() {
                    var TrayView = ADK.Messaging.request("tray:writeback:actions:trayView");
                    if (TrayView) {
                        TrayView.$el.trigger('tray.reset');
                    }
                }
            });
            closeAlertView.show();
        },
        fireDraft: function(e) {
            this.$el.trigger('tray.reset');
            //this.model.trigger('draft:save');
            if (this.model.get('activity') && this.model.get('activity').processInstanceId) {
                EventHandler.sendSignal(e, this.model, 'draft');
            } else {
                EventHandler.handleRequest(e, this.model, 'draft');
            }
        },
        fireAccept: function(e) {
            if(this.validateFields) {
                var requestState=this.model.get('requestState');
                if (this.model.get('activity') && this.model.get('activity').processInstanceId && !_.isEmpty(requestState) &&
                    (requestState=='Active: Clarification Requested' || requestState=='Active: Declined')) {
                    EventHandler.sendUpdate(e, this.model, 'accepted');
                }
                else if (this.model.get('activity') && this.model.get('activity').processInstanceId) {
                    EventHandler.sendSignal(e, this.model, 'accepted');
                } else {
                    EventHandler.handleRequest(e, this.model, 'accepted');
                }
            }
        },
        fireDetail: function(e) {
            ADK.Messaging.getChannel('task_forms').request('activity_detail', {processId: this.model.get('activity').processInstanceId});
        },
        validateFields: function(e) {
            var success = true;
            _.every(self.requiredFields, function(fieldName) {
                if(_.isEmpty(self.model.get(fieldName))) {
                    success = false;
                    this.model.errorModel.set({fieldName: "Invalid selection"});
                }
            });
            return success;
        },
        onDraftSaveSuccess: FormUtils.onDraftSuccessEvent,
        onDraftReadSuccess: FormUtils.onDraftReadSuccess,
        onDraftDeleteSuccess: FormUtils.onDraftSuccessEvent,
    });

    return formView;
});
