define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/applets/task_forms/common/utils/utils',
    'app/applets/task_forms/activities/consults/eventHandler',
    'hbs!app/applets/task_forms/activities/consults/templates/orderEntry_Template',
    'app/applets/problems/applet'
], function(Backbone, Marionette, _, Handlebars, Utils, EventHandler, OrderEntryTemplate) {
    "use strict";
    var collection;
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
            control: 'popover',
            name: 'recentOrders',
            label: 'Recent Orders [Under Development]',
            // extraClasses: ['btn-info'],
            extraClasses: ['non-functional-fields'],
            items: []
        }]
    });

    // === Consult form body section
    var ProvideTaskModel = Backbone.Model.extend({
        validate: function(attributes, options) {
            var self = this;
            this.errorModel.clear();

            var errors = {
                'urgency': 'Urgency is required',
                'earliestDate': 'Earliest Date is required',
                'latestDate': 'Latest Date is required'
            };

            _.each(errors, function(val, prop) {
                var value = $.trim(self.get(prop));
                if (value === '') {
                    self.errorModel.set(prop, val);
                }
            });

            if (this.get('urgency') === 'Emergent' && $.trim(this.get('attention')) === '') {
                this.errorModel.set('attention', 'The Attention Field is Required');
            }
            if ($.trim(this.get('requestQuestion')) === '') {
                this.errorModel.set('requestQuestion', 'The Question (Request) Field is Required');
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
                    name: 'urgency',
                    label: 'Urgency',
                    pickList: [{
                        value: 'Emergent',
                        label: 'Emergent (Now)'
                    }, {
                        value: 'Urgent',
                        label: 'Urgent (24hr+)'
                    }, {
                        value: 'Routine',
                        label: 'Routine (Regular scheduling effort)'
                    }]
                }, {
                    control: 'input',
                    name: 'attention',
                    label: 'Attention',
                    placeholder: 'Enter provider name',
                    required: 'true',
                    disabled: 'true',
                    hidden: 'true'
                }, {
                    control: 'container',
                    extraClasses: ['clearfix'],
                    items: [{
                            control: 'datepicker',
                            name: 'earliestDate',
                            label: 'Earliest Date',
                            extraClasses: ['col-md-6'],
                        }, {
                            control: 'datepicker',
                            name: 'latestDate',
                            label: 'Latest Date',
                            extraClasses: ['col-md-6']
                        },

                    ]
                }, {
                    control: 'select',
                    name: 'location',
                    label: 'Location for consultation',
                    extraClasses: ['non-functional-fields'],
                    pickList: [{
                        value: 'Local Facility Name',
                        label: 'Local Facility Name'
                    }, {
                        value: 'location1',
                        label: 'Location 1'
                    }, {
                        value: 'location2',
                        label: 'Location 2'
                    }, {
                        value: 'location3',
                        label: 'Location 3'
                    }]
                }, {
                    control: 'select',
                    name: 'condition',
                    label: 'Conditions related to this consult',
                    attributeMapping: {
                        label: 'problemText',
                        value: 'problemText'
                    }
                }, {
                    control: 'textarea',
                    name: 'requestComment',
                    label: 'Reason for Request <br/>Comment (Clinical History)',
                    rows: 4
                }, {
                    control: 'textarea',
                    name: 'requestQuestion',
                    label: 'Question (Request)*',
                    rows: 4
                } //,

            ]
        }],
        modelEvents: {
            'change:earliestDate': 'updateUrgency',
            'change:latestDate': 'updateUrgency',
            'change:urgency': 'updateDates'
        },
        // Based on the dates selected, update the urgency
        updateUrgency: function(e) {
            // the difference between the dates in days
            var delta = moment(this.model.get('latestDate'))
                .diff(moment(this.model.get('earliestDate')), 'days');
            if (isNaN(delta)) {
                return 0;
            }
            Utils.resetFields.call(this, ['attention']);

            // Change the urgency value
            switch (delta) {
                case 0:
                    this.$('#urgency').val('Emergent');
                    this.model.set('urgency', 'Emergent');
                    Utils.activateField.call(this, 'attention');
                    break;
                case 7:
                    this.$('#urgency').val('Urgent');
                    this.model.set('urgency', 'Urgent');
                    break;
                default:
                    this.$('#urgency').val('Routine');
                    this.model.set('urgency', 'Routine');
            }
        },
        // Update the datepickers based on the urgency
        updateDates: function(e) {
            Utils.resetFields.call(this, ['attention']);
            var urgency = e.get('urgency');
            if (!urgency) {
                return 0;
            }
            urgency = urgency && urgency.toLowerCase();
            var date = moment();

            if (urgency === 'emergent') {
                Utils.activateField.call(this, 'attention');
                this.setDates(date.format('L'), date.format('L'));
            } else if (urgency === 'urgent') {
                this.setDates(date.format('L'), date.add(7, 'd').format('L'));
            } else if (urgency === 'routine') {
                this.setDates(date.format('L'), date.add(30, 'd').format('L'));
            }
        },
        // Set the dates for the earliest and latest date fields
        setDates: function(earliestDate, latestDate) {
            this.model.set('earliestDate', earliestDate);
            this.model.set('latestDate', latestDate);
        },
        onInitialize: function(options) {
            // Store the task information
            var taskModel  = options.taskModel;
            this.taskModel = taskModel;

            if (this.model.errorModel) {
                this.model.errorModel.clear();
            }

            // Claim the task
            EventHandler.claimTask(taskModel);
        },
        onRender: function(e) {
            var self = this;
            var taskVar = this.taskModel.get('taskVariables');

            // Initialize the form fields from model
            
            var date = moment();

            Utils.onEntryViewRender.call(this, date, taskVar);
            
            var fetchOptions = ADK.Messaging.getChannel('problems').request('finalizeConsultOrder');
            collection = ADK.PatientRecordService.fetchCollection(fetchOptions.fetchOptions);
            collection.on('sync', function(col) {
                self.$('.control.select-control.condition').trigger('control:picklist:set', [col]);
            });

            Utils.setFields(this.model, taskVar);

        }
    });

    var ProvideTaskFormBottomSection = ADK.UI.Form.extend({
        _super: ADK.UI.Form.prototype,
        fields: [{
            name: 'noteCondition',
            control: 'select',
            label: 'Condition Relationship',
            attributeMapping: {
                label: 'problemText',
                value: 'problemText'
            }
        }, {
            name: 'noteAnnotation',
            control: 'textarea',
            label: 'Annotation',
            rows: 4
        }],
        onRender: function(e) {
            var self = this;
            var taskVar = e.options.taskModel.get('taskVariables');

            // Initialize the form fields from model
            Utils.setFields(this.model, taskVar);
            collection.on('sync', function(col) {
                self.$('.control.select-control.noteCondition').trigger('control:picklist:set', [col]);
            });

        }
    });

    return Backbone.Marionette.LayoutView.extend({
        template: OrderEntryTemplate,
        regions: {
            form_elements: '.form-elements',
            form_top_section: '.form-top-section',
            form_bottom_section: '.form-bottom-section',
            form_buttom_group: '.form-elements-bottom'
        },
        initialize: function(options) {
            this.formModel = new ProvideTaskModel();

        },
        onShow: function() {
            this.form_top_section.show(new FormTopSection());

            // Give ProvideTaskForm access to the task model
            this.form_elements.show(new ProvideTaskForm({
                taskModel: this.model,
                model: this.formModel
            }));

            this.form_bottom_section.show(new ProvideTaskFormBottomSection({
                model: this.formModel,
                taskModel: this.model
            }));
        }
    });
});