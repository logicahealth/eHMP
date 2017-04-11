define([
    'main/ADK',
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'app/applets/orders/writeback/common/assignmentType/assignmentTypeUtils',
    'app/applets/task_forms/activities/lab/views/formFields',
    'app/applets/task_forms/activities/lab/eventHandler'
], function(ADK, Backbone, Marionette, $, Handlebars, AssignmentTypeUtils, FormFields, EventHandler) {
    'use strict';

    var FormModel = new Backbone.Model();

    var formView = ADK.UI.Form.extend({
        onInitialize: function() {
            EventHandler.claimTask(this.model);
        },
        model: FormModel,
        fields: FormFields,
        basicRequiredFields: ['title', 'assignment'],
        actionRequiredFields: {
            'Remind Me Later': ['notificationDate', 'comment'],
            'Reassign Reminder': {
                'opt_person': ['facility', 'person', 'comment'],
                'opt_myteams': ['team', 'roles', 'comment'],
                'opt_patientteams': ['team', 'roles', 'comment'],
                'opt_anyteam': ['facility', 'team', 'roles', 'comment']
            },
            'Cancel Reminder': ['comment']
        },
        ui: {
            'notificationDatepicker': '.notification-datepicker',
            'assignment': '.assignment',
            'assignToContainer': '.assign-to-container',
            'actionOptions': '.action',
            'facilityContainer': '.facility-row',
            'personContainer': '.person-row',
            'teamContainer': '.team-row',
            'rolesContainer': '.roles-row',
            'facilityField': '.facility',
            'personField': '.person',
            'teamField': '.team',
            'rolesField': '.roles',
            'patientContactInstruction': '.patient-contact-instruction',
            'labContactInstruction': '.lab-contact-instruction',
            'acceptButton': '.acceptButton',
            'labErrorMessage': '.lab-error-message'
        },
        events: {
            'click #modal-cancel-button': 'fireCloseEvent',
            'click #requestAcceptButton': 'fireAcceptEvent',
            'click #activityDetails': 'showOverview'
        },
        modelEvents: {
            'change:action': 'handleActionChange',
            'change:assignment': 'changeAssignment',
            'change:facility': 'handleFacilityChange',
            'change:team': 'handleTeamChange',
            'change:roles': 'handleAcceptButton',
            'change:person': 'handleAcceptButton',
            'change:comment': 'handleAcceptButton'
        },
        handleAcceptButton: function(model) {
            var fields = this.actionRequiredFields[model.get('action')];
            var disableAccept = true;
            _.each(fields, function(field) {
                if (_.isObject(field)) {
                    fields = fields[model.get('assignment')] || '';
                }
                if (_.isArray(fields)) {
                    if (fields.length === _.size(_.omit(_.pick(model.attributes, fields), _.isEmpty))) {
                        disableAccept = false;
                    } else {
                        disableAccept = true;
                    }
                }
            });
            this.ui.acceptButton.trigger('control:disabled', disableAccept);
        },
        unsetFields: function(model, fields) {
            _.each(fields, function(field) {
                model.unset(field, {
                    silent: true
                });
            });
        },
        changeAssignment: function() {
            this.handleAcceptButton(this.model);
            AssignmentTypeUtils.changeAssignment(this);
        },
        handleFacilityChange: function() {
            this.unsetFields(this.model, ['team', 'roles']);
            this.handleAcceptButton(this.model);
            AssignmentTypeUtils.handleFacilityChange(this);
        },
        handleTeamChange: function() {
            this.unsetFields(this.model, ['roles']);
            this.handleAcceptButton(this.model);
            AssignmentTypeUtils.handleTeamChange(this);
        },
        adjustButtonProperties: function() {
            //Empty function called from AssignmentTypeUtils. Need to coordinate with team Mars
        },
        handleActionChange: function() {
            this.handleAcceptButton(this.model);
            switch (this.model.get('action')) {
                case 'Reassign Reminder':
                    this.ui.notificationDatepicker.trigger('control:hidden', true);
                    this.ui.notificationDatepicker.trigger('control:required', false);
                    this.ui.assignToContainer.trigger('control:hidden', false);
                    this.ui.assignToContainer.trigger('control:required', true);
                    break;
                case 'Cancel Reminder':
                    this.ui.notificationDatepicker.trigger('control:hidden', true);
                    this.ui.notificationDatepicker.trigger('control:required', false);
                    this.ui.assignToContainer.trigger('control:hidden', true);
                    this.ui.assignToContainer.trigger('control:required', false);
                    break;
                default:
                    this.ui.notificationDatepicker.trigger('control:hidden', false);
                    this.ui.notificationDatepicker.trigger('control:required', true);
                    this.ui.assignToContainer.trigger('control:hidden', true);
                    this.ui.assignToContainer.trigger('control:required', false);
            }
        },
        fireCloseEvent: function(event) {
            event.preventDefault();
            EventHandler.releaseTask(event, this.model);
        },
        fireAcceptEvent: function(event) {
            event.preventDefault();
            if (EventHandler.validateOutGroupString(this.model)) {
                EventHandler.completeTask(event, this.model);
            } else {
                this.model.set('lab-error-message', 'groupOutString exceeded 2000 characters');
                this.showErrorMessage(this.model.get('lab-error-message'));
            }
        },
        showOverview: function(event) {
            event.preventDefault();
            ADK.Messaging.getChannel('task_forms').request('activity_detail', {
                processId: this.model.get('processInstanceId')
            });
        },
        onError: function(model, resp) {
            var errorMessage = _.get(resp, 'responseJSON.message', '');
            if (_.isEmpty(errorMessage)) {
                this.model.errorModel.set({
                    'errorMessage': 'error retrieving order tasks'
                });
            }
            this.showErrorMessage(errorMessage);
            //this.hideInProgress();
        },
        showErrorMessage: function(errorMessage) {
            this.$el.find('.lab-error-message').removeClass('hidden');
        },
        onRender: function() {
            if (this.model.get('processName') === 'Contact_Lab') {
                this.ui.patientContactInstruction.trigger('control:hidden', true);
                this.ui.labContactInstruction.trigger('control:hidden', false);
            }
            this.$el.find('#assignment').attr('title', "Assign to Person, My Teams, Patient's Teams, or Any Team Radio");
            this.$el.find('#assignment label:first').remove();
        }
    });

    return formView;
});