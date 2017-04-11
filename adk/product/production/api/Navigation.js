define([
    'underscore',
    'backbone',
    'jquery',
    'api/Messaging',
    'handlebars',
    'main/ui_components/alert/component'
], function(_, Backbone, $, Messaging, Handlebars, UIAlert) {
    'use strict';
    var CheckModel = Backbone.Model.extend({
        idAttribute: "id",
        defaults: {
            id: null,
            // used for browser's beforeunload check
            failureMessage: '',
            shouldNavigate: function(screenToNavigateTo) {
                return true;
            }
        }
    });
    var ChecksCollection = Backbone.Collection.extend({
        model: CheckModel
    });
    var DefaultPatientContextCheck = CheckModel.extend({
        defaults: {
            onFailure: null,
            onCancel: null,
            // TODO - future implementations of shouldNavigate will also contain the context you are navigating to.
            shouldNavigate: function(screenName, checkConfig) {
                if (_.some(['logon-screen', 'patient-search-screen', 'ehmp-administration', 'provider-centric-view' ], function(screen) {
                        return _.isEqual(screen, screenName);
                    })) {
                    var SimpleAlertItemView = Backbone.Marionette.ItemView.extend({
                        template: Handlebars.compile([
                            '<h5>Are you sure you want to navigate to: "' + screenName +'"?</h5>',
                            '<p>'+checkConfig.failureMessage+'</p>'
                        ].join('\n'))
                    });
                    var SimpleAlertFooterItemView = Backbone.Marionette.ItemView.extend({
                        template: Handlebars.compile([
                            '{{ui-button "Cancel" classes="btn-default alert-cancel" title="Click to cancel"}}',
                            '{{ui-button "Continue" classes="btn-primary alert-continue" title="Click to continue"}}'
                        ].join('\n')),
                        events: {
                            'click button.alert-cancel': function() {
                                UIAlert.hide();
                                if (_.isFunction(checkConfig.onCancel)){
                                    checkConfig.onCancel();
                                }
                            },
                            'click button.alert-continue': function() {
                                UIAlert.hide();
                                Events.unregisterCheck(checkConfig.id);
                                Events.navigate(screenName);
                            }
                        }
                    });
                    var alertView = new UIAlert({
                        title: "Warning",
                        icon: "fa-warning",
                        messageView: SimpleAlertItemView,
                        footerView: SimpleAlertFooterItemView
                    });
                    if (_.isFunction(checkConfig.onFailure)){
                        checkConfig.onFailure();
                    }
                    alertView.show();
                    return false;
                }
                return true;
            }
        }
    });
    var Events = {
        PatientContextCheck: DefaultPatientContextCheck,
        _navigationChecks: new ChecksCollection(),
        registerCheck: function(model) {
            return this._navigationChecks.add(model);
        },
        unregisterCheck: function(unique) {
            // unique is either the id string or the whole model
            return this._navigationChecks.remove(unique);
        },
        runChecks: function(methodToExecuteOnPass, screenName) {
            var failedCheck = this._navigationChecks.find(function(checkModel) {
                return !checkModel.get('shouldNavigate')(screenName, checkModel.toJSON());
            });
            if (_.isEmpty(failedCheck)) {
                methodToExecuteOnPass();
            }
        },
        getMessagesOfAllChecks: function() {
            var failureString = '';
            var failedCheck = this._navigationChecks.each(function(checkModel) {
                failureString = checkModel.get('failureMessage') + '\n\n';
            });
            return failureString;
        },
        navigate: function(screenName, routeOptions, extraScreenDisplayOptions) {
            if (screenName.charAt(0) === '#') {
                screenName = screenName.slice(1);
            }
            this.runChecks(function() {
                Messaging.trigger('screen:navigate', screenName);
                var globalChannel = Backbone.Wreqr.radio.channel('global');
                globalChannel.commands.execute('screen:navigate', screenName, routeOptions, extraScreenDisplayOptions);
            }, screenName);
        },
        displayScreen: function(screenName) {
            if (screenName.charAt(0) === '#') {
                screenName = screenName.slice(1);
            }
            this.runChecks(function() {
                Messaging.trigger('screen:display', screenName);
                var globalChannel = Backbone.Wreqr.radio.channel('global');
                globalChannel.commands.execute('screen:display', screenName);
            }, screenName);
        }
    };
    $(window).on('beforeunload', function() {
        var failureString = Events.getMessagesOfAllChecks();
        if (_.isEmpty(failureString)) {
            return;
        }
        return failureString;
    });
    return Events;
});