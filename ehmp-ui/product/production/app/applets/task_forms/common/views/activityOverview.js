define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'async',
    'app/applets/task_forms/common/views/mainBody_View',
    'app/applets/task_forms/common/utils/detailUtils'
], function(Backbone, Marionette, _, Handlebars, Async, MainBodyView, Utils) {
    'use strict';
    var getHighlights = function(highlights) {
        var searchTermArray = [ADK.SessionStorage.getAppletStorageModel('search', 'searchText').searchTerm];
        var markStart = '{{addTag \"';
        var markEnd = '\" \"mark\" \"cpe-search-term-match\"}}';
        var regex = new RegExp(markStart + '(.*?)' + markEnd, 'g');
        var match;
        var keywords = [];

        while ((match = regex.exec(highlights)) !== null) {
            var synonym = match[1].toLowerCase();
            if (_.indexOf(keywords, synonym) === -1) {
                keywords.push(synonym);
            }
        }
        return _.unique(keywords.concat(searchTermArray));
    };
    var getView = function(showHighlights) {
        if (showHighlights) {
            var collection = new Backbone.Collection();
            var LoadingView = ADK.Views.Loading.view.extend({
                collection: collection,
                collectionEvents: {
                    'postFetchAsyncComplete': function(collection) {
                        this.model = collection.models[0];
                        this.synonyms = ADK.Messaging.getChannel('search').request('synonymsCollection');
                        this.listenToOnce(this.synonyms, 'fetch:success', this.setKeywords);
                        this.setKeywords();
                    }
                },
                setKeywords: function(collection, response) {
                    if (response) {
                        this.model.set('highlightKeywords', this.processSynonyms(_.get(response, 'data.synonyms', []), ActivityOverview.highlights));
                        ActivityOverview.launchDetailsModal(this.model, ActivityOverview.triggerElement, this.model.get('footerView'));
                    } else if (!this.synonyms.isEmpty() && this.synonyms.first().has('synonyms')) {
                        this.model.set('highlightKeywords', this.processSynonyms(this.synonyms.first().get('synonyms'), ActivityOverview.highlights));
                        if (this.model.has('footerView')) {
                            ActivityOverview.launchDetailsModal(this.model, ActivityOverview.triggerElement, this.model.get('footerView'));
                        }
                    }
                },
                processSynonyms: function(synonyms, highlights) {
                    var searchTerm = ADK.SessionStorage.getAppletStorageModel('search', 'searchText').searchTerm;
                    var searchTermArray = searchTerm ? searchTerm.toLowerCase().split(' ') : [];
                    highlights = getHighlights(highlights);
                    return _.uniq(this.mergeHighlights(synonyms, highlights).concat(searchTermArray));
                },
                mergeHighlights: function(synonyms, highlights) {
                    // only add unique highlights to synonyms
                    if (_.isEmpty(synonyms)) {
                        return highlights;
                    }
                    // split the multiword synonyms to get array of all words used.
                    var synonymWords = synonyms.join(' ').split(' ');
                    highlights = _.filter(highlights, function(highlight) {
                        return !_.includes(synonymWords, highlight);
                    });
                    if (highlights.length === 0) {
                        return synonyms;
                    } else {
                        return synonyms.concat(highlights);
                    }
                },
                onBeforeShow: function() {
                    this.collection = ADK.ResourceService.fetchCollection(ActivityOverview.fetchOptions, this.collection);
                }
            });
            return {
                create: function() {
                    return new LoadingView();
                }
            };
        }
        return ADK.Views.Loading;
    };
    var ActivityOverview = {
        keywords: [],
        startActivityDetails: function(params) {
            var processId = params.processId;
            var readOnly = params.readOnly;
            var showHighlights = params.showHighlights;
            var $triggerElement = ActivityOverview.triggerElement = params.triggerElement || $(':focus');
            ActivityOverview.highlights = params.highlights;
            var highlightKeywords;
            if (showHighlights) {
                highlightKeywords = getHighlights(params.highlights);
            }
            var modal = new ADK.UI.Modal({
                view: getView(showHighlights).create(),
                options: {
                    size: "large",
                    title: "Loading..."
                }
            });
            var fetchOptions = ActivityOverview.fetchOptions = {
                resourceTitle: 'activities-single-instance',
                cache: false,
                criteria: {
                    id: processId
                },
                viewModel: {
                    parse: function(response) {
                        response.modalTitle = 'Activity Details - ' + response.activityName;
                        if (showHighlights === true) {
                            /* Pass params.highlights to model. Needed for post discontinue of activity from detail view */
                            response.detailsHighlights = params.highlights;
                            response.modalTitle = ADK.utils.stringUtils.addSearchResultElementHighlighting(response.modalTitle, highlightKeywords);
                            response.activityName = ADK.utils.stringUtils.addSearchResultElementHighlighting(response.activityName, highlightKeywords);
                            response.showHighlights = true;
                        }
                        return response;
                    }
                },
                onSuccess: function(collection) {
                    var model = collection.models[0];
                    Utils.enrichSingleActivityModel(model, ADK.Messaging.request('facilityMonikers'), ADK.WorkspaceContextRepository.currentContextId, readOnly);


                    if (!_.isUndefined(model.get('processDefinitionId'))) {
                        // Dynamically load the view controller and left footer button for the given process/activity
                        // Don't set err in Async because it will terminate early and all files may not load by then
                        Async.parallel({
                                domainDetails: function(callback) {
                                    var activityDomainDetailsViewFile = 'app/applets/task_forms/activities/' + model.get('processDefinitionId').toLowerCase() + '/views/activityDetails_View';
                                    require([activityDomainDetailsViewFile],
                                        function(DomainDetailsContentView) {
                                            return callback(null, DomainDetailsContentView);
                                        },
                                        function(err) {
                                            return callback(null);
                                        });
                                },
                                footerView: function(callback) {
                                    var activityDetailsFooterFile = 'app/applets/task_forms/activities/' + model.get('processDefinitionId').toLowerCase() + '/views/activityDetailsFooter_View';
                                    require([activityDetailsFooterFile],
                                        function(FooterView) {
                                            return callback(null, FooterView);
                                        },
                                        function(err) {
                                            return callback(null);
                                        });
                                },
                            },
                            function(err, results) {
                                if (!_.isUndefined(results.domainDetails)) {
                                    model.set('domainDetailsContentView', results.domainDetails);
                                }
                                if (!_.isUndefined(results.footerView)) {
                                    model.set('footerView', results.footerView);
                                    if (!model.has('showHighlights')) {
                                        ActivityOverview.launchDetailsModal(model, ActivityOverview.triggerElement, results.footerView);
                                    }
                                }
                                collection.trigger('postFetchAsyncComplete', collection);
                            });
                    }
                }
            };
            modal.show({
                triggerElement: $triggerElement
            });
            if (!showHighlights) {
                ADK.ResourceService.fetchCollection(fetchOptions);
            }
        },
        launchDetailsModal: function(model, triggerElement, FooterView) {
            var modalOptions = {
                title: model.get('modalTitle'),
                size: 'large'
            };

            if (!_.isUndefined(FooterView) && !model.get('readOnly')) {
                modalOptions.footerView = new FooterView({
                    model: model
                });
            }

            var detailModal = new ADK.UI.Modal({
                view: new MainBodyView({
                    model: model
                }),
                options: modalOptions
            });
            detailModal.show({
                triggerElement: triggerElement
            });
        }
    };

    return ActivityOverview;
});