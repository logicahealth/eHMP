define([
    "app/applets/medication_review_v2/medicationCollectionHandler",
    "hbs!app/applets/medication_review_v2/templates/appletLayout",
    "app/applets/medication_review_v2/views/medicationListView",
    "main/api/WorkspaceFilters"
], function(CollectionHandler, AppletLayout, MedicationListView, WorkspaceFilters) {
    "use strict";

    var AppletLayoutView = Backbone.Marionette.CompositeView.extend({
        template: AppletLayout,
        childView: MedicationListView,
        childViewContainer: ".medsReviewApplet_mainContentArea",
        childViewOptions: function(){
            return {
                instanceid: this.options.instanceId
            };
        },
        initialize: function(options) {
            this._super = Backbone.Marionette.CompositeView.prototype;
            this.collection = options.collection;
            this._super.initialize.apply(this, arguments);
            this.model = new Backbone.Model();
            this.model.set('instanceid', this.options.instanceId);
        },
        onRender: function() {
            var self = this;
            var instanceID = $('[data-appletid="medication_review_v2"]').attr('data-instanceid');
            var chromeHeight = $('#' + instanceID).height() - 30;
            $('[data-appletid="medication_review_v2"]').find('.grid-container').height(chromeHeight.toString() + 'px');
            //$('[data-appletid="medication_review_v2"]').find('.grid-container').attr('data-sizey', 12);
            WorkspaceFilters.onRetrieveWorkspaceFilters(this.options.instanceId, function(args) {
                if (args.anyFilters) {
                    self.$el.hide();
                }
            });
        },
        showEl: function() {
            this.$el.show();
        }
    });
    var AppletView = ADK.Applets.BaseDisplayApplet.extend({
        initialize: function(options) {
            var self = this;
            this._super = ADK.Applets.BaseDisplayApplet.prototype;
            this.appletOptions = {
                collection: CollectionHandler.fetchAllMeds(true),
                AppletView: AppletLayoutView,
                filterFields: ['name', 'sig', 'standardizedVaStatus', 'drugClassName'],
                refresh: this.refresh
            };
            this.$el.addClass('gridster');
            this.listenTo(ADK.Messaging, 'globalDate:selected', function(dateModel) {
                self.dateRangeRefresh();
            });
            this.listenTo(this.appletOptions.collection, 'customfilter', this.onCustomFilter);
            this.listenTo(this.appletOptions.collection, 'clear_customfilter', this.onClearCustomFilter);
            this._super.initialize.apply(this, arguments);
        },
        dateRangeRefresh: function() {

            this.loading();

            var collection = this.appletOptions.collection;
            this.loading();
            this.displayAppletView = new this.appletOptions.AppletView(this.appletOptions);

            if (this.appletOptions.collection instanceof Backbone.PageableCollection) {
                this.appletOptions.collection.fullCollection.reset();
            } else {
                this.appletOptions.collection.reset();
            }


            ADK.ResourceService.fetchCollection(this.appletOptions.collection.fetchOptions, this.appletOptions.collection);
        },
        onDomRefresh: function() {
            this.onCustomFilter();
        },
        refresh: function(event) {
            var collection = this.appletOptions.collection;

            this.loading();
            this.setAppletView();

            if (collection instanceof Backbone.PageableCollection) {
                collection.fullCollection.reset();
            } else {
                collection.reset();
            }

            ADK.ResourceService.clearCache(collection.url);
            ADK.ResourceService.fetchCollection(collection.fetchOptions, collection);
            this.filterView.doCustomSearch();
        },
        onCustomFilter: function(search) {
            var $inputFilterSearch = this.$el.parents('[data-appletid="medication_review_v2"]').find('#input-filter-search');
            this.displayAppletView.$el.hide();

            if (CollectionHandler.shadowCollection === undefined) {
                this.displayAppletView.showEl();
                return;
            }
            var self = this;
            var filtered = CollectionHandler.shadowCollection.filter(function(item) {
                var filterString = '';
                _.each(self.appletOptions.filterFields, function(field) {
                    if (field === 'drugClassName') {
                        var productLength = item.get('products') !== undefined ? item.get('products').length : 0;
                        for (var i = 0; i < productLength; i++) {
                            if (item.get('products')[i].drugClassName !== undefined) {
                                filterString = filterString + ' ' + item.get('products')[i].drugClassName;
                            }
                        }
                    } else {
                        filterString = filterString + ' ' + item.get(field);
                    }

                });
                if (search) {
                    return search.test(filterString);
                } else {
                    return true;
                }

            });
            var filteredCollection = new Backbone.Collection();
            filteredCollection.reset(filtered);
            var filteredGrouped = CollectionHandler.groupCollectionModels(filteredCollection);
            this.appletOptions.collection.reset(filteredGrouped);

            var accordions = this.displayAppletView.$('.mainAccordion.verticalAlignMiddle.panel-heading.selectable.accordion-toggle');
            var firstFound = false;
            _.each(accordions, function(collapse, i) {

                if (!$(collapse).next().find('.emptyViewHeight').length && !firstFound) {
                    firstFound = true;
                    if(i !== 0){
                        $(collapse).trigger('click');
                    }
                }
            });

            this.displayAppletView.showEl();
        },

        onClearCustomFilter: function(search) {
            var originalCollection = new Backbone.Collection();
            originalCollection.reset(CollectionHandler.shadowCollection.models);
            var originalGrouped = CollectionHandler.groupCollectionModels(originalCollection);
            this.appletOptions.collection.reset(originalGrouped);
            if (search) {
                this.onCustomFilter(search);
            }
        }
    });
    return AppletView;
});