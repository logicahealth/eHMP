define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'moment',
    'app/applets/task_forms/common/utils/utils',
    'app/applets/task_forms/common/views/alertView',
    'hbs!app/applets/orders/writeback/consults/templates/orderCompletedTemplate',
    'hbs!app/applets/orders/writeback/consults/templates/editOrderHeader'
], function(Backbone, Marionette, _, Handlebars, moment, Utils, AlertView, orderCompletedTemplate, EditOrderHeaderTemplate) {
    "use strict";

    var PreReqCollection = Backbone.Collection.extend({
        initialize: function(models, options) {
            this.listenTo(this, 'change:value', this.onValueChange);
        },
        onValueChange: function(model, val, options) {
            if (val.toLowerCase() === 'no') {
                var alert = new ADK.UI.Alert({
                    title: 'Attention',
                    icon: 'icon-circle-exclamation',
                    messageView: AlertView.MessageView,
                    footerView: AlertView.FooterView
                });

                alert.show();
            }
        }
    });

    var mapPreReqQuestions = function(obj, mappingAttribrutes) {
        if (_.get(obj, 'length') > 0 && obj[0].question === "null") {
            return [];
        }

        if (!mappingAttribrutes) {
            return _.map(obj, function(question) {
                return {
                    label: question.question,
                    value: question.answer,
                    name: question.question
                };
            });
        } else {
            return _.map(obj, function(question) {

                if (question['observation-result']) {
                    return {
                        //Add level of 'observation-result' to object in order to find correct properties TODO - this is not an issue on local for some reason-find out why
                        label: question['observation-result'][mappingAttribrutes.label],
                        value: question['observation-result'][mappingAttribrutes.value],
                        name: question['observation-result'][mappingAttribrutes.name]
                    };
                } else {
                    return {
                        label: question[mappingAttribrutes.label],
                        value: question[mappingAttribrutes.value],
                        name: question[mappingAttribrutes.name]
                    };
                }
            });
        }
    };
    var mapPreReqOrders = function(obj, mappingAttributes) {
        if (_.get(obj, 'length') > 0 && obj[0][mappingAttributes.label] === "null") {
            return [];
        }

        return _.map(obj, function(obj) {
            return _.extend(obj, {
                label: obj[mappingAttributes.label],
                value: obj[mappingAttributes.value],
                name: obj[mappingAttributes.name],
                statusDate: obj[mappingAttributes.statusDate],
                ien: obj[mappingAttributes.ien] || null,
                domain: obj[mappingAttributes.domain],
                action: obj[mappingAttributes.action],
                uid: obj[mappingAttributes.uid]
            });
        });
    };

    /**
     * US11569/TA77556 - Use a custom template and supporting helpers to allow the toggling of the
     * Order option according to the remediation action.
     */
    var templateHelpers = _.extend({}, Handlebars.helpers, {
        id: function(model) {
            var prefix = model.prependToDomId ? model.prependToDomId + '-' : '';
            return prefix + model.formAttributeName + '-' + model.name;
        },
        isSelected: function(optionValue, model) {
            if (optionValue === model.value) {
                return new Handlebars.SafeString(' selected');
            }
            return '';
        },
        if_eq: function(a, b, options) {
            if (a === b) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        }
    });

    var preReqOrdersSelectTemplate = Handlebars.compile([
        '<div class="select-list-caret"></div>' +
        '<select ' +
        'id="{{clean-for-id (id this)}}" ' +
        'name="{{clean-for-id (id this)}}"' +
        '{{#if title}}title="{{title}}" {{else}}title="Use up and down arrow keys to view options and press enter to select" {{/if}}' +
        '{{#if disabled}}disabled {{else}}{{#if controlDisabled}}disabled {{/if}}{{/if}}' +
        '{{#if required}}required {{else}}{{#if controlRequired}}required {{/if}}{{/if}}' +
        '{{#if multiple}}multiple {{else}}{{#if controlMultiple}}multiple {{/if}}{{/if}}' +
        '>',
        '<option value=""></option>',
        '{{#if_eq action "order"}}<option value="Order"{{#if orderDisabled}} disabled{{/if}}{{isSelected "Order" @root}}>Order</option>{{/if_eq}}',
        '<option value="Override"{{#if disabled}} disabled{{/if}}{{isSelected "Override" @root}}>Override</option>',
        '<option value="Satisfied"{{#if disabled}} disabled{{/if}}{{isSelected "Satisfied" @root}}>Satisfied with data external to VA</option>',
        '</select>',
    ].join('\n'));

    var fromJBPMOrdersMapping = {
        label: 'orderName',
        value: 'status',
        name: 'orderName',
        statusDate: 'statusDate',
        domain: 'domain',
        action: 'action',
        ien: 'ien',
        uid: 'uid'
    };
    var fromCDSOrdersMapping = {
        label: 'display',
        value: '',
        name: 'code'
    };

    var fromCDSQuestionsMapping = {
        label: 'question-text',
        value: 'value',
        name: 'question-text'
    };

    var errorMessageContainer = {
        control: "container",
        extraClasses: ["row"],
        items: [{
            control: "alertBanner",
            name: "errorMessage",
            title: "Unable To Submit",
            extraClasses: ["col-xs-12"],
            type: "danger",
            dismissible: false
        }]
    };

    var orderEntryFields =
        [{
            control: 'container',
            extraClasses: ['modal-body'],
            items: [{
                control: 'container',
                extraClasses: ['container-fluid'],
                items: [errorMessageContainer, {
                    control: 'container',
                    template: EditOrderHeaderTemplate,
                    hidden: true,
                    modelListeners: ['consultName', 'instructions', 'state', 'subState'],
                    extraClasses: ['edit_order_header']
                }, {
                    control: 'container',
                    extraClasses: ['row'],
                    items: [{
                        control: 'container',
                        extraClasses: ['col-xs-12', 'top-margin-xs', 'bottom-margin-xs'],
                        items: [{
                            control: 'select',
                            name: 'consultName',
                            required: true,
                            label: 'Consult Name',
                            title: 'Press enter to open search filter text',
                            showFilter: true,
                            picklist: [],
                            options: {
                                minimumInputLength: 0
                            }
                        }]
                    }]
                }, {
                    control: 'container',
                    extraClasses: ['the_rest_of_the_form'],
                    items: [{
                        control: 'container',
                        extraClasses: ['row'],
                        items: [{
                            control: 'container',
                            extraClasses: ['col-xs-12', 'bottom-margin-xs'],
                            items: [{
                                control: 'select',
                                name: 'urgency',
                                label: 'Urgency',
                                title: 'Use up and down arrow keys to view options and press enter to select',
                                required: 'true',
                                pickList: [{
                                    value: '2',
                                    label: 'Emergent (24 hours or less)'
                                }, {
                                    value: '4',
                                    label: 'Urgent (7 days or less)'
                                }, {
                                    value: '9',
                                    label: 'Routine (30 days or less)'
                                }]
                            }, {
                                control: 'select',
                                name: 'acceptingProvider',
                                extraClasses: 'top-margin-sm',
                                label: 'Provider who accepted Consult',
                                required: 'true',
                                disabled: 'true',
                                hidden: 'true',
                                title: 'Press enter to open search filter text',
                                showFilter: true,
                                options: {
                                    placeholder: 'Provider Contacted',
                                    minimumInputLength: 2,
                                    language: {
                                        inputTooShort: function() {
                                            return 'Enter at least 2 characters of the person\'s name';
                                        }
                                    }
                                },
                                attributeMapping: {
                                    label: 'name',
                                    value: 'personID'
                                },
                                pickList: []
                            }, {
                                control: 'container',
                                extraClasses: ['form-group', 'instructions-container'],
                                template: '<p class="faux-label top-margin-sm bottom-margin-xs">Instructions</p> <div class="control inline-display button-control action-instructions"><button type="button" class="btn btn-icon btn-sm" title="Press enter to view instructions for consults" data-instructions class="btn btn-info btn-sm"><i class="fa fa-file-text-o font-size-14"></i> Instructions</button></div>'
                            }, {
                                control: 'container',
                                template: '<h5 class="bottom-border-grey-darker">Pre-Requisites</h5>',
                                extraClasses: ['prereqFieldset'],
                                items: [{
                                    control: 'container',
                                    template: '<p class="top-margin-sm color-grey-darkest"><strong>Questions *</strong></p>',
                                    extraClasses: ['preReqQuestions'],
                                    items: [{
                                        control: 'selectList',
                                        name: 'preReqQuestions',
                                        label: 'Pre-Requisite Questions',
                                        labelTemplate: '<label for="preReqQuestions-{{label}}" class="transform-none">{{label}}</label>',
                                        srOnlyLabel: true,
                                        collection: null,
                                        options: [{
                                            label: 'Yes',
                                            value: 'Yes'
                                        }, {
                                            label: 'No',
                                            value: 'No'
                                        }, {
                                            label: 'Override',
                                            value: 'Override'
                                        }]
                                    }]
                                }, {
                                    control: 'container',
                                    template: '<p class="top-margin-sm color-grey-darkest"><strong>Orders and Results *</strong></p>',
                                    extraClasses: ['preReqOrders'],
                                    items: [{
                                        name: 'preReqOrders',
                                        label: 'Pre-Requisite Orders',
                                        required: true,
                                        labelTemplate: '<label for="preReqOrders-{{label}}" class="transform-none">{{label}}</label>',
                                        control: "selectList",
                                        srOnlyLabel: true,
                                        collection: null,
                                        getValueTemplate: function(model, index) {
                                            var json = model.toJSON();
                                            return model.get('value').match(':comp') || model.get('value').match('Passed') ?
                                                orderCompletedTemplate(json, {
                                                    helpers: templateHelpers
                                                }) :
                                                preReqOrdersSelectTemplate(json, {
                                                    helpers: templateHelpers
                                                });
                                        }
                                    }]
                                }, {
                                    control: 'textarea',
                                    name: 'orderResultComment',
                                    label: 'Satisfied with data external to VA - Comment',
                                    extraClasses: 'top-margin-xs',
                                    required: true,
                                    rows: 7,
                                    hidden: true,
                                    charCount: true,
                                    title: 'Enter information regarding external data'
                                }, {
                                    control: 'textarea',
                                    name: 'overrideReason',
                                    label: 'Reason for Override',
                                    extraClasses: 'top-margin-xs',
                                    required: true,
                                    rows: 7,
                                    hidden: true,
                                    charCount: true,
                                    title: 'Enter in the reason for override'
                                }]
                            }, {
                                control: 'select',
                                name: 'destinationFacility',
                                label: 'Location for Consultation',
                                extraClasses: ['top-margin-md'],
                                showFilter: true,
                                options: {
                                    minimumInputLength: 0
                                },
                                title: 'Use up and down arrow keys to view options and press enter to select',
                                attributeMapping: {
                                    label: 'name',
                                    value: 'division'
                                },
                                required: true
                            }]
                        }]
                    }, {
                        control: 'container',
                        extraClasses: ['row', 'bottom-margin-xs'],
                        items: [{
                            control: 'datepicker',
                            name: 'earliestDate',
                            label: 'Earliest date',
                            extraClasses: ['col-xs-6'],
                            startDate: '0d',
                            required: true,
                            flexible: true,
                            minPrecision: "day",
                        }, {
                            control: 'datepicker',
                            name: 'latestDate',
                            label: 'Latest date',
                            extraClasses: ['col-xs-6'],
                            startDate: '0d',
                            required: true,
                            flexible: true,
                            minPrecision: "day",
                        }]
                    }, {
                        control: 'container',
                        extraClasses: ['row'],
                        items: [{
                            control: 'container',
                            extraClasses: ['col-xs-12'],
                            items: [{
                                control: 'select',
                                name: 'condition',
                                label: 'Conditions related to this consult',
                                title: 'Use up and down arrow keys to view options and press enter to select',
                                showFilter: true,
                                options: {
                                    minimumInputLength: 0
                                },
                                attributeMapping: {
                                    label: 'problemText',
                                    value: 'snomedCode'
                                }
                            }, {
                                control: 'container',
                                template: '<h5 class="bottom-border-grey-dark bottom-margin-xs">Reason for request</h5>',
                                items: [{
                                    control: 'textarea',
                                    name: 'requestReason',
                                    label: 'Request',
                                    required: true,
                                    rows: 4,
                                    title: 'Enter in a reason for overriding'
                                }],
                            }, {
                                control: 'textarea',
                                name: 'requestComment',
                                label: 'Comment (clinical history)',
                                title: 'Enter a comment',
                                rows: 4
                            }]
                        }]
                    }]

                }]
            }]
        }, {
            control: 'container',
            extraClasses: ['modal-footer footer-extended'],
            items: [{
                control: 'container',
                extraClasses: ['row'],
                items: [{
                    control: 'container',
                    extraClasses: ["col-xs-12", "left-padding-sm", "bottom-padding-xs"],
                    items: [{
                        control: 'container',
                        extraClasses: ["text-left inProgressContainer"],
                        hidden: true,
                        template: Handlebars.compile('<i class="fa fa-spinner fa-spin pull-left"></i> {{inProgressMessage}}'),
                        modelListeners: ["inProgressMessage"]

                    }]
                }]
            }, {
                control: 'container',
                extraClasses: ['row'],
                items: [{
                    control: 'container',
                    extraClasses: ['col-xs-12', 'display-flex', 'valign-bottom'],
                    items: [{
                        control: 'container',
                        extraClasses: ['flex-grow-loose', 'text-left'],
                        items: [{
                            control: 'popover',
                            behaviors: {
                                Confirmation: {
                                    title: 'Delete',
                                    eventToTrigger: 'consult-add-confirm-delete',
                                    message: 'Are you sure you want to delete?',
                                    confirmButtonTitle: 'Press enter to delete'
                                }
                            },
                            label: 'Delete',
                            name: 'consultAddDeleteButton',
                            extraClasses: ['btn-default', 'btn-sm']
                        }]
                    }, {
                        control: 'popover',
                        behaviors: {
                            Confirmation: {
                                title: 'Warning',
                                eventToTrigger: 'consult-add-confirm-cancel'
                            }
                        },
                        label: 'Cancel',
                        name: 'consultAddConfirmCancel',
                        extraClasses: ['btn-default', 'btn-sm', 'right-margin-xs']
                    }, {
                        control: 'button',
                        extraClasses: ['btn-primary', 'btn-sm'],
                        id: 'consult-add-save-button',
                        label: 'Draft',
                        type: 'button',
                        title: 'Press enter to save as draft and close'
                    }, {
                        control: 'button',
                        extraClasses: ['btn-primary', 'btn-sm'],
                        id: 'consult-add-begin-workup-button',
                        label: 'Begin Workup',
                        type: 'button',
                        title: 'Press enter to begin workup'
                    }, {
                        control: 'button',
                        extraClasses: ['btn-primary', 'btn-sm'],
                        id: 'consult-add-accept-button',
                        label: 'Accept',
                        type: 'button',
                        title: 'Press enter to accept'
                    }, {
                        control: 'button',
                        extraClasses: ['btn-primary', 'btn-sm'],
                        id: 'consult-add-edit-save-button',
                        label: 'Accept',
                        type: 'button',
                        hidden: true,
                        disabled: true,
                        title: 'Press enter to accept'
                    }]
                }]
            }]
        }];

    return {
        orderEntryFields: orderEntryFields,
        PreReqCollection: PreReqCollection,
        mapPreReqQuestions: mapPreReqQuestions,
        mapPreReqOrders: mapPreReqOrders,
        fromJBPMOrdersMapping: fromJBPMOrdersMapping,
        fromCDSOrdersMapping: fromCDSOrdersMapping,
        fromCDSQuestionsMapping: fromCDSQuestionsMapping
    };
});