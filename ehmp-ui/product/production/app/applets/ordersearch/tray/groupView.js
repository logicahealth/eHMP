define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars'
], function(Backbone, Marionette, _, Handlebars) {
    "use strict";

    var EmptyGroupsView = Backbone.Marionette.ItemView.extend({
        className: "panel panel-default all-padding-sm",
        initialize: function(options) {
            this.model = new Backbone.Model({
                text: options.text
            });
        },
        template: Handlebars.compile('<span>{{text}}</span>')
    });

    var BodyGroupItemView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile([
            '{{#if showFavoriteIcon}}<button class="btn fav-item btn-icon" data-uniqueID="{{itemUniqueId}}"><i class="fav-icon fa {{favoriteIcon}} color-blue"></i></button>{{/if}}',
            '<a class="li-item" href="#li-item" data-uniqueID="{{itemUniqueId}}">',
            '<div class="col-xs-12 left-padding-xs">',
            '<span class="sr-only">Press enter to select {{itemLabel}}"</span>',
            '{{#if icon}}<i class="order-icon fa {{icon}} color-blue left-padding-md right-padding-xs" aria-hidden="true"></i>{{/if}}',
            '{{itemLabel}}',
            '</div>',
            '</a>'
        ].join('\n')),
        className: 'group-item left-padding-sm flex-display',
        tagName: 'li',
        events: {
            'click button.fav-item': function(e) {
                e.preventDefault(e);
                this.model.set('isFavorite', !this.model.get('isFavorite'));
                this.onFavorite(this.model);
            },
            'click a.li-item': function(e) {
                e.preventDefault();
                this.onClick(this.model);
            }
        },
        templateHelpers: function() {
            return {
                formatIdString: function(string) {
                    return _.isString(string) ? string.replace(" ", "-").toLowerCase() : string;
                },
                summaryLabel: this.summaryLabel,
                groupLabel: this.groupLabel,
                groupId: this.groupId,
                itemUniqueId: this.cid,
                showFavoriteIcon: this.showFavoriteIcon
            };
        },
        initialize: function(options) {
            this.summaryLabel = options.summaryLabel;
            this.groupLabel = options.groupLabel;
            this.groupId = options.groupId;
            this.attributeMapping = options.attributeMapping;
            this.showFavoriteIcon = options.showFavoriteIcon;
            this.onClick = options.onClick;
            this.onFavorite = options.onFavorite;
            this.showFavoriteIcon = options.showFavoriteIcon;
        },
        serializeModel: function(model) {
            var attributes = model.toJSON(),
                data = {
                    itemUniqueId: attributes[this.attributeMapping.itemUniqueId],
                    itemLabel: attributes[this.attributeMapping.itemLabel],
                    icon: attributes.icon,
                    favoriteIcon: attributes.isFavorite ? 'fa-star' : 'fa-star-o'
                };
            return data;
        }
    });

    var BodyGroupCollectionView = Backbone.Marionette.CompositeView.extend({
        className: 'panel panel-default',
        template: Handlebars.compile([
            '<div class="panel-heading tray-summary-group-header all-padding-xs" id="heading-{{formatIdString summaryLabel}}-{{formatIdString groupLabel}}">',
                '<button type="button" class="btn btn-icon btn-xs panel-title accordion-toggle left-padding-sm" data-toggle="collapse" data-target="#collapse-{{formatIdString summaryLabel}}-{{formatIdString groupLabel}}" aria-expanded="true" aria-controls="collapse-{{formatIdString summaryLabel}}-{{formatIdString groupLabel}}" title="Press enter to collapse accordion {{groupLabel}}">',
                    '{{groupLabel}}',
                '</button>',
            '</div>',
            '<div class="panel-collapse collapse in" aria-labelledby="heading-{{formatIdString summaryLabel}}-{{formatIdString groupLabel}}" id="collapse-{{formatIdString summaryLabel}}-{{formatIdString groupLabel}}">',
            '   <div class="panel-body multi-select-list all-padding-no">',
                    '<ul class="all-padding-no"></ul>',
                '</div>',
            '</div>',
        ].join('\n')),
        childViewContainer: 'ul',
        childView: BodyGroupItemView,
        childViewOptions: function(model, index) {
            return {
                summaryLabel: this.summaryLabel,
                groupLabel: this.model.get(this.attributeMapping.groupLabel),
                groupId: this.model.get(this.attributeMapping.groupId),
                attributeMapping: this.attributeMapping,
                onClick: this.onClick,
                onFavorite: this.onFavorite,
                showFavoriteIcon: this.showFavoriteIcon
            };
        },
        templateHelpers: function() {
            return {
                formatIdString: function(string) {
                    return _.isString(string) ? string.replace(" ", "-").toLowerCase() : string;
                },
                itemOptions: this.itemOptions,
                summaryLabel: this.summaryLabel
            };
        },
        events: {
            'shown.bs.collapse': function() {
                this.$('.panel-title').attr('title', 'Press enter to collapse accordion ' + this.model.attributes.name);
            },
            'hidden.bs.collapse': function(){
                this.$('.panel-title').attr('title', 'Press enter to expand accordion ' + this.model.attributes.name);

            }
        },
        initialize: function(options) {
            this.summaryLabel = options.summaryLabel;
            this.emptyGroupLabel = options.emptyGroupLabel;
            this.attributeMapping = options.attributeMapping;
            this.onClick = options.onClick;
            this.onFavorite = options.onFavorite;
            this.showFavoriteIcon = options.showFavoriteIcon;
        },
        serializeModel: function(model) {
            var attributes = model.toJSON(),
                data = {
                    groupLabel: attributes[this.attributeMapping.groupLabel],
                    groupId: attributes[this.attributeMapping.groupId]
                };
            return data;
        },
    });

    var defaultOptions = {
        attributeMapping: {
            groupId: 'id',
            groupLabel: 'label',
            groupItems: 'items',
            itemUniqueId: 'uniqueId',
            itemLabel: 'label'
        }
    };

    var LoadingView = Backbone.Marionette.ItemView.extend({
        className: "panel panel-default all-padding-sm",
        template: Handlebars.compile('<span class="text-muted font-size-12"><i class="fa fa-spinner fa-spin"></i> {{text}}</span>'),
        initialize: function(options) {
            this.model = new Backbone.Model({
                text: options.text
            });
        }
    });

    var BodyGroupContainerCollectionView = Backbone.Marionette.CollectionView.extend({
        className: 'accordion-container panel-group',
        options: defaultOptions,
        emptyView: EmptyGroupsView,
        emptyViewOptions: function() {
            return {
                text: this.emptyGroupLabel
            };
        },
        loadingViewOptions: function() {
            return {
                text: this.loadingLabel
            };
        },
        loading: function(boolean) {
            if (!!boolean) {
                // save a reference to the collection. We're setting this.collection to null to force CollectionView to show its empty (loading) screen
                this._collection = this.collection;
                this.collection = null;

                // overrride empty view options with loading options while we show loading
                this.emptyViewOptions = this.loadingViewOptions;
                this.emptyView = LoadingView;
            } else {
                // restore the original collection now that we don't need CollectionView to show the loading screen
                this.collection = this._collection;
                this._collection = null;

                // restore the original empty view options now that we're not showing the loading view
                this.emptyViewOptions = this._emptyViewOptions;
                this.emptyView = EmptyGroupsView;
            }
            // We set everything up to toggle the loading view, now draw the view.
            this.render();
        },
        childView: BodyGroupCollectionView,
        childViewOptions: function(model, index) {
            var attributeMapping = this.getOption('attributeMapping');
            return {
                collection: model.get(attributeMapping.groupItems),
                summaryLabel: this.options.label || "Items",
                attributeMapping: attributeMapping,
                onClick: this.onClick || null,
                onFavorite: this.onFavorite || null,
                showFavoriteIcon: this.showFavoriteIcon || false
            };
        },
        initialize: function(options) {
            if (_.isFunction(options.onClick)) {
                this.onClick = options.onClick;
            }
            if (_.isFunction(options.onFavorite)) {
                this.onFavorite = options.onFavorite;
            }
            if (_.isObject(options.attributeMapping)) {
                this.attributeMapping = _.defaults(options.attributeMapping, defaultOptions.attributeMapping);
            }
            // Save a reference to the empty view options since we override it when we show the loading view.
            // We need it to restore back to empty view after no longer loading.
            this._emptyViewOptions = this.emptyViewOptions;

            this.emptyGroupLabel = options.emptyGroupLabel || 'There are no items.';
            this.loadingLabel = options.loadingLabel || 'Loading...';
            this.showFavoriteIcon = options.showFavoriteIcon;
        }
    });
    var Orig = BodyGroupContainerCollectionView,
        Modified = Orig.extend({
            constructor: function() {
                this.options = _.extend({}, defaultOptions, this.options);
                var args = Array.prototype.slice.call(arguments),
                    init = this.initialize;
                this.initialize = function() {
                    var args = Array.prototype.slice.call(arguments);
                    Orig.prototype.initialize.apply(this, args);
                    if (Orig.prototype.initialize === init) return;
                    init.apply(this, args);
                };
                Orig.prototype.constructor.apply(this, args);
            }
        });
    BodyGroupContainerCollectionView = Modified;

    return BodyGroupContainerCollectionView;
});