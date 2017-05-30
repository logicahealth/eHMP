define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/applets/documents/docDetailsDisplayer',
    'app/applets/documents/appletHelper'
], function(Backbone, Marionette, _, Handlebars, DocDetailsDisplayer, appletHelper) {
    'use strict';

    var EmptyView = Backbone.Marionette.LayoutView.extend({
        collectionEvents: {
            'page:fetch:error': function(collection, resp, options) {
                this.errorModel.set(resp);
                this.showChildView('EmptyViewRegion', ADK.Views.Error.create({
                    model: this.errorModel
                }));
            },
            'page:fetch': '_showLoading'
        },
        template: Handlebars.compile('<div class="empty-view-region"></div>'),
        regions: {
            EmptyViewRegion: '.empty-view-region'
        },
        initialize: function() {
            this.errorModel = new Backbone.Model();
        },
        onRender: function() {
            this._showLoading();
        },
        _showLoading: function() {
            this.showChildView('EmptyViewRegion', ADK.Views.Loading.create());
        }
    });

    var DetailsView = Backbone.Marionette.CollectionView.extend({
        emptyView: EmptyView,
        emptyViewOptions: function() {
            return {
                model: this.pagingModel,
                collection: this.collection
            };
        },
        isEmpty: function() {
            return !(!!this.collection.length && !(this.children.any(function(child) {
                return child instanceof EmptyView;
            }))) || (!(!!this.children.length) && this.pagingModel.get('fetchingNextPage'));
        },
        _headerModelEvents: {
            'user.get.previous': '_getPreviousModel',
            'user.get.next': '_getNextModel'
        },
        _pagingModelEvents: {
            'change': function(model, options) {
                if (_.has(model.changed, 'groupIndex') || _.has(model.changed, 'modelIndex')) {
                    // render redraws children
                    this.pagingModel.set({ fetchingNextPage: false, onPreviousPage: false });
                    this.render();
                }
            }
        },
        collectionEvents: {
            'page:fetch:success': function() {
                if (this.pagingModel.get('fetchingNextPage')) {
                    // get next page triggered by us
                    this._getNextModel();
                }
            },
            'page:fetch:error': function(collection, resp, options) {
                // so clicking "Previous" should just redraw
                this.pagingModel.set('fetchingNextPage', false);
            },
            'request': function() {
                if (!this.pagingModel.get('fetchingNextPage')) {
                    // request triggered
                    ADK.UI.Modal.hide();
                } else {
                    // "Previous" button is enabled so on click should just re-draw.
                    // onPreviousPage === actual index wasn't changed because of error during fetch
                    this.pagingModel.set('onPreviousPage', true);
                }
            }
        },
        _getPreviousModel: function() {
            if (this.pagingModel.get('fetchingNextPage')) {
                this.pagingModel.set('fetchingNextPage', false);
            }
            if (this.pagingModel.get('onPreviousPage')) {
                this.pagingModel.set('onPreviousPage', false);
                this.render();
                return;
            }
            var previousModel;
            var previousModelIndex;
            var previousGroup;
            var previousGroupIndex;
            var currentGroup = this._getGroup(this.currentModel);
            var currentGroupIndex = this._getGroupIndex(currentGroup);
            var currentModelIndex = this._getModelIndex(currentGroup, this.currentModel);
            if (currentModelIndex > 0) {
                // at least one model in group before this one
                previousModel = currentGroup.get('rows').at(currentModelIndex - 1);
                previousGroupIndex = currentGroupIndex;
                previousGroup = currentGroup;
                previousModelIndex = currentModelIndex - 1;
            } else if (currentGroupIndex > 0) {
                // no more models in current group, gotta jump to group before
                previousGroup = this.collection.at(currentGroupIndex - 1);
                previousModel = previousGroup.get('rows').last();
                previousGroupIndex = currentGroupIndex - 1;
                previousModelIndex = this._getModelIndex(previousGroup, previousModel);
            }
            if (previousModel) {
                this._setPagingModel({ newModel: previousModel, newGroup: previousGroup, newGroupIndex: previousGroupIndex, newModelIndex: previousModelIndex });
            }
        },
        _getNextModel: function() {
            var nextModel;
            var nextModelIndex;
            var nextGroupIndex;
            var nextGroup;
            var currentGroup = this._getGroup(this.currentModel);
            var currentGroupIndex = this._getGroupIndex(currentGroup);
            var currentModelIndex = this._getModelIndex(currentGroup, this.currentModel);
            if (currentModelIndex < currentGroup.get('rows').length - 1) {
                // at least one more model in group, simply grab next model in group
                nextModel = currentGroup.get('rows').at(currentModelIndex + 1);
                nextGroupIndex = currentGroupIndex;
                nextGroup = currentGroup;
                nextModelIndex = currentModelIndex + 1;
            } else if (currentGroupIndex < this.collection.length - 1) {
                // there are no more items in current group and there is next group with model
                nextGroup = this.collection.at(currentGroupIndex + 1);
                nextModel = nextGroup.get('rows').first();
                nextGroupIndex = currentGroupIndex + 1;
                nextModelIndex = 0;
            }
            if (nextModel) {
                this._setPagingModel({ newModel: nextModel, newGroup: nextGroup, newGroupIndex: nextGroupIndex, newModelIndex: nextModelIndex });
            } else if (this.collection.hasNextPage() || this.collection.inProgress) {
                // only inProgress when fetching next page (we want to show loading of next page)
                // fetch here, there are no more groups with models currently fetched, but there are more pages
                this._fetchNextPage();
            }
        },
        _fetchNextPage: function() {
            this.pagingModel.set('fetchingNextPage', true);
            if (!this.isEmpty()) {
                // not already empty, no re-fetch being attempted
                this.destroyChildren();
            }
            if (!this.collection.inProgress) {
                this.collection.trigger('page:fetch', this.collection);
            }
        },
        filter: function(child, index, collection) {
            return !!child.get('rows').find(this.currentModel);
        },
        _getGroup: function(dataModel) {
            return this.collection.find(function(groupModel) {
                return !!groupModel.get('rows').find(dataModel);
            }, this);
        },
        _getGroupIndex: function(group) {
            return this.collection.indexOf(group);
        },
        _getModelIndex: function(group, dataModel) {
            return group.get('rows').indexOf(dataModel);
        },
        _setPagingModel: function(newOptions) {
            var newModel = _.get(newOptions, 'newModel');
            if (newModel instanceof Backbone.Model) {
                this.model = this.currentModel = newModel;
                var group = _.get(newOptions, 'newGroup', this._getGroup(newModel));
                var groupIndex = this._getGroupIndex(group);
                var modelIndex = this._getModelIndex(group, newModel);
                this.pagingModel.set({
                    currentModel: newModel,
                    currentGroup: group,
                    groupIndex: _.get(newOptions, 'newGroupIndex', groupIndex),
                    modelIndex: _.get(newOptions, 'newModelIndex', modelIndex),
                    hasNext: (modelIndex < group.get('rows').length - 1) || (groupIndex < this.collection.length - 1) || this.collection.hasNextPage() || this.collection.inProgress,
                    hasPrevious: modelIndex > 0 || groupIndex > 0
                });
            }
        },
        initialize: function() {
            this.headerModel = this.getOption('headerModel');
            this.pagingModel = this.getOption('pagingModel');
            this._setPagingModel({ newModel: this.model });
            this.bindEntityEvents(this.headerModel, this._headerModelEvents);
            this.bindEntityEvents(this.pagingModel, this._pagingModelEvents);
        },
        getChildView: function(item) {
            var resultDocCollection = new ADK.UIResources.Fetch.Document.Collections.ResultsByUidCollection();
            var modalCollection = this.getOption('modalCollection');
            modalCollection.reset(this.currentModel);
            if (this.currentModel.get('complexDoc')) {
                appletHelper.getResultsFromUid.call(this, this.currentModel, resultDocCollection);
            }
            var results = DocDetailsDisplayer.getView.call(this, item, this.currentModel.get('kind'), resultDocCollection, new  ADK.UIResources.Fetch.Document.Collections.DocumentCollection(), modalCollection);
            return results.view;
        },
        childViewOptions: function() {
            return {
                model: this.currentModel
            };
        },
        onDestroy: function() {
            this.unbindEntityEvents(this.headerModel, this._headerModelEvents);
            this.unbindEntityEvents(this.pagingModel, this._pagingModelEvents);
        }
    });
    return DetailsView;
});
