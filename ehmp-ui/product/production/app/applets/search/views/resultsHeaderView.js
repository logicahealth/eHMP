define([
    'underscore',
    'backbone',
    'marionette',
    'handlebars',
    'hbs!app/applets/search/templates/searchResultHeaderTemplate',
    'hbs!app/applets/search/templates/synonymsPopoverListTemplate',
    'hbs!app/applets/search/templates/syncStatusMessageBannerTemplate'
], function(_, Backbone, Marionette, Handlebars, searchResultHeaderTemplate, synonymsPopoverListTemplate, syncStatusMessageBannerTemplate) {
    'use strict';

    var TEXT_SEARCH_CHANNEL = ADK.Messaging.getChannel('search');
    var SearchResultsHeaderView = Backbone.Marionette.LayoutView.extend({
        template: searchResultHeaderTemplate,
        regions: {
            numberofResultsRegion: '.number-of-results',
            synonymsButtonRegion: '.synonyms-button',
            solrSyncStatusRegion: '.solr-sync-status'
        },
        initialize: function(options) {
            this.headerHidden = true;
            this.listenTo(TEXT_SEARCH_CHANNEL, 'toggleHeader', function(isHidden) {
                this.toggleHeader(isHidden);
            });
        },
        onRender: function() {
            this.showChildView('solrSyncStatusRegion', new SolrSyncStatusView({
                model: this.model
            }));

            this.showChildView('numberofResultsRegion', new NumberOfResultsView({
                model: this.model
            }));

            this.showChildView('synonymsButtonRegion', new SynonymsButtonView({
                model: this.model
            }));

            this.toggleHeader(this.headerHidden);
        },
        toggleHeader: function(isHidden) {
            this.headerHidden = isHidden;
            if (isHidden) {
                return this.$el.hide();
            }
            return this.$el.show();
        }
    });

    var SolrSyncStatusView = Backbone.Marionette.ItemView.extend({
        template: syncStatusMessageBannerTemplate,
        initialize: function() {
            var currentPatient = ADK.PatientRecordService.getCurrentPatient();
            this.refreshSyncMessageData(currentPatient);
            this.listenTo(currentPatient, 'change:syncStatsForAllVa change:syncStatsForMySite change:syncStatsForDoD change:syncStatsForCommunities', this.refreshSyncMessageData);
            this.listenTo(TEXT_SEARCH_CHANNEL, 'newSearch', function() {
                this.refreshSyncMessageData(currentPatient);
            });
            this.listenTo(TEXT_SEARCH_CHANNEL, 'toggleHeader', function(isHidden) {
                var elementInContextIsScreen = ADK.WorkspaceContextRepository.currentWorkspaceAndContext.get('workspace') === 'record-search' && $(document.activeElement).is('body');
                if (!isHidden) {
                    if (this.focusRedoTextSearchButton && elementInContextIsScreen) {
                        this.ui.redoTextSearchButton.focus();
                    }
                    this.focusRedoTextSearchButton = false;
                }

            });
        },
        ui: {
            redoTextSearchButton: '.redo-text-search'
        },
        events: {
            'keydown @ui.redoTextSearchButton': 'handleEnterOrSpaceBar',
            'click @ui.redoTextSearchButton': 'resubmitSearch'
        },
        resubmitSearch: function() {
            this.focusRedoTextSearchButton = true;
            TEXT_SEARCH_CHANNEL.trigger('newSearch');
        },
        handleEnterOrSpaceBar: function(event) {
            var keyCode;
            if (!_.isUndefined(event)) {
                if (event.which) {
                    keyCode = event.which;
                } else {
                    keyCode = event.keyCode;
                }
            }
            if (!_.isUndefined(keyCode) && (keyCode === 13 || keyCode === 32)) {
                var targetElement = this.$(event.currentTarget);
                targetElement.focus();
                targetElement.trigger('click');
            }
        },
        refreshSyncMessageData: function(model) {
            var stats = _.values(_.pick(model.attributes, ['syncStatsForAllVa', 'syncStatsForMySite', 'syncStatsForDoD', 'syncStatsForCommunities']));
            var mySiteStats = model.get('syncStatsForMySite');
            var allVaStats = model.get('syncStatsForAllVa');
            var DoDStats = model.get('syncStatsForDoD');
            var communitiesStats = model.get('syncStatsForCommunities');

            var allDataSynced = _.every(stats, 'completed');
            var allDataSolrSynced = _.every(stats, 'isSolrSyncCompleted');

            var fullDataSyncComplete = !_.isUndefined(allVaStats) &&
                !_.isUndefined(mySiteStats) &&
                allDataSynced &&
                allDataSolrSynced;
            if (!_.isUndefined(DoDStats)) {
                fullDataSyncComplete = fullDataSyncComplete && DoDStats.completed === true && DoDStats.isSolrSyncCompleted === true;
            }
            if (!_.isUndefined(communitiesStats)) {
                fullDataSyncComplete = fullDataSyncComplete && communitiesStats.completed === true && communitiesStats.isSolrSyncCompleted === true;
            }

            var allVaDataSyncComplete = !_.isUndefined(allVaStats) && allVaStats.completed && allVaStats.isSolrSyncCompleted;
            var mySiteDataSyncComplete = !_.isUndefined(mySiteStats) && mySiteStats.completed && mySiteStats.isSolrSyncCompleted;

            if (!fullDataSyncComplete) {
                if (allVaDataSyncComplete) {
                    this.model.set('solrSyncStatusMessage', 'Search results limited to only data from All VA Sites');
                } else if (mySiteDataSyncComplete) {
                    this.model.set('solrSyncStatusMessage', 'Search results limited to only data from My Site');
                }
            } else {
                this.model.unset('solrSyncStatusMessage');
            }
        }
    });

    var NumberOfResultsView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('Displaying <strong class="text-search-number-of-results-count">{{numberOfResults}}</strong> results for &#8220<strong>{{searchTerm}}</strong>&#8221'),
        modelEvents: {
            'change:searchTerm change:numberOfResults': 'render',
            'change:solrSyncStatusMessage': 'render'
        }
    });

    var SynonymsButtonView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('<a role="button" tabindex="0" class="text-search-synonyms btn btn-xs btn-default transform-text-capitalize synonyms-button" data-toggle="popover" data-placement="bottom" data-selector="true" aria-expanded="false" title="Press enter to view synonyms used">View Synonyms Used</a>'),
        ui: {
            synonymsButton: '.synonyms-button'
        },
        initialize: function(options) {
            this.synonymsFetched = false;
            var collection = this.collection = new ADK.UIResources.Fetch.TextSearch.Collection({});
            var model = this.model;
            this.listenTo(TEXT_SEARCH_CHANNEL, 'newSearch', function() {
                TEXT_SEARCH_CHANNEL.trigger('toggleHeader', true);
                this.synonymsFetched = false;
            });
            this.listenTo(TEXT_SEARCH_CHANNEL, 'newSearchComplete', function() {
                TEXT_SEARCH_CHANNEL.trigger('toggleHeader', false);
            });
            ADK.SessionStorage.clearAppletStorageModelAttribute('search', 'synonymArray');

            TEXT_SEARCH_CHANNEL.reply('synonymsCollection', function() {
                var storedSynonyms = ADK.SessionStorage.getAppletStorageModel('search', 'synonymArray');
                if (storedSynonyms) {
                    return new Backbone.Collection({
                        synonyms: storedSynonyms
                    });
                } else {
                    return (collection.fetchCollection({
                        searchTerm: model.get('searchTerm'),
                        getSynonyms: true
                    }), collection);
                }
            });
        },
        onBeforeDestroy: function() {
            TEXT_SEARCH_CHANNEL.stopReplying('synonymsCollection');
        },
        behaviors: {
            Popover: {
                html: true,
                interactivePopover: true
            }
        },
        getPopoverContent: function() {
            return synonymsPopoverListTemplate(this.model.toJSON());
        },
        onRender: function() {
            var self = this;
            this.popoverShown = false;
            this.ui.synonymsButton.popover({
                html: true,
                content: function() {
                    return self.getPopoverContent();
                }
            });
        },
        events: {
            'shown.bs.popover': 'onShowSynonymsPopover',
            'hidden.bs.popover': 'onHideSynonymsPopover',
            'keydown @ui.synonymsButton': 'handleEnterOrSpaceBar'
        },
        handleEnterOrSpaceBar: function(event) {
            var keyCode;
            if (!_.isUndefined(event)) {
                if (event.which) {
                    keyCode = event.which;
                } else {
                    keyCode = event.keyCode;
                }
            } else {
                return;
            }
            var targetElement = this.$(event.currentTarget);

            if (keyCode === 13 || keyCode === 32) {
                targetElement.focus();
                targetElement.trigger('click');
                targetElement.addClass('btn-primary').addClass('popover-shown');
            } else if (keyCode === 27) {
                //Escape Key
                targetElement.attr('aria-expanded', false);
            }
        },
        collectionEvents: {
            'sync': function(collection, response) {
                var synonymArray = _.get(response, 'data.synonyms') || [];
                ADK.SessionStorage.setAppletStorageModel('search', 'synonymArray', synonymArray);
                this.synonymsFetched = true;
                this.synonymsFetching = false;
                this.setSynonymList(synonymArray);
            },
            'error': function(collection, response) {
                this.synonymsFetched = false;
                this.synonymsFetching = false;
                var targetPopoverContentElement = this.ui.synonymsButton.data('bs.popover').$tip.find('.popover-content');
                var errorView = ADK.Views.Error.create({
                    model: new Backbone.Model({
                        responseText: _.get(response, 'responseText'),
                        statusText: _.get(response, 'statusText'),
                        status: _.get(response, 'status')
                    })
                });

                targetPopoverContentElement.html(errorView.render().el);
            }
        },
        onShowSynonymsPopover: function() {
            this.popoverShown = true;
            this.ui.synonymsButton.addClass('btn-primary').addClass('popover-shown');
            this.ui.synonymsButton.removeClass('btn-default');
            this.ui.synonymsButton.attr('aria-expanded', true);
            this.fetchSynonyms();
        },
        onHideSynonymsPopover: function() {
            this.popoverShown = false;
            this.ui.synonymsButton.addClass('btn-default');
            this.ui.synonymsButton.removeClass('btn-primary').removeClass('popover-shown');
            this.ui.synonymsButton.attr('aria-expanded', false);
        },
        fetchSynonyms: function() {
            if (!this.synonymsFetched && !this.synonymsFetching) {
                this.synonymsFetching = true;
                this.collection.fetchCollection({
                    searchTerm: this.model.get('searchTerm'),
                    getSynonyms: true
                });
            }
        },
        setSynonymList: function(synonymArray) {
            var sortedSynonymArray;
            var searchTerm = this.model.get('searchTerm');
            if (!_.isUndefined(synonymArray)) {
                if (_.indexOf(synonymArray, searchTerm) === -1) {
                    synonymArray.push(searchTerm);
                }
                sortedSynonymArray = _.sortBy(synonymArray);
            } else {
                sortedSynonymArray = [searchTerm];
            }

            this.model.set('synonymList', sortedSynonymArray.join(', ').toLowerCase());
            if (this.popoverShown) {
                /* only execute this code when popover is open */
                var targetPopoverContentElement = this.ui.synonymsButton.data('bs.popover').$tip.find('.popover-content');
                targetPopoverContentElement.html(this.getPopoverContent());
            }
        }
    });

    return SearchResultsHeaderView;
});