define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'hbs!app/applets/task_forms/activities/FIT_FOBT/templates/followUp_Template'
],
function(Backbone, Marionette, _, Handlebars, FollowUpTemplate) {
    "use strict";

    var ProvideTaskModel = Backbone.Model.extend({
        validate: function(attributes, options) {
            this.errorModel.clear();

            var errormsgs = {
                'out_training_completed': 'You must provide the kit to the patient'
            };

            for (var key in errormsgs) {
                var value = $.trim(this.get(key));

                switch(key) {
                    case 'out_training_completed':
                        if (value === '' || value === 'false') {
                            this.errorModel.set(key, errormsgs[key]);
                        }
                        break;
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
        model: provideTaskModel,
        fields: [{
            control: 'checkbox',
            name: 'out_training_completed',
            label: 'Kit Provided',
            title: 'Kit Provided'
        }, {
            control: 'textarea',
            name: 'out_training_notes',
            label: 'Notes',
            placeholder: 'Notes',
            rows: 15
        }, {
            control: 'checkbox',
            name: 'out_training_follow_up',
            label: 'Mark as Follow Up',
            title: 'Mark as Follow Up'
        }],
        initialize: function(options) {
            // Store the task information
            this.taskModel = options.taskModel;
            this._super.initialize.apply(this, arguments);

            if (this.model.errorModel) {
                this.model.errorModel.clear();
            }

            var fetchOptions = {
                resourceTitle: 'tasks-changestate',
                fetchType: 'POST',
                criteria: {
                    taskid: this.taskModel.get('TASKID'),
                    state: 'start'
                }
            };
            ADK.ResourceService.fetchCollection(fetchOptions);
        }
    });

    return Backbone.Marionette.LayoutView.extend({
        template: FollowUpTemplate,
        regions: {
            form_elements: '.form-elements'
        },
        initialize: function(options) {
            this.model = options.model;
            this.formModel = provideTaskModel;
            provideTaskModel.clear();

            // Add datetime to model to be used on templates
            var expDate = this.model.get('EXPIRATIONTIME');
            if (expDate !== null) {
                this.model.set('dueDateTime', moment(expDate).format('lll'));
            } else {
                this.model.set('dueDateTime', '');
            }
        },
        onShow: function() {
            // Give ProvideTaskForm access to the task model
            this.form_elements.show(new ProvideTaskForm({
                taskModel: this.model
            }));
        }
    });
});
