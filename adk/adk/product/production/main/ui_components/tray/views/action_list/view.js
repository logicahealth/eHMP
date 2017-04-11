define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'api/Messaging',
    'main/Session'
], function(Backbone, Marionette, _, Handlebars, Messaging, Session) {
    "use strict";

    var LoadingView = Backbone.Marionette.ItemView.extend({
        getTemplate: function(model) {
            if (_.isBoolean(this.model.get('appletsLoaded')) && this.model.get('appletsLoaded')) {
                return Handlebars.compile('');
            }
            return Handlebars.compile('<span class="text-muted font-size-12"><i class="fa fa-spinner fa-spin"></i> Loading...</span>');
        },
        modelEvents: {
            'change:appletsLoaded': 'render'
        }
    });

    var NoActionItemsView = Backbone.Marionette.ItemView.extend({
        className: "panel panel-default list-group-item",
        tagName: "li",
        initialize: function(options) {
            this.model = new Backbone.Model({
                text: options.text
            });
        },
        template: Handlebars.compile('{{text}}')
    });

    var ActionListItemView = Backbone.Marionette.ItemView.extend({
        tagName: 'li',
        className: 'panel panel-default list-group-item top-padding-no bottom-padding-no bottom-border-grey-light',
        getTemplate: function() {
            var itemOptions = this.model.get('itemOptions');
            if (itemOptions && itemOptions.summaryView) {
                return Handlebars.compile([
                    '<a href="#" class="show-summary" title="Press enter to select New {{itemOptions.title}}">',
                    '<h5 class="all-margin-no"><i class="fa fa-angle-right pull-right"></i> View {{itemOptions.title}}s</h5>',
                    '</a>'
                ].join('\n'));
            }
            return Handlebars.compile([
                '<a href="#" class="add-new" title="Press enter to select New {{itemOptions.title}}">',
                '<h5 class="all-margin-no"><i class="fa fa-plus"></i> New {{itemOptions.title}}</h5>',
                '</a>'
            ].join('\n'));
        },
        ui: {
            'ActionListItem': 'a.add-new',
            'ActionListItemWithSummaryView': 'a.show-summary'
        },
        events: {
            'click @ui.ActionListItem': function(e) {
                e.preventDefault();
                var itemOptions = this.model.get('itemOptions');
                if (_.isObject(itemOptions) && _.isFunction(itemOptions.onClick)) {
                    itemOptions.onClick();
                }
            },
            'click @ui.ActionListItemWithSummaryView': function(e) {
                e.preventDefault();
                this.triggerMethod('show:summaryView');
            }
        }
    });

    var ActionListCollectionView = Backbone.Marionette.CollectionView.extend({
        tagName: 'ul',
        className: 'list-group panel-group small',
        attributes: {
            role: 'tablist'
        },
        childView: ActionListItemView,
        emptyView: NoActionItemsView,
        emptyViewOptions: function() {
            return {
                text: this.emptyViewText
            };
        },
        initialize: function(options) {
            this.key = options.key;
            this.emptyViewText = options.emptyViewText;
            this.parent = options.parent;
            this.collection = Messaging.request('get:tray:items');
        },
        filter: function(child, index) {
            return this.collection.hasKey(child, this.key);
        },
        childEvents: {
            'show:summaryView': function(child) {
                this.showActionList(false);
                this.parent.showSummaryView(child.model, true);
            }
        },
        showActionList: function(boolean) {
            if (_.isBoolean(boolean) && boolean) {
                this.$el.removeClass("hidden");
            } else {
                this.$el.addClass("hidden");
            }
        }
    });

    var SummaryListCollectionView = Backbone.Marionette.CollectionView.extend({
        initialize: function(options) {
            this.key = options.key;
            this.collection = Messaging.request('get:tray:items');
        },
        filter: function(child, index) {
            if (this.collection.hasKey(child, this.key)) {
                var itemOptions = child.get('itemOptions');
                if (itemOptions.summaryView) {
                    return true;
                }
            }
            return false;
        },
        getChildView: function(child, index) {
            var itemOptions = child.get('itemOptions');
            return itemOptions.summaryView.extend({
                className: itemOptions.summaryView.prototype.className + ' tray-summary-view hidden'
            });
        },
        showSummaryView: function(model) {
            var view = this.children.findByModel(model);
            if (view.$el) {
                view.$el.removeClass('hidden');
            }
        },
        hideSummaryView: function() {
            this.$('.tray-summary-view').addClass('hidden');
        }
    });

    var HeaderView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile([
            '{{#if backButton}}<button type="button" class="back-button btn btn-icon left-padding-no right-padding-xs font-size-14" title="Press enter to go back to list of options under {{key}}."><i class="fa fa-angle-left"></i></button>{{/if}}',
            '<h4 class="panel-title all-border-no inline-block-display">{{label}}</h4>',
            '{{#if addButton}}<button type="button" class="add-new btn btn-primary btn-sm pull-right top-margin-sm" title="Press enter to create a {{onClickLabel}}."><i class="fa fa-plus"></i> {{onClickLabel}}</button>{{/if}}',
        ].join("\n")),
        initialize: function(options) {
            this.parent = options.parent;
        },
        modelEvents: {
            'change': 'render'
        },
        events: {
            'click button.add-new': function(e) {
                e.preventDefault();
                this.model.get('onClick').call(this);
            },
            'click button.back-button': function(e) {
                e.preventDefault();
                this.parent.showActionListView();
            }
        }
    });

    var ActionListView = Backbone.Marionette.LayoutView.extend({
        template: Handlebars.compile([
            '<div class="action-list-header-container row panel-heading all-padding-no left-padding-md"></div>',
            '<div class="action-list-container row panel-body all-padding-no"></div>',
            '<div class="summary-list-container row panel-body all-padding-no"></div>',
            '<div class="action-list-items-loading-region"></div>'
        ].join("\n")),
        className: "container-fluid panel panel-default",
        regions: {
            'HeaderRegion': '.action-list-header-container',
            'ActionListRegion': '.action-list-container',
            'SummaryListRegion': '.summary-list-container',
            'LoadingRegion': '.action-list-items-loading-region'
        },
        initialize: function(options) {
            this.emptyViewText = this.options.emptyViewText || "No Items Available.";
            this.key = this.options.key || null;
            this.label = this.options.label || null;
            this.model = new Backbone.Model({
                label: this.label,
                backButton: false,
                onClickLabel: null,
                onClick: null,
                key: this.key
            });
            this.loadingModel = new Backbone.Model({
                defaults: {
                    appletsLoaded: false
                }
            });
        },
        onBeforeShow: function() {
            var self = this;
            this.showChildView('HeaderRegion', new HeaderView({
                model: this.model,
                parent: this
            }));
            this.showChildView('ActionListRegion', new ActionListCollectionView({
                emptyViewText: this.emptyViewText,
                key: this.key,
                parent: this
            }));
            this.showChildView('SummaryListRegion', new SummaryListCollectionView({
                key: this.key,
            }));
            this.showChildView('LoadingRegion', new LoadingView({
                model: this.loadingModel
            }));
            Session.allAppletsLoadedPromise.done(function() {
                self.loadingModel.set('appletsLoaded', true);
                self.checkIfSingleItem();
            });
        },
        checkIfSingleItem: function() {
            var actionListView = this.ActionListRegion.currentView;
            var filteredCollection = actionListView.collection.filter(function(child) {
                if (actionListView.collection.hasKey(child, this.key)) {
                    return true;
                }
                return false;
            }, this);
            if (filteredCollection.length == 1) {
                var model = filteredCollection[0];
                var itemOptions = model.get('itemOptions');
                if (itemOptions.summaryView) {
                    actionListView.showActionList(false);
                    this.showSummaryView(model, false);
                    return true;
                }
            }
            return false;
        },
        showSummaryView: function(childModel, showBackButton) {
            var itemOptions = childModel.get('itemOptions');
            this.model.set({
                backButton: showBackButton,
                label: 'All ' + itemOptions.title + 's',
                onClickLabel: 'New ' + itemOptions.title,
                onClick: itemOptions.onClick,
                addButton: _.isFunction(itemOptions.onClick)
            });
            this.SummaryListRegion.currentView.showSummaryView(childModel);
        },
        showActionListView: function() {
            this.SummaryListRegion.currentView.hideSummaryView();
            this.model.set({
                backButton: false,
                label: this.label,
                onClick: null,
                addButton: false
            });
            this.ActionListRegion.currentView.showActionList(true);
        }
    });

    return ActionListView;
});