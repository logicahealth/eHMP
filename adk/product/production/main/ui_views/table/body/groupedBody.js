define([
    'backbone',
    'marionette',
    'handlebars',
    'main/ui_views/table/body/row'
], function(Backbone, Marionette, Handlebars, Row) {
    'use strict';

    var GroupHeader = Backbone.Marionette.ItemView.extend({
        _setFocus: false,
        template: Handlebars.compile(
            '<button data-toggle="collapse" type="button" class="btn btn-accordion" title="Press enter to {{buttonActionText}} {{formatGroupHeader}} accordion.">' +
            '<i class="fa fa-caret-down{{#unless isExpanded}} fa-rotate-270{{/unless}}" aria-hidden="true"></i> {{formatGroupHeader}}' +
            '<span class="badge left-margin-xs {{#if isExpanded}}hidden{{/if}}" aria-hidden="true">{{count}}</span><span class="sr-only"> {{count}} items in group</span>' +
            '</button>'),
        tagName: 'th',
        attributes: function() {
            var colspanValue = this.getOption('columns').length;
            var tileOptions = this.getOption('tileOptions', {});
            var isQuickMenuEnabled = _.get(tileOptions, 'quickMenu.enabled', false);

            if (isQuickMenuEnabled) {
                colspanValue += 1;
            }

            return {
                'scope': 'rowGroup',
                'colspan': colspanValue,
                'id': this.getOption('groupId'),
                'aria-expanded': 'true'
            };
        },
        templateHelpers: function() {
            var helpers = _.extend({
                'formatGroupHeader': function() {
                    var groupName = this.groupName;
                    var key = this._groupkey;
                    var attributeName = groupName;
                    if (_.has(this, (attributeName + '_groupHeader'))) {
                        attributeName += '_groupHeader';
                    }
                    return _.result(this, attributeName);
                },
                count: function() {
                    return this.rows.length;
                },
                isExpanded: this.isExpanded(),
                buttonActionText: function() {
                    return _.result(this, 'isExpanded') ? 'collapse' : 'expand';
                }
            }, _.transform(_.result(this.options, 'helpers'), function(helperObj, helper, key) {
                if (_.isFunction(helper)) {
                    helper = _.partial(helper, this.model);
                }
                helperObj[key] = helper;
            }, {}, this));
            if (_.has(helpers, this.model.get('groupName'))) {
                var origHelper = {
                    originalHelper: helpers[this.model.get('groupName')]
                };
                Object.defineProperty(helpers, this.model.get('groupName'), {
                    get: function() {
                        return _.result(origHelper, 'originalHelper');
                    }
                });
            }
            return helpers;
        },
        events: {
            'click': function(event) {
                this._setFocus = true;
                this.toggleGroup(event);
            }
        },
        toggleGroup: function() {
            var expanded = this.isExpanded();
            this.$el.parent().nextUntil('tr.row-header, tr.infinite-scrolling-indicator-container', 'tr').toggleClass('hidden');
            this.$el.attr('aria-expanded', !expanded);
            this.render();
        },
        onDomRefresh: function() {
            if (this._setFocus) {
                this.$('button').focus();
            }
            this._setFocus = false;
        },
        isExpanded: function() {
            return _.isEqual(this.$el.attr('aria-expanded'), 'true');
        }
    });

    var TableGroupedBody = Backbone.Marionette.CompositeView.extend({
        _replaceSpaces: function(string) {
            if (_.isString(string)) {
                string = string || "";
                return string.replace(/[^A-Z0-9]+/ig, "-");
            }
            return string;
        },
        template: Handlebars.compile('<tr data-group-key="{{_groupKey}}" class="row-header"></tr>'),
        childView: Row,
        childViewOptions: function(model) {
            return _.extend({}, this.options, {
                collection: new Backbone.Collection(this.getOption('columns')),
                model: model,
                groupId: this._groupId
            });
        },
        setElement: function(el) {
            this.el = document.createDocumentFragment();
            this.$el = Backbone.$(this.el);
            this.delegateEvents();
            return this;
        },
        // Overwriting to accommodate our setElement implementation to maintain table structure
        attachHtml: function(collectionView, childView, index) {
            if (collectionView.isBuffering) {
                collectionView._bufferedChildren.splice(index, 0, childView);
            } else {
                if (!collectionView._insertBefore(childView, index)) {
                    // Was calling _insertAfter, which calls this.$el.append
                    // which doesn't work because of our setElement implementation
                    // this.children.last() will be the new child view, so need to get one before that
                    this.children.findByIndex(this.children.last()._index - 1).$el.after(childView.el);
                }
            }
        },
        initialize: function(options) {
            this._groupId = this._replaceSpaces(this.model.get('_groupKey') + this.cid);
            this._rowHeaderRegionManager = new Backbone.Marionette.RegionManager();
        },
        onRenderTemplate: function() {
            var HeaderRegion = Backbone.Marionette.Region.extend({
                el: this.$('tr.row-header')
            });
            this._rowHeaderRegionManager.addRegions({
                'HeaderRegion': HeaderRegion
            });
            var headerRegion = this._rowHeaderRegionManager.get('HeaderRegion');
            this.headerView = new GroupHeader(_.extend({}, this.options, {
                model: this.model,
                groupId: this._groupId
            }));
            headerRegion.show(this.headerView);
        },
        onBeforeDestroy: function() {
            this._rowHeaderRegionManager.destroy();
        },
        onAddChild: function(childView) {
            var isVisible = this.headerView.isExpanded();
            if (!isVisible) {
                childView.$el.addClass('hidden');
                this.headerView.toggleGroup();
            }
        }
    });

    return TableGroupedBody;
});