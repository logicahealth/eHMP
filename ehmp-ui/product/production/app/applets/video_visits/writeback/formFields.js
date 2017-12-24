define([], function() {
    "use strict";

    var messageContainer = {
        control: "container",
        extraClasses: ["row"],
        items: [{
            control: "alertBanner",
            name: "alertMessage",
            extraClasses: ["col-xs-12"],
            dismissible: true
        }, {
            control: "alertBanner",
            name: "errorMessage",
            title: "Unable To Submit",
            extraClasses: ["col-xs-12"],
            type: "danger",
            dismissible: false
        }]
    };

    var appointmentBodyContainer = {
        control: "container",
        extraClasses: ["row", "appointment-information"],
        items: [{
            control: "datepicker",
            extraClasses: ["col-xs-4"],
            required: true,
            disabled: false,
            name: "appointmentDate",
            label: "Date",
            flexible: false,
            minPrecision: "day",
            startDate: "0d"
        }, {
            control: "timepicker",
            extraClasses: ["col-xs-4"],
            required: true,
            disabled: false,
            placeholder: "HH:MM",
            name: "appointmentTime",
            label: "Time",
            options: {
                defaultTime: false,
                minuteStep: 15
            }
        }, {
            control: "select",
            extraClasses: ["col-xs-4"],
            name: "appointmentDuration",
            label: "Duration",
            required: true,
            disabled: false,
            options: [],
            pickList: [{ value: "15", label: "15 minutes" }, { value: "20", label: "20 minutes" }, { value: "30", label: "30 minutes" }]
        }, {
            control: "input",
            name: "patientEmail",
            label: "Patient Email",
            type: "email",
            extraClasses: ["col-xs-12"],
            maxlength: 100,
            required: true,
            disabled: false
        }, {
            control: "input",
            name: "patientPhone",
            label: "Patient Phone",
            extraClasses: ["col-xs-6"],
            maxLength: 100,
            required: false,
            disabled: false
        }, {
            control: "select",
            name: "patientPhoneType",
            label: "Phone Type",
            required: false,
            disabled: false,
            options: [],
            extraClasses: ["col-xs-6"],
            pickList: [{ value: "Mobile", label: "Mobile" }, { value: "Home", label: "Home" }, { value: "Work", label: "Work" }, { value: "Fax", label: "Fax" }]
        }, {
            control: "input",
            name: "providerName",
            label: "Provider Name",
            extraClasses: ["col-xs-12"],
            required: false,
            readonly: true
        }, {
            control: "input",
            name: "providerEmail",
            label: "Provider Email",
            type: "email",
            extraClasses: ["col-xs-12"],
            maxlength: 100,
            required: true,
            disabled: false
        }, {
            control: "input",
            name: "providerPhone",
            label: "Provider Phone",
            extraClasses: ["col-xs-6"],
            required: true,
            disabled: false
        }, {
            control: "textarea",
            name: "comment",
            label: "Comment",
            extraClasses: ["col-xs-12"],
            rows: 3,
            maxlength: 250,
            required: false,
            disabled: false
        }, {
            control: "radio",
            label: "Include additional instructions for Patient?",
            name: "additionalInstructionsOption",
            extraClasses: ["col-xs-12", "top-padding-sm"],
            options: [{ label: "Yes", value: "yes"}, { label: "No", value: "no"}]
        }, {
            control: "select",
            name: "instructionsList",
            label: "Select Instructions",
            hidden: true,
            attributeMapping: {
                label: "title",
                value: "title"
            },
            pickList: [],
            options: {},
            extraClasses: ["col-xs-12"],
        }, {
            control: "textarea",
            name: "instructionsToPatient",
            label: "Instructions that will be sent to Patient",
            extraClasses: ["col-xs-12"],
            hidden: true,
            rows: 10,
            maxlength: 10000,
            disable: false
        }]
    };

    var appointmentFields = [
        {
            control: "container",
            extraClasses: ["modal-body order-lab-test"],
            items: [{
                control: "container",
                extraClasses: ["container-fluid"],
                items: [messageContainer, appointmentBodyContainer]
            }]
        }, {
            control: "container",
            extraClasses: ["modal-footer"],
            items: [{
                control: "container",
                extraClasses: ["row"],
                items: [{
                    control: "container",
                    extraClasses: ["col-xs-12", "display-flex", "valign-bottom"],
                    items: [{
                        control: "popover",
                        behaviors: {
                            Confirmation: {
                                title: "Warning",
                                eventToTrigger: "video-visit-add-confirm-cancel"
                            }
                        },
                        label: "Cancel",
                        id: "cancelButton",
                        name: "videoAppointmentAddConfirmCancel",
                        extraClasses: ["btn-default", "btn-sm"]
                    }, {
                        control: "button",
                        extraClasses: ["btn-primary", "btn-sm", "left-margin-sm"],
                        label: "Create",
                        id: "createButton",
                        name: "create-button",
                        type: "submit",
                        disabled: true
                    }]
                }]
            }]
        }
    ];

    return appointmentFields;
});
