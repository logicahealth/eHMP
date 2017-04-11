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

    var StaffContextLinkView = ContextLinkView.extend({
        getContext: function(){
            return 'staff';
        },
        label: 'Staff View',
        icon: '<i class="fa fa-home fa-lg"></i>'//,
        // isActive: function(model){
        //     return _.isEqual(model.get('context'), this.getContext()) && !_.isEqual(model.get('workspace'), 'my-notifications-full') ? true : false;
        // }
    });

    ADK.Messaging.trigger('register:component', {
        type: "applicationHeaderItem",
        group: "right",
        key: "staffContextLink",
        view: StaffContextLinkView,
        orderIndex: 3
    });

    return StaffContextLinkView;
});