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
                        //title container
                        control: "container",
                        extraClasses: ["row"],
                        items: [{
                            control: "container",
                            extraClasses: ["col-xs-12"],
                            items: [{
                                control: "select",
                                name: "documentDefUidUnique",
                                id: "documentDefUidUnique",
                                label: "Note Title",
                                title: "Press enter to open search filter text.",
                                pickList: [],
                                showFilter: true,
                                groupEnabled: true,
                                required: true,
                                disabled: true,
                                options: {
                                    minimumInputLength: 0,
                                    sorter: function(data, params) {
                                        var sortedData;
                                        var filterText = params.term;

                                        // This utilizes an undocumented feature of Select2 version 4.0.0. It may fail if the lib's
                                        // future release changes its internal structure of data.
                                        if (!_.isEmpty(data) && !_.isUndefined(_.first(data).children)) {
                                            sortedData = _.map(data, function(group) {
                                                if (group.text !== modelUtil.NOTE_GROUP_RECENT_TITLES) {
                                                    if (filterText) {
                                                        var first = [],
                                                            others = [];

                                                        for (var i = 0; i < group.children.length; i++) {
                                                            var titleString = group.children[i].text.toLowerCase(),
                                                                filterTextLower = filterText.toLowerCase();

                                                            if (titleString.indexOf(filterTextLower) === 0) {
                                                                first.push(group.children[i]);
                                                            } else {
                                                                others.push(group.children[i]);
                                                            }
                                                        }

                                                        first = _.sortBy(first, function(item) {
                                                            return item.text;
                                                        });

                                                        others = _.sortBy(others, function(item) {
                                                            return item.text;
                                                        });

                                                        group.children = first.concat(others);
                                                    } else {
                                                        group.children = _.sortBy(group.children, function(item) {
                                                            return item.text;
                                                        });
                                                    }
                                                }
                                                return group;
                                            });
                                        } else {
                                            sortedData = _.map(data, function(group) {
                                                if (group.text === modelUtil.NOTE_GROUP_RECENT_TITLES) {
                                                    return group;
                                                }

                                                group.children = _.sortBy(group.children, function(item) {
                                                    return item.text;
                                                });

                                                return group;
                                            });
                                        }

                                        return sortedData;
                                    }
                                }
                            }]
                        }]
                    }, {
                        //Date and Time picker
                        control: "container",
                        extraClasses: ["row"],
                        items: [{
                            control: "container",
                            extraClasses: ["col-xs-6"],
                            items: [{
                                control: "datepicker",
                                id: "derivReferenceDate",
                                name: "derivReferenceDate",
                                title: "Enter in a date in the following format, " + options.referenceDateFormat.toUpperCase(),
                                label: "Date",
                                required: true,
                                flexible: true,
                                options: {
                                    endDate: '0d'
                                }
                            }]
                        }, {
                            control: "container",
                            extraClasses: ["col-xs-6"],
                            items: [{
                                control: "timepicker",
                                id: "derivReferenceTime",
                                title: "Enter in a time in the following format, " + options.referenceTimeFormat.toUpperCase(),
                                label: "Time",
                                placeholder: options.referenceTimeFormat,
                                name: "derivReferenceTime",
                                required: true
                            }]
                        }]
                    }, {
                        //notes body container
                        control: "container",
                        extraClasses: ["row"],
                        items: [{
                            control: "container",
                            extraClasses: ["col-xs-12"],
                            items: [{
                                control: "textarea",
                                id: "derivBody",
                                name: "noteBody",
                                title: "Enter in note details",
                                label: "Note",
                                placeholder: "",
                                rows: 27,
                                required: true,
                                disabled: true,
                                maxlength: 1000000, // 1 Megabyte is the maximum for the RDK
                                charCount: false
                            }]
                        }]
                    }]
                }]
            }, {
                //buttons container
                control: "container",
                extraClasses: ["modal-footer footer-extended"],
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
                            name: "note-delete",
                            id: "delete-form-btn",
                            title: "Press enter to delete and close note",
                            extraClasses: ["btn-danger", "btn-sm", "pull-left"]
                        }, {
                            label: "Preview",
                            type: "button",
                            control: "button",
                            name: "note-preview",
                            id: "preview-form-btn",
                            title: "Press enter to preview note",
                            extraClasses: ["btn-primary", "btn-sm"]
                        }, {
                            label: "Draft",
                            type: "button",
                            control: "button",
                            name: "note-close",
                            id: "close-form-btn",
                            extraClasses: ["btn-primary", "btn-sm"],
                            title: "Press enter to save and close note"
                        }, {
                            label: "Sign",
                            type: "submit",
                            control: "button",
                            name: "note-sign",
                            id: "sign-form-btn",
                            title: "Press enter to sign note",
                            extraClasses: ["btn-primary", "btn-sm"]
                        }]
                    }]
                }]
            }];
        }
    };
});