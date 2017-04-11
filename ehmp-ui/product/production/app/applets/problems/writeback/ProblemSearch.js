define([
    'backbone',
    'marionette',
    'jquery',
    'moment',
    'handlebars',
    'app/applets/problems/writeback/parseUtils'
], function(Backbone, Marionette, $, Moment, Handlebars, ParseUtil) {
    'use strict';

    var selectProblemContainer = {
        control: 'container',
        extraClasses: ['col-xs-12'],
        items: [                
        {
                control: 'container',
                modelListeners: ['showKeepProblem', 'problemText'],                
                template: '{{#if showKeepProblem}}<p class="faux-label bottom-margin-md">Currently Selected Problem<span class="pull-right"><button type="button" id="keepProblemBtn" class="btn btn-link keep-problem-btn top-padding-no" title="Press enter to keep problem name.">Keep Previous Problem Name</button></span></p><p>{{problemText}}</p>{{/if}}',
                extraClasses: ['all-padding-sm', 'keepProblemContainer', 'form-group']
        },
        {
            control: 'input',
            name: 'problemTerm',
            label: 'Problem Name',
            required: true,
            extraClasses: ['col-xs-9', 'top-margin-sm'],
            title: 'Please enter in text to begin searching for a problem'
        },
        {
            control: 'container',
            extraClasses: ['col-xs-2'],
            items: [{
                control: 'container',
                extraClasses: [],
                items: [{
                    control: 'button',
                    extraClasses: ['btn-link', 'invisible'],
                    id: 'problemCancelSearchBtn',
                    name: 'problem-cancel-search-btn',
                    label: 'Reset Search',
                    type: 'button'
                }]
        },
        {
            control: 'container',
            extracClasses: [],
            items: [{
                control: 'button',
                id: 'problemSearchBtn',
                name: 'problem-search-btn',
                title: 'Click to search for problems',
                type: 'button',
                label: 'Search',
                disabled: false,
                extraClasses: ['btn-primary', 'left-padding-xl', 'right-padding-xl']
            }]
        }]
        }]
    };

    var problemResultsContainer = {
        control: 'container',
        extraClasses: ['problem-results-container', 'col-xs-12'],
        items: [{
            control: 'container',
            extraClasses: ['text-center', 'col-xs-12'],
            template: '{{resultsHeaderText}}',
            modelListeners: ['resultsHeaderText']
        },
        {
            control: 'treepicker',
            name: 'problemResults',
            extraClasses: ['col-xs-12', 'all-border-grey-light'],
            selectableNodes: true,
            attributeMapping: {
                treeItemDescription: 'prefText'
            }
        }]
    };

    var problemResultsMessageContainer = {
        control: 'container',
        extraClasses: ['problem-results-message-container', 'left-margin-xs', 'col-xs-12'],
        template: '{{#each resultsMessage}}{{this}}<br>{{/each}}',
        modelListeners: ['resultsMessage']
    };

    var extendSearchContainer = {
        control: 'container',
        extraClasses: ['col-xs-12'],
        items: [{
            control: 'button',
            id: 'extendedSearchBtn',
            name: 'extended-search-btn',
            title: 'Extend Search',
            type: 'button',
            label: 'Extend Search',
            hidden: true,
            extraClasses: ['btn-default', 'left-padding-xl', 'right-padding-xl', 'pull-right']
        },
        {
            control: 'button',
            id: 'freeTxtBtn',
            name: 'free-txt-btn',
            title: 'Enter as Free Text',
            type: 'button',
            label: 'Enter Free Text',
            hidden: true,
            extraClasses: ['btn-default', 'left-padding-xl', 'right-padding-xl', 'pull-right']
        }]
    };

    var ProblemSearchFields = [{
        control: 'container',
        extraClasses: ['modal-body'],
        items: [{
            control: 'container',
            extraClasses: ['container-fluid'],
            items: [selectProblemContainer, problemResultsContainer, extendSearchContainer, problemResultsMessageContainer]
        }]
    }, {
        control: "container",
        extraClasses: ["modal-footer"],
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
                    label: "ADD",
                    name: 'searchAddContainer',
                    items: [{
                        label: "Add",
                        id: "add"
                    }, {
                        label: "Add and Create Another",
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

    var problemSearchView = ADK.UI.Form.extend({  
        ui: {
            'problemTerm': '#problemTerm',
            'resultsMessage': '.problem-results-message-container',
            'problemSearchBtn': '#problemSearchBtn',
            'problemSearchBtnComp': '.problem-search-btn',
            'problemResults': '.problemResults',
            'problemResultsContainer': '.problem-results-container',
            'cancelFormSearchProblem': '#cancelFormSearchProblem',
            'cancelSearch': '#problemCancelSearchBtn',
            'freeTxtBtn': '#freeTxtBtn',
            'extendSearchBtn': '#extendedSearchBtn',
            'searchAddContainer': '.searchAddContainer',
            'keepProblemContainer': '.keepProblemContainer'

        },
        fields: ProblemSearchFields,
         onRender: function(){
            this.ui.searchAddContainer.trigger('control:disable', true);
         },
        events: {
            'click #keepProblemBtn': function(e) {
                e.preventDefault();
                this.removeProblemResultTable();
                this.model.set('problemTerm', this.model.get('problemText'));

                if(!this.model.get('isFreeTextProblem')){
                    this.model.set('showDetails', false);
                }

                this.model.trigger('showFtArea', this.model.get('showDetails'));

                this.workflow.goToIndex(this.workflow.model.get('steps').length - 1);    
            },            
            'click #freeTxtBtn': function(e) {
                e.preventDefault();
                this.showRequestFtView();
            },
            'click #extendedSearchBtn': function(e){
                e.preventDefault();
                this.performSearch(true);
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
            'click #problemSearchBtn': function(e){
                e.preventDefault();
                this.performSearch(false);
            },
            'keypress #problemCancelSearchBtn': function(e){
                e.preventDefault();
                e.stopPropagation();

                if(e.which === 13){
                    this.handleCancelButton();
                }
            },
            'keyup #problemTerm': function(e){
                e.preventDefault();
                if(e.which === 13){
                    if(this.$('#problemTerm').val().length > 0){
                        this.$('#problemSearchBtn').click();
                    }
                } else if(e.which !== 37 && e.which !== 39 && e.which !== 9 && e.which !== 27){
                    this.removeProblemResultTable();
                }
            },
            'input #problemTerm': function(e){
                if(this.$('#problemTerm').val().length === 0){
                    this.removeProblemResultTable();
                }
            },
            'click #problemCancelSearchBtn': function(e){
                e.preventDefault();
                this.handleCancelButton();
            }
        },
        modelEvents: {
            'change:showKeepProblem': function(){
                if(this.model.get('showKeepProblem')){
                    this.$(this.ui.keepProblemContainer).addClass('background-color-grey-lighter');
                }
            },            
            'change:problemResults': function(){
                this.model.set({
                    'isFreeTextProblem': false,
                    'problemText': this.model.get('problemResults').get('prefText'),
                    'resultsMessage': ''                   
                });
                this.removeProblemResultTable();
                this.$(this.ui.cancelSearch).addClass('invisible');
                this.$(this.ui.problemTerm).val('');
                this.model.trigger('showFtArea', false);                
                this.workflow.goToNext();
            }
        },
        showRequestFtView: function(){
                this.removeProblemResultTable();

                this.model.set({
                    'previousRequestTermCheckBox': this.model.get('requestTermCheckBox'),
                    'previousFreeTxtTxtArea': this.model.get('freeTxtTxtArea')
                });                

                this.model.set(
                    {
                        'requestTermCheckBox': '', 
                        'freeTxtTxtArea': ''
                    }, 
                    {   unset: true
                    }
                );
                this.workflow.goToNext();
        },
        removeProblemResultTable: function(){
            this.$(this.ui.cancelSearch).addClass('invisible');
            this.ui.extendSearchBtn.trigger('control:hidden', true);
            this.ui.freeTxtBtn.trigger('control:hidden', true);
            this.model.unset('resultsHeaderText');
            this.ui.problemResults.trigger('control:hidden', true);
            this.ui.problemResults.trigger('control:picklist:set', []);
            this.model.set('resultsMessage', '');
        },
        handleCancelButton: function(){
            this.removeProblemResultTable();
            this.$('#problemTerm').val('').focus();
        },
        performSearch: function(extended){
            var form = this;
            this.removeProblemResultTable();
            this.ui.problemSearchBtnComp.trigger('control:disabled', true);
            this.ui.problemResults.trigger('control:loading:show');
            this.ui.problemResults.trigger('control:hidden', false);
            var term = this.$('#problemTerm').val();
            var termCollection;

            if(extended){
                termCollection = new ADK.UIResources.Picklist.Problems.ExtendedTerms();
            } else {
                termCollection = new ADK.UIResources.Picklist.Problems.Terms();
            }

            termCollection.on('read:success', function(collection, response){
                if(termCollection.length > 2){
                    // JSON format has 2 extra items added to the collection with results count - need to remove them
                    termCollection.pop();
                    termCollection.pop();

                    form.ui.problemResults.trigger('control:hidden', false);

                    if(extended){
                        form.model.set('resultsHeaderText', 'EXTENDED SEARCH RESULTS');
                    } else {
                        form.model.set('resultsHeaderText', 'SEARCH RESULTS');
                    }

                    form.ui.problemResults.trigger('control:loading:hide');
                    form.ui.problemResults.trigger('control:picklist:set', [ParseUtil.buildSearchResults(termCollection)]);

                    form.$(form.ui.cancelSearch).removeClass('invisible');

                    if(extended){
                        form.ui.freeTxtBtn.trigger('control:hidden', false);
                    } else {
                        form.ui.extendSearchBtn.trigger('control:hidden', false);
                    }
                } else {
                    form.ui.problemResults.trigger('control:loading:hide');
                    if(extended){
                        form.showRequestFtView();
                    } else {
                        form.performSearch(true);
                    }
                }

                form.ui.problemSearchBtnComp.trigger('control:disabled', false);
            });

            termCollection.on('read:error', function(collection, error){
                form.ui.problemSearchBtnComp.trigger('control:disabled', false);
                form.ui.problemResults.trigger('control:loading:hide');
                form.ui.problemResults.trigger('control:hidden', true);
                form.model.set('resultsMessage', ParseUtil.formatSearchErrorMessage(error));
                form.$(form.ui.cancelSearch).removeClass('invisible');
            });

            termCollection.fetch({searchString: term, synonym: 1, noMinimumLength: 1});
        }
    });

        return problemSearchView;
});