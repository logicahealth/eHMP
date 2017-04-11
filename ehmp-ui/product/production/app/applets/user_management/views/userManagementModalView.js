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
            extraClasses: ["alertBannerContainer"]
        }],
        ui: {
            "alertBannerControl": ".alertBannerContainer"
        },
        onRender: function() {
            this.ui.alertBannerControl.trigger('control:icon', this.model.get('icon')).trigger('control:type', this.model.get('type')).trigger('control:title', this.model.get('title')).trigger('control:message', this.model.get('message'));
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
            if(!_.isUndefined(options.alertOptions)){
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
        showModal: function() {
            var modalOptions = {
                title: ADK.UserService.getUserSession().get('facility').toUpperCase() + ' User',
                size: 'medium',
                backdrop: false,
                keyboard: true,
                footerView: 'none'
            };
            var modalView = new ADK.UI.Modal({
                view: this,
                options: modalOptions
            });
            modalView.show();
        },
        events: {
            'click @ui.EditPermissionSetsButton': 'editPermissionSets'
        },
        editPermissionSets: function() {
            this.model.set('permissions', appletUtil.getPermissions());
            var permissionSetsSelectionView = userManagementPermissionSetSelectionView.createForm(this, this.model);
            ADK.UI.Modal.hide();
        }
    });


    return userModalView;
});