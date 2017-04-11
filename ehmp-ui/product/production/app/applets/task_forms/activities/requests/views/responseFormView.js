define([
    'app/applets/orders/writeback/common/requiredFields/requiredFieldsUtils',
    'app/applets/orders/writeback/requests/responseFormFields',
    'app/applets/orders/writeback/requests/responseFormUtils',
    'app/applets/orders/viewUtils',
    'app/applets/task_forms/activities/requests/responseEventHandler'
], function(RequiredFieldsUtils, FormFields, FormUtils, ViewUtils, EventHandler) {
    'use strict';

    var DATE_FORMAT = 'MM/DD/YYYY';
    var DATE_TIME_FORMAT = DATE_FORMAT + ' HH:mm';

    var ACTIVE_STATE = 'active';
    var PENDING_RESPONSE_SUBSTATE = 'pending response';

    var formView = ADK.UI.Form.extend({
        fields: FormFields,
        basicRequiredFields: ['action'],
        events: {
            'click #responseCancelButton': 'fireCancel',
            'click #responseAcceptButton': 'fireAccept',
            'click #activityDetails': 'fireDetail'
        },
        modelEvents: {
            //'change:assignment': 'changeAssignment',
            //'change:facility': 'handleFacilityChange',
            //'change:team': 'handleTeamChange',
            //'change:roles' : 'adjustAcceptButtonProperties',
            'change:action': 'changeAction'
        },
        ui: {
            'commentField': '.comment',
            'commentContainer': '.comment-row',
            'requestField': '.request',
            'requestContainer': '.request-row',
            'cancelButton': '#responseCancelButton',
            'acceptButton': '#responseAcceptButton'
        },
        data: {},
        onRender: function() {
            this.data = this.model.get('data');
            this.taskId = this.model.get('taskId');
            this.taskStatus= this.model.get('taskStatus');
            RequiredFieldsUtils.requireFields(this);
            this.setupRequestedByText();
            this.setupSubState();
            this.setupDates();
            this.copyRequestDetails();
            this.adjustAcceptButtonProperties();

            this.listenTo(this.model, 'change.inputted', function(e) {
                if (e && e.changed) {
                    if (e.changed.request !== undefined) {
                        this.handleRequestInput(e);
                    }
                    if (e.changed.comment !== undefined) {
                        this.handleCommentInput(e);
                    }
                }
            });
            this.listenToOnce(this.model, 'change.inputted', this.registerChecks);
        },
        onDestroy: function() {
            //this.unregisterChecks();
        },
        registerChecks: function() {
            var checkOptions = {
                id: 'request-activity-writeback-in-progress',
                label: 'Response',
                failureMessage: 'Response Writeback Workflow In Progress! Any unsaved changes will be lost if you continue.',
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
        adjustAcceptButtonProperties: function() {
            RequiredFieldsUtils.makeButtonDependOnRequiredFields(this, this.ui.acceptButton);
        },
        copyRequestDetails: function() {
            if (this.data && _.isObject(this.data) && _.isArray(this.data.requests) && (this.data.requests.length > 0) && _.isObject(this.data.requests[this.data.requests.length-1])) {
                this.model.set('requestDetails', this.data.requests[this.data.requests.length-1].request);
            }
        },
        setupRequestedByText: function() {
            var requestorName = this.data.requests[this.data.requests.length-1].submittedByName || '';

            var requestDateTime;
            if (this.data.requests[this.data.requests.length-1].submittedTimeStamp) {
                requestDateTime = moment(this.data.requests[this.data.requests.length-1].submittedTimeStamp).format(DATE_TIME_FORMAT);
            }

            var requestorInformation = requestorName;
            if (requestDateTime) {
                requestorInformation = requestorInformation + ' on ' + requestDateTime;
            }
            this.model.set('requestorInformation', requestorInformation);

            if (this.data.requests[this.data.requests.length-1].visit && this.data.requests[this.data.requests.length-1].visit.location) {
                var requestorLocationUid = this.data.requests[0].visit.location;
                var requestorSiteCode = requestorLocationUid.split(':')[3];

                var facilities = new ADK.UIResources.Picklist.Team_Management.Facilities();

                this.listenToOnce(facilities, 'read:success', function(collection, response) {
                    if (response && response.data && _.isArray(response.data) && (response.data.length === 1) && response.data[0] && response.data[0].vistaName) {
                        this.model.set('requestorLocation', response.data[0].vistaName);
                    }
                });

                facilities.fetch({
                    siteCode: requestorSiteCode
                });
            }
        },
        behaviors: {
            Tooltip: {
                placement: 'bottom'
            }
        },
        setupSubState: function() {
            if (this.model.get('ehmpState') === ACTIVE_STATE) {
                this.model.set('subState', PENDING_RESPONSE_SUBSTATE);
            }
        },
        setupDates: function() {
            this.model.set('earliestDateText', moment(this.data.requests[this.data.requests.length-1].earliestDate).format(DATE_FORMAT));
            this.model.set('latestDateText', moment(this.data.requests[this.data.requests.length-1].latestDate).format(DATE_FORMAT));
        },
        changeAction: function() {
            this.model.unset('comment');
            this.model.unset('request');

            this.ui.commentContainer.trigger('control:hidden', true);
            this.ui.requestContainer.trigger('control:hidden', true);

            this.ui.commentField.trigger('control:hidden', true);
            this.ui.requestField.trigger('control:hidden', true);

            this.ui.commentField.trigger('control:required', false);
            this.ui.requestField.trigger('control:required', false);

            var action = this.model.get('action');
            if (action === 'Mark as Complete') {
                RequiredFieldsUtils.requireFields(this);

                this.ui.commentContainer.trigger('control:hidden', false);
                this.ui.commentField.trigger('control:hidden', false);
            } else if (action === 'Return for Clarification') {
                this.ui.requestField.trigger('control:required', true);

                RequiredFieldsUtils.requireFields(this, 'request');

                this.ui.requestContainer.trigger('control:hidden', false);
                this.ui.requestField.trigger('control:hidden', false);
            } else if (action === 'Decline') {
                this.ui.commentField.trigger('control:required', true);

                RequiredFieldsUtils.requireFields(this, 'comment');

                this.ui.commentContainer.trigger('control:hidden', false);
                this.ui.commentField.trigger('control:hidden', false);
            }

            this.adjustAcceptButtonProperties();
        },
        handleRequestInput: function(e) {
            if (e && e.changed && (e.changed.request !== undefined)) {
                this.model.set('request', e.changed.request, {silent: true});

                //We updated the model in silent mode, so we need to manually trigger the listeners we actually want to 'hear' our update.
                this.adjustAcceptButtonProperties();
                //this.registerChecks();
            }
        },
        handleCommentInput: function(e) {
            if (e && e.changed && (e.changed.comment !== undefined)) {
                this.model.set('comment', e.changed.comment, {silent: true});

                //We updated the model in silent mode, so we need to manually trigger the listeners we actually want to 'hear' our update.
                this.adjustAcceptButtonProperties();
                //this.registerChecks();
            }
        },
        fireCancel: function(e) {
            e.preventDefault();
            var closeAlertView = new ViewUtils.DialogBox({
                title: 'Cancel Response',
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
        fireAccept: function(e) {
            if (RequiredFieldsUtils.validateRequiredFields(this)) {
                EventHandler.handleResponseAction(e, this.model, 'accepted', this.model.get('action'), this.data);
            }
        },
        fireDetail: function(e) {
            ADK.Messaging.getChannel('task_forms').request('activity_detail', {processId: this.model.get('data').activity.processInstanceId});
        },

    });

    return formView;
});
