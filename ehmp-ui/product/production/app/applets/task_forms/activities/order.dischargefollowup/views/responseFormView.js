define([
    'backbone',
    'underscore',
    'handlebars',
    'moment',
    'app/applets/orders/writeback/common/requiredFields/requiredFieldsUtils',
    'app/applets/orders/writeback/dischargefollowup/formFields',
    'app/applets/orders/viewUtils',
    'app/applets/task_forms/activities/order.dischargefollowup/utils',
    'app/applets/task_forms/common/utils/eventHandler',
    'app/extensions/extensions'
], function(Backbone, _, Handlebars, moment, RequiredFieldsUtils, FormFields, ViewUtils, Utils, CommonEventHandler, Extensions) {
    'use strict';

    var DATE_FORMAT = 'MM/DD/YYYY';

    var formView = ADK.UI.Form.extend({
        controlClass: {
            'assignTo': Extensions.UI.Form.Controls.AssignTo
        },
        fields: FormFields,
        basicRequiredFields: ['action'],
        events: {
            'response-confirm-cancel-button': 'fireCancel',
            'click #responseAcceptButton': 'fireAccept',
            'click #activityDetails': 'fireDetail'
        },
        modelEvents: {
            'change': 'changedModel',
            'change:action': 'changedAction',
            'change:comment': 'changedComment'
        },
        ui: {
            'actionOptions': '.action-options',
            'assignmentControl': '.assignment',
            'helpTextContainer': '.help-text-container',
            'commentField': '.comment',
            'commentContainer': '.comment-row',
            'cancelButton': '#responseCancelButton',
            'acceptButton': '#responseAcceptButton'
        },
        behaviors: {
            Tooltip: {
                placement: 'bottom'
            }
        },
        onInitialize: function() {
            var contactBy = '';
            if (!_.isEmpty(this.model.get('dischargeContactBy'))) {
                contactBy = moment.utc(this.model.get('dischargeContactBy'), 'YYYYMMDDHHmmSS').local().format(DATE_FORMAT);
            }

            this.model.set({
                'contactBy': contactBy,
                'instructions': 'Use this form to record a post discharge patient telephone event.'
            });

            this.listenTo(this.model, 'change.inputted', function(model, changedValue) {
                // Default radio button selection should not register checks
                if (_.get(changedValue, 'assignment.type', '') !== 'opt_me') {
                    this.registerChecks();
                    this.stopListening(this.model, 'change.inputted');
                }
            });
        },
        onRender: function() {
            RequiredFieldsUtils.requireFields(this);
            this.adjustAcceptButtonProperties();
        },
        adjustAcceptButtonProperties: function() {
            RequiredFieldsUtils.makeButtonDependOnRequiredFields(this, this.ui.acceptButton);
        },
        onDestroy: function() {
            this.unregisterChecks();
            this.$el.trigger('tray.loaderHide');
        },
        registerChecks: function() {
            var checkOptions = {
                id: 'discharge-followup-reponse-in-progress',
                label: 'Discharge Followup Response',
                failureMessage: 'Discharge Followup Response Writeback Workflow In Progress! Any unsaved changes will be lost if you continue.',
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
                id: 'discharge-followup-reponse-in-progress'
            });
        },
        changedModel: function() {
            this.adjustAcceptButtonProperties();
        },
        changedAction: function() {
            this.model.unset('comment');
            this.ui.helpTextContainer.trigger('control:hidden', true);
            this.ui.assignmentControl.trigger('control:hidden', true);
            this.ui.assignmentControl.trigger('control:required', false);
            RequiredFieldsUtils.requireFields(this);

            //change helpText based on the selected action
            var helpTextTemplate = '';
            var action = this.model.get('action');
            if (!_.isEmpty(action)) {
                if (action === Utils.TASK_ACTION_SUCCESFUL_CONTACT) {
                    helpTextTemplate = '<p>Patient <strong>WILL</strong> be removed from the Inpatient Discharge Follow-Up list.</p>' +
                        '<p>Complete the discharge note and Encounter in CPRS to receive work credit.</p>';
                } else if (action === Utils.TASK_ACTION_UNABLE_TO_CONTACT) {
                    helpTextTemplate = 'Patient <strong>WILL NOT</strong> be removed from the Inpatient Discharge Follow-Up list.';
                } else if (action === Utils.TASK_ACTION_FINAL_ATTEMPT) {
                    helpTextTemplate = 'Patient <strong>WILL</strong> be removed from the Inpatient Discharge Follow-Up list.';
                } else if (action === Utils.TASK_ACTION_REASSIGN) {
                    helpTextTemplate = 'Patient <strong>WILL NOT</strong> be removed from the Inpatient Discharge Follow-Up list.';
                    //add assignTo controll to the form
                    this.ui.assignmentControl.trigger('control:hidden', false);
                    this.ui.assignmentControl.trigger('control:required', true);
                }
                this.ui.helpTextContainer.trigger('control:hidden', false);
            }

            this.ui.helpTextContainer.trigger('control:items:update', {
                control: 'container',
                extraClasses: ['col-xs-12', 'all-margin-sm', 'top-margin-xs'],
                template: Handlebars.compile(helpTextTemplate)
            });
        },
        changedComment: function() {
            this.registerChecks();
        },
        fireCancel: function(e) {
            this.workflow.close();
        },
        fireAccept: function(e) {
            if (ADK.UserService.hasPermissions('edit-discharge-followup')) {
                if (RequiredFieldsUtils.validateRequiredFields(this)) {
                    this.startTaskSave();
                }
            } else {
                this.$el.trigger('tray.loaderHide');
                var errorBanner = new ADK.UI.Notification({
                    type: 'error',
                    title: 'Error Discharge Followup - Response',
                    message: 'The user has no permissions to respond to the request.'
                });
                errorBanner.show();
            }
        },
        fireDetail: function(event) {
            var processId = this.model.get('processInstanceId');
            if (processId) {
                ADK.Messaging.getChannel('task_forms').request('activity_detail', {
                    processId: processId,
                    model: this.model
                });
            }
        },
        saveTaskAction: function() {
            var saveActionModel = Utils.buildTaskActionModel(this.model);
            saveActionModel.save(null, {
                type: 'POST',
                success: _.bind(this.onSaveActionSuccess, this),
                error: _.bind(this.onTaskSaveError, this)
            });
        },
        onSaveActionSuccess: function() {
            var successBanner = new ADK.UI.Notification({
                type: 'success',
                title: 'Discharge Activity',
                message: 'Successfully completed.'
            });
            successBanner.show();

            ADK.Messaging.getChannel('tray-tasks').trigger('action:refresh');
            ADK.Messaging.getChannel('activities').trigger('create:success');
            CommonEventHandler.fireCloseEvent();
        },
        onTaskSaveError: function() {
            var errorBanner = new ADK.UI.Notification({
                type: 'error',
                title: 'Error while saving discharge.',
                message: 'Failed to update discharge task.'
            });
            errorBanner.show();
            this.$el.trigger('tray.loaderHide');
        },
        onStartTaskSuccess: function() {
            this.saveTaskAction();
        },
        startTaskSave: function() {
            this.$el.trigger('tray.loaderShow', {
                loadingString: 'Accepting'
            });
            if (!_.isUndefined(this.model.get('status')) && this.model.get('status').toLowerCase() === 'inprogress') {
                this.saveTaskAction();
            } else {
                var startTaskModel = Utils.buildTaskStartModel(this.model.get('taskId'), this.model.get('deploymentId'));
                startTaskModel.save(null, {
                    type: 'POST',
                    success: _.bind(this.onStartTaskSuccess, this),
                    error: _.bind(this.onTaskSaveError, this)
                });
            }
        },
        onBeforeDestroy: function() {
            if (this.model.has('nextURL')) {
                var nextSuggestionOptions = {
                    header: 'Workspace Navigation',
                    suggestionLabel: 'View workspace',
                    suggestion: 'Discharge Care Coordination',
                    buttonLabel: 'View',
                    callback: _.partial(function(nextUrl) {
                        ADK.Navigation.navigate(nextUrl);
                    }, this.model.get('nextURL'))
                };
                var nextViewOptions = {
                    nextSuggestion: nextSuggestionOptions
                };
                this.$el.trigger('tray.update:nextViewOptions', nextViewOptions);
            }
        }

    });

    return formView;
});