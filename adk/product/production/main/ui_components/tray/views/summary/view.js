define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'moment',
    'api/Messaging'
], function(Backbone, Marionette, _, Handlebars, moment, Messaging) {
    "use strict";

    var NoSummaryGroupsView = Backbone.Marionette.ItemView.extend({
        className: "panel panel-default all-padding-sm",
        initialize: function(options) {
            this.model = new Backbone.Model({
                text: options.text
            });
        },
        template: Handlebars.compile('<span>{{text}}</span>')
    });

    var NoSummaryItemsView = NoSummaryGroupsView.extend({
        className: "panel panel-default list-group-item",
        tagName: "li",
        getTemplate: function() {
            var emptyTemplate = this.getOption('emptyViewTemplate');
            return _.isFunction(emptyTemplate) ?
                emptyTemplate : _.isString(emptyTemplate) ?
                Handlebars.compile(emptyTemplate) :
                Handlebars.compile('<div class="all-padding-xs left-padding-sm right-padding-sm"><p class="left-padding-lg">{{text}}</p></div>');
        }
    });

    var BodyGroupItemView = Backbone.Marionette.ItemView.extend({
        getTemplate: function() {
            var itemTemplate = this.getOption('itemTemplate');
            return _.isFunction(itemTemplate) ?
                itemTemplate : _.isString(itemTemplate) ?
                Handlebars.compile(itemTemplate) :
                Handlebars.compile([
                    '<a href="#li-item" data-uniqueID="{{itemUniqueId}}" title="Press enter to open {{localTitle}}">',
                        '<div>',
                            '<h5 id="{{formatIdString groupLabel}}-{{formatIdString summaryLabel}}-list-title-{{formatIdString itemUniqueId}}">' +
                                '{{itemLabel}}' +
                            '</h5>',
                            '{{#if formattedReferenceDate}}<p><span class="sr-only">Date/Time: </span><span id="{{formatIdString groupLabel}}-note-list-date-{{formatIdString itemUniqueId}}">{{{formattedReferenceDate}}}</span></p>{{/if}}',
                            '{{#if itemStatus}}<p><span id="{{formatIdString groupLabel}}-note-list-status-{{formatIdString itemUniqueId}}">Status: {{itemStatus}}</span></p>{{/if}}',
                        '</div>',
                    '</a>'
                ].join("\n"));
        },
        tagName: function() {
            return this.options.removeTagName ? 'div' : 'li';
        },
        events: {
            'click a[href="#li-item"]': function(e) {
                e.preventDefault();
                e.stopPropagation();
                this.onClick(this.model);
            }
        },
        templateHelpers: function() {
            var self = this;

            var defaultHelpers = {
                formatIdString: function(string) {
                    return _.isString(string) ? string.replace(/ |\(|\)/g, "-").toLowerCase() : string;
                },
                formattedReferenceDate: function() {
                    var isDate = moment(this[self.attributeMapping.itemDateTime], 'YYYYMMDDHHmmssSSS').isValid();
                    if (isDate) {
                        return moment(this[self.attributeMapping.itemDateTime], 'YYYYMMDDHHmmssSSS').format('MM/DD/YYYY - HH:mm');
                    }
                    return '';
                },
                summaryLabel: this.summaryLabel,
                groupLabel: this.groupLabel,
                groupId: this.groupId,
                itemUniqueId: this.cid
            };

            var itemTemplateHelper = this.getOption('itemTemplateHelper');

            if (_.isEmpty(itemTemplateHelper)) {
                return defaultHelpers;
            } else {
                return _.defaults(itemTemplateHelper, defaultHelpers);
            }
        },
        initialize: function(options) {
            this.mergeOptions(options, [
                'summaryLabel',
                'groupLabel',
                'groupId',
                'attributeMapping',
                'onClick'
            ]);

            if (_.isFunction(this.getOption('getItemTemplate'))) {
                this.getTemplate = this.getOption('getItemTemplate');
            }
        },
        serializeModel: function(model) {
            var attributes = model.toJSON(),
                data = _.defaults({
                    itemUniqueId: attributes[this.attributeMapping.itemUniqueId],
                    itemLabel: attributes[this.attributeMapping.itemLabel],
                    itemStatus: attributes[this.attributeMapping.itemStatus],
                    itemDateTime: attributes[this.attributeMapping.itemDateTime]
                }, attributes);
            return data;
        }
    });

    var BodyGroupNodeCollectionView = Backbone.Marionette.CollectionView.extend({
        tagName: 'ul',
        getChildView: function(item) {
            return this.hasChildren(item) ? BodyGroupNodeView : BodyGroupItemView;
        },
        initialize: function(options) {
            this.attributeMapping = options.attributeMapping;
            this.onClick = options.onClick;
            this.hasChildren = options.hasChildren;
            this.childViewOptions = options.childViewOptions;
            this.collection = new Backbone.Collection(this.model.get(this.attributeMapping.nodes));
        }
    });
    var BodyGroupNodeView = Marionette.LayoutView.extend({
        tagName: 'li',
        className: 'accordion-container panel-group bottom-margin-no',
        template: Handlebars.compile([
            '<div class="panel panel-default">',
                '<div class="panel-heading all-padding-no background-color-pure-white">',
                    '<div class="panel-title">',
                        '<div class="row all-margin-no">',
                            '<div class="col-xs-1 left-margin-lg pixel-width-1">',
                                '<div class="node-toggle-button">',
                                    '<a data-toggle="collapse" class="btn-accordion accordion-toggle" href="#collapse-{{itemUniqueId}}-node">',
                                    '</a>',
                                '</div>',
                            '</div>',
                            '<div class="col-xs-11 left-padding-no percent-width-85">',
                                '<div class="node-main-item"></div>',
                            '</div>',
                        '</div>',
                    '</div>',
                '</div>',
                '<div id="collapse-{{itemUniqueId}}-node" class="panel-collapse collapse"  aria-labelledby="headingOne">',
                    '<div class="panel-body multi-select-list all-padding-no all-border-no">',
                '</div>',
            '</div>'
        ].join("\n")),
        onDomRefresh: function() {
            this.$('.panel-collapse').collapse('toggle');
            this.$('[data-toggle="collapse"]').attr('role', 'button');
        },
        events: {
            'shown.bs.collapse': function() {
                this.$('.panel-title').attr('title', 'Press enter to collapse accordion ' + this.model.get('localTitle'));
            },
            'hidden.bs.collapse': function(){
                this.$('.panel-title').attr('title', 'Press enter to expand accordion ' + this.model.get('localTitle'));

            }
        },
        regions: {
            mainItem: '.node-main-item',
            nodes: '.panel-body'
        },
        onBeforeShow: function() {
            this.showChildView('mainItem', new BodyGroupItemView(_.extend(this.options, { removeTagName: true })));
            this.showChildView('nodes', new BodyGroupNodeCollectionView(this.options));
        },
        templateHelpers: function() {
            return {
                formatIdString: function(string) {
                    return _.isString(string) ? string.replace(/ |\(|\)/g, "-").toLowerCase() : string;
                },
                itemOptions: this.itemOptions,
                summaryLabel: this.summaryLabel,
                itemUniqueId: this.cid
            };
        }
    });

    var BodyGroupCollectionView = Backbone.Marionette.CompositeView.extend({
        className: 'panel panel-default',
        template: Handlebars.compile([
            '<div class="panel-heading tray-summary-group-header all-padding-xs" id="heading-{{formatIdString summaryLabel}}-{{formatIdString groupLabel}}">',
                '<button type="button" class="btn btn-icon btn-xs panel-title accordion-toggle left-padding-sm" data-toggle="collapse" data-target="#collapse-{{formatIdString summaryLabel}}-{{formatIdString groupLabel}}" aria-expanded="true" aria-controls="collapse-{{formatIdString summaryLabel}}-{{formatIdString groupLabel}}">',
                    '{{groupLabel}}',
                '</button>',
            '</div>',
            '<div class="panel-collapse collapse" aria-labelledby="heading-{{formatIdString summaryLabel}}-{{formatIdString groupLabel}}" id="collapse-{{formatIdString summaryLabel}}-{{formatIdString groupLabel}}">',
                '<div class="panel-body multi-select-list all-padding-no" id="body-{{summaryLabel}}-{{formatIdString groupLabel}}">',
                    '<ul class="all-padding-no"></ul>',
                '</div>',
            '</div>'
        ].join('\n')),
        onDomRefresh: function() {
            this.$('.panel-collapse').collapse('toggle');
            this.$('[data-toggle="collapse"]').removeAttr('role');
        },
        events: {
            'shown.bs.collapse': function() {
                this.$('button.panel-title').attr('title', 'Press enter to collapse accordion ' + ((this.model.get('groupLabel') === undefined ) ? this.model.get('name') : this.model.get('groupLabel')));
            },
            'hidden.bs.collapse': function(){
                this.$('button.panel-title').attr('title', 'Press enter to expand accordion ' + ((this.model.get('groupLabel') === undefined ) ? this.model.get('name') : this.model.get('groupLabel')));

            }
        },
        emptyView: NoSummaryItemsView,
        emptyViewOptions: function() {
            //edge case: avoid appending summaryLabel if groupLabel already ends with it
            //e.g. My Signed Notes + Notes
            var group = this.model.get(this.attributeMapping.groupLabel);
            var summary = this.summaryLabel ? (!_.endsWith(group, this.summaryLabel) ? " " +this.summaryLabel : "") : " Items";
            var text = "No " +group + summary + ".";
            return {
                emptyViewTemplate: this.getOption('emptyViewTemplate'),
                text: text
            };
        },
        childViewContainer: 'ul',
        hasChildren: function(item) {
            return item.get(this.attributeMapping.nodes);
        },
        getChildView: function(item) {
            return this.hasChildren(item) ? BodyGroupNodeView : BodyGroupItemView;
        },
        childViewOptions: function(model, index) {
            return {
                summaryLabel: this.summaryLabel,
                groupLabel: this.model.get(this.attributeMapping.groupLabel),
                groupId: this.model.get(this.attributeMapping.groupId),
                attributeMapping: this.attributeMapping,
                onClick: this.onClick,
                getItemTemplate: this.getOption('getItemTemplate'),
                itemTemplate: this.getOption('itemTemplate'),
                hasChildren: this.hasChildren,
                childViewOptions: this.childViewOptions
            };
        },
        templateHelpers: function() {
            return {
                formatIdString: function(string) {
                    return _.isString(string) ? string.replace(/ |\(|\)/g, "-").toLowerCase() : string;
                },
                itemOptions: this.itemOptions,
                summaryLabel: this.summaryLabel
            };
        },
        initialize: function(options) {
            this.collection.bind("reset", this.reset, this);
            this.collection.bind("change", this.render, this);
            this.summaryLabel = options.summaryLabel;
            this.attributeMapping = options.attributeMapping;
            this.onClick = _.bind(options.onClick, this);
        },
        serializeModel: function(model) {
            var attributes = model.toJSON(),
                data = {
                    groupLabel: attributes[this.attributeMapping.groupLabel],
                    groupId: attributes[this.attributeMapping.groupId]
                };
            return data;
        }
    });

    var defaultOptions = {
        emptyViewLabel: '',
        emptyGroupLabel: '',
        onClick: null,
        attributeMapping: {
            groupId: 'id',
            groupLabel: 'label',
            groupItems: 'items',
            itemUniqueId: 'uniqueId',
            itemLabel: 'label',
            itemStatus: 'status',
            itemDateTime: 'dateTime',
            nodes: 'nodes'
        }
    };

    var LoadingView = Backbone.Marionette.ItemView.extend({
        className: "panel panel-default all-padding-sm",
        template: Handlebars.compile('<span class="font-size-12"><i class="fa fa-spinner fa-spin"></i> {{text}}</span>'),
        initialize: function(options) {
            this.model = new Backbone.Model({
                text: options.text
            });
        }
    });

    var BodyGroupContainerCollectionViewBase = Backbone.Marionette.CollectionView.extend({
        className: 'accordion-container panel-group small bottom-margin-xs',
        options: defaultOptions,
        emptyView: NoSummaryGroupsView,
        defaultEmptyViewOptions: function() {
            return {
                text: "This patient currently has no " + (this.options.label || "Items") + "."
            };
        },
        defaultLoadingViewOptions: function() {
            return {
                text: "Loading " + (this.options.label || "Items") + "..."
            };
        },
        emptyViewOptions: function(){
            return this.defaultEmptyViewOptions;
        },
        loading: function(boolean) {
            if (!!boolean) {
                this.emptyViewOptions = this.defaultLoadingViewOptions;
                this.emptyView = LoadingView;
            } else {
                this.emptyViewOptions = this.defaultEmptyViewOptions;
                this.emptyView = NoSummaryGroupsView;
            }
        },
        childView: BodyGroupCollectionView,
        childViewOptions: function(model, index) {
            var attributeMapping = this.getOption('attributeMapping');
            return {
                collection: model.get(attributeMapping.groupItems),
                summaryLabel: this.options.label || "Items",
                attributeMapping: attributeMapping,
                onClick: this.onClick || null,
                getItemTemplate: this.getOption('getItemTemplate'),
                itemTemplate: this.getOption('itemTemplate'),
                itemTemplateHelper: this.getOption('itemTemplateHelper'),
                emptyViewTemplate: this.getOption('emptyViewTemplate')
            };
        },
        initialize: function(options) {
            if (_.isFunction(this.getOption('onClick'))) {
                this.onClick = this.getOption('onClick');
            }
            if (_.isObject(this.getOption('attributeMapping'))) {
                this.attributeMapping = _.defaults(this.getOption('attributeMapping'), defaultOptions.attributeMapping);
            }
        }
    });

    var BodyGroupContainerCollectionView = BodyGroupContainerCollectionViewBase.extend({
            constructor: function() {
                this.options = _.extend({}, defaultOptions, this.options);
                var args = Array.prototype.slice.call(arguments),
                    init = this.initialize;
                this.initialize = function() {
                    var args = Array.prototype.slice.call(arguments);
                    BodyGroupContainerCollectionViewBase.prototype.initialize.apply(this, args);
                    if (BodyGroupContainerCollectionViewBase.prototype.initialize === init) return;
                    init.apply(this, args);
                };
                BodyGroupContainerCollectionViewBase.prototype.constructor.apply(this, args);
            }
        });

    return BodyGroupContainerCollectionView;
});