define([
    'underscore',
    'handlebars',
    'backbone',
    'marionette',
    'api/Messaging',
    'app/applets/ordersearch/orderSearchView'
], function(_, Handlebars, Backbone, Marionette, Messaging, OrderSearchView) {
    'use strict';

    var ActionTray = ADK.Views.TrayActionSummaryList.extend({
        options: {
            key: "actions",
            headerLabel: "Actions",
        }
    });

    var trayView = ADK.UI.Tray.extend({
        attributes: {
            id: 'patientDemographic-action',
        },
        options: {
            tray: ActionTray,
            position: 'right',
            buttonLabel: 'Actions',
            eventChannelName: 'actionTray'
        },
        initialize: function(options) {
            var d = $.Deferred();
            var self = this;
            var channel = ADK.Messaging.getChannel('action');
            channel.reply('getActionTray', function() {

                d.resolve({
                    tray: self
                });
                return d.promise();
            });

            ADK.Messaging.getChannel(this.options.eventChannelName).on('tray.hidden', function() {
                onNewAction(ActionTray);
            });
        }
    });

    function onNewAction(view) {
        var TrayView = Messaging.request("tray:writeback:actions:trayView");
        if (TrayView) {
            if (view) {
                TrayView.$el.trigger('tray.swap', view);
            } else {
                TrayView.$el.trigger('tray.swap', OrderSearchView);
            }
        }
    }

    ADK.Messaging.trigger('register:component', {
        type: "tray",
        key: "actions",
        group: "writeback",
        orderIndex: 20,
        view: trayView,
        shouldShow: function() {
            // return ADK.PatientRecordService.isPatientInPrimaryVista() && ADK.UserService.hasPermissions('add-immunization|add-allergy|add-vital');
            return true;
        }
    });

    ADK.Messaging.trigger('register:component:item', {
        type: "tray",
        key: 'actions',
        label: 'Action',
        onClick: onNewAction,
        shouldShow: function() {
            return true;
        }
    });

    return ActionTray;
});