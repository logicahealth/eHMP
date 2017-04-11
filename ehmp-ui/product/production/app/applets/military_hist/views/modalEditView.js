define([
    'backbone'
], function(Backbone) {
    "use strict";

    var currentUser = ADK.UserService.getUserSession();
    var FormFields = [{
        control: "container",
        extraClasses: ["modal-body"],
        items: [{
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
                id: "cancel-btn",
                label: "Cancel",
                disabled: false,
                extraClasses: ["btn-default", "btn-sm"],
                name: "cancel"
            }, {
                control: "button",
                type: "submit",
                id: "viewEncounters-btn",
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
            "click #cancel-btn": "onCancel"
        },
        ui: {
            'descriptionArea': '#description'
        },
        onSubmit: function(e) {
            e.preventDefault();
            this.model.set({
                modifiedOn: moment().format(ADK.utils.dateUtils.defaultOptions().placeholder),
                location: currentUser.get('facility'),
                modifiedBy: currentUser.get('firstname') + ' ' + currentUser.get('lastname')
            });
            this.model.trigger('custom_save', this.model);
            //add here any notification or alert
            ADK.UI.Workflow.hide();
        },
        onCancel: function(e) {
            ADK.UI.Workflow.hide();
        },
        onRender: function() {
            this.$el.find("label[for='description']").text(this.model.get('displayName'));
        }
    });

    return formView;

    //end of function
});