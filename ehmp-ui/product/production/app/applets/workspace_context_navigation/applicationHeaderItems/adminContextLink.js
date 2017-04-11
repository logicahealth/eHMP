define([
    'underscore',
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'app/applets/workspace_context_navigation/applicationHeaderItems/contextLinkView'
], function(
    _,
    Backbone,
    Marionette,
    $,
    Handlebars,
    ContextLinkView
) {
    'use strict';

    var AdminContextLinkView = ContextLinkView.extend({
        getContext: function(){
            return 'admin';
        },
        label: 'Access Control',
        icon: '<i class="fa fa-user-md"></i>'
    });

    ADK.Messaging.trigger('register:component', {
        type: "applicationHeaderItem",
        group: "right",
        key: "adminContextLink",
        view: AdminContextLinkView,
        orderIndex: 2,
        shouldShow: function() {
            return (ADK.UserService.hasPermissions('read-admin-screen'));
        }
    });

    return AdminContextLinkView;
});