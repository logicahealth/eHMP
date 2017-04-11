define([
    'backbone',
    'marionette',
    'jquery',
    'moment',
    'handlebars',
    'app/applets/problems/writeback/parseUtils',
    'app/applets/problems/writeback/writebackUtils'
], function(Backbone, Marionette, $, moment, Handlebars, ParseUtil, WritebackUtils) {
    'use strict';

    var selectProblemContainer = {
        control: 'container',
        extraClasses: ['row', 'all-padding-sm', 'bottom-padding-no'],
        items: [{
            control: 'container',
            modelListeners: ['row', 'showKeepProblem', 'problemText'],
            extraClasses: ['row', 'all-padding-md', 'top-padding-lg', 'keep-problem-container', 'background-color-pure-white'],
            template: '{{#if showKeepProblem}}<div class="col-xs-6 left-padding-no"><p class="bottom-margin-xs"><strong>Currently Selected Problem</strong></p><p>{{problemText}}</p></div><div class="col-xs-6 all-padding-no"><button type="button" id="keepProblemBtn" class="btn btn-sm btn-primary" title="Press enter to keep previous problem name.">Keep Previous Problem Name</button></div>{{/if}}',
            hidden: true
        }, {
            control: 'container',
            extraClasses: ['row'],
            items: [{
                control: 'searchbar',
                id: 'problemTerm',
                name: 'problemTerm',
                label: 'Problem name',
                placeholder: 'Search for problem',
                required: true,
                extraClasses: ['col-xs-12', 'top-margin-sm'],
                title: 'Enter in text to search for a problem',
                minimumInputLength: 3
            }]
        }]
    };

    var problemResultsContainer = {
        control: 'container',
        extraClasses: ['problem-results-container', 'row', 'all-padding-sm', 'top-padding-no'],
        items: [{
            control: 'container',
            extraClasses: ['text-center', 'col-xs-12', 'problem-results-header', 'color-primary-dark', 'all-margin-no', 'bottom-border-grey-light', 'all-padding-xs'],
            template: '{{resultsHeaderText}}',
            hidden: true,
            modelListeners: ['resultsHeaderText']
        }, {
            control: 'treepicker',
            name: 'problemResults',
            extraClasses: ['col-xs-12', 'panel-body', 'top-padding-no', 'bottom-padding-no', 'bottom-border-grey-light'],
            selectableNodes: true,
            attributeMapping: {
                treeItemDescription: 'prefText'
            }
        }, {
            control: 'container',
            extraClasses: ['panel-footer', 'problem-results-footer', 'text-right'],
            hidden: true,
            items: [{
                control: 'button',
                id: 'extendedSearchBtn',
                name: 'extended-search-btn',
                type: 'button',
                label: 'Extend Search',
                hidden: true,
                extraClasses: ['btn-default', 'btn-xs'],
                title: 'Press enter to extend search'
            }, {
                control: 'button',
                id: 'freeTxtBtn',
                name: 'free-txt-btn',
                type: 'button',
                label: 'Enter Free Text',
                hidden: true,
                extraClasses: ['btn-default', 'btn-xs'],
                title: 'Press enter search as free text'
            }]
        }]
    };

    var problemResultsMessageContainer = {
        control: 'container',
        extraClasses: ['problem-results-message-container', 'left-margin-xs', 'row'],
        template: '<span aria-live="assertive">{{#each resultsMessage}}{{this}}<br />{{/each}}</span>',
        modelListeners: ['resultsMessage']
    };

    var ProblemSearchFields = [{
        control: 'container',
        extraClasses: ['modal-body'],
        items: [{
            control: 'container',
            extraClasses: ['container-fluid'],
            items: [selectProblemContainer, problemResultsContainer, problemResultsMessageContainer]
        }]
    }, {
        control: "container",
        extraClasses: ["modal-footer"],
        items: [{
            control: 'container',
            extraClasses: ['row'],
            items: [{
                control: 'container',
                extraClasses: ['col-xs-12', 'display-flex', 'valign-bottom'],
                items: [{
                    control: 'popover',
                    behaviors: {
                        Confirmation: {
                            title: 'Warning',
                            eventToTrigger: 'problem-search-confirm-cancel'
                        }
                    },
                    label: 'Cancel',
                    name: 'problemSearchConfirmCancel',
                    extraClasses: ['btn-default', 'btn-sm', 'right-margin-xs']
                }, {
                    control: "dropdown",
                    split: true,
                    label: "Accept",
                    name: 'searchAddContainer',
                    items: [{
                        label: "Accept",
                        id: "add"
                    }, {
                        label: "Accept and Create Another",
                        id: "addCreate"
                    }]
                }]
            }]
        }]
    }];
    var ParentView = ADK.UI.Form;
    var problemSearchView = ParentView.extend({
        initialize: function() {
            this.termsCollection = new ADK.UIResources.Picklist.Problems.Terms();
            this.extendedTermsCollection = new ADK.UIResources.Picklist.Problems.ExtendedTerms();
            this.bindEntityEvents(this.termsCollection, this.termCollectionEvents);
            this.bindEntityEvents(this.extendedTermsCollection, this.termCollectionEvents);
            ParentView.prototype.initialize.apply(this, arguments);
        },
        ui: {
            'problemTerm': '#problemTerm',
            'resultsMessage': '.problem-results-message-container',
            'problemTermBtn': '#problemTermBtn',
            'problemTermBtnComp': '.problem-search-btn',
            'problemResults': '.problemResults',
            'problemResultsHeader': '.problem-results-header',
            'problemResultsFooter': '.problem-results-footer',
            'problemResultsBody': '.problem-results-body',
            'problemResultsContainer': '.problem-results-container',
            'cancelFormSearchProblem': '#cancelButtonFormSearchProblem',
            'cancelSearch': '.cancel-search',
            'freeTxtBtn': '#freeTxtBtn',
            'extendSearchBtn': '#extendedSearchBtn',
            'searchAddContainer': '.searchAddContainer',
            'keepProblemContainer': '.keep-problem-container',
            'clearInputBtn': '.clear-input-btn'

        },
        fields: ProblemSearchFields,
        onRender: function() {
            this.ui.searchAddContainer.trigger('control:disabled', true);
            this.ui.problemResults.trigger('control:hidden', true);
        },
        events: {
            'click #keepProblemBtn': function(e) {
                e.preventDefault();
                this.removeProblemResultTable();
                this.model.set('problemTerm', this.model.get('problemText'));

                if (!this.model.get('isFreeTextProblem')) {
                    this.model.set('showDetails', false);
                }

                this.model.trigger('showFtArea', this.model.get('showDetails'));

                this.workflow.goToIndex(this.workflow.model.get('steps').length - 1);
            },
            'click #freeTxtBtn': function(e) {
                e.preventDefault();
                this.showRequestFtView();
            },
            'click #extendedSearchBtn': function(e) {
                e.preventDefault();
                this.performSearch(true);
            },
            'problem-search-confirm-cancel': function(e) {
                WritebackUtils.unregisterChecks();
                this.workflow.close();
            },
            'keypress @ui.cancelSearch': function(e) {
                e.preventDefault();
                e.stopPropagation();

                if (e.which === 13) {
                    this.handleCancelButton();
                }
            },
            'click #problemTermBtn': function(e) {
                e.preventDefault();
                this.performSearch(false);
            },
            'keyup #problemTerm': function(e) {
                e.preventDefault();
                if (e.which === 13) {
                    if (this.$('#problemTerm').val().length > 0) {
                        this.$('#problemTermBtn').click();
                    }
                } else if (e.which !== 37 && e.which !== 39 && e.which !== 9 && e.which !== 27) {
                    this.removeProblemResultTable();
                }
            },
            'input #problemTerm': function(e) {
                if (this.$('#problemTerm').val().length === 0) {
                    this.removeProblemResultTable();
                }
            },
            'click @ui.cancelSearch': function(e) {
                e.preventDefault();
                this.handleCancelButton();
            },
            'click @ui.clearInputBtn': function(e) {
                e.preventDefault();
                this.removeProblemResultTable();
            }
        },
        modelEvents: {
            'change:showKeepProblem': function() {
                if (this.model.get('showKeepProblem')) {
                    this.ui.keepProblemContainer.trigger('control:hidden', false);
                } else {
                    this.ui.keepProblemContainer.trigger('control:hidden', true);
                }
            },
            'change:problemResults': function() {
                this.model.set({
                    'isFreeTextProblem': false,
                    'problemText': this.model.get('problemResults').get('prefText'),
                    'resultsMessage': ''
                });
                this.removeProblemResultTable();
                this.$(this.ui.problemTerm).val('');
                this.model.trigger('showFtArea', false);
                this.workflow.goToNext();
            }
        },
        showRequestFtView: function() {
            this.removeProblemResultTable();

            this.model.set({
                'previousRequestTermCheckBox': this.model.get('requestTermCheckBox'),
                'previousFreeTxtTxtArea': this.model.get('freeTxtTxtArea')
            });

            this.model.set({
                'requestTermCheckBox': '',
                'freeTxtTxtArea': ''
            }, {
                unset: true
            });
            this.workflow.goToNext();
        },
        removeProblemResultTable: function() {
            this.ui.extendSearchBtn.trigger('control:hidden', true);
            this.ui.freeTxtBtn.trigger('control:hidden', true);
            this.model.unset('resultsHeaderText');
            this.ui.problemResults.trigger('control:hidden', true).trigger('control:picklist:set', []);
            this.ui.problemResultsHeader.trigger('control:hidden', true);
            this.ui.problemResultsFooter.trigger('control:hidden', true);
            this.model.set('resultsMessage', '');
        },
        handleCancelButton: function() {
            this.removeProblemResultTable();
            this.$('#problemTerm').val('').focus();
        },
        onDestroy: function() {
            this.unbindEntityEvents(this.termsCollection, this.termCollectionEvents);
            this.unbindEntityEvents(this.extendedTermsCollection, this.termCollectionEvents);
        },

        termCollectionEvents: {
            'read:success': function(collection, response) {
                var termCollection = collection;
                var extended = collection instanceof ADK.UIResources.Picklist.Problems.ExtendedTerms;
                if (termCollection.length > 2) {
                    // JSON format has 2 extra items added to the collection with results count - need to remove them
                    termCollection.pop();
                    termCollection.pop();

                    this.ui.problemResults.trigger('control:hidden', false);

                    if (extended) {
                        this.model.set('resultsHeaderText', 'EXTENDED SEARCH RESULTS');
                    } else {
                        this.model.set('resultsHeaderText', 'SEARCH RESULTS');
                    }

                    this.ui.problemResults.trigger('control:loading:hide');
                    this.ui.problemResults.trigger('control:picklist:set', [ParseUtil.buildSearchResults(termCollection)]);

                    if (extended) {
                        this.ui.freeTxtBtn.trigger('control:hidden', false);
                    } else {
                        this.ui.extendSearchBtn.trigger('control:hidden', false);
                    }
                } else {
                    this.ui.problemResults.trigger('control:loading:hide');
                    if (extended) {
                        this.showRequestFtView();
                    } else {
                        this.performSearch(true);
                    }
                }
            },
            'read:error': function(collection, response) {
                this.ui.problemResults.trigger('control:loading:hide');
                this.ui.problemResults.trigger('control:hidden', true);
                this.model.set('resultsMessage', ParseUtil.formatSearchErrorMessage(error));
            }
        },
        performSearch: function(extended) {
            this.removeProblemResultTable();
            this.ui.problemResults.trigger('control:hidden', false);
            this.ui.problemResults.trigger('control:loading:show');
            this.ui.problemResultsHeader.trigger('control:hidden', false);
            this.ui.problemResultsFooter.trigger('control:hidden', false);
            var term = this.$('#problemTerm').val();
            var termCollection;

            termCollection = (extended) ? this.extendedTermsCollection : this.termsCollection;
            termCollection.fetch({
                searchString: term,
                synonym: 1,
                noMinimumLength: 1
            });
        }
    });

    return problemSearchView;
});