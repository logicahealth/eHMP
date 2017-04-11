define([
    'handlebars',
    'backbone',
    'marionette',
    'underscore',
    'api/Messaging',
    "hbs!main/components/views/notificationsPopUpTemplate"
], function(Handlebars, Backbone, Marionette, _, Messaging, PopupTemplate) {
    'use strict';



    return {
        show: function(options) {
            var globalNotificationsCollection = options.globalNotificationsCollection;
            var i, getAllNotifications = false;
            var siteCode = ADK.UserService.getUserSession().get('site');
            var duz = ADK.UserService.getUserSession().get('duz')[siteCode];
            var getAlertNotificationsUrl = 'resource/fhir/communicationrequest/' + siteCode + ';' + duz;
            var setCompletedUrl = 'resource/fhir/communicationrequest/setstatus/completed/' + siteCode + ';' + duz;
            if (this.options !== undefined && this.options.getAllNotifications === true) {
                getAllNotifications = true;
            }

            var NotificationModel = Backbone.Model.extend({
                url: function() {
                    return;
                }
            });

            var NotificationsCollection = Backbone.Collection.extend({
                model: NotificationModel,
                url: getAlertNotificationsUrl
            });

            this.collection = new NotificationsCollection();

            this.collection.fetch({
                data: {
                    priority: 'ehmp/msg/priority/alert',
                    status: 'received'
                },
                success: function(collection, response, options) {
                    if (collection && collection.models && collection.models.length > 0) {
                        if (getAllNotifications) {
                            for (i = 0; i < collection.length; i++) {
                                globalNotificationsCollection.push(collection.models[i]);
                            }
                        } else {
                            if (collection.models[collection.length - 1].attributes !== undefined && collection.models[collection.length - 1].attributes.identifier !== undefined) {
                                if (_.find(globalNotificationsCollection.models, function(elem) {
                                        return elem.attributes.identifier.value === collection.models[collection.length - 1].attributes.identifier.value;
                                    }) === undefined) {
                                    globalNotificationsCollection.push(collection.models[collection.length - 1]);
                                }
                            }
                        }
                        var showModal = function(model) {
                            if (model) {
                                model.attributes.shown = true;
                                var result = _.find(model.attributes.payload, function(e) {
                                    return 'contentString' in e;
                                });

                                var resultParsed = {};

                                try {
                                    resultParsed = JSON.parse(result.contentString);
                                } catch (err) {
                                    resultParsed = {
                                        "title": "ALERT",
                                        "content": ""
                                    };
                                }

                                model.set("contentStringParsed", resultParsed);

                                var popupOptions = {};
                                if (model.attributes !== undefined && model.attributes.contentStringParsed !== undefined) {
                                    popupOptions.title = model.attributes.contentStringParsed.title;
                                }
                                if (model.attributes !== undefined && model.attributes.sender !== undefined) {
                                    popupOptions.notificationSender = model.attributes.sender.reference;
                                }
                                if (model.attributes !== undefined && model.attributes.subject !== undefined) {
                                    popupOptions.notificationSubject = model.attributes.subject.reference;
                                }
                                if (model.attributes !== undefined && model.attributes.contentStringParsed !== undefined) {
                                    popupOptions.notificationText = model.attributes.contentStringParsed.content;
                                }

                                var defaultPopup = {
                                    title: 'Notification title',
                                    notificationSender: 'Notification sender',
                                    notificationSubject: 'Notification subject',
                                    notificationText: 'Notification text',
                                };
                                var PopupView = Backbone.Marionette.ItemView.extend({
                                    tag: 'div',
                                    attributes: {
                                        'role': 'dialog',
                                        'tabindex': '-1'
                                    },
                                    id: 'base-modal',
                                    className: 'modal fade',
                                    template: PopupTemplate,
                                    regions: {
                                        dialog: '#notifications-alert-dialog'
                                    },
                                    isShown: false,
                                    events: {
                                        "shown.bs.modal": "focus",
                                        "click #OkBtn": "readNotification",
                                    },

                                    readNotification: function(e) {
                                        e.preventDefault();
                                        notificationsPopUp.hide();
                                        model.save(null, {
                                            url: setCompletedUrl + '/' + model.id,
                                            success: function(model, response) {
                                                globalNotificationsCollection.pop();
                                                if (getAllNotifications && globalNotificationsCollection.models.length > 0) {
                                                    showModal(globalNotificationsCollection.models[globalNotificationsCollection.models.length - 1]);
                                                }
                                            },
                                            error: function(model, response) {
                                                var alertView = new ADK.UI.Notification({
                                                    title: 'Notification error',
                                                    icon: 'fa-info',
                                                    type: 'warning',
                                                    message: 'The notification cannot be marked as completed!'
                                                });
                                                alertView.show();
                                            }
                                        });
                                    },


                                    show: function() {
                                        this.render();
                                        this.$el.modal('show');
                                        $(this.dialog).show();
                                    },

                                    hide: function() {
                                        this.$el.modal('hide');
                                    },


                                    focus: function() {
                                        $(this.dialog).focus();
                                    },

                                    setModel: function(popup) {
                                        this.model.set(popup, {
                                            'silent': true
                                        });
                                    },

                                    extendDefaultModel: function(options) {
                                        return _.extend(_.clone(defaultPopup), options);
                                    }
                                });

                                var notificationsPopUp = new PopupView({
                                    model: model
                                });

                                var popupModel = notificationsPopUp.extendDefaultModel(popupOptions);
                                notificationsPopUp.setModel(popupModel);
                                notificationsPopUp.show();

                            }
                        };
                        if (globalNotificationsCollection.models[globalNotificationsCollection.models.length - 1].attributes.shown === undefined) {
                            showModal(globalNotificationsCollection.models[globalNotificationsCollection.models.length - 1]);
                        }
                    }
                }
            });
        }
    };
});