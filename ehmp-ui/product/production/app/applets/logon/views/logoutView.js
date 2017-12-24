define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars'
], function(Backbone, Marionette, _, Handlebars) {
    "use strict";

    var LogoutAlertItemView = Backbone.Marionette.ItemView.extend({
        template: '<p>Are you sure you want to sign out?</p>'
    });

    var LogoutAlertFooterItemView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile([
            '{{ui-button "No" classes="btn-default btn-sm alert-cancel"}}',
            '{{ui-button "Yes" classes="btn-primary btn-sm alert-continue" title="Sign out"}}'
        ].join('\n')),
        events: {
            'click .alert-cancel': function() {
                ADK.UI.Alert.hide();
            },
            'click .alert-continue': function(e) {
                e.preventDefault();
                ADK.Checks.run('navigation', function() {
                    ADK.Messaging.trigger('app:logout');
                }, {
                    screenName: 'logon-screen'
                });
            }
        }
    });

    var LogoutButton = Backbone.Marionette.ItemView.extend({
        behaviors: {
            Tooltip: {
                trigger: 'hover focus',
                placement: 'left'
            }
        },
        template: Handlebars.compile('{{ui-button "Sign out" classes="btn-icon" title="Sign out" icon="fa-sign-out font-size-18" srOnlyLabel=true attributes=\'data-toggle="tooltip"\'}}'),
        events: {
            'click button': function() {
                var alertView = new ADK.UI.Alert({
                    title: "Sign Out Confirmation",
                    icon: "fa-sign-out font-size-18 color-primary",
                    messageView: LogoutAlertItemView,
                    footerView: LogoutAlertFooterItemView
                });
                alertView.show();
            }
        }
    });

    function register() {
        ADK.Messaging.trigger('register:component', {
            type: 'applicationHeaderItem',
            orderIndex: 10,
            key: 'logout',
            group: 'user-nav-actions',
            view: LogoutButton,
            shouldShow: function() {
                return ADK.UserService.getStatus() !== 'loggedout';
            }
        });
    }

    return {
        LogoutButton: LogoutButton,
        register: register
    };
});
