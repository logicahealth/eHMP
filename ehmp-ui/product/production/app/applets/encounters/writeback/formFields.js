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
        extraClasses: ['row'],
        items: [{
            control: 'container',
            extraClasses: ['row', 'col-md-12', 'bottom-padding-xs'],
            items: [{
                control: 'container',
                extraClasses: ['col-md-11', 'left-padding-md'],
                items: [{
                    control: 'container',
                    extraClasses: ['row', 'diagnosis-section-container'],
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
                }]
            }, {
                control: 'container',
                extraClasses: ['col-md-1', 'left-padding-sm'],
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
                    extraClasses: ['btn-primary', 'offset-btn-md'],
                    items: [
                        {
                            control:'container',
                            extraClasses:['flex-display','flex-direction-column','encounters-diagnosis-container'],
                            items:[
                                {
                                    control: 'container',
                                    extraClasses: ['flex-grow-fixed', 'section-add-other-diagnosis', 'all-padding-sm','bottom-border-grey-lightest'],
                                    items: [{
                                        control: 'container',
                                        extraClasses: [],
                                        items: [{
                                            control: 'searchbar',
                                            name: 'addOtherDiagnosisSearchString',
                                            id: 'addOtherDiagnosisSearchString',
                                            placeholder: 'Search for a diagnosis',
                                            label: 'Search for a diagnosis',
                                            srOnlyLabel: true,
                                            title: 'Enter in text to search for a diagnosis.'
                                        }]
                                    }]
                                },
                                {
                                    control: 'container',
                                    extraClasses:['scrolling-content'],
                                    items:[
                                        {
                                            control: 'container',
                                            extraClasses: [''],
                                            items: [{
                                                control: 'treepicker',
                                                name: 'selectAddOtherDiagnosis',
                                                attributeMapping: {
                                                    href: 'childHref'
                                                },
                                                itemTemplate: '{{preferredText}} ({{icdCode}})'
                                            }]
                                        }
                                    ]
                                },
                                {
                                    control: 'container',
                                    extraClasses:['flex-grow-fixed','all-padding-sm','top-border-grey-light','background-color-grey-lightest'],
                                    items:[{
                                        control: 'container',
                                        extraClasses: [],
                                        items: [{
                                            control: 'container',
                                            extraClasses: ['text-right'],
                                            items: [{
                                                control: 'button',
                                                type: 'button',
                                                label: 'Cancel',
                                                extraClasses: ['btn-primary', 'btn-sm'],
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
                                }
                            ]
                        }
                    ]
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
                extraClasses: ['col-md-6', 'well', 'well-flex', 'left-padding-sm', 'right-padding-sm'],
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
                        name: 'encounterServiceConnected',
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
            extraClasses: ['col-md-9', 'visit-type-container', 'right-padding-sm'],
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
            extraClasses: ['col-md-3', 'modifier-well', 'left-padding-no'],
            items: [{
                control: 'popover',
                label: 'Add/Remove Modifiers',
                name: 'add-visit-modifiers-popover',
                title: 'Add Modifiers',
                id: 'visit-modifiers-popover',
                options: {
                    placement: 'left'
                },
                extraClasses: ['btn-primary', 'btn-sm', 'btn-block'],
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
        control: 'container',
        extraClasses: ['row'],
        items: [{
            control: 'container',
            extraClasses: ['col-md-12', 'bottom-margin-sm'],
            items: [{
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
                    extraClasses: ["cell-valign-middle", "bottom-margin-no", "pixel-height-13"],
                    control: 'checkbox',
                    srOnlyLabel: true,
                    label: "Primary Provider"
                }]
            }]
        }]
    };
    var procedureHeaderContainer = {
        control: 'container',
        extraClasses: ['row', 'bottom-padding-xs'],
        items: [{
            control: 'container',
            extraClasses: ['col-md-12'],
            template: '<h5>Procedure</h5>'
        }]
    };
    var procedureContainer = {
        control: 'container',
        extraClasses: ['row'],
        items: [{
            control: 'container',
            extraClasses: ['row', 'col-md-12', 'bottom-padding-xs'],
            items: [{
                control: 'container',
                extraClasses: ['col-md-11', 'left-padding-md'],
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
                extraClasses: ['col-xs-1', 'left-padding-sm'],
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
                    extraClasses: ['btn-primary', 'offset-btn-md'],
                    items: [{
                        control: 'container',
                        extraClasses: ['section-add-other-procedure'],
                        items: [{
                            control: 'container',
                            extraClasses: ['all-padding-sm'],
                            items: [{
                                control: 'searchbar',
                                name: 'addOtherProcedureSearchString',
                                id: 'addOtherProcedureSearchString',
                                placeholder: 'Search for a procedure',
                                label: 'Add Other Procedure Input',
                                srOnlyLabel: true,
                                title: 'Enter in a procedure to search.'
                            }]
                        }, {
                            control: 'container',
                            extraClasses: ['left-padding-sm', 'right-padding-sm', 'bottom-padding-sm'],
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
                            extraClasses: ['all-padding-sm','background-color-grey-lightest','top-border-grey-light'],
                            items: [{
                                control: 'container',
                                extraClasses: ['text-right'],
                                items: [{
                                    control: 'button',
                                    type: 'button',
                                    label: 'Cancel',
                                    extraClasses: ['btn-primary', 'btn-sm'],
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
                maxComments: 1,
                itemColumn: {
                    columnTitle: 'Selected Procedures',
                    columnClasses: ['flex-width-4']
                },
                commentColumn: {
                    columnTitle: 'Comments',
                    name: 'comments',
                    columnClasses: ['percent-width-10']
                },
                additionalColumns: [{
                    columnTitle: 'Quantity',
                    columnClasses: ['percent-width-10'],
                    control: 'input',
                    extraClasses: ['input-sm', 'percent-width-80', 'center-margin', 'pixel-height-37'],
                    name: 'quantity',
                    placeholder: '1',
                    srOnlyLabel: true,
                    label: 'Enter in quantity',
                    title: 'Enter in quantity'
                }, {
                    columnClasses: [],
                    columnTitle: 'Provider *',
                    control: 'select',
                    extraClasses: ['input-sm', 'all-margin-no', 'pixel-height-37'],
                    name: 'provider',
                    srOnlyLabel: true,
                    label: 'Enter in provider.',
                    title: 'Enter in provider.',
                    pickList: 'providerPickList',
                    attributeMapping: {
                        id: 'code',
                        value: 'code',
                        label: 'name',
                    },
                }, {
                    columnTitle: 'Add Modifiers',
                    columnClasses: ['text-center'],
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
                extraClasses: ['col-xs-12'],
                template: Handlebars.compile('{{#if savedTime}}<p><span id="immunization-historical-saved-at">Saved at: {{savedTime}}</span></p>{{/if}}')
            }, {
                control: 'container',
                extraClasses: ['col-xs-12'],
                items: [{
                    control: 'button',
                    id: 'cancelEncounterBtn',
                    label: 'Cancel',
                    title: 'Press enter to cancel.',
                    extraClasses: ['btn-default', 'btn-sm'],
                    name: 'cancel',
                    type: 'button'
                }, {
                    control: 'button',
                    id: 'ok-btn',
                    label: 'Accept',
                    title: 'Press enter to confirm.',
                    extraClasses: ['btn-primary', 'btn-sm'],
                    name: 'ok'
                }]
            }]
        }]
    }];
    return formFields;
});