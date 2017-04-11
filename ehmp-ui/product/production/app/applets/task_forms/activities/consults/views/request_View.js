define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/applets/task_forms/common/utils/utils',
    'app/applets/task_forms/activities/consults/eventHandler',
    'app/applets/todo_list/eventHandler',
    'hbs!app/applets/task_forms/activities/consults/templates/request_Template'
], function(Backbone, Marionette, _, Handlebars, Utils, EventHandler, TodoEventHandler, RequestTemplate) {
    "use strict";

    // === Consult form top section
    var FormTopSectionModel = Backbone.Model.extend({
        validate: function(attributes, options) {
            this.errModel.clear();
        }
    });

    var FormTopSection = ADK.UI.Form.extend({
        _super: ADK.UI.Form.prototype,
        model: new FormTopSectionModel(),
        fields: [{
            control: 'button',
            name: 'consultOverview',
            label: 'Activity Overview',
            type: 'button',
            id: 'consult-overview-button',
            extraClasses: ['btn-default']
        }]
    });

    // === Consult form body section
    var ProvideTaskModel = Backbone.Model.extend({
        defaults: {
            action: ''
        },
        validate: function(options) {
            this.errorModel.clear();
            var errormsgs = {};

            // Add form validation based on the action selected
            var action = $.trim(this.get('action'));
            switch (action) {
                case '':
                    // Validate action for all forms
                    errormsgs.action = 'Select an Action';
                    break;
                case 'discontinued':
                    errormsgs.reason = 'Select a Reason';
                    break;
                case 'assigned':
                    errormsgs.attention = 'Select an Attention';
                    break;
                case 'scheduled':
                    errormsgs.scheduledDate = 'Select Scheduled Date';
                    errormsgs.clinic = 'Select a Clinic';
                    errormsgs.provider = 'Enter Provider';
                    break;
                case 'contacted':
                    errormsgs.attempt = 'Select an Attempt';
                    break;
            }

            // Check for errors based on the case
            for (var key in errormsgs) {
                var value = $.trim(this.get(key));

                if (value === '') {
                    this.errorModel.set(key, errormsgs[key]);
                }
            }

            if (!_.isEmpty(this.errorModel.toJSON())) {
                return "Validation errors. Please fix.";
            }
        }
    });

    var provideTaskModel = new ProvideTaskModel();
    var ProvideTaskForm = ADK.UI.Form.extend({
        _super: ADK.UI.Form.prototype,
        fields: [{
            control: 'container',
            items: [{
                control: 'select',
                name: 'action',
                label: 'Action',
                required: 'true',
                diabled: 'true',
                hidden: 'true'
                    // pickList: being set dynamically in initialize
            }, {
                control: 'select',
                name: 'reason',
                label: 'Reason for Discontinue',
                required: 'true',
                diabled: 'true',
                hidden: 'true',
                // pickList: being set dynamically in initialize
                pickList: []
            }, {
                control: 'datepicker',
                name: 'scheduledDate',
                label: 'Scheduled Date',
                required: 'true',
                diabled: 'true',
                hidden: 'true'
            }, {
                control: 'select',
                name: 'clinic',
                label: 'Clinic',
                required: 'true',
                diabled: 'true',
                hidden: 'true',
                extraClasses: ['non-functional-fields'],
                // pickList: being set dynamically in initialize
                pickList: []
            }, {
                control: 'checkbox',
                name: 'contacted',
                label: 'Patient responded',
                diabled: 'true',
                hidden: 'true'
            }, {
                control: 'select',
                name: 'attempt',
                label: 'Attempt',
                required: 'true',
                diabled: 'true',
                hidden: 'true',
                // pickList: being set dynamically in initialize
                pickList: []
            }, {
                control: 'input',
                name: 'provider',
                label: 'Provider',
                required: 'true',
                diabled: 'true',
                hidden: 'true'
            }, {
                control: 'input',
                name: 'attention',
                label: 'Attention',
                required: 'true',
                diabled: 'true',
                hidden: 'true'
            }, {
                control: 'textarea',
                name: 'comment',
                label: 'Comment',
                diabled: 'true',
                hidden: 'true',
                rows: 8
            }]
        }],
        modelEvents: {
            'change:action': 'populateFields'
        },
        populateFields: function(e) {
            // reset comment label
            this.setCommentLabel();
            var selectList;

            Utils.resetFields.call(this, [
                'action', 'reason', 'clinic', 'contacted', 'attempt',
                'scheduledDate', 'provider', 'comment', 'attention'
            ]);
            Utils.activateField.call(this, 'action');

            // if e is null, exit here
            if (!e) return;

            switch (e.get('action')) {
                case 'triaged':
                    Utils.activateField.call(this, 'comment');
                    Utils.activateButton.call(this, 'modal-complete-button');
                    break;
                case 'eConsult':
                    Utils.activateField.call(this, 'comment');
                    this.setCommentLabel('<br>Reminder <span style="font-weight: normal">This action will assign the consult to you for completion by a clinical note</span><br><br>Comment');
                    break;
                case 'clarification':
                    Utils.activateField.call(this, 'comment');
                    this.setCommentLabel('Question');
                    break;
                case 'assigned':
                    Utils.activateField.call(this, 'attention');
                    Utils.activateField.call(this, 'comment');
                    break;
                case 'scheduled':
                    Utils.activateField.call(this, 'scheduledDate');
                    Utils.activateField.call(this, 'clinic');
                    Utils.activateField.call(this, 'provider');
                    Utils.activateField.call(this, 'comment');
                    selectList = [{
                        value: '',
                        name: ''
                    }, {
                        value: 'clinic1',
                        name: 'clinic1'
                    }, {
                        value: 'clinic2',
                        name: 'clinic2'
                    }];
                    Utils.populateSelectOptions.call(this, selectList, 'clinic');
                    break;
                case 'contacted':
                    Utils.activateField.call(this, 'attempt');
                    Utils.activateField.call(this, 'comment');
                    selectList = [{
                        value: '',
                        name: ''
                    }, {
                        value: 'contacted',
                        name: this.options.taskModel.get('taskVariables').contactAttempt
                    }, {
                        value: 'other',
                        name: 'Other'
                    }];
                    Utils.populateSelectOptions.call(this, selectList, 'attempt');
                    break;
                case 'discontinued':
                    Utils.activateField.call(this, 'reason');
                    Utils.activateField.call(this, 'comment');
                    selectList =
                        [{
                            value: '',
                            name: ''
                        }, {
                            value: 'byOrderingProvider',
                            name: 'By Ordering Provider'
                        }, {
                            value: 'patientDidNotRespond',
                            name: 'Patient did not respond'
                        }, {
                            value: 'patientRequest',
                            name: 'Patient Request'
                        }, {
                            value: 'byConsultant',
                            name: 'By Consultant'
                        }, {
                            value: 'nonVaCare',
                            name: 'Non VA Care'
                        }, {
                            value: 'noShow',
                            name: 'No Show'
                        }, {
                            value: 'leftWithoutBeingSeen',
                            name: 'Left without being seen'
                        }, {
                            value: 'death',
                            name: 'Death'
                        }, {
                            value: 'choiceAppointments',
                            name: 'CHOICE appointment'
                        }, {
                            value: 'duplicate',
                            name: 'Duplicate'
                        }, {
                            value: 'patientRefureCare',
                            name: 'Patient refuse care'
                        }, {
                            value: 'patientReceivedCareOutsideOfVa',
                            name: 'Patient received care outside of VA'
                        }];

                    Utils.populateSelectOptions.call(this, selectList, 'reason');
                    break;
            }
        },
        setCommentLabel: function(label) {
            if (label) {
                // Set to given label
                this.$el.find('.comment label').html(label);
            } else {
                // Reset to 'Comment'
                this.$el.find('.comment label').html('Comment');
            }
        },
        onInitialize: function(options) {
            // Setting the pickList options of the form Fields dynamically
            this.fields.models[0].get('items')[0].pickList = options.actions;
            var taskModel = options.taskModel;

            if (this.model.errorModel) {
                this.model.errorModel.clear();
            }

            // Claim the task
            EventHandler.claimTask(taskModel);
        },
        onRender: function(options) {
            // Populate the fields on form
            this.populateFields();
        }
    });

    return Backbone.Marionette.LayoutView.extend({
        template: RequestTemplate,
        regions: {
            form_elements: '.form-elements',
            form_top_section: '.form-top-section'
        },
        templateHelpers: function() {
            return {
                showUrgency: function() {
                    var urgency = this.taskVariables.urgency.toLowerCase();
                    if (urgency === 'urgent' || urgency === 'emergent') {
                        return true;
                    }
                    return false;

                },
                urgencyTag: function() {
                    var urgency = this.taskVariables.urgency.toLowerCase();
                    if (urgency === 'emergent') {
                        return 'label-critical';
                    }
                    return 'label-warning';

                },
                isRequestReason: function() {
                    return this.taskVariables.requestReason;
                }
            };
        },
        events: {
            'click #consult-overview-button': 'showOverview'
        },
        showOverview: function(e) {
            var options = {
                model: this.model,
                navHeader: 'false'
            };

            // Laumch the activity overview screen from the viewController
            TodoEventHandler.fetchTask(options, null, '', 'order.activity_overview_screen');
        },
        initialize: function(options) {
            this.actions = options.actions;
            this.formModel = new ProvideTaskModel();
        },
        onShow: function() {
            this.form_top_section.show(new FormTopSection());

            // Give ProvideTaskForm access to the task model
            this.form_elements.show(new ProvideTaskForm({
                model: this.formModel,
                taskModel: this.model,
                actions: this.actions
            }));
        }
    });
});
