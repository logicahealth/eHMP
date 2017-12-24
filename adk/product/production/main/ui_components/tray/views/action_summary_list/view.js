define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'api/Messaging',
    'main/Session'
], function(Backbone, Marionette, _, Handlebars, Messaging, Session) {
    "use strict";

    var HeaderModel = Backbone.Model.extend({
        defaults: {
            key: null,
            headerLabel: null
        }
    });
    var HeaderView = Backbone.Marionette.ItemView.extend({
        behaviors: function() {
            return {
                HelpLink: {
                    container: '.header-buttons-container',
                    mapping: this.getOption('helpMapping'),
                    url: this.getOption('helpUrl'),
                    buttonOptions: {
                        colorClass: 'bgc-primary-dark'
                    }
                },
                FlexContainer: {
                    direction: 'row',
                    alignItems: 'flex-start'
                }
            };
        },
        template: Handlebars.compile([
            '<div data-flex-width="1"><h4 class="panel-title all-border-no inline-block-display color-pure-white">{{headerLabel}}</h4></div>',
            '<div class="header-buttons-container top-padding-xs"></div>'
        ].join("\n")),
        modelEvents: {
            'change': 'render'
        }
    });

    var LoadingModel = Backbone.Model.extend({
        defaults: {
            allAppletsLoaded: false
        }
    });
    var LoadingView = Backbone.Marionette.ItemView.extend({
        getTemplate: function(model) {
            if (_.isBoolean(this.model.get('allAppletsLoaded')) && this.model.get('allAppletsLoaded')) {
                return Handlebars.compile('');
            }
            return Handlebars.compile('<span class="text-muted font-size-12"><i class="fa fa-spinner fa-spin"></i> Loading...</span>');
        },
        modelEvents: {
            'change:allAppletsLoaded': 'render'
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

    var SingleItemModel = Backbone.Model.extend({
        defaults: {
            isSingleItem: false
        }
    });

    var SingleItemView = Backbone.Marionette.ItemView.extend({
        tagName: "button",
        className: "btn btn-default btn-block",
        attributes: function() {
            var label = this.model.get('label');
            return {
                'type': 'button',
                'title': label ? 'Add New ' + label : 'Add New Item'
            };
        },
        template: Handlebars.compile([
            'New {{label}} <i class="fa fa-plus font-size-10 pull-right"></i>'
        ].join('\n')),
        events: {
            'click': function(e) {
                e.preventDefault();
                var onClickFunc = this.model.get('onClick');
                if (_.isFunction(onClickFunc)) {
                    _.bind(onClickFunc, this)();
                }
            }
        }
    });

    var ActionListItemView = Backbone.Marionette.ItemView.extend({
        tagName: 'li',
        className: 'list-group-item all-padding-no bottom-padding-xs all-border-no',
        template: Handlebars.compile([
            '<a href="#" class="add-new all-padding-sm" title="Add New {{label}}">',
            '{{label}}',
            '</a>'
        ].join('\n')),
        ui: {
            'ActionListItem': 'a.add-new'
        },
        events: {
            'click @ui.ActionListItem': function(e) {
                e.preventDefault();
                var onClickFunc = this.model.get('onClick');
                if (_.isFunction(onClickFunc)) {
                    onClickFunc();
                }
            }
        }
    });

    var ActionListCollectionView = Backbone.Marionette.CompositeView.extend({
        className: 'btn-group btn-block',
        getTemplate: function() {
            if (this.singleItemModel.get('isSingleItem') === true) {
                return Handlebars.compile('<div class="action-list-child-container"></div>');
            }
            return Handlebars.compile([
                '<button type="button" class="btn btn-default btn-block dropdown-toggle" title="Press enter to open {{dropdownLabel}} menu" data-toggle="dropdown" aria-expanded="false">',
                '{{dropdownLabel}} <i class="fa fa-caret-down color-pure-white pull-right"></i>',
                '</button>',
                '<ul class="dropdown dropdown-menu btn-block action-list-child-container top-padding-no">' +
                '<li class="all-padding-sm bottom-border-grey-light">Create a New...</li>',
                '</ul>'
            ].join("\n"));
        },
        events: {
            'keydown [data-toggle=dropdown],.dropdown': function(e) {
                if (e.target.hasAttribute('data-toggle', 'dropdown') && e.which == 9) return;
                if (!/(38|40|27)/.test(e.which)) e.stopPropagation();
            }
        },
        ui: {
            'ChildViewContainer': '.action-list-child-container'
        },
        templateHelpers: function() {
            return {
                dropdownLabel: this.dropdownLabel
            };
        },
        childViewContainer: '@ui.ChildViewContainer',
        getChildView: function() {
            if (this.singleItemModel.get('isSingleItem') === true) {
                return SingleItemView;
            }
            return ActionListItemView;
        },
        emptyView: NoActionItemsView,
        emptyViewOptions: function() {
            return {
                text: this.emptyViewText
            };
        },
        initialize: function(options) {
            this.options = options;
            this.key = this.getOption('key');
            this.dropdownLabel = this.getOption('dropdownLabel');
            this.emptyViewText = this.getOption('emptyViewText');

            this.loadingModel = this.getOption('loadingModel');
            this.singleItemModel = new SingleItemModel();

            this.collection = Messaging.request('get:component:items');
            if (this.getItemLength() <= 1) {
                this.singleItemModel.set('isSingleItem', true);

                if (!this.loadingModel.get('allAppletsLoaded')) {
                    this.listenTo(this.collection, 'add', function(addedModel) {
                        if (addedModel.hasKey('tray', this.key)) {
                            if (this.getItemLength() > 1) {
                                this.singleItemModel.set('isSingleItem', false);
                                this.stopListening(this.collection, 'add');
                            } else {
                                this.singleItemModel.set('isSingleItem', true);
                            }
                        }
                    });
                }
            }
        },
        onBeforeShow: function() {
            if (this.loadingModel.get('allAppletsLoaded') === false) {
                this.listenTo(this.singleItemModel, 'change:isSingleItem', this.render);
                this.listenToOnce(this.loadingModel, 'change:allAppletsLoaded', function() {
                    this.stopListening(this.collection, 'add');
                    this.stopListening(this.singleItemModel, 'change:isSingleItem');
                });
            }
        },
        filter: function(child, index) {
            var shouldShow = child.get('shouldShow');
            var onClick = child.get('onClick');
            if (_.isFunction(shouldShow) && !shouldShow()) {
                return false;
            }
            if (!_.isFunction(onClick)) {
                return false;
            }
            return child.hasKey('tray', this.key);
        },
        getItemLength: function(collection) {
            var filteredCollection = this.collection.filter(function(child) {
                if (child.hasKey('tray', this.key)) {
                    return true;
                }
                return false;
            }, this);
            return filteredCollection.length;
        }
    });

    var defaultOptions = {
        key: null,
        headerLabel: '',
        dropdownLabel: 'New Item',
        listView: null,
        emptyViewText: "No Items Available."
    };

    var ActionSummaryListView = Backbone.Marionette.LayoutView.extend({
        behaviors: {
            FlexContainer: {
                direction: 'column'
            }
        },
        className: "container-fluid panel panel-default",
        template: Handlebars.compile([
            '<div class="header-container row panel-heading all-padding-no left-padding-sm right-padding-sm"></div>',
            '{{#if hasNextSuggestion}}<div class="panel all-margin-no" data-flex-order="1">',
            '{{#if nextSuggestion.header}}<div class="row panel-heading all-padding-no left-padding-sm right-padding-sm background-color-primary-lightest"><h5 class="panel-title font-size-12 top-padding-xs bottom-padding-xs">{{nextSuggestion.header}}</h5></div>{{/if}}',
            '<div class="row panel-body left-padding-sm right-padding-sm flex-display top-border-grey-dark {{#if nextSuggestion.header}}background-color-primary-light{{else}}background-color-primary-lightest{{/if}}">',
            '<div class="flex-width-1">{{#if nextSuggestion.suggestionLabel}}<p class="all-margin-no">{{nextSuggestion.suggestionLabel}}</p>{{/if}}<p class="font-size-12 transform-text-uppercase bold-font all-margin-no">{{nextSuggestion.suggestion}}</p></div>',
            '<div class="flex-width-none"><button data-ui="nextSuggestion" type="button" class="btn btn-primary pull-right" aria-label="{{nextSuggestion.buttonDescription}}">{{#if nextSuggestion.buttonLabel}}{{nextSuggestion.buttonLabel}}{{else}}<i class="fa fa-arrow-right" aria-hidden="true"></i>{{/if}}</button></div></div>',
            '</div>{{/if}}',
            '<div class="action-list-container row panel-body bottom-border-grey-light"></div>',
            '<div data-flex-width="1" class="summary-list-container row panel-body all-padding-no auto-overflow-y"></div>',
            '<div class="loading-container"></div>'
        ].join("\n")),
        templateHelpers: function() {
            var nextViewOptions = this.getOption('nextViewOptions');
            nextViewOptions = (nextViewOptions instanceof Backbone.Model) ? nextViewOptions.get('nextSuggestion') : {};
            var helpers = {
                hasNextSuggestion: !!nextViewOptions && _.has(nextViewOptions, 'suggestion'),
                nextSuggestion: _.extend({
                    header: '',
                    suggestionLabel: '',
                    buttonLabel: ''
                }, _.pick(nextViewOptions, ['buttonLabel', 'suggestion', 'header', 'suggestionLabel']))
            };
            _.extend(helpers.nextSuggestion, {
                buttonDescription: _.get(helpers, 'nextSuggestion.suggestionLabel', _.get(helpers, 'nextSuggestion.buttonLabel', '')) + ' ' + _.get(helpers, 'nextSuggestion.suggestion')
            });
            return helpers;
        },
        ui: {
            'HeaderContainer': '.header-container',
            'ListContainer': '.action-list-container',
            'SummaryContainer': '.summary-list-container',
            'LoadingContainer': '.loading-container',
            'NextSuggestionButton': 'button[data-ui="nextSuggestion"]'
        },
        regions: {
            'HeaderRegion': '@ui.HeaderContainer',
            'ActionListRegion': '@ui.ListContainer',
            'SummaryListRegion': '@ui.SummaryContainer',
            'LoadingRegion': '@ui.LoadingContainer'
        },
        events: {
            'click @ui.NextSuggestionButton': function() {
                var nextViewOptions = this.getOption('nextViewOptions');
                if (nextViewOptions instanceof Backbone.Model) {
                    _.result(nextViewOptions.get('nextSuggestion'), 'callback');
                }
            }
        },
        options: defaultOptions,
        initialize: function(options) {
            this.key = this.getOption('key');
            this.headerLabel = this.getOption('headerLabel');
            this.dropdownLabel = this.getOption('dropdownLabel');
            this.listView = this.getOption('listView');
            this.emptyViewText = this.getOption('emptyViewText');

            this.model = new HeaderModel({
                key: this.key,
                headerLabel: this.headerLabel
            });
            this.loadingModel = new LoadingModel();
            Session.allAppletsLoadedPromise.done(_.bind(function() {
                this.loadingModel.set('allAppletsLoaded', true);
            }, this));
        },
        onBeforeShow: function() {
            var self = this;
            this.showChildView('HeaderRegion', new HeaderView({
                model: this.model,
                helpMapping: this.getOption('helpMapping'),
                helpUrl: this.getOption('helpUrl')
            }));

            this.showChildView('ActionListRegion', new ActionListCollectionView({
                key: this.key,
                dropdownLabel: this.dropdownLabel,
                emptyViewText: this.emptyViewText,
                loadingModel: this.loadingModel
            }));

            if (this.listView) {
                this.showChildView('SummaryListRegion', new this.listView());
            }

            this.showChildView('LoadingRegion', new LoadingView({
                model: this.loadingModel
            }));
        }
    });

    var Orig = ActionSummaryListView,
        Modified = Orig.extend({
            constructor: function() {
                this.options = _.extend({}, defaultOptions, this.options);
                var args = Array.prototype.slice.call(arguments),
                    init = this.initialize,
                    onBeforeShow = this.onBeforeShow;
                this.initialize = function() {
                    var args = Array.prototype.slice.call(arguments);
                    Orig.prototype.initialize.apply(this, args);
                    if (Orig.prototype.initialize === init) return;
                    init.apply(this, args);
                };
                this.onBeforeShow = function() {
                    var args = Array.prototype.slice.call(arguments);
                    Orig.prototype.onBeforeShow.apply(this, args);
                    if (Orig.prototype.onBeforeShow === onBeforeShow) return;
                    onBeforeShow.apply(this, args);
                };
                Orig.prototype.constructor.apply(this, args);
            }
        });
    ActionSummaryListView = Modified;

    return ActionSummaryListView;
});
