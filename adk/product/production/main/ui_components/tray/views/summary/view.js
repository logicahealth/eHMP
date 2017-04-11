define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'api/Messaging'
], function(Backbone, Marionette, _, Handlebars, Messaging) {
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
        template: Handlebars.compile('<div class="all-padding-xs left-padding-sm right-padding-sm">{{text}}</div>')
    });

    var BodyGroupItemView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile([
            '<a href="#li-item" data-uniqueID="{{itemUniqueId}}">',
            '<div class="col-xs-12">',
            '<h5 id="{{formatIdString groupLabel}}-{{formatIdString summaryLabel}}-list-title-{{formatIdString itemUniqueId}}">' +
            '<span class="sr-only">Title: </span> {{itemLabel}}' +
            '</h5>',
            '{{#if formattedReferenceDate}}<p><span class="sr-only">Date/Time: </span><span id="{{formatIdString groupLabel}}-note-list-date-{{formatIdString itemUniqueId}}">{{{formattedReferenceDate}}}</span></p>{{/if}}',
            '{{#if itemStatus}}<p><span id="{{formatIdString groupLabel}}-note-list-status-{{formatIdString itemUniqueId}}">Status: {{itemStatus}}</span></p>{{/if}}',
            '</div>',
            '</a>'
        ].join("\n")),
        tagName: 'li',
        events: {
            'click a': function(e) {
                e.preventDefault();
                this.onClick(this.model);
            }
        },
        templateHelpers: function() {
            return {
                formatIdString: function(string) {
                    return _.isString(string) ? string.replace(" ", "-").toLowerCase() : string;
                },
                formattedReferenceDate: function() {
                    var isDate = moment(this.itemDateTime, 'YYYYMMDDHHmmssSSS').isValid();
                    if (isDate) {
                        return moment(this.itemDateTime, 'YYYYMMDDHHmmssSSS').format('MM/DD/YYYY - HH:mm');
                    }
                    return '';
                },
                summaryLabel: this.summaryLabel,
                groupLabel: this.groupLabel,
                groupId: this.groupId,
                itemUniqueId: this.cid
            };
        },
        initialize: function(options) {
            this.summaryLabel = options.summaryLabel;
            this.groupLabel = options.groupLabel;
            this.groupId = options.groupId;
            this.attributeMapping = options.attributeMapping;
            this.onClick = options.onClick;
        },
        serializeModel: function(model) {
            var attributes = model.toJSON(),
                data = {
                    itemUniqueId: attributes[this.attributeMapping.itemUniqueId],
                    itemLabel: attributes[this.attributeMapping.itemLabel],
                    itemStatus: attributes[this.attributeMapping.itemStatus],
                    itemDateTime: attributes[this.attributeMapping.itemDateTime],
                };
            return data;
        }
    });

    var BodyGroupCollectionView = Backbone.Marionette.CompositeView.extend({
        className: 'panel panel-default',
        template: Handlebars.compile([
            '<div class="panel-heading tray-summary-group-header top-padding-xs bottom-padding-xs" role="tab" id="heading-{{formatIdString summaryLabel}}-{{formatIdString groupLabel}}">',
            '<h4><a class="panel-title accordion-toggle" data-toggle="collapse" href="#collapse-{{formatIdString summaryLabel}}-{{formatIdString groupLabel}}" aria-expanded="true" aria-controls="collapse-{{formatIdString summaryLabel}}-{{formatIdString groupLabel}}">',
            '{{groupLabel}}',
            '</a></h4>',
            '</div>',
            '<div class="panel-collapse collapse in" role="tabpanel" aria-labelledby="heading-{{formatIdString summaryLabel}}-{{formatIdString groupLabel}}" id="collapse-{{formatIdString summaryLabel}}-{{formatIdString groupLabel}}">',
            '<div class="panel-body multi-select-list">',
            '<ul></ul>',
            '</div>',
            '</div>',
        ].join('\n')),
        emptyView: NoSummaryItemsView,
        emptyViewOptions: function() {
            return {
                text: "No " + this.model.get(this.attributeMapping.groupLabel) + " " + (this.summaryLabel || "Items") + "."
            };
        },
        childViewContainer: 'ul',
        childView: BodyGroupItemView,
        childViewOptions: function(model, index) {
            return {
                summaryLabel: this.summaryLabel,
                groupLabel: this.model.get(this.attributeMapping.groupLabel),
                groupId: this.model.get(this.attributeMapping.groupId),
                attributeMapping: this.attributeMapping,
                onClick: this.onClick
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
        initialize: function(options) {
            this.collection.bind("reset", this.reset, this);
            this.collection.bind("change", this.render, this);
            this.summaryLabel = options.summaryLabel;
            this.attributeMapping = options.attributeMapping;
            this.onClick = options.onClick;
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
            itemDateTime: 'dateTime'
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
        className: 'accordion-container panel-group small',
        attributes: {
            role: 'tablist'
        },
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
                onClick: this.onClick || null
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