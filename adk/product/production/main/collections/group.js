define([
    'backbone',
    'api/QueryBuilder',
    'main/collections/server'
], function (Backbone, QueryBuilder, ServerCollection) {
    "use strict";


    // TODO: this should be something that the applet should extend and have parse ensured.
    var GroupModel = ServerCollection.prototype.model.extend({
        idAttribute: "_groupKey",
        parse: function (item) {
            if (this.has('rows')) {
                this.get('rows').add(item.items, {remove: false});
            } else {
                item.rows = new Backbone.Collection(item.items);
            }

            delete item.items;
            return item;
        }
    });

    var GroupsCollection = ServerCollection.extend({
        model: GroupModel,

        parse: function (attr, options) {
            var self = this;
            attr = GroupsCollection.__super__.parse.apply(this, arguments);
            var groups = [];
            var getGroupKey;

            if (_.isFunction(this._groupKey)) {
                getGroupKey = this._groupKey;
            } else {
                getGroupKey = function (item) {
                    return item[self._groupKey];
                };
            }

            _.each(attr, _.bind(function (item) {
                var key = getGroupKey(item);
                var index = groups.length - 1;
                if (groups.length && groups[index]._groupKey === key) {
                    groups[index].items.push(item);
                } else {
                    groups.push(_.set({_groupKey: key, items: [item], groupName: this.groupName}, this.groupName, key));
                }
            }, this));
            return groups;
        },

        fetch: function (options) {
            if (_.isUndefined(this._groupKey)) {
                throw new Error("getGroupKey specified before fetching the collection");
            }
            GroupsCollection.__super__.fetch.apply(this, arguments);
        },

        /**
         * @param models {[] | Backbone.Model}
         * @param options {{groupKey, groupName} | undefined}
         */
        initialize: function (models, options) {
            GroupsCollection.__super__.initialize.apply(this, arguments);
            this.setInitialGrouping(options);
        },

        setInitialGrouping: function(options){
            if (options.groupKey && options.groupName) {
                this.groupName = options.groupName;
                this._initialGroupKey = this.setGrouping(options.groupKey);
            } else if (options.groupName) {
                this.groupName = options.groupName;
                this._initialGroupKey = this.setGrouping(options.groupName);
            }
            this._initialGroupName = this.groupName;
        },

        setGrouping: function (grouping) {
            if (_.isString(grouping)) {
                this._groupKey = function (item) {
                    return item[grouping];
                };
                return this._groupKey;
            }
            this._groupKey = grouping;
            return this._groupKey;
        },

        serverSort: function(sortKey, options) {
            var keyToSort = sortKey;
            var optionsToSort = options;
            if (!_.isString(keyToSort) && _.isObject(sortKey)) {
                // if only options were provided
                keyToSort = null;
                optionsToSort = sortKey;
            }
            this.groupName = _.get(optionsToSort, 'groupName', this._initialGroupName);
            if (_.get(optionsToSort, 'groupKey')) {
                this.setGrouping(_.get(optionsToSort, 'groupKey'));
            } else {
                this.setGrouping(_.get(optionsToSort, 'groupName', this._initialGroupKey));
            }
            GroupsCollection.__super__.serverSort.apply(this, [keyToSort, optionsToSort]);
        },

        getTotalItems: function () {
            var length = 0;
            this.each(function (group) {
                var rows = group.get('rows') || [];
                length += rows.length;
            });
            return length;
        },

        isEmpty: function() {
            // overwriting in case parse error causes group to be created but execution
            // is interrupted
            return !(!!this.length) || !(this.some(function(model) {
                return _.get(model.get('rows'), 'length');
            }));
        }
    });

    return GroupsCollection;
});
