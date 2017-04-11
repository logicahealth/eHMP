define([
    'backbone',
    'marionette',
    'handlebars',
    'underscore',
    'app/applets/user_management/appletUtil',
    'app/applets/user_management/views/userManagementView'
], function(Backbone, Marionette, Handlebars, _, appletUtil, userManagementView) {
    'use strict';

    var map = appletUtil.getPermissionSetsMap();

    var mapping = function(context) {
        if (map) {
            return map[this];
        }
        return this;
    };
    Handlebars.registerHelper('mapping', mapping);

    var BulkEditButtonView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('<button type="button" class="applet-bulk-user-edit-button btn btn-sm btn-icon" tooltip-data-key="Bulk Edit" title="" data-original-title="Bulk Edit"><i class="fa fa-user"></i><i class="fa fa-user"></i><i class="fa fa-pencil"></i><span class="sr-only">Press enter to open bulk user edit workflow</span></i></button>'),
        tagName: 'span',
        events: {
            'click .applet-bulk-user-edit-button': 'onClickBulkEditButton'
        },
        onClickBulkEditButton: function() {
            ADK.Messaging.trigger('users-applet:launch-bulk-edit');
        }
    });
    var applet = {
        id: 'user_management',
        getRootView: function(viewTypeOption) {
            return ADK.Views.AppletControllerView.extend({
                viewType: viewTypeOption
            });
        },
        viewTypes: [{
            type: 'summary',
            view: userManagementView,
            chromeEnabled: true,
            chromeOptions: {
                additionalButtons: [{
                    'id': 'bulk-user-edit-button',
                    'view': BulkEditButtonView
                }]
            }
        }, {
            type: 'expanded',
            view: userManagementView,
            chromeEnabled: true,
            chromeOptions: {
                additionalButtons: [{
                    'id': 'bulk-user-edit-button',
                    'view': BulkEditButtonView
                }]
            }
        }],
        defaultViewType: 'summary'
    };

    return applet;
});