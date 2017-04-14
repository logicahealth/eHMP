define([
    'underscore',
    'api/Messaging',
    'api/UserService'
], function(_, Messaging, UserService) {
    'use strict';

    var GlobalHelpButton = Backbone.Marionette.ItemView.extend({
        template: false,
        className: 'help-button-container',
        behaviors: {
            Tooltip: {},
            HelpLink: {
                mapping: 'ehmp_header',
                buttonOptions: {
                    icon: 'fa-question-circle'
                }
            }
        }
    });

    var PredefinedComponents = {
        register: function(){
            Messaging.trigger('register:component', {
                type: 'applicationHeaderItem',
                orderIndex: 1,
                key: 'globalHelp',
                group: 'user-nav-actions',
                view: GlobalHelpButton,
                shouldShow: function() {
                    return UserService.getStatus() !== 'loggedout';
                }
            });
        }
    };

    return PredefinedComponents;
});

