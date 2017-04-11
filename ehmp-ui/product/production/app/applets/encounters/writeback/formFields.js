define([
    'moment',
    'handlebars'
], function(moment, Handlebars) {
    "use strict";

    var diagnosisHeaderContainer = {
        control: 'container',
        extraClasses: ['row', 'bottom-padding-xs'],
        items: [{
            control: 'container',
            extraClasses: ['col-md-12'],
            template: '<h5>Diagnoses List</h5>'
        }]
    };
    var diagnosesContainer = {
        control: 'container',
        extraClasses: ['row', 'bottom-padding-xs'],
        items: [{
            control: 'container',
            extraClasses: ['col-xs-11'],
            items: [{
                control: 'drilldownChecklist',
                selectOptions: {
                    control: 'select',
                    label: 'Diagnoses Section',
                    name: 'diagnosesSection',
                    pickList: 'DiagnosisCollection',
                    extraClasses: ['items-shown-md'],
                    size: 10,
                    srOnlyLabel: true,
                    attributeMapping: {
                        id: 'categoryName',
                        value: 'categoryName',
                        label: 'categoryName'
                    }
                },
                checklistOptions: {
                    control: 'checklist',
                    name: 'values',
                    extraClasses: ['items-shown-md', 'diagChecklist'],
                    attributeMapping: {
                        id: 'icdCode'
                    }
                }
            }]
        }, {
            control: 'container',
            extraClasses: ['col-xs-1'],
            items: [{
                control: 'popover',
                label: 'Add Other',
                name: 'add-other-diagnosis-popover',
                header: 'Add Other Diagnosis',
                title: 'Press enter to add other diagnoses.',
                size: 'sm',
                options: {
                    placement: 'left'
                },
                extraClasses: ['btn-default', 'offset-btn-md'],
                items: [{
                    control: 'container',
                    extraClasses: ['row', 'section-add-other-diagnosis'],
                    items: [{
                        control: 'container',
                        extraClasses: ['col-xs-10', 'bottom-padding-xs'],
                        items: [{
                            control: 'input',
                            name: 'addOtherDiagnosisSearchString',
                            placeholder: 'Search for diagnosis',
                            label: 'Search for a diagnosis',
                            srOnlyLabel: true,
                            title: 'Please enter in text to start searching for a diagnosis, and then press tab to navigate to the search button.'
                        }]
                    }, {
                        control: 'container',
                        extraClasses: ['col-xs-2', 'bottom-padding-xs'],
                        items: [{
                            control: 'button',
                            type: 'button',
                            label: '',
                            size: 'sm',
                            extraClasses: ['btn-default', 'btn-block'],
                            icon: 'fa-search',
                            title: 'Press enter to search based on entered text, and then press tab to view the results listed below.',
                            id: 'add-other-diagnosis-search-btn'
                        }]
                    }, {
                        control: 'container',
                        extraClasses: ['col-xs-12'],
                        items: [{
                            control: 'treepicker',
                            name: 'selectAddOtherDiagnosis',
                            attributeMapping: {
                                href: 'childHref'
                            },
                            itemTemplate: '{{preferredText}} ({{icdCode}})'
                        }]
                    }, {
                        control: 'container',
                        extraClasses: ['col-xs-12'],
                        items: [{
                            control: 'container',
                            extraClasses: ['text-right'],
                            items: [{
                                control: 'button',
                                type: 'button',
                                label: 'Cancel',
                                extraClasses: ['btn-default', 'btn-sm'],
                                title: 'Press enter to cancel.',
                                id: 'add-other-diagnosis-cancel-btn'
                            }, {
                                control: 'button',
                                type: 'button',
                                label: 'Add',
                                extraClasses: ['btn-primary', 'btn-sm'],
                                title: 'Press enter to add.',
                                id: 'add-other-diagnosis-add-btn',
                                disabled: true
                            }]
                        }]
                    }]
                }]
            }]
        }]
    };
    var selectedDiagnosesContainer = {
        control: 'container',
        extraClasses: ['row'],
        items: [{
            control: 'container',
            extraClasses: ['col-md-12'],
            items: [{
                control: 'nestedCommentBox',
                name: 'DiagnosisCollection',
                extraClasses: ['bottom-margin-none'],
                label: 'Selected Diagnoses',
                itemColumn: {
                    columnTitle: 'Selected Diagnoses',
                    columnClasses: ['flex-width-7']
                },
                commentColumn: {
                    columnTitle: '',
                    columnClasses: ['hidden']
                },
                additionalColumns: [{
                    columnClasses: ['text-center', 'flex-width-2'],
                    columnTitle: 'Primary',
                    name: 'primary',
                    control: 'checkbox',
                    label: 'Primary Diagnoses. Press spacebar to select this as the Primary Diagnoses',
                    srOnlyLabel: true
                }],
                attributeMapping: {
                    collection: 'values',
                    commentsCollection: 'comments',
                    comment: 'commentString'
                }
            }]
        }]
    };
    var serviceConnectedContainer = {
        control: 'container',
        extraClasses: ['col-md-12'],
        items: [{
            control: 'container',
            extraClasses: ['row', 'row-eq-height'],
            items: [{
                control: 'container',
                extraClasses: ['col-md-6', 'well', 'well-flex'],
                modelListeners: ['serviceConnected', 'ratedDisabilities'],
                template: Handlebars.compile('<p>Service Connected: {{{serviceConnected}}}</p><p>Rated Disabilities: <ul>{{{ratedDisabilities}}}</ul></p>')
            }, {
                control: 'container',
                extraClasses: ['col-md-6', 'well', 'well-flex', 'service-connected-radios'],
                items: [{
                    control: 'container',
                    tagName: 'fieldset',
                    template: '<legend>Visit Related To</legend>',
                    items: [{
                        control: 'radio',
                        name: 'service-connected',
                        label: 'Service Connected',
                        value: 'undefined',
                        extraClasses: ['bottom-border-grey-light'],
                        hidden: true,
                        options: [{
                            label: 'Yes',
                            value: 'yes'
                        }, {
                            label: 'No',
                            value: 'no'
                        }]
                    }, {
                        control: 'radio',
                        name: 'combat-vet',
                        label: 'Combat Veteran',
                        value: 'undefined',
                        extraClasses: ['bottom-border-grey-light'],
                        hidden: true,
                        options: [{
                            label: 'Yes',
                            value: 'yes'
                        }, {
                            label: 'No',
                            value: 'no'
                        }]
                    }, {
                        control: 'radio',
                        name: 'agent-orange',
                        label: 'Agent Orange',
                        value: 'undefined',
                        extraClasses: ['bottom-border-grey-light'],
                        hidden: true,
                        options: [{
                            label: 'Yes',
                            value: 'yes'
                        }, {
                            label: 'No',
                            value: 'no'
                        }]
                    }, {
                        control: 'radio',
                        name: 'ionizing-radiation',
                        label: 'Ionizing Radiation',
                        value: 'undefined',
                        extraClasses: ['bottom-border-grey-light'],
                        hidden: true,
                        options: [{
                            label: 'Yes',
                            value: 'yes'
                        }, {
                            label: 'No',
                            value: 'no'
                        }]
                    }, {
                        control: 'radio',
                        name: 'sw-asia',
                        label: 'Southwest Asia Conditions',
                        value: 'undefined',
                        extraClasses: ['bottom-border-grey-light'],
                        hidden: true,
                        options: [{
                            label: 'Yes',
                            value: 'yes'
                        }, {
                            label: 'No',
                            value: 'no'
                        }]
                    }, {
                        control: 'radio',
                        name: 'shad',
                        label: 'Shipboard Hazard and Defense',
                        value: 'undefined',
                        extraClasses: ['bottom-border-grey-light'],
                        hidden: true,
                        options: [{
                            label: 'Yes',
                            value: 'yes'
                        }, {
                            label: 'No',
                            value: 'no'
                        }]
                    }, {
                        control: 'radio',
                        name: 'mst',
                        label: 'Military Sexual Trauma',
                        value: 'undefined',
                        extraClasses: ['bottom-border-grey-light'],
                        hidden: true,
                        options: [{
                            label: 'Yes',
                            value: 'yes'
                        }, {
                            label: 'No',
                            value: 'no'
                        }]
                    }, {
                        control: 'radio',
                        name: 'head-neck-cancer',
                        label: 'Head and Neck Cancer',
                        value: 'undefined',
                        hidden: true,
                        options: [{
                            label: 'Yes',
                            value: 'yes'
                        }, {
                            label: 'No',
                            value: 'no'
                        }]
                    }]
                }]
            }]
        }]
    };
    var selectedConnectedHeaderContainer = {
        control: 'container',
        extraClasses: ['row'],
        items: [{
            control: 'container',
            extraClasses: ['col-md-12', 'bottom-padding-xs'],
            template: '<h5>Service Connected</h5>'
        }, serviceConnectedContainer]
    };
    var visitTypeHeaderContainer = {
        control: 'container',
        extraClasses: ['row', 'bottom-padding-xs'],
        items: [{
            control: 'container',
            extraClasses: ['col-md-12'],
            template: '<h5>Visit Type</h5></h5>'
        }]
    };
    var visitTypeContainer = {
        control: 'container',
        extraClasses: ['row'],
        items: [{
            control: 'container',
            extraClasses: ['col-md-9'],
            items: [{
                control: 'container',
                extraClasses: ['row'],
                items: [{
                    control: 'drilldownChecklist',
                    extraClasses: ['drilldownColumnResize-5:7'],
                    selectOptions: {
                        control: 'select',
                        name: 'visitTypeSelection',
                        label: 'Type of Visit. Use the up and down arrow keys to view the predefined visit type, then press tab to view the type.',
                        pickList: 'visitCollection',
                        extraClasses: ['items-shown-md'],
                        size: 10,
                        srOnlyLabel: true,
                        attributeMapping: {
                            id: 'categoryName',
                            value: 'categoryName',
                            label: 'categoryName'
                        }
                    },
                    checklistOptions: {
                        control: 'checklist',
                        name: 'cptCodes',
                        extraClasses: ['items-shown-md', 'visit-checklist'],
                        attributeMapping: {
                            unique: 'cid',
                            id: 'cid'
                        }
                    }
                }]
            }]
        }, {
            control: 'container',
            extraClasses: ['col-md-3', 'modifier-well'],
            items: [{
                control: 'popover',
                label: 'Add/Remove Modifiers',
                name: 'add-visit-modifiers-popover',
                title: 'Add Modifiers',
                id: 'visit-modifiers-popover',
                options: {
                    placement: 'left'
                },
                extraClasses: ['btn-default', 'btn-sm', 'btn-block'],
                items: [{
                    control: 'container',
                    extraClasses: ['row', 'section-add-modifiers'],
                    items: [{
                        control: 'container',
                        extraClasses: ['col-xs-12'],
                        items: [{
                            control: 'multiselectSideBySide',
                            name: 'availableVisitModifiers',
                            label: 'Modifiers',
                            selectedCountName: "visitModifiersCount",
                            attributeMapping: {
                                id: 'ien',
                                name: 'name',
                                label: 'name',
                            }
                        }],
                    }, {
                        control: 'container',
                        extraClasses: ['col-xs-12'],
                        items: [{
                            control: 'container',
                            extraClasses: ['text-right'],
                            items: [{
                                control: 'button',
                                type: 'button',
                                label: 'Done',
                                extraClasses: ['btn-primary', 'btn-sm'],
                                title: 'Press enter to close.',
                                id: 'add-visit-modifiers-close-btn'
                            }]
                        }]
                    }]
                }]
            }, {
                control: 'container',
                extraClasses: ['well', 'read-only-well'],
                template: Handlebars.compile(['<ul class="list-inline">{{#each selectedModifiersForVisit}}<li>{{this.name}}</li>{{/each}}</ul>'].join('\n')),
                modelListeners: ['visitModifiersCount']
            }]
        }]
    };
    var providersEncounterContainer = {
        control: 'multiselectSideBySide',
        name: 'providerList',
        label: 'Providers',
        attributeMapping: {
            id: 'code',
            name: 'name',
            label: 'name',
        },
        additionalColumns: [{
            columnClasses: ["text-center"],
            columnTitle: "Primary Provider *",
            name: "primaryProviderCheck",
            extraClasses: ["cell-valign-middle", "bottom-margin-no"],
            control: 'checkbox',
            srOnlyLabel: true,
            label: "Primary Provider"
        }]
    };
    var procedureHeaderContainer = {
        control: 'container',
        extraClasses: ['row', 'bottom-padding-xs'],
        items: [{
            control: 'container',
            extraClasses: ['col-md-12'],
            template: '<h5>Procedure</h5></h5>'
        }]
    };
    var procedureContainer = {
        control: 'container',
        extraClasses: ['row', 'bottom-padding-xs'],
        items: [{
            control: 'container',
            extraClasses: ['col-md-11'],
            items: [{
                control: 'container',
                extraClasses: ['row', 'procedure-section-container'],
                items: [{
                    control: 'drilldownChecklist',
                    extraClasses: ['drilldownColumnResize-5:7'],
                    selectOptions: {
                        control: 'select',
                        name: 'procedureSection',
                        label: 'Procedure Section. Use the up and down arrow keys to view the predefined procedure section, then press tab to view the procedures.',
                        pickList: 'ProcedureCollection',
                        extraClasses: ['items-shown-md'],
                        size: 10,
                        srOnlyLabel: true,
                        attributeMapping: {
                            id: 'categoryName',
                            label: 'categoryName',
                            value: 'categoryName'
                        }
                    },
                    checklistOptions: {
                        control: 'checklist',
                        name: 'cptCodes',
                        extraClasses: ['items-shown-md'],
                        attributeMapping: {
                            id: 'ien'
                        }
                    }
                }]
            }]
        }, {
            control: 'container',
            extraClasses: ['col-xs-1'],
            items: [{
                control: 'popover',
                label: 'Add Other',
                name: 'add-other-procedure-popover',
                header: 'Add Other Procedure',
                title: 'Press enter to add other procedure.',
                size: 'sm',
                options: {
                    placement: 'left'
                },
                extraClasses: ['btn-default', 'offset-btn-md', 'btn-xs'],
                items: [{
                    control: 'container',
                    extraClasses: ['row', 'section-add-other-procedure'],
                    items: [{
                        control: 'container',
                        extraClasses: ['col-xs-10', 'bottom-padding-xs'],
                        items: [{
                            control: 'input',
                            name: 'addOtherProcedureSearchString',
                            placeholder: 'Search for procedure',
                            label: 'Add Other Procedure Input',
                            srOnlyLabel: true,
                            title: 'Please enter in a procedure to filter.'
                        }]
                    }, {
                        control: 'container',
                        extraClasses: ['col-xs-2', 'bottom-padding-xs'],
                        items: [{
                            control: 'button',
                            type: 'button',
                            label: '',
                            size: 'sm',
                            extraClasses: ['btn-default', 'btn-block'],
                            icon: 'fa-search',
                            title: 'Press enter to search',
                            id: 'add-other-procedure-search-btn'
                        }]
                    }, {
                        control: 'container',
                        extraClasses: ['col-xs-12'],
                        items: [{
                            control: 'select',
                            name: 'selectAddOtherProcedure',
                            srOnlyLabel: true,
                            label: 'Add Other Procedure Selection',
                            size: 10,
                            extraClasses: ['items-shown-md'],
                            title: 'Press enter to browse through select options.',
                            pickList: 'addOtherProcedurePicklist'
                        }]
                    }, {
                        control: 'container',
                        extraClasses: ['col-xs-12'],
                        items: [{
                            control: 'container',
                            extraClasses: ['text-right'],
                            items: [{
                                control: 'button',
                                type: 'button',
                                label: 'Cancel',
                                extraClasses: ['btn-default', 'btn-sm'],
                                title: 'Press enter to cancel.',
                                id: 'add-other-procedure-cancel-btn'
                            }, {
                                control: 'button',
                                type: 'button',
                                label: 'Add',
                                extraClasses: ['btn-primary', 'btn-sm'],
                                title: 'Press enter to add.',
                                id: 'add-other-procedure-add-btn',
                                disabled: true
                            }]
                        }]
                    }]
                }]
            }]
        }]
    };
    var selectedProceduresContainer = {
        control: 'container',
        extraClasses: ['row'],
        items: [{
            control: 'container',
            extraClasses: ['col-md-12'],
            items: [{
                control: 'nestedCommentBox',
                name: 'ProcedureCollection',
                label: 'Selected Procedures',
                extraClasses: ['nested-comment-box', 'nested-comment-box-alt', 'faux-table-row-container'],
                itemColumn: {
                    columnTitle: 'Selected Procedures',
                    columnClasses: ['flex-width-7']
                },
                commentColumn: {
                    columnTitle: 'Comments',
                    name: 'comments',
                    columnClasses: ['text-center']
                },
                additionalColumns: [{
                    columnTitle: 'Quantity',
                    columnClasses: ['text-center'],
                    control: 'input',
                    extraClasses: ['input-sm', 'percent-width-80', 'center-margin'],
                    name: 'quantity',
                    placeholder: '1',
                    srOnlyLabel: true,
                    label: 'Please enter in quantity',
                    title: 'Please enter in quantity'
                }, {
                    columnClasses: ['flex-width-2', 'text-center'],
                    columnTitle: 'Provider *',
                    control: 'select',
                    extraClasses: ['input-sm', 'all-margin-no'],
                    name: 'provider',
                    srOnlyLabel: true,
                    label: 'Please enter in provider.',
                    title: 'Please enter in provider.',
                    pickList: 'providerPickList',
                    attributeMapping: {
                        id: 'code',
                        value: 'code',
                        label: 'name',
                    },
                }, {
                    columnTitle: 'Add Modifiers',
                    columnClasses: ['flex-width-2', 'text-center'],
                    control: 'popover',
                    extraClasses: ['btn-icon', 'btn-xs', 'procedure-modifier-popover'],
                    name: 'itemModifiers',
                    label: 'Add Modifiers',
                    options: {
                        trigger: 'click',
                        header: 'Add Modifiers',
                        placement: 'left'
                    },
                    items: [{
                        control: 'container',
                        extraClasses: ['row', 'section-add-modifiers'],
                        items: [{
                            control: 'container',
                            extraClasses: ['col-xs-12'],
                            items: [{
                                control: 'multiselectSideBySide',
                                name: 'modifiers',
                                label: 'Modifiers',
                                attributeMapping: {
                                    id: 'ien',
                                    name: 'name',
                                    label: 'name',
                                }
                            }]
                        }, {
                            control: 'container',
                            extraClasses: ['col-xs-12'],
                            items: [{
                                control: 'container',
                                extraClasses: ['text-right'],
                                items: [{
                                    control: 'button',
                                    type: 'button',
                                    label: 'Done',
                                    extraClasses: ['btn-primary', 'btn-sm'],
                                    title: 'Press enter to close.',
                                    id: 'add-procedure-modifiers-close-btn'
                                }]
                            }]
                        }]
                    }]
                }],
                attributeMapping: {
                    collection: 'cptCodes',
                    commentsCollection: 'comments',
                    comment: 'commentString'
                }
            }]
        }]
    };
    var formFields = [{
        control: 'container',
        extraClasses: ['modal-body', 'encounter-form-modal'],
        items: [{
            control: 'container',
            extraClasses: ['container-fluid'],
            items: [
                diagnosisHeaderContainer,
                diagnosesContainer,
                selectedDiagnosesContainer,
                selectedConnectedHeaderContainer,
                visitTypeHeaderContainer,
                visitTypeContainer,
                providersEncounterContainer,
                procedureHeaderContainer,
                procedureContainer,
                selectedProceduresContainer
            ]
        }]
    }, {
        control: 'container',
        extraClasses: ['modal-footer'],
        items: [{
            control: 'container',
            extraClasses: ['row'],
            items: [{
                control: 'container',
                extraClasses: ['col-xs-6'],
                template: Handlebars.compile('<p aria-hidden="true">(* indicates a required field.)</p>{{#if savedTime}}<p><span id="immunization-historical-saved-at">Saved at: {{savedTime}}</span></p>{{/if}}')
            }, {
                control: 'container',
                extraClasses: ['col-xs-6'],
                items: [{
                    control: 'button',
                    id: 'cancel-btn',
                    label: 'Cancel',
                    title: 'Press enter to cancel.',
                    extraClasses: ['btn-default', 'btn-sm', 'left-margin-xs'],
                    name: 'cancel',
                    type: 'button'
                }, {
                    control: 'button',
                    id: 'ok-btn',
                    label: 'OK',
                    title: 'Press enter to confirm.',
                    extraClasses: ['btn-primary', 'btn-sm', 'left-margin-xs'],
                    name: 'ok'
                }]
            }]
        }]
    }];
    return formFields;
});
