define([
    'backbone',
    'hbs!app/applets/addApplets/templates/deleteMessage',
    'hbs!app/applets/addApplets/templates/deleteFooter'
], function(Backbone, messageTemplate, footerTemplate) {
   'use strict';


    var MessageView = Backbone.Marionette.ItemView.extend({
        template: messageTemplate
    });


    var FooterView = Backbone.Marionette.ItemView.extend({
        template: footerTemplate,
        ui: {
            abort: '.btn-default',
            confirm: '.btn-danger'
        },
        events: {
            'click @ui.abort': 'abort',
            'click @ui.confirm': 'confirm'
        },

        abort: function abort() {
            ADK.UI.Alert.hide();
            this.model.get('triggerElement').focus();
        },

        confirm: function confirm() {
            ADK.UI.Alert.hide();
            ADK.UI.FullScreenOverlay.hide();
            ADK.ADKApp.ScreenPassthrough.deleteUserScreen(this.model.get('screenId'));
            ADK.Navigation.goToDefault();
        }
    });


    return function launchDeleteModal(screenId, screenTitle, triggerElement) {
        var deleteMessageModel = new Backbone.Model({
            screenTitle: screenTitle
        });

        var deleteFooterModel = new Backbone.Model({
            screenId: screenId,
            triggerElement: triggerElement
        });

        var deleteAlertView = new ADK.UI.Alert({
            title: 'Delete',
            icon: 'icon-triangle-exclamation',
            messageView: MessageView.extend({
                model: deleteMessageModel
            }),
            footerView: FooterView.extend({
                model: deleteFooterModel
            })
        });

        deleteAlertView.show();
    };
});