define([
    'underscore',
    'backbone',
    'marionette',
    'jquery',
    'handlebars'
], function(_, Backbone, Marionette, $, Handlebars) {
    'use strict';

    var newTaskNotification = new ADK.UI.Notification({
        icon: "fa fa-bell font-size-18", // only matters if type: "basic"
        message: "NEW task notification(s) received",
        type: "basic",
        autoClose: false, // prevents from closing automatically after 10 seconds
        //Do not remove. This is a workaround suggested by Josh Bell for closing the growler on onClick
        onClick: function() { // an optional callback function to be invoked on click event
            return;
        }
    });

    var Model = ADK.Resources.Model.extend({
        resource: 'notifications-staff-indicator-summary',
        parse: function(response) {
            var data = response.data;
            data.alert_count = data.count;
            return data;
        },
        defaults: function() {
            var user = ADK.UserService.getUserSession();
            var duz = user.get('duz')[user.get('site')];
            return {
                'DUZ': duz
            };
        },
        methodMap: {
            'read': {
                parameters: {
                    'userId': 'DUZ'
                }
            }
        }
    });

    var Collection = ADK.Resources.Collection.extend({
        resource: 'notifications-staff-indicator-list',
        initialize: function() {
            var user = ADK.UserService.getUserSession();
            var duz = user.get('duz')[user.get('site')];
            this.DUZ = duz;
        },
        parse: function(response, attr) {
            var duz = this.DUZ;
            return _.each(_.sortBy(response.data, function(item) {
                return _.findWhere(item.recipients, {
                    userId: duz
                }).salience;
            }), function(item, index) {
                item.title = 'Item ' + (index + 1) + '. Press enter to view notifications.';
            });

        },
        methodMap: {
            'read': {
                parameters: {
                    'userId': 'DUZ'
                }
            }
        }
    });

    var GrowlerCollection = ADK.Resources.Collection.extend({
        resource: 'notifications-staff-growler-list',
        initialize: function() {
            var user = ADK.UserService.getUserSession();
            var duz = user.get('duz')[user.get('site')];
            this.DUZ = duz;
        },
        parse: function(response) {
            return response.data;
        },
        methodMap: {
            'read': {
                parameters: {
                    'userId': 'DUZ'
                }
            }
        }
    });

    var AlertDropdown = ADK.UI.AlertDropdown.extend({
        tagName: 'li',
        icon: 'fa-bell',
        id: 'myNotificationsButton',
        backdrop: true,
        onBeforeInitialize: function() {
            var self = this;
            this.growlerCollection = new GrowlerCollection();
            this.countModel = new Model();
            this.newIdCollection = [];
            this.oldIdCollection = [];
            this.processed = false;

            this.listenTo(ADK.Messaging, 'app:logout', function() {
                ADK.UI.Notification.hide();
            });

            this.listenTo(this.countModel, 'read:success', function(fetchedModel) {
                this.model.set({
                    'alert_count': fetchedModel.get('count'),
                    'icon': (fetchedModel.get('count') > 0) ? 'fa-bell' : 'fa-bell-o'
                });
            });

            this.listenTo(this.growlerCollection, 'read:success', function(fetchedModel) {
                this.newIdCollection = fetchedModel.pluck('notificationId');
                this.difference = _.difference(this.newIdCollection, this.oldIdCollection);
                _.extend(this.oldIdCollection, this.newIdCollection);

                if (this.processed && !_.isEmpty(this.difference)) {
                    newTaskNotification.show();
                }
                this.processed = true;
            });

            this.listenTo(ADK.Messaging, 'screen:navigate', this.fetch);

            this.listenTo(ADK.Messaging, 'tray.opened', this.fetch);

            this.listenTo(this, 'dropdown.show', this.fetch);

            this.listenTo(ADK.Messaging, 'refresh:allData', this.fetch);

            this.countModel.fetch();
            this.growlerCollection.fetch();

            this.collection = new Collection();
            this.listenTo(this.collection, 'read:success', function(fetchedModel) {
                this.model.set('dropdownTitle', 'MY TASK NOTIFICATIONS ');
            });

            this.timer = setInterval(function() {
                self.countModel.fetch();
                self.growlerCollection.fetch();
            }, 300000);
        },
        fetch: function() {
            this.countModel.fetch();
            this.growlerCollection.fetch();
        },
        onDestroy: function() {
            clearInterval(this.timer);
        },
        RowView: ADK.UI.AlertDropdown.RowView.extend({
            ui: {
                'rowitem': 'a'
            },
            events: {
                'click @ui.rowitem': function() {
                    var isPatientSearch = ADK.WorkspaceContextRepository.currentWorkspace.id === 'patient-search-screen';
                    var isPatientContext = ADK.WorkspaceContextRepository.currentContext.id === 'patient' && !isPatientSearch;
                    var navigation = this.model.get('navigation');
                    if (_.isObject(navigation)) {
                        ADK.PatientRecordService.setCurrentPatient(this.model.get('patientId'), {
                            reconfirm: !isPatientContext,
                            navigation: !isPatientContext || (ADK.PatientRecordService.getCurrentPatient().get('pid') !== this.model.get('patientId')),
                            staffnavAction: {
                                channel: navigation.get('channel'),
                                event: navigation.get('event'),
                                data: navigation.get('parameter') //this should be parameters
                            }
                        });
                    }
                    ADK.Messaging.getChannel('ApplicationHeaderNotificationIcon').trigger('alert-dropdown.hide');
                    return false;
                }
            },
            getTemplate: function() {
                return Handlebars.compile('<a href="#" title="{{title}}" class="dd-link fa fa-arrow-right"><div class="row right-margin-no left-margin-no"><div class="col-xs-12 left-padding-md pre-wrap word-wrap-break-word word-break-break-word"><div><strong>{{patientName}} ({{last4OfSSN}})</strong></div><div>{{message.subject}}</div><div>{{message.body}}</div></div></div></a>');
            }
        }),
        ButtonView: ADK.UI.AlertDropdown.ButtonView.extend({
            getTemplate: function() {
                return Handlebars.compile([
                    '<i class="fa {{icon}} font-size-18"></i>',
                    '{{#if alert_count}}',
                    '<span class="badge font-size-11">{{alert_count}}</span>',
                    '{{/if}}'
                ].join('\n'));
            }
        }),
        DropdownListView: ADK.UI.AlertDropdown.DropdownListView.extend({
            initialize: function() {
                this.model.set('dropdownTitle', 'MY TASK NOTIFICATIONS');
                this.collection.fetch();
            },
            modelEvents: {
                'change dropdownTitle': function(model) {
                    this.render();
                }
            },
            getTemplate: function() {
                return Handlebars.compile([
                    '{{#if dropdownTitle}}<div class="dropdown-header left-padding-sm" aria-live="polite">',
                    '<p>',
                    '{{#if alert_count}}',
                    '<strong>{{dropdownTitle}}</strong>',
                    '{{else}}',
                    '<span>No Notifications Found</span>',
                    '{{/if}}',
                    '{{#if count}}<span><strong>({{count}})</strong></span>{{/if}}',
                    '</p>',
                    '</div>{{/if}}',
                    '<ul class="dropdown-body list-group"></ul>',
                    '{{#if footerButton}}<div class="dropdown-footer">',
                    '<button type="button" class="btn btn-link {{footerButton.extraClasses}}" title="{{footerButton.title}}">{{footerButton.label}}</button>',
                    '{{/if}}</div>'
                ].join('\n'));
            }
        })
    });


    ADK.Messaging.trigger('register:component', {
        type: 'applicationHeaderItem',
        group: "user-nav-alerts",
        title: 'Notifications Button. Press enter to view notifications.',
        orderIndex: 1,
        key: 'ApplicationHeaderNotificationIcon',
        view: AlertDropdown
    });

    return AlertDropdown;
});