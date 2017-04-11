define([
    'underscore',
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'typeahead',
    'app/applets/workspaceManager/list/problems/problemAssociationUtil',
    'hbs!app/applets/workspaceManager/list/problems/associationManagerTemplate',
    'hbs!app/applets/workspaceManager/list/problems/problemListItemTemplate',
    'hbs!app/applets/workspaceManager/list/problems/searchResultItemTemplate',
    'hbs!app/applets/workspaceManager/list/problems/emptyResultsTemplate',
    'hbs!app/applets/workspaceManager/list/problems/noAssociationsTemplate'
], function(_, Backbone, Marionette, $, Handlebars, TwitterTypeahead, ProblemUtil, AssociationManagerTemplate, ProblemListTemplate, SearchResultItemTemplate, EmptyResultsTemplate, NoAssociationsTemplate) {
    "use strict";

    var QUERY_DELAY = 300; // delay (in ms) between the user typing and a resource call being generated
    var QUERY_LENGTH_THRESHOLD = 3; // number of characters typed before typeahead kicks in

    var EmptyView = Backbone.Marionette.ItemView.extend({
        template: NoAssociationsTemplate
    });

    var ProblemListView = Backbone.Marionette.ItemView.extend({
        template: ProblemListTemplate,
        tagName: 'li'
    });

    var ProblemListCollectionView = Backbone.Marionette.CollectionView.extend({
        childView: ProblemListView,
        emptyView: EmptyView,
        tagName: 'ul'
    });

    var AssociationManagerView = Backbone.Marionette.LayoutView.extend({
        template: AssociationManagerTemplate,
        regions: {
            problemListRegion: '#problem-list-region',
            statusRegion: '#problem-query-status-region'
        },
        events: {
            'keyup #screen-problem-search': function(event) {
                if ($(event.target).val().length < QUERY_LENGTH_THRESHOLD) {
                    this.hideStatus();
                }

                if ($(event.target).val().length > 0) {
                    this.$('#clear-search-problem-btn').show();
                } else {
                    this.$('#clear-search-problem-btn').hide();
                }
            },
            'keyup .association-manager': function(event) {
                if (event.keyCode === 27) { // escape
                    // close the dropdown on escape keyup
                    this.closeSearchResultDropdown(event);
                }
            },
            'click #clear-search-problem-btn': function(event) {
                event.stopImmediatePropagation();
                this.$('#screen-problem-search').val('');
                this.$('#screen-problem-search').focus();
                this.hideStatus();
                this.closeSearchResultDropdown(event);
                this.$('#clear-search-problem-btn').hide();
            },
            'click #problem-list-region li button': function(event) {
                event.stopPropagation();
                var snomed = $(event.currentTarget).attr('data-snomed-ct');
                this.removeProblemAssociation(snomed);
                this.$('#screen-problem-search').focus();
            }
        },
        initialize: function(options) {
            this.problemListColl = new Backbone.Collection(this.model.get('problems'));
            this.problemResultsColl = new Backbone.Collection();
        },
        addProblemAssociation: function(snomed) {
            var fullProblem = ProblemUtil.findProblemBySnomedCt(this.problemResultsColl, snomed);
            var problem = ProblemUtil.getTrimmedProblem(fullProblem);
            var problems = _.clone(this.model.get('problems')) || [];
            problems.push(problem);
            this.model.set('problems', problems);
            ProblemUtil.addProblemAssociation(this.problemListColl, new Backbone.Model(problem));
            this.disableProblemResult(snomed);
        },
        removeProblemAssociation: function(snomed) {
            var problem = ProblemUtil.findProblemBySnomedCt(this.problemListColl, snomed);
            var problems = this.model.get('problems') || [];
            problems = _.reject(problems, function(prob) {
                return prob.snomed === snomed;
            });
            this.model.set('problems', problems);
            ProblemUtil.removeProblemAssociation(this.problemListColl, problem);
            this.enableProblemResult(snomed);
        },
        onRender: function() {
            var self = this;

            // show the list of currently-associated problems
            this.problemListRegion.show(new ProblemListCollectionView({ collection: this.problemListColl }));
        },
        queryProblems: function(query, typeaheadCallback) {
            // clear current results
            this.problemResultsColl.reset();
            this.showLoadingStatus();

            var self = this;
            function onSuccess(problemsCollection) {
                //user has escaped the query so do not load the results
                if (!self.$('#problem-query-status-region').is(':visible')) {
                    return;
                }

                self.problemResultsColl.reset(problemsCollection.models);
                typeaheadCallback(problemsCollection.toJSON());

                // disable previously associated problems in the results
                self.problemListColl.forEach(function(problemModel) {
                    var snomed = problemModel.get('snomed');
                    self.disableProblemResult(snomed);
                });
            }

            // submit query
            ProblemUtil.queryGlobalProblems(query, onSuccess, _.bind(this.showErrorStatus, this));
        },
        closeSearchResultDropdown: function(event) {
            // this overrides the typeahead plugin's escape handling (which is to close the dropdown on escape keydown)
            // this matters because bootstrap modals close on escape keyup, and we need to stop propagation of the
            // event if the dropdown is open so the modal doesn't close
            var $dropdown = this.$('.twitter-typeahead .tt-dropdown-menu');
            if ($dropdown.is(':visible')) {
                $dropdown.hide();
                this.$('#screen-problem-search').focus();
                event.stopPropagation(); // stop propagation so the parent view won't take any 'close' action
            }
        },
        onDomRefresh: function() {
            var self = this;

            if (!this.model.get('predefined')) {
                // initialize twitter typeahead for searching problems
                var $typeahead = this.$('#screen-problem-search');

                $typeahead.on('keydown', function(event) {
                    switch(event.keyCode) {
                        case 27: // escape
                            // prevent the typeahead plugin from seeing the escape keydown; this prevents the dropdown from closing on keydown
                            event.stopImmediatePropagation();
                            break;
                        case 38: // up arrow
                            event.preventDefault();
                            event.stopImmediatePropagation();
                            break;
                        case 40: // down arrow
                            event.preventDefault();
                            event.stopImmediatePropagation();
                            break;
                    }
                });
                $typeahead.on('blur', function(event) {
                    // prevent the typeahead plugin from seeing the blur event; this prevents the dropdown from closing
                    // when the search box loses focus
                    event.stopImmediatePropagation();
                });

                $typeahead.typeahead({
                    hint: false,
                    highlight: true,
                    minLength: QUERY_LENGTH_THRESHOLD
                }, {
                    source: _.debounce(_.bind(this.queryProblems, this), QUERY_DELAY),
                    templates: {
                        empty: EmptyResultsTemplate,
                        suggestion: SearchResultItemTemplate
                    }
                });

                // There is no twitter, bootstrap, or jquery event we can use to listen for the dropdown list opening and closing
                // Use a MutationObserver to catch these; the dropdown's style attribute will change when it is shown/hidden, so that's what we're listening for
                // When Twitter Typeahead 0.11 is released it should have a built-in event that can replace this: https://github.com/twitter/typeahead.js/issues/141
                var $dropdown = this.$('.twitter-typeahead .tt-dropdown-menu');
                if (this.mutationObserver) {
                    this.mutationObserver.disconnect();
                }
                this.mutationObserver = new MutationObserver(function(mutations, observer) {
                    for (var i = 0; i < mutations.length; i++) {
                        var mutation = mutations[i];
                        if (mutation.attributeName === 'style' && mutation.oldValue !== $dropdown.attr('style')) {
                            // assume it was shown/hidden
                            if ($dropdown.is(':visible')) {
                                self.onDropdownShown($dropdown);
                            } else {
                                self.onDropdownHidden($dropdown);
                            }
                        }
                    }
                });
                this.mutationObserver.observe($dropdown[0], {
                    childList: false,
                    attributes: true,
                    characterData: false,
                    subtree: false,
                    attributeOldValue: true
                });

                this.$('#screen-problem-search').focus(); //focus the search input
            } else {
                this.$('#association-manager-close-btn').focus();
            }
        },
        onDropdownShown: function($dropdown) {
            this.hideStatus();
            $dropdown.scrollTop(0);

            var self = this;

            $dropdown.attr('role', 'listbox');

            $dropdown.on('keydown', function(event){
                if(event.keyCode === 27) {
                    event.stopImmediatePropagation();
                }
            });
            $dropdown.find('.problem-result').each(function(index, item) {
                var $item = $(item);
                $item.on('click', function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    var target = $(event.currentTarget);
                    var snomed = target.attr('data-snomed-ct');
                    if (target.hasClass('disabled')) {
                        self.removeProblemAssociation(snomed);
                    } else {
                        self.addProblemAssociation(snomed);
                    }
                });
                $item.on('focus', function(event) {
                    $(this).closest('.tt-suggestions').find('.tt-cursor').removeClass('tt-cursor');
                    $(this).parent().addClass('tt-cursor');
                });
            });
        },
        onDropdownHidden: function($dropdown) {
            $dropdown.find('.problem-result').each(function(index, item) {
                var $item = $(item);
                $item.off('click');
                $item.off('focus');
            });
            $dropdown.off('keydown');
        },
        disableProblemResult: function(snomed) {
            this.$('.tt-suggestions').find('[data-snomed-ct="' + snomed + '"]').addClass('disabled')
                .attr('aria-selected', true).prepend('<span class="sr-only"> Selected. Press enter to deselect');
        },
        enableProblemResult: function(snomed) {
            this.$('.tt-suggestions').find('[data-snomed-ct="' + snomed + '"]').removeClass('disabled')
                .attr('aria-selected', false).children('span').remove();
        },
        showLoadingStatus: function() {
            this.$('.tt-dropdown-menu').hide();
            this.$('#problem-query-status-region').show();
            this.statusRegion.show(ADK.Views.Loading.create());
        },
        hideStatus: function() {
            this.statusRegion.reset();
            this.$('#problem-query-status-region').hide();
        },
        showErrorStatus: function() {
            this.$('.tt-dropdown-menu').hide();
            this.$('#problem-query-status-region').show();
            this.statusRegion.show(ADK.Views.Error.create({ model: this.model }));
        },
        onBeforeDestroy: function() {
            if (!this.model.get('predefined')) {
                this.$('#screen-problem-search').typeahead('destroy');
            }
            if (this.dropdownMutationObserver) {
                this.dropdownMutationObserver.disconnect();
            }
        }
    });

    return AssociationManagerView;
});
