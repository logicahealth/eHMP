define([
    'backbone',
    'marionette',
    'underscore',
    'moment',
    'app/applets/orders/writeback/requests/requestFormFields',
    'app/applets/orders/writeback/requests/requestFormUtils',
    'app/applets/orders/writeback/common/assignmentType/assignmentTypeUtils',
    'app/applets/orders/writeback/common/buttons/buttonUtils',
    'app/applets/orders/writeback/common/requiredFields/requiredFieldsUtils',
    'app/applets/orders/behaviors/draftRequest',
    'app/applets/orders/viewUtils',
    'app/applets/task_forms/activities/requests/requestEventHandler'
], function(Backbone, Marionette, _, moment, FormFields, FormUtils, AssignmentTypeUtils, ButtonUtils, RequiredFieldsUtils, DraftBehavior, ViewUtils, EventHandler) {
    'use strict';

    var dateErrorMessages = {
        earliest: {
            tooFar: 'Earliest date cannot be more than 100 years in the future',
            afterLatest: 'Earliest date cannot be after latest date',
            inPast: 'Earliest date cannot be in the past'
        },
        latest: {
            tooFar: 'Latest date cannot be more than 100 years in the future',
            beforeEarliest: 'Latest date cannot be before earliest date',
            inPast: 'Latest date cannot be in the past'
        }
    };

    var isNotInList = function(x, list) {
        return _.every(list, function(item) {
            return x !== item;
        });
    };

    var dateFormat = 'MM/DD/YYYY';
    var isDate = function(s) {
        return moment(s, dateFormat, true).isValid();
    };

    var formView = ADK.UI.Form.extend({
        fields: FormFields,
        basicRequiredFields: ['urgency', 'earliest', 'latest', 'title', 'assignment'],
        events: {
            'request-add-confirm-delete': 'fireDelete',
            'request-add-confirm-cancel': 'fireCancel',
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
            'change:roles': 'adjustAcceptButtonProperties'
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
            'activityDetailsContainer': '.activityDetailsContainer',
            'errorMessage': '.errorMessage'
        },
        onRender: function() {
            if (_.isEmpty(this.model.get('assignment'))) {
                this.model.set('assignment', 'opt_me');
            }

            RequiredFieldsUtils.requireFields(this);

            this.setupFormStatus();
            this.validateDates();
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
        onAttach: function() {
            if (_.isEmpty(this.model.get('urgency'))) {
                this.model.set('urgency', 'routine');
            }
        },
        onDestroy: function() {
            this.unregisterChecks();
            this.$el.trigger('tray.loaderHide');
        },
        unBlockUI: function() {
            this.$el.trigger('tray.loaderHide');
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
            var requestState = this.model.get('requestState');

            // set details button visibility
            if (_.startsWith(requestState, 'Active')) {
                this.ui.activityDetailsContainer.trigger('control:hidden', false);
            } else {
                this.ui.activityDetailsContainer.trigger('control:hidden', true);
            }

            if ((!_.isEmpty(requestState)) &&
                ((requestState === 'Active:PendingResponse') ||
                    (requestState === 'Active: Clarification Requested') ||
                    (requestState === 'Active: Declined'))
            ) {
                this.model.set('formStatus', 'Active');

                if (requestState === 'Active:PendingResponse') {
                    this.model.set('formStatusDescription', 'Pending Response');
                } else if (requestState === 'Active: Clarification Requested') {
                    this.model.set('formStatusDescription', 'Clarification Requested');
                } else if (requestState === 'Active: Declined') {
                    this.model.set('formStatusDescription', 'Declined');
                }
                this.ui.deleteButton.trigger('control:disabled', true);
                this.ui.draftButton.trigger('control:hidden', true);

                this.changeAssignment();
            } else if (_.isEmpty(this.model.get('draft-uid'))) {
                this.ui.deleteButton.trigger('control:disabled', true);
                this.model.set('formStatus', 'new');
            } else {
                this.ui.deleteButton.trigger('control:disabled', false);
                this.model.set('formStatus', 'draft');
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
            this.model.set('title', e.target.value, {
                silent: true
            });

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
            this.model.set('earliest', earliestDate);
            this.model.set('latest', latestDate);
        },
        handleEarliestDateChange: function(e) {
            this.validateDates(e);

            if ((!this.model.errorModel.has('earliest') || isNotInList(this.model.errorModel.get('earliest'), dateErrorMessages.earliest)) && isDate(e.changed.earliest)) {
                if (e && e.changed && e.changed.earliest) {
                    this.ui.latestField.trigger('control:startDate', e.changed.earliest);
                } else {
                    this.ui.latestField.trigger('control:startDate', moment());
                }
            }
        },
        handleLatestDateChange: function(e) {
            this.validateDates(e);

            if ((!this.model.errorModel.has('latest') || isNotInList(this.model.errorModel.get('latest'), dateErrorMessages.latest)) && isDate(e.changed.latest)) {
                if (e && e.changed && e.changed.latest) {
                    this.ui.earliestField.trigger('control:endDate', e.changed.latest);
                } else {
                    this.ui.earliestField.trigger('control:endDate', moment().add(100, 'y'));
                }
            }
        },
        validateDates: function(e) {
            this.model.errorModel.set({
                'earliest': undefined,
                'latest': undefined
            }, {
                unset: true
            });
            this.model.isValid(); //This function performs the datepicker's standard validation as a side-effect.
            var earliest = this.model.get('earliest');
            var latest = this.model.get('latest');

            if (earliest) {
                if (latest) {
                    if (moment(earliest).isAfter(latest, 'day')) {
                        if (e && e.changed && e.changed.latest) {
                            this.model.errorModel.set({
                                'latest': dateErrorMessages.latest.beforeEarliest
                            });
                        } else {
                            this.model.errorModel.set({
                                'earliest': dateErrorMessages.earliest.afterLatest
                            });
                        }
                    }
                }

                if (moment().isAfter(earliest, 'day')) {
                    this.model.errorModel.set({
                        'earliest': dateErrorMessages.earliest.inPast
                    });
                } else if (moment(earliest).isAfter(moment().add(100, 'y'))) {
                    this.model.errorModel.set({
                        'earliest': dateErrorMessages.earliest.tooFar
                    });
                }
            }

            if (latest) {
                if (moment().isAfter(latest, 'day')) {
                    this.model.errorModel.set({
                        'latest': dateErrorMessages.latest.inPast
                    });

                    //This message should supercede earliest.afterLatest (but not earliest.inPast).
                    if (this.model.errorModel.has('earliest')) {
                        if (this.model.errorModel.get('earliest') === dateErrorMessages.earliest.afterLatest) {
                            this.model.errorModel.unset('earliest');
                        }
                    }
                }

                if (moment(latest).isAfter(moment().add(100, 'y'))) {
                    this.model.errorModel.set({
                        'latest': 'Date cannot be more than 100 years in the future'
                    });
                }
            }

            if (!this.model.isValid()) {
                return;
            }
        },
        fireDelete: function(e) {
            EventHandler.sendSignal(e, this.model, 'deleted');
        },
        fireCancel: function(e) {
            this.workflow.close();
        },
        fireDraft: function(e) {
            this.model.unset('errorMessage');
            this.$el.trigger('tray.loaderShow', {
                loadingString: 'Drafting'
            });
            if (this.model.get('activity') && this.model.get('activity').processInstanceId) {
                EventHandler.sendSignal(e, this.model, 'draft');
            } else {
                EventHandler.handleRequest(e, this.model, 'draft', this);
            }
        },
        fireAccept: function(e) {
            this.model.unset('errorMessage');

            if (this.validateFields(e)) {
                this.$el.trigger('tray.loaderShow', {
                    loadingString: 'Accepting'
                });

                var requestState = this.model.get('requestState');
                if (this.model.get('activity') && this.model.get('activity').processInstanceId && !_.isEmpty(requestState) &&
                    (requestState === 'Active: Clarification Requested' || requestState === 'Active: Declined')) {
                    if (ADK.UserService.hasPermissions('edit-coordination-request')) {
                        EventHandler.sendUpdate(e, this.model, 'accepted');
                    } else {
                        this.$el.trigger('tray.loaderHide');
                        var errorBanner = new ADK.UI.Notification({
                            type: 'error',
                            title: 'Error Request - Review',
                            message: 'The user has no permissions to edit the request.'
                        });
                        errorBanner.show();
                    }
                } else if (this.model.get('activity') && this.model.get('activity').processInstanceId) {
                    EventHandler.sendSignal(e, this.model, 'accepted', this);
                } else {
                    EventHandler.handleRequest(e, this.model, 'accepted', this);
                }
            }
        },
        fireDetail: function(e) {
            ADK.Messaging.getChannel('task_forms').request('activity_detail', {
                processId: this.model.get('activity').processInstanceId
            });
        },
        validateFields: function(e) {
            var success = true;
            var self = this;
            _.every(this.requiredFields, function(fieldName) {
                var field = self.model.get(fieldName);
                if (_.isEmpty(field)) {
                    success = false;
                    this.model.errorModel.set({
                        fieldName: 'Invalid selection'
                    });
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
