define([
    'backbone',
    'marionette',
    'underscore',
    'app/applets/task_forms/activities/simple_activity/utils/eventHandler',
    'hbs!app/applets/task_forms/activities/simple_activity/templates/taskModalTemplate',
    'app/applets/task_forms/activities/simple_activity/utils/appletHelper'
], function(Backbone, Marionette, _, EventHandler, TaskModalTemplate, AppletHelper) {
    "use strict";

    var Form = ADK.UI.Form.extend({
        _super: ADK.UI.Form.prototype,
        onShow: function() {
            var self = this;
            var count = 1;
            var checkingUp = setInterval(function() {
                if (self.$('.followup').length || count >= 100) {
                    clearInterval(checkingUp);
                    self.onStatusChange(self.model);
                }
                count++;
            }, 500);

        },
        modelEvents: {
            'change:followup': 'onFollowUp',
            'change:status': 'onStatusChange',
        },
        validate: function(attributes, options) {

        },
        onStatusChange: function(model) {
            if (this.model.get('status').toLowerCase() === 'inprogress') {
                this.$('.followup, .out_completionnote').removeClass('hidden');
                if(this.model.get('followup')){
                    this.$('.newduetime, .newduedate, .newstartdate, .newstarttime').removeClass('hidden');
                }
            } else {
                this.$('.followup, .newduetime, .newduedate, .newstartdate, .newstarttime,.out_completionnote').addClass('hidden');

            }

        },
        onFollowUp: function(model) {
            this.$('.newduetime, .newduedate, .newstartdate, .newstarttime').toggleClass('hidden');

        },
        fields: [{
            control: 'textarea',
            extraClasses: ['hidden'],
            name: 'out_completionnote',
            label: 'Notes:',
            placeholder: 'Enter more information about your task...',
            rows: 5
        }, {
            control: 'container',
            items: [{
                control: 'container',
                items: [{
                    control: 'checkbox',
                    name: 'cprs',
                    label: 'Report to CPRS',
                    title: 'Report to CPRS',
                    disabled: true,
                    extraClasses: ['col-sm-6'],
                },{
                    control: 'checkbox',
                    extraClasses: ['hidden', 'col-sm-6'],
                    name: 'followup',
                    label: 'Mark as Follow-Up',
                    title: 'Mark as Follow-Up',
                }]
            }, {
                control: 'container',
                items: [{
                    control: 'datepicker',
                    extraClasses: ['hidden', 'col-sm-3'],
                    name: 'newstartdate',
                    label: 'New Start Date'
                }, {
                    control: 'timepicker',
                    extraClasses: ['hidden', 'col-sm-3'],
                    name: 'newstarttime',
                    label: 'New Start Time'
                },{
                    control: 'datepicker',
                    extraClasses: ['hidden', 'col-sm-3'],
                    name: 'newduedate',
                    label: 'New Due Date'
                }, {
                    control: 'timepicker',
                    extraClasses: ['hidden', 'col-sm-3'],
                    name: 'newduetime',
                    label: 'New Due Time'
                }]

            }]
        }]

    });


    return Backbone.Marionette.LayoutView.extend({
        template: TaskModalTemplate,
        regions: {
            notes: '.notes'
        },
        onShow: function() {
            this.notes.show(new Form({
                model: this.model
            }));
        },
        initialize: function(options) {
            this.model = options.model;
            var formattedService = this.model.get('service').replace('_', ' ');
            this.model.set({
                'service': formattedService,
                'newstartdate': moment().format('MM/DD/YYYY'),
                'newduedate': moment().format('MM/DD/YYYY'),
            });
        }
    });

    //end of function
});