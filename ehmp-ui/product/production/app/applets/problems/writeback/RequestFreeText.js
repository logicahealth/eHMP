define([
    'backbone',
    'marionette',
    'jquery',
    'moment',
    'handlebars'
], function(Backbone, Marionette, $, moment, Handlebars) {
    'use strict';

    var freeTextMsgContainer = {
        control: 'container',
        items: [{
            control: 'container',
            extraClasses: ['row', 'all-padding-sm', 'top-padding-xl', 'background-color-pure-white', 'bottom-border-grey', 'keep-problem-container'],
            items: [{
                control: 'container',
                extraClasses: ['col-xs-6', 'left-padding-no'],
                modelListeners: ['showKeepProblem', 'problemText'],
                template: '{{#if showKeepProblem}}<p class="bottom-margin-xs"><strong>Currently Selected Problem</strong></p><p>{{problemText}}</p>{{/if}}'
            }, {
                control: 'container',
                extraClasses: ['col-xs-6', 'left-padding-no'],
                items: [{
                    control: 'button',
                    extraClasses: ['btn', 'btn-sm', 'btn-primary', 'keep-previous-btn'],
                    name: 'keepProblemBtn',
                    label: 'Keep Previous Problem Name',
                    type: 'button',
                    hidden: true,
                    title: 'Press enter to keep the previous problem name'
                }]

            }]
        }, {
            control: 'container',
            extraClasses: ['row', 'top-padding-md', 'background-color-pure-white'],
            items: [{
                control: 'container',
                extraClasses: ['col-xs-1', 'left-padding-sm'],
                items: [{
                    control: 'container',
                    modelListeners: ['problemTerm'],
                    template: '<i class="fa fa-warning font-size-22 color-red-dark right-padding-sm"><span class="sr-only">Warning</span></i>'
                }]
            }, {
                control: 'container',
                extraClasses: 'col-xs-11',
                items: [{
                    control: 'container',
                    modelListeners: ['problemTerm'],
                    template: '<p>A suitable term was not found based on user input and current defaults. If you proceed with this nonspecific term, an ICD code of "<strong>R69-ILLNESS, UNSPECIFIED</strong>" will be filed.</p><p><strong>Use "{{problemTerm}}"?</strong></p>'
                }]
            }]
        }, {
            control: 'container',
            extraClasses: ['row', 'left-padding-xl', 'pixel-height-50', 'background-color-pure-white'],
            items: [{
                control: 'checkbox',
                extraClasses: ['left-padding-lg'],
                name: 'requestTermCheckBox',
                label: 'Request New Term'
            }]
        }, {
            control: 'container',
            extraClasses: ['row', 'left-padding-xl', 'background-color-pure-white'],
            items: [{
                control: 'textarea',
                extraClasses: ['left-padding-lg', 'right-padding-lg'],
                name: 'freeTxtTxtArea',
                label: 'New Term Request Comment',
                rows: 5,
                placeholder: 'Description to help the evaluation of your request',
                hidden: true
            }]
        }, {
            control: 'container',
            extraClasses: ['row', 'all-padding-sm', 'top-padding-xl', 'background-color-pure-white', 'text-right'],
            name: 'freeTextMsgContainer',
            items: [{
                control: 'container',
                items: [{
                    control: 'button',
                    id: 'ftYesBtn',
                    extraClasses: ['btn-primary', 'btn-sm'],
                    label: 'Yes',
                    name: 'freeTxtMsg',
                    type: 'button'
                }, {
                    control: 'button',
                    id: 'ftNoBtn',
                    extraClasses: ['btn-primary', 'btn-sm'],
                    label: 'No',
                    type: 'button',
                    name: 'freeTxtMsg'
                }]
            }]
        }]
    };


    var RequestTermFields = [{
        control: 'container',
        extraClasses: ['modal-body'],
        items: [{
            control: 'container',
            extraClasses: ['scroll-enter-form col-xs-12'],
            items: [freeTextMsgContainer]
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
                items: [{
                    control: 'button',
                    id: 'cancelFormSearchProblem',
                    extraClasses: ['btn-default', 'btn-sm'],
                    label: 'Cancel',
                    type: 'button',
                    name: 'cancel-form-search-problem'
                }, {
                    control: "dropdown",
                    split: true,
                    label: "Add",
                    name: 'freeTextAddContainer',
                    items: [{
                        label: "Add",
                        id: "add"
                    }, {
                        label: "Add & Create Another",
                        id: "addCreate"
                    }]
                }]
            }]
        }]
    }];

    var CancelMessageView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('All unsaved changes will be lost. Are you sure you want to cancel?'),
        tagName: 'p'
    });
    var CancelFooterView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('{{ui-button "No" classes="btn-default" title="Press enter to cancel."}}{{ui-button "Yes" classes="btn-primary" title="Press enter to continue."}}'),
        events: {
            'click .btn-primary': function() {
                ADK.UI.Alert.hide();
                ADK.UI.Workflow.hide();
                this.options.workflow.close();
            },
            'click .btn-default': function() {
                ADK.UI.Alert.hide();
            }
        },
        tagName: 'span'
    });

    var requestFreeTextView = ADK.UI.Form.extend({
        ui: {
            'problemTerm': '#problemTerm',
            'requestTermCheckBox': '.requestTermCheckBox',
            'freeTxtTxtArea': '.freeTxtTxtArea',
            'freeTextAddContainer': '.freeTextAddContainer',
            'keepProblemBtn': '.keepProblemBtn'
        },
        fields: RequestTermFields,
        onRender: function() {
            this.ui.freeTextAddContainer.trigger('control:disabled', true);
        },
        events: {
            'click @ui.keepProblemBtn': function(e) {
                e.preventDefault();
                this.model.set({
                    'problemTerm': this.model.get('problemText'),
                    'requestTermCheckBox': this.model.get('previousRequestTermCheckBox'),
                    'freeTxtTxtArea': this.model.get('previousFreeTxtTxtArea')
                });
                this.model.trigger('showFtArea', this.model.get('showDetails'));
                this.workflow.goToIndex(this.workflow.model.get('steps').length - 1);
            },
            'click #cancelFormSearchProblem': function(e) {
                e.preventDefault();
                var cancelAlertView = new ADK.UI.Alert({
                    title: 'Cancel',
                    icon: 'icon-triangle-exclamation',
                    messageView: CancelMessageView,
                    footerView: CancelFooterView,
                    workflow: this.workflow
                });
                cancelAlertView.show();
            },
            'click #ftNoBtn': function(e) {
                e.preventDefault();
                this.model.set({
                    'requestTermCheckBox': this.model.get('previousRequestTermCheckBox'),
                    'freeTxtTxtArea': this.model.get('previousFreeTxtTxtArea')
                });
                this.workflow.goToPrevious();
            },
            'click #ftYesBtn': function(e) {
                e.preventDefault();

                this.model.set({
                    'problemText': this.model.get('problemTerm'),
                    'isFreeTextProblem': true,
                    'showDetails': false
                });
                this.model.trigger('showFtArea', false);
                this.workflow.goToNext();
            },
            submit: function() {
                console.log('submit event fired');
            }
        },
        modelEvents: {
            'change:showKeepProblem': function() {
                this.ui.keepProblemBtn.trigger('control:hidden', !this.model.get('showKeepProblem'));
                this.model.trigger('showFtArea', false);
            },
            'change:problemResults': function() {
                this.workflow.goToNext();
            },
            'change:requestTermCheckBox': function() {
                var requestTermCheckBox = this.model.get('requestTermCheckBox');
                this.ui.freeTxtTxtArea.trigger('control:hidden', !requestTermCheckBox);
            },
            'change:freeTxtTxtArea': function() {
                this.model.set('editableFreeTxtTxtArea', this.model.get('freeTxtTxtArea'));
            }
        }
    });

    return requestFreeTextView;
});
