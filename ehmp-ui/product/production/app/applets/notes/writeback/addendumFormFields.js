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
                    extraClasses: ['container-fluid', 'flex-display', 'flex-direction-column', 'percent-height-100'],
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
                        extraClasses: ['row', 'notes-textarea-wrapper'],
                        items: [{
                            control: "container",
                            extraClasses: ["col-xs-12", "percent-height-100", 'position-absolute'],
                            items: [{
                                control: "textarea",
                                extraClasses:['percent-height-100', 'flex-display', 'flex-direction-column'],
                                id: "addendumBody",
                                name: "addendumBody",
                                title: "Enter in addendum details",
                                label: "Note Addendum",
                                required: true,
                                maxlength: 1000000, // 1 Megabyte is the maximum for the RDK
                                charCount: false
                            }]
                        }]
                    },{
                        control: "container",
                        extraClasses: ["row"],
                        template: Handlebars.compile('{{#if lastSavedDisplayTime}}<div class="bottom-margin-no top-margin-xs col-xs-12 font-size-11"><span id="notes-saved-at-view2">Saved {{lastSavedDisplayTime}}</span></div>{{/if}}'),
                        modelListeners: ["lastSavedDisplayTime"]
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
                        items: [{
                            label: "Delete",
                            type: "button",
                            control: "button",
                            name: "addendum-delete",
                            id: "delete-addendum-form-btn",
                            extraClasses: ["btn-danger", "btn-sm", "pull-left"]
                        }, {
                            label: "Preview",
                            type: "button",
                            control: "button",
                            name: "addendum-preview",
                            id: "preview-addendum-form-btn",
                            extraClasses: ["btn-primary", "btn-sm"]
                        }, {
                            label: "Draft",
                            type: "button",
                            control: "button",
                            name: "addendum-close",
                            id: "close-addendum-form-btn",
                            extraClasses: ["btn-primary", "btn-sm"],
                        }, {
                            label: "Sign",
                            type: "submit",
                            control: "button",
                            name: "addendum-sign",
                            id: "sign-addendum-form-btn",
                            extraClasses: ["btn-primary", "btn-sm"]
                        }]
                    }]
                }]
            }];
        }
    };
});