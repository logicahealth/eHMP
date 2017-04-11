define([
        'backbone',
        'marionette',
        'underscore',
        'handlebars',
        'app/applets/task_forms/activities/simple_activity/utils/appletHelper',
        'hbs!app/applets/task_forms/activities/simple_activity/templates/startActivityTemplate',
        'app/applets/task_forms/activities/simple_activity/views/changedActivityHeaderView',
        'app/applets/task_forms/activities/simple_activity/views/changedActivityFooterView',
        'app/applets/task_forms/activities/simple_activity/utils/countdown'
    ],
    function(Backbone, Marionette, _, Handlebars, AppletHelper, StartActivityTemplate, changedActivityHeaderView, changedActivityFooterView, countdown) {
        "use strict";

        var ExampleFormModel = Backbone.Model.extend({
            toJSON: function(forSendingToServer) {
                var startinterval;
                if (!forSendingToServer) {
                    return _.clone(this.attributes);
                }
                var clone = _.clone(this.attributes);
                clone.startdate = moment(clone.startdate + ' ' + clone.starttime).format('YYYY-MM-DD HH:mm');
                clone.duedate = moment(clone.duedate + ' ' + clone.duetime).format('YYYY-MM-DD HH:mm');

                if (moment(clone.startdate).valueOf() <= moment().valueOf()) {
                    startinterval = '0';
                } else {
                    startinterval = countdown(
                        moment().toDate(),
                        moment(clone.startdate).toDate(),
                        countdown.DAYS | countdown.HOURS | countdown.MINUTES | countdown.SECONDS
                    );

                    startinterval = '' + (startinterval.days + 'd') + (startinterval.hours + 'h') + (startinterval.minutes + 'm') + (startinterval.seconds + 's');
                }

                clone.startinterval = startinterval;

                delete clone.duetime;
                delete clone.starttime;
                clone.service = clone.service.replace(/\s/g, '_').toLowerCase();
                clone.team = clone.team.replace(/\s/g, '_').toLowerCase();
                clone.role = clone.role.replace(/\s/g, '_').replace(/[\(\)]/g, '').toLowerCase();
                return clone;
            },
            validate: function(attributes, options) {
                this.errorModel.clear();

                var errormsgs = {
                    'tasktype': 'Select a Activity',
                    'startdate': 'Select a Start Date',
                    'starttime': 'Select a Start Time',
                    'duedate': 'Select a Due Date',
                    'duetime': 'Select a Due Time',
                    'todonote': 'Enter Todo Notes',
                    'taskname': 'Select a Task',
                    'priority': 'Select a Priority',
                };

                for (var key in errormsgs) {
                    if ($.trim(this.get(key)) === '') {
                        this.errorModel.set(key, errormsgs[key]);
                    }
                }

                if (!_.isEmpty(this.errorModel.toJSON())) {
                    return "Validation errors. Please fix.";
                }

            }
        });

        var emodel = new ExampleFormModel();

        var StartProcessForm = ADK.UI.Form.extend({
            _super: ADK.UI.Form.prototype,
            model: emodel,
            firstTime: 0,
            ui: {
                "startProcessForm": ".row",
            },
            initialize: function(options) {
                this.fields = AppletHelper.fields(options.activityTypes);
                this.model.set({
                    'patientname': ADK.PatientRecordService.getCurrentPatient().get('displayName'),
                    'patientid': ADK.PatientRecordService.getCurrentPatient().get('pid'),
                    'startdate': moment().format('MM/DD/YYYY'),
                    'starttime': '',
                    'duedate': moment().format('MM/DD/YYYY'),
                    'duetime': '',
                    'priority': 'Normal',
                    'tasktype': '',
                    'todonote': '',
                    'out_completionnote': '',
                    'taskname': 'To Do'
                });

                this._super.initialize.apply(this, arguments);

                if (this.model.errorModel) {
                    this.model.errorModel.clear();
                }
            },
            modelEvents: {
                'change:tasktype': 'onActivityChanged',
                'change:startdate': 'onStartDateChanged'
            },
            clearFormFields: function() {
                $('form').find('select, textarea').val('');

            },
            onStartDateChanged: function(model, name) {
                this.model.set('duedate', name);
            },
            onActivityChanged: function(model, name) {
                this.firstTime++;
                if (this.model.get('tasktype') !== '') {
                    this.$(this.ui.startProcessForm).removeClass('hidden');
                }

                if (model.previous('tasktype') && this.firstTime > 0) {
                    new ADK.UI.Alert({
                        title: 'New Activity Selected!',
                        icon: 'icon-warning-severe',
                        messageView: changedActivityHeaderView,
                        footerView: changedActivityFooterView.extend({
                            model: model
                        })
                    }).show();
                }
            }
        });

        return Backbone.Marionette.LayoutView.extend({
            template: StartActivityTemplate,
            formModel: emodel,
            model: emodel,
            initialize: function() {
                var pcmm = ADK.UserService.getUserSession().get('data').pcmm[0];
                this.model = emodel;
                this.model.set({
                    'service': pcmm.service.slice(0, 1).toString().toLowerCase(),
                    'role': pcmm.roles.slice(0, 1).toString().toLowerCase(),
                    'team': 'team1'
                });
            },
            regions: {
                formElements: '.form-elements',
                activity: '.activity'
            },
            onShow: function() {
                var self = this;
                var fetchOptions = {
                    cache: true,
                    resourceTitle: 'activities-available',
                    pageable: false,
                    onSuccess: function(collection) {
                        var activityTypes = collection.map(function(model) {
                            return {
                                label: model.get('name'),
                                value: model.get('id')
                            };
                        });

                        activityTypes.unshift({
                            label: 'Select Activity',
                            value: ''
                        });

                        self.formElements.show(new StartProcessForm({
                            activityTypes: activityTypes
                        }));

                    }
                };
                ADK.ResourceService.fetchCollection(fetchOptions);

            }
        });

    });
