define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'hbs!app/applets/task_forms/activities/FIT_FOBT/templates/followUp_Template'
],
function(Backbone, Marionette, _, Handlebars, FollowUpTemplate) {
    "use strict";

    var OrderConsultModel = Backbone.Model.extend({
        validate: function(attributes, options) {
            this.errorModel.clear();

            var errormsgs = {
                'out_patient_contacted': 'The patient must be contacted'
            };

            for (var key in errormsgs) {
                var value = $.trim(this.get(key));

                switch(key) {
                    case 'out_patient_contacted':
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

    var orderConsultModel = new OrderConsultModel();

    var OrderConsultForm = ADK.UI.Form.extend({
        _super: ADK.UI.Form.prototype,
        model: orderConsultModel,
        fields: [{
            control: 'checkbox',
            name: 'out_patient_contacted',
            label: 'Patient Notified',
            title: 'Patient Notified'
        }, {
            control: 'textarea',
            name: 'out_consult_notes',
            label: 'Notes',
            placeholder: 'Notes',
            rows: 15
        }, {
            control: 'checkbox',
            name: 'out_consult_follow_up',
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
            this.formModel = orderConsultModel;
            orderConsultModel.clear();

            // Add datetime to model to be used on templates
            var expDate = this.model.get('EXPIRATIONTIME');
            if (expDate !== null) {
                this.model.set('dueDateTime', moment(expDate).format('lll'));
            } else {
                this.model.set('dueDateTime', '');
            }
        },
        onShow: function() {
            // Give OrderConsultForm access to the task model
            this.form_elements.show(new OrderConsultForm({
                taskModel: this.model
            }));
        }
    });
});
