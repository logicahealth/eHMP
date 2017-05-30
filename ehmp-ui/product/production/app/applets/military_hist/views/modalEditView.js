define([
    'backbone',
    'moment'
], function(Backbone, moment) {
    "use strict";

    var currentUser = ADK.UserService.getUserSession();

    var errorMessageContainer = {
        control: "alertBanner",
        name: "errorMessage",
        title: "Unable To Submit",
        extraClasses: ["col-xs-12"],
        type: "danger",
        dismissible: false
    };

    var FormFields = [{
        control: "container",
        extraClasses: ["modal-body"],
        items: [errorMessageContainer, {
            control: "container",
            extraClasses: ["container-fluid"],
            items: [{
                control: "textarea",
                name: "description",
                label: "sometext",
                placeholder: "Enter text...",
                rows: 10
            }]
        }]

    }, {
        control: "container",
        extraClasses: ["modal-footer"],
        items: [{
            control: "container",
            extraClasses: ["form-group"],
            items: [{
                control: "button",
                type: "button",
                id: "cancelBtn",
                label: "Cancel",
                disabled: false,
                extraClasses: ["btn-default", "btn-sm"],
                name: "cancel"
            }, {
                control: "button",
                type: "submit",
                id: "saveBtn",
                label: "Save",
                disabled: false,
                extraClasses: ["btn-default", "btn-sm", "left-margin-xs"],
                name: "save"
            }]
        }]
    }];

    var formView = ADK.UI.Form.extend({
        model: new Backbone.Model.extend({}),
        fields: FormFields,
        events: {
            "submit": "onSubmit",
            "click #cancelBtn": "onCancel"
        },
        ui: {
            'descriptionArea': '.description textarea'
        },
        onSubmit: function(e) {
            e.preventDefault();
            this.model.set({
                touchedOn: moment().format('YYYYMMDDHHmmss'),
                siteHash: currentUser.get('site'),
                touchedBy: currentUser.get('uid'),
                edited: true
            });
            this.model.trigger('custom_save', this.model);
            //add here any notification or alert
        },
        onCancel: function(e) {
            ADK.UI.Workflow.hide();
        },
        onRender: function() {
            this.$(".description label").text(this.model.get('displayName'));
        }
    });

    return formView;

    //end of function
});