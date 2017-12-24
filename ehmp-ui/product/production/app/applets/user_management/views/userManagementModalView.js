define([
    'backbone',
    'marionette',
    'app/applets/user_management/views/userManagementPermissionSetSelectionView',
    'hbs!app/applets/user_management/templates/userManagementModalTemplate',
    'app/applets/user_management/appletUtil'
], function(Backbone, Marionette, userManagementPermissionSetSelectionView, userManagementModalTemplate, appletUtil) {
    "use strict";
    var AlertViewModel = Backbone.Model.extend({
        defaults: {
            alertMessage: "",
        }
    });
    var AlertView = ADK.UI.Form.extend({
        fields: [{
            control: "alertBanner",
            name: "message",
            dismissible: true,
            extraClasses: ["alert-banner-container"]
        }],
        ui: {
            "alertBannerControl": ".alert-banner-container"
        },
        onRender: function() {
            this.ui.alertBannerControl.trigger('control:update:config', {
                icon: this.model.get('icon'),
                type: this.model.get('type'),
                title: this.model.get('title'),
                message: this.model.get('message')
            });
        }
    });
    var userModalView = Backbone.Marionette.LayoutView.extend({
        template: userManagementModalTemplate,
        regions: {
            alertRegion: "#alertRegionContainer"
        },
        ui: {
            'EditPermissionSetsButton': '.edit-permission-sets-btn'
        },
        initialize: function(options) {
            this.alertViewOptions = {};
            this.showAlertView = false;
            if (!_.isUndefined(options.alertOptions)) {
                this.showAlertView = true;
                this.alertViewOptions = options.alertOptions;
            }
        },
        onRender: function() {
            this.showAlert = true;
            if (this.showAlertView) {
                this.alertRegion.show(new AlertView({
                    model: new AlertViewModel(this.alertViewOptions)
                }));
            }
            var session = ADK.UserService.getUserSession();
            var currentUserDuz = session.get('duz')[session.get('site')];
            if (this.model.get('duz').toString() === currentUserDuz && !ADK.UserService.hasPermission('edit-own-permissions')) {
                this.ui.EditPermissionSetsButton.prop("disabled", true);
            }
        },
        showModal: function(triggerElement) {
            var modalOptions = {
                title: ADK.UserService.getUserSession().get('facility').toUpperCase() + ' User',
                size: 'medium',
                backdrop: false,
                keyboard: true
            };
            var modalView = new ADK.UI.Modal({
                view: this,
                options: modalOptions
            });
            var showModalOptions = {};
            if (!_.isUndefined(triggerElement)) {
                this.triggerElement = triggerElement;
                showModalOptions.triggerElement = triggerElement;
            }
            modalView.show(showModalOptions);
        },
        events: {
            'click @ui.EditPermissionSetsButton': 'editPermissionSets'
        },
        editPermissionSets: function() {
            var permissionSetsSelectionView = userManagementPermissionSetSelectionView.createForm(this, this.model, this.triggerElement);
            ADK.UI.Modal.hide();
        }
    });


    return userModalView;
});