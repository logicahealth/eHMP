define([
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
], function(Backbone, Marionette, $, Handlebars) {

    //=============================================================================================================
    // PLEASE DO NOT COPY AND PASTE THIS FULL FILE. PLEASE JUST USE AS A REFERENCE AND COPY PARTS THAT ARE NEEDED
    // for more information on how to layout this form for your applet please checkout the following link:
    // http://IP_ADDRESS/documentation/#/adk/conventions#Writeback
    //=============================================================================================================

    var F662 = {
        // DO NOT USE CREATE FORM FUNCTION --- THIS IS FOR DEMO PURPOSES ONLY!!!
        createForm: function() {
            // *********************************************** FIELDS ***************************************************
            var F662Fields = [{
                control: "container",
                extraClasses: ["modal-body"],
                items: [{
                    control: "container",
                    extraClasses: ["container-fluid"],
                    items: [{
                        control: "container",
                        extraClasses: ["row"],
                        items: [{
                            control: "container",
                            extraClasses: ["col-xs-12"],
                            items: [{
                                control: "multiselectSideBySide",
                                name: "roles",
                                label: "Roles"
                            }]
                        }]
                    }]
                }]
            }, {
                control: "container",
                extraClasses: ["modal-footer"],
                items: [{
                    control: "container",
                    extraClasses: ["row"],
                    items: [{
                        control: "container",
                        extraClasses: ["col-md-12", "text-right"],
                        items: [{
                            control: "button",
                            extraClasses: ["btn-default", "btn-sm"],
                            label: "Cancel",
                            name: "cancel",
                            type: "button"
                        }, {
                            control: "button",
                            extraClasses: ["btn-primary", "btn-sm"],
                            label: "Done",
                            name: "done",
                            type: "button"
                        }]
                    }]
                }]
            }];
            // *********************************************** END OF FIELDS ********************************************

            // *********************************************** MODEL ****************************************************
            // Okay to copy and paste - Please Add additional items to prepopulate the fields
            var FormModel = Backbone.Model.extend({
                defaults: {
                    roles: new Backbone.Collection([{label: "1", value: true, id: "1"}, {label: "2", value: true, id: "2"}, {label: "3", value: true, id: "3"}])
                }
            });
            // *********************************************** END OF MODEL *********************************************

            // *********************************************** VIEWS **********************************************
            // Okay to copy and paste - WITH 1 EXCEPTION (see below)

            var formView = ADK.UI.Form.extend({
                ui: { },
                fields: F662Fields,
                onInitialize: function(){
                    this.initialRoles = this.model.get("roles");
                },
                events: {
                    "click .cancel button": function(e){
                        ADK.UI.Workflow.hide();
                    },
                    "click .done button": function(e) {
                        e.preventDefault();
                        if (!this.model.isValid())
                            this.model.set("formStatus", {
                                status: "error",
                                message: self.model.validationError
                            });
                        else {
                            this.model.unset("formStatus");
                            var saveAlertView = new ADK.UI.Notification({
                                title: 'Role Modified',
                                icon: 'fa-check',
                                message: 'The role has been successfully modified with no errors.',
                                type: "success"
                            });
                            saveAlertView.show();
                            ADK.UI.Workflow.hide();
                        }
                    }
                },
                modelEvents: { }
            });
            // *********************************************** END OF FORM VIEW *****************************************

            // *********************************************** MODEL AND WORKFLOW INSTANCE ******************************
            // Okay to copy and paste
            var formModel = new FormModel();

            var workflowOptions = {
                size: "medium",
                title: "Select Roles",
                showProgress: false,
                keyboard: true,
                steps: [{
                    view: formView,
                    viewModel: formModel,
                    stepTitle: 'Step 1'
                }]
            };
            var workflow = new ADK.UI.Workflow(workflowOptions);
            workflow.show();
            // *********************************************** END OF MODEL AND WORKFLOW INSTANCE ***********************
        }
    };
    return F662;
});