define([
    'moment',
    'app/applets/orders/writeback/common/requiredFields/requiredFieldsUtils',
    'app/applets/orders/writeback/requests/responseFormFields',
    'app/applets/orders/writeback/requests/responseFormUtils',
    'app/applets/orders/viewUtils',
    'app/applets/task_forms/activities/requests/responseEventHandler',
    'app/extensions/extensions'
], function(moment, RequiredFieldsUtils, FormFields, FormUtils, ViewUtils, EventHandler, Extensions) {
    'use strict';

    var DATE_FORMAT = 'MM/DD/YYYY';
    var DATE_TIME_FORMAT = DATE_FORMAT + ' HH:mm';

    var ACTIVE_STATE = 'active';
    var PENDING_RESPONSE_SUBSTATE = 'Pending Response';

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
            'change:action': 'changeAction'
        },
        ui: {
            'assignmentControl': '.assignment',
            'beforeEarliestDateBanner': '.beforeEarliestDateBanner',
            'requestDetailsField': '.requestDetails',
            'commentField': '.comment',
            'commentContainer': '.comment-row',
            'requestField': '.request',
            'requestContainer': '.request-row',
            'cancelButton': '#responseCancelButton',
            'acceptButton': '#responseAcceptButton'
        },
        data: {},
        onRender: function() {
            if (_.isEmpty(this.model.get('assignment'))) {
                this.model.set('assignment', 'opt_person');
            }

            var requests = this.model.get("data").requests;
            this.model.set('displayName', requests[requests.length - 1].title);

            this.data = this.model.get('data');
            this.taskId = this.model.get('taskId');
            this.taskStatus = this.model.get('taskStatus');
            this.setupActions();
            RequiredFieldsUtils.requireFields(this);
            this.setupRequestedByText();
            this.setupSubState();
            this.setupDates();
            this.copyRequestDetails();
            this.adjustAcceptButtonProperties();
            this.adjustButtonProperties();
            this.listenTo(this.model, 'change', this.adjustButtonProperties);

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
            this.unregisterChecks();
            this.$el.trigger('tray.loaderHide');
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
        adjustButtonProperties: function() {
            this.adjustAcceptButtonProperties();
        },
        copyRequestDetails: function() {
            var newRequestDetails = '';
            if (this.data && _.isObject(this.data) && _.isArray(this.data.requests) && (this.data.requests.length > 0) && _.isObject(this.data.requests[this.data.requests.length - 1]) && (this.data.requests[this.data.requests.length - 1].request !== ' ')) {
                newRequestDetails = this.data.requests[this.data.requests.length - 1].request;
            }
            this.model.set('requestDetails', newRequestDetails);
        },
        setupRequestedByText: function() {
            var requestorName = this.data.requests[this.data.requests.length - 1].submittedByName || '';

            var requestDateTime;
            if (this.data.requests[this.data.requests.length - 1].submittedTimeStamp) {
                requestDateTime = moment(this.data.requests[this.data.requests.length - 1].submittedTimeStamp).format(DATE_TIME_FORMAT);
            }

            var requestorInformation = requestorName;
            if (requestDateTime) {
                requestorInformation = requestorInformation + ' on ' + requestDateTime;
            }
            this.model.set('requestorInformation', requestorInformation);

            if (this.data.requests[this.data.requests.length - 1].visit && this.data.requests[this.data.requests.length - 1].visit.location) {
                var requestorLocationUid = this.data.requests[0].visit.location;
                var requestorSiteCode = requestorLocationUid.split(':')[3];

                var division = _.get(this, 'data.activity.sourceFacilityId', null);
                if (!_.isNull(division) && !_.isUndefined(division)) {
                    var facilities = new ADK.UIResources.Picklist.Team_Management.Facilities();
                    this.listenToOnce(facilities, 'read:success', function(collection, response) {
                        var facility = collection.findWhere({ facilityID: division });
                        if (!_.isUndefined(facility)) {
                            this.model.set('requestorLocation', facility.get('vistaName'));
                        }
                    });

                    facilities.fetch({
                        division: division
                    });
                }
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
            this.model.set('earliestDateText', moment.utc(this.data.requests[this.data.requests.length - 1].earliestDate, "YYYYMMDDHHmmSS").local().format(DATE_FORMAT));
            this.model.set('latestDateText', moment.utc(this.data.requests[this.data.requests.length - 1].latestDate, "YYYYMMDDHHmmSS").local().format(DATE_FORMAT));
        },
        setupActions: function() {
            var actionsPickList = [{
                value: EventHandler.REQUEST_COMPLETE,
                label: 'Mark as Complete'
            }, {
                value: EventHandler.REQUEST_CLARIFICATION,
                label: 'Return for Clarification'
            }, {
                value: EventHandler.REQUEST_DECLINE,
                label: 'Decline'
            }, {
                value: EventHandler.REQUEST_REASSIGN,
                label: 'Reassign'
            }];

            var earliestDate = moment.utc(_.last(this.data.requests).earliestDate, 'YYYYMMDDHHmmSS').local();
            if(moment().isBefore(earliestDate) && this.model.get('beforeEarliestDate') === 1) {
                this.ui.beforeEarliestDateBanner.trigger('control:message', 'A Request cannot be marked as complete before the earliest date');
                actionsPickList[0].disabled = true;
            }

            this.model.set('actionsPickList', actionsPickList);
        },
        changeAction: function() {
            this.model.unset('comment');
            this.model.unset('request');

            this.ui.commentContainer.trigger('control:hidden', true);
            this.ui.requestContainer.trigger('control:hidden', true);
            this.ui.assignmentControl.trigger('control:hidden', true);
            this.ui.commentField.trigger('control:hidden', true);
            this.ui.requestField.trigger('control:hidden', true);

            this.ui.commentField.trigger('control:required', false);
            this.ui.requestField.trigger('control:required', false);


            var action = this.model.get('action');
            if (action === EventHandler.REQUEST_COMPLETE) {
                RequiredFieldsUtils.requireFields(this);

                this.ui.commentContainer.trigger('control:hidden', false);
                this.ui.commentField.trigger('control:hidden', false);
            } else if (action === EventHandler.REQUEST_CLARIFICATION) {
                this.ui.requestField.trigger('control:required', true);

                RequiredFieldsUtils.requireFields(this, 'request');

                this.ui.requestContainer.trigger('control:hidden', false);
                this.ui.requestField.trigger('control:hidden', false);
            } else if (action === EventHandler.REQUEST_DECLINE) {
                this.ui.commentField.trigger('control:required', true);

                RequiredFieldsUtils.requireFields(this, 'comment');

                this.ui.commentContainer.trigger('control:hidden', false);
                this.ui.commentField.trigger('control:hidden', false);
            } else if (action === EventHandler.REQUEST_REASSIGN) {
                this.ui.commentField.trigger('control:required', true);

                RequiredFieldsUtils.requireFields(this, 'assignment');
                RequiredFieldsUtils.requireFields(this, 'comment');

                this.ui.assignmentControl.trigger('control:hidden', false);
                this.ui.commentContainer.trigger('control:hidden', false);
                this.ui.commentField.trigger('control:hidden', false);
            }

            this.adjustAcceptButtonProperties();
            this.assignmentRquired(_.isEqual(action, EventHandler.REQUEST_REASSIGN));
        },
        assignmentRquired: function(required) {
            this.ui.assignmentControl.trigger('control:required', required);
        },
        handleRequestInput: function(e) {
            if (e && e.changed && (e.changed.request !== undefined)) {
                this.model.set('request', e.changed.request, {
                    silent: true
                });

                //We updated the model in silent mode, so we need to manually trigger the listeners we actually want to 'hear' our update.
                this.adjustAcceptButtonProperties();
                this.registerChecks();
            }
        },
        handleCommentInput: function(e) {
            if (e && e.changed && (e.changed.comment !== undefined)) {
                this.model.set('comment', e.changed.comment, {
                    silent: true
                });

                //We updated the model in silent mode, so we need to manually trigger the listeners we actually want to 'hear' our update.
                this.adjustAcceptButtonProperties();
                this.registerChecks();
            }
        },
        fireCancel: function(e) {
            this.workflow.close();
        },
        fireAccept: function(e) {
            if (ADK.UserService.hasPermissions('respond-coordination-request')) {
                if (RequiredFieldsUtils.validateRequiredFields(this)) {
                    EventHandler.handleResponseAction(e, this.model, 'accepted', this.model.get('action'), this.data);
                }
            } else {
                this.$el.trigger('tray.loaderHide');
                var errorBanner = new ADK.UI.Notification({
                    type: 'error',
                    title: 'Error Request - Response',
                    message: 'The user has no permissions to respond to the request.'
                });
                errorBanner.show();
            }
        },
        fireDetail: function(e) {
            ADK.Messaging.getChannel('task_forms').request('activity_detail', {
                processId: this.model.get('data').activity.processInstanceId
            });
        }
    });

    return formView;
});
