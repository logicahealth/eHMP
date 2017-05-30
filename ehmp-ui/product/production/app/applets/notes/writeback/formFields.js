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
                        control: "container",
                        extraClasses: ["row"],
                        items: [{
                            control: "container",
                            extraClasses: ["col-xs-6"],
                            items: [{
                                control: "datepicker",
                                id: "derivReferenceDate",
                                name: "derivReferenceDate",
                                label: "Date",
                                required: true,
                                flexible: true,
                                minPrecision: 'day',
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
                        control: "container",
                        extraClasses: ['row', 'notes-textarea-wrapper'],
                        items: [{
                            control: "container",
                            extraClasses: ["col-xs-12", "percent-height-100", 'position-absolute'],
                            items: [{
                                control: "textarea",
                                extraClasses:['percent-height-100', 'flex-display', 'flex-direction-column'],
                                id: "noteBody",
                                name: "noteBody",
                                title: "Enter in note details",
                                label: "Note",
                                placeholder: "",
                                required: true,
                                disabled: true,
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
                        extraClasses: ['col-xs-12','flex-display','valign-bottom'],
                        items: [{
                            control:'container',
                            extraClasses:['flex-grow-loose','text-left'],
                            items:[
                                {
                                    control: 'popover',
                                    behaviors: {
                                        Confirmation: {
                                            title: 'Delete',
                                            eventToTrigger: 'note-confirm-delete',
                                            message:'Are you sure you want to delete?',
                                            confirmButtonTitle: 'Press enter to delete'
                                        }
                                    },
                                    label: 'Delete',
                                    name: 'noteConfirmDelete',
                                    id:'noteConfirmDelete',
                                    extraClasses: ['btn-default', 'btn-sm']
                                }
                            ]
                        },
                        {
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
                            extraClasses: ["btn-primary", "btn-sm", "left-margin-xs"],
                            title: "Press enter to save and close note"
                        }, {
                            label: "Sign",
                            type: "submit",
                            control: "button",
                            name: "note-sign",
                            id: "sign-form-btn",
                            title: "Press enter to sign note",
                            extraClasses: ["btn-primary", "btn-sm", "left-margin-xs"]
                        }]
                    }]
                }]
            }];
        }
    };
});