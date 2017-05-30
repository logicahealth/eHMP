define([
    'underscore',
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'moment',
    'app/applets/todo_list/statusNotCompletedView',
    'hbs!app/applets/todo_list/templates/statusModalFooterTemplate'
], function(_, Backbone, Marionette, $, Handlebars, moment, StatusNotCompletedView, StatusModalFooterTemplate) {
    'use strict';

    var newTaskNotification = new ADK.UI.Notification({
        icon: "fa fa-bell font-size-18 color-tertiary", // only matters if type: "basic"
        message: "New task notification(s) received",
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
            var duz = user.get('site') + ';' + user.get('duz')[user.get('site')];
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
        model: ADK.Resources.Model.extend({
            idAttribute: 'notificationId'
        }),
        resource: 'notifications-staff-indicator-list',
        initialize: function() {
            var user = ADK.UserService.getUserSession();
            var duz = user.get('site') + ';' + user.get('duz')[user.get('site')];
            this.DUZ = duz;
        },
        parse: function(response, attr) {
            var duz = this.DUZ;

            return _.sortBy(response.data, function(item) {
                var itemExpiration = moment(item.expiration);
                if (itemExpiration.isValid()) {
                    item.expirationFormatted = itemExpiration.format('MM/DD/YYYY HH:mm');
                    item.message.body = item.message.body.replace('{dateString}', item.expirationFormatted);
                }
                return _.findWhere(item.recipients, {
                    userId: duz
                }).salience;
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
            var duz = user.get('site') + ';' + user.get('duz')[user.get('site')];
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

    var CountView = Backbone.Marionette.ItemView.extend({
        tagName: 'strong',
        template: Handlebars.compile('{{#if getCount}}({{getCount}}){{/if}}'),
        templateHelpers: function() {
            return {
                'getCount': _.bind(function() {
                    return this.getOption('collection').length > 0 ? this.getOption('collection').length : false;
                }, this)
            };
        },
        modelEvents: {
            'change:dropdownTitle': 'render'
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

            this.listenTo(ADK.Messaging.getChannel('activities'), 'create:success', this.fetch);

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
            if (_.isUndefined(ADK.UserService.getStatus()) || ADK.UserService.getUserSession().get('status') !== ADK.UserService.STATUS.LOGGEDIN) {
                return;
            }
            if (!_.has(this, "countModel.xhr") || !_.isFunction(_.get(this, "countModel.xhr.state", null)) || this.countModel.xhr.state() !== "pending") {
                this.countModel.xhr = this.countModel.fetch();
            }
            if (!_.has(this, "growlerCollection.xhr") || !_.isFunction(_.get(this, "growlerCollection.xhr.state", null)) || this.growlerCollection.xhr.state() !== "pending") {
                this.growlerCollection.xhr = this.growlerCollection.fetch();
            }
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
                    var hasEditRequestPermission = ADK.UserService.hasPermissions('edit-coordination-request');
                    var hasRespondRequestPermission = ADK.UserService.hasPermissions('respond-coordination-request');
                    var navigation = this.model.get('navigation') || new Backbone.Model();
                    var parameter = navigation.get('parameter') || {};
                    var taskName = _.get(parameter, 'taskName');
                    var isReviewRequest = (taskName === 'Review');
                    var isResponseRequest = (taskName === 'Response');
                    var hasEditPermissions = !isReviewRequest || hasEditRequestPermission;
                    var hasRespondPermissions = !isResponseRequest || hasRespondRequestPermission;
                    if (!hasEditPermissions || !hasRespondPermissions) {
                        var activityId = _.get(parameter, 'activityId');
                        var modal = this.taskModal(activityId);
                        modal.show();
                    } else if (_.isObject(navigation)) {
                        var patientId = this.model.get('patientId');
                        ADK.PatientRecordService.setCurrentPatient(patientId, {
                            reconfirm: !isPatientContext,
                            navigation: !isPatientContext || (ADK.PatientRecordService.getCurrentPatient().get('pid') !== patientId),
                            staffnavAction: {
                                channel: navigation.get('channel'),
                                event: navigation.get('event'),
                                data: parameter //this should be parameters
                            }
                        });
                    }
                    ADK.Messaging.getChannel('ApplicationHeaderNotificationIcon').trigger('alert-dropdown.hide');
                    return false;
                }
            },
            serializeModel: function() {
                var modelJSON = this.model.toJSON();
                modelJSON.title = 'Item ' + (this._index + 1) + '. Press enter to view notifications.';
                return modelJSON;
            },
            getTemplate: function() {
                var navigation = this.model.get('navigation') || new Backbone.Model();
                var parameter = navigation.get('parameter') || {};
                var taskName = _.get(parameter, 'taskName');
                var hasPermissions = true;
                if (taskName === 'Review') {
                    hasPermissions = ADK.UserService.hasPermissions('edit-coordination-request');
                } else if (taskName === 'Response') {
                    hasPermissions = ADK.UserService.hasPermissions('respond-coordination-request');
                }
                this.model.set('hasPermissions', hasPermissions);
                return Handlebars.compile(
                    '<a href="#" title="{{title}}" class="dd-link" role="menuitem" tabindex="-1">' +
                    '{{#if hasPermissions}}<i class="fa fa-arrow-right"></i>{{/if}}' +
                    '<div class="row right-margin-no left-margin-no">' +
                    '<div class="col-xs-12 left-padding-md pre-wrap word-wrap-break-word word-break-break-word">' +
                    '<div><strong>{{patientName}} ({{last4OfSSN}})</strong></div>' +
                    '<div>{{message.subject}}</div>' +
                    '<div>{{message.body}}</div>' +
                    '</div></div></a>'
                );
            },
            taskModal: function(activityId) {
                var headerView = Backbone.Marionette.ItemView.extend({
                    template: Handlebars.compile('<div class="container-fluid"><div class="row"><div class="col-xs-11"><h4 class="modal-title" id="mainModalLabel"><i class="fa fa-ban font-size-18 color-red-dark right-padding-xs" aria-hidden="true"></i>Task Cannot Be Completed</h4></div><div class="col-xs-1 text-right top-margin-sm"><button type="button" class="close btn btn-icon btn-xs left-margin-sm" data-dismiss="modal" title="Press enter to close."><i class="fa fa-times fa-lg"></i></button></div></div></div>')
                });
                var footerView = Backbone.Marionette.ItemView.extend({
                    template: StatusModalFooterTemplate,
                    model: new Backbone.Model({
                        params: {
                            processId: activityId
                        }
                    }),
                    events: {
                        'click #activDetailBtn': 'activDetail'
                    },
                    activDetail: function(event) {
                        event.preventDefault();
                        ADK.Messaging.getChannel('task_forms').request('activity_detail', this.model.get('params'));
                    }
                });
                var view = new StatusNotCompletedView({
                    model: new Backbone.Model({
                        reason: '',
                        icon: 'fa-exclamation-circle',
                        color: 'color-red'
                    })
                });
                var modalOptions = {
                    'size': 'normal',
                    'headerView': headerView,
                    'footerView': footerView
                };
                var modal = new ADK.UI.Modal({
                    view: view,
                    options: modalOptions
                });

                return modal;
            }
        }),
        ButtonView: ADK.UI.AlertDropdown.ButtonView.extend({
            modelEvents: {
                'change alert_count': function(model) {
                    this.render();
                }
            },
            getTemplate: function() {
                return Handlebars.compile([
                    '<i class="fa {{icon}} font-size-18"></i>',
                    '{{#if alert_count}}',
                    '<span class="badge badge--notification">{{alert_count}}</span>',
                    '{{/if}}'
                ].join('\n'));
            }
        }),
        DropdownListView: ADK.UI.AlertDropdown.DropdownListView.extend({
            initialize: function() {
                this.model.set('dropdownTitle', 'MY TASK NOTIFICATIONS');
                this.collection.fetch();
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
                    '<span class="numeric-notification-count-container"></span>',
                    '</p>',
                    '</div>{{/if}}',
                    '<ul class="dropdown-body list-group" role="menu" tabindex="-1"></ul>',
                    '{{#if footerButton}}<div class="dropdown-footer">',
                    '<button type="button" class="btn btn-link {{footerButton.extraClasses}}" title="{{footerButton.title}}">{{footerButton.label}}</button>',
                    '{{/if}}</div>'
                ].join('\n'));
            },
            onRenderTemplate: function() {
                this.regionManager = new Backbone.Marionette.RegionManager({
                    regions: {
                        'countRegion': Backbone.Marionette.Region.extend({
                                el: this.$('.numeric-notification-count-container')
                            }) // if dropdownTitle needs to be dynamic, control with new region/view here
                    }
                });
                this.regionManager.get('countRegion').show(new CountView({
                    model: this.model,
                    collection: this.collection
                }));
            },
            onBeforeDestroy: function() {
                this.regionManager.destroy();
            }
        })
    });

    return AlertDropdown;
});
