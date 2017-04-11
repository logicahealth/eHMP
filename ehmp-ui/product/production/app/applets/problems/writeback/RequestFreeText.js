define([
    'backbone',
    'marionette',
    'jquery',
    'moment',
    'handlebars'
], function(Backbone, Marionette, $, Moment, Handlebars) {
    'use strict';

    var freeTextMsgContainer = {
            control: 'container',
            extraClasses: ['col-md-12', 'background-color-grey-lighter', 'top-padding-md', 'bottom-padding-md'],
            items: [
                    {
                        control: 'container',
                        extraClasses: ['left-padding-md', 'form-group', 'pull-left', 'col-md-6'],                        
                        modelListeners: ['showKeepProblem', 'problemText'],                
                        template: '{{#if showKeepProblem}}<p class="faux-label bottom-margin-md">Currently Selected Problem</p>{{/if}}'
                    },            
                    {
                        control: 'button',
                        extraClasses: ['btn-link', 'pull-right', 'col-md-6', 'top-padding-no'],
                        name: 'keepProblemBtn',
                        label: 'Keep Previous Problem Name',
                        type: 'button',
                        hidden: true
                    },
                    {
                        control: 'container',
                        extraClasses: ['pull-left', 'left-padding-xl', 'col-md-12' ],
                        modelListeners: ['showKeepProblem', 'problemText'],
                        template: Handlebars.compile('{{#if showKeepProblem}}<p>{{problemText}}</p>{{/if}}')
                    },                    
                    {
                        control: 'container',
                        extraClasses: ['col-md-1', 'left-padding-xl'],
                        modelListeners: [],
                        template: Handlebars.compile('<i class="fa fa-warning fa-2x color-tertiary"></i>')
                    },
                    {
                        control: 'container',
                        extraClasses: ['col-md-10', 'left-padding-xl'],
                        modelListeners: ['problemTerm'],
                        template: Handlebars.compile('<p>A suitable term was not found based on user input and current defaults. if you proceed with this nonspefic term, an ICD code of "<strong>R69-ILLNESS, UNSPECIFIED</strong>" will be filed.</p><p><strong>Use "{{problemTerm}}"?</strong></p>')
                    },                   
                    {
                        control: 'checkbox',
                        extraClasses: ['col-md-offset-1', 'col-md-10', 'left-padding-xl'],
                        name: 'requestTermCheckBox',
                        label: 'Request New Term'
                    },                     
                    {
                        control: 'textarea',
                        extraClasses: ['col-md-offset-1', 'col-md-10', 'left-padding-xl', 'bottom-padding-sm'],
                        name: 'freeTxtTxtArea',
                        label: 'New Term Request Comment',
                        placeholder: 'Description to help the evaluation of your request',
                        hidden: true
                    },                    
                    {
                        control: 'container',
                        extraClasses: ['col-md-10'],
                        name: 'freeTextMsgContainer',                      
                        items: [{
                            control: 'container',
                            extraClasses: ['left-padding-xl', 'col-md-offset-1', 'col-md-11'],
                            items: [{
                                control: 'button',
                                id: 'ftYesBtn',
                                extraClasses: ['btn-default', 'btn-sm', 'left-padding-lg', 'right-padding-lg'],
                                label: 'Yes',
                                name: 'freeTxtMsg',
                                type: 'button'
                            },
                            {
                                control: 'button',
                                id: 'ftNoBtn',
                                extraClasses: ['btn-default', 'btn-sm', 'left-padding-lg', 'right-padding-lg'],
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
                extraClasses: ['col-md-12'],
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
                        id: "add-create"
                    }]
                }]
            }]
        }]
    }];

    var CancelMessageView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('You will lose all work in progress if you cancel this observation. Would you like to proceed with ending this observation?'),
        tagName: 'p'
    });
    var CancelFooterView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('{{ui-button "Cancel" classes="btn-default" title="Press enter to cancel."}}{{ui-button "Continue" classes="btn-primary" title="Press enter to continue."}}'),
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
        onRender: function(){
            this.ui.freeTextAddContainer.trigger('control:disable', true);
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
                    title: 'Are you sure you want to cancel?',
                    icon: 'fa-warning color-red',
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
            } 
        },
        modelEvents: {
            'change:showKeepProblem': function(){
                this.ui.keepProblemBtn.trigger('control:hidden', !this.model.get('showKeepProblem'));                        
                this.model.trigger('showFtArea', false);                  
            },            
            'change:problemResults': function(){
                this.workflow.goToNext();
            },
            'change:requestTermCheckBox': function(){
                var requestTermCheckBox = this.model.get('requestTermCheckBox');
                this.ui.freeTxtTxtArea.trigger('control:hidden', !requestTermCheckBox);                    
            }            
        }
    });

        return requestFreeTextView;
});