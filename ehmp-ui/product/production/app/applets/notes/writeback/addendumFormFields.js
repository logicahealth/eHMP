define([
    'moment',
    'handlebars',
    'app/applets/notes/writeback/modelUtil',
], function(moment, Handlebars, modelUtil) {
    "use strict";

    return {
        getForm: function(options) {
            return [{
                control: "container",
                extraClasses: ["modal-body"],
                items: [{
                    control: "container",
                    extraClasses: ["container-fluid"],
                    items: [{
                        control: "container",
                        items: [{
                            control: "alertBanner",
                            name: "saveErrorBanner",
                            extraClasses: ["save-error-banner"],
                            dismissible: true,
                            type: "danger",
                            title: "Server Error",
                            hidden: true
                        }]
                    }, {
                        control: "container",
                        extraClasses: ["row"],
                        items: [{
                            control: "container",
                            extraClasses: ["col-xs-5"],
                            items: [{
                                control: "datepicker",
                                id: "addendumDerivReferenceDate",
                                name: "addendumDerivReferenceDate",
                                title: "Enter in a date in the following format, " + options.referenceDateFormat.toUpperCase(),
                                label: "Date",
                                required: true,
                                options: {
                                    endDate: '0d'
                                }
                            }]
                        }, {
                            control: "container",
                            extraClasses: ["col-xs-5"],
                            items: [{
                                control: "timepicker",
                                id: "addendumDerivReferenceTime",
                                title: "Enter in a time in the following format, " + options.referenceTimeFormat.toUpperCase(),
                                label: "Time",
                                placeholder: options.referenceTimeFormat,
                                name: "addendumDerivReferenceTime",
                                required: true
                            }]
                        }]
                    }, {
                        //addendum text container
                        control: "container",
                        extraClasses: ["row"],
                        items: [{
                            control: "container",
                            extraClasses: ["col-xs-12"],
                            items: [{
                                control: "textarea",
                                id: "addendumDerivBody",
                                name: "addendumBody",
                                title: "Enter in addendum details",
                                label: "Note Addendum",
                                rows: 27,
                                required: true,
                                maxlength: 1000000, // 1 Megabyte is the maximum for the RDK
                                charCount: false
                            }]
                        }]
                    }]
                }]
            }, {
                //buttons container
                control: "container",
                extraClasses: ["modal-footer"],
                items: [{
                    control: "container",
                    extraClasses: ["row"],
                    items: [{
                        control: "container",
                        extraClasses: ["col-xs-12"],
                        template: Handlebars.compile('{{#if lastSavedDisplayTime}}<p><span id="notes-saved-at-view2">Saved {{lastSavedDisplayTime}}</span></p>{{/if}}'),
                        modelListeners: ["lastSavedDisplayTime"]
                    }, {
                        control: "container",
                        extraClasses: ["col-xs-12"],
                        items: [{
                            label: "Delete",
                            type: "button",
                            control: "button",
                            name: "addendum-delete",
                            id: "delete-addendum-form-btn",
                            title: "Press enter to delete and close addendum",
                            extraClasses: ["btn-danger", "btn-sm", "pull-left"]
                        }, {
                            label: "Preview",
                            type: "button",
                            control: "button",
                            name: "addendum-preview",
                            id: "preview-addendum-form-btn",
                            title: "Press enter to preview addendum",
                            extraClasses: ["btn-primary", "btn-sm"]
                        }, {
                            label: "Draft",
                            type: "button",
                            control: "button",
                            name: "addendum-close",
                            id: "close-addendum-form-btn",
                            extraClasses: ["btn-primary", "btn-sm"],
                            title: "Press enter to save and close addendum"
                        }, {
                            label: "Sign",
                            type: "submit",
                            control: "button",
                            name: "addendum-sign",
                            id: "sign-addendum-form-btn",
                            title: "Press enter to sign addendum",
                            extraClasses: ["btn-primary", "btn-sm"]
                        }]
                    }]
                }]
            }];
        }
    };
});