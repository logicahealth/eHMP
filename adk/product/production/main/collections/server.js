define([
    'backbone',
    'api/QueryBuilder',
    'main/collections/base'
], function(Backbone, QueryBuilder, ADKBaseCollection) {
    'use strict';

    var ServerCollection = ADKBaseCollection.extend({
        model: ADKBaseCollection.prototype.model,
        _initialOptions: {
            sortKey: false,
            filter: {
                values: [],
                fields: []
            }
        },
        _defaults: {
            limit: 100,
            sortKey: false,
            filter: {
                values: [],
                fields: []
            }
        },
        collectionType: "server",
        inProgress: false,
        initialize: function(models, options) {
            this.options = _.defaultsDeep({}, options, this._initialOptions);
            this.defaultOptions = _.defaultsDeep({}, this.options.defaults, this.defaults, this._defaults);
            this.Criteria = new QueryBuilder.Criteria();

            var initialSortKey = this.options.sortKey;
            var defaultSortKey = this.defaultOptions.sortKey;
            if (_.isString(initialSortKey)) {
                this.Criteria.Order.setSortKey(initialSortKey);
                this.Criteria.Order.setDefaultKey(_.isString(defaultSortKey) ? defaultSortKey : initialSortKey);
            } else if (_.isString(defaultSortKey)) {
                this.Criteria.Order.setSortKey(defaultSortKey);
                this.Criteria.Order.setDefaultKey(defaultSortKey);
            }

            var initialFilterValues = this.options.filter.values;
            initialFilterValues = _.isString(initialFilterValues) ? [initialFilterValues] : initialFilterValues;
            if (_.isArray(initialFilterValues)) {
                this.Criteria.TextFilter.addTextValues(initialFilterValues);
            }
            var initialFilterFields = this.options.filter.fields;
            initialFilterFields = _.isString(initialFilterFields) ? [initialFilterFields] : initialFilterFields;
            if (_.isArray(initialFilterFields)) {
                this.Criteria.TextFilter.addFields(initialFilterFields);
            }

            var defaultFilterValues = this.defaultOptions.filter.values;
            defaultFilterValues = _.isString(defaultFilterValues) ? [defaultFilterValues] : defaultFilterValues;
            if (_.isArray(defaultFilterValues)) {
                this.Criteria.TextFilter.addTextValues(defaultFilterValues);
                this.Criteria.TextFilter.setDefaultValues(defaultFilterValues);
            }
            var defaultFilterFields = this.defaultOptions.filter.fields;
            defaultFilterFields = _.isString(defaultFilterFields) ? [defaultFilterFields] : defaultFilterFields;
            if (_.isArray(defaultFilterFields)) {
                this.Criteria.TextFilter.addFields(defaultFilterFields);
                this.Criteria.TextFilter.setDefaultFields(defaultFilterFields);
            }

            this.options.limit = (_.isNumber(this.options.limit) && this.options.limit > 0) ? this.options.limit :
                (_.isNumber(this.defaultOptions.limit) && this.defaultOptions.limit > 0) ? this.defaultOptions.limit :
                this._defaults.limit;
            if (this.options.limit) {
                this.Criteria.Page.setPageSize(this.options.limit);
            }

            this.listenTo(this, 'sync error', function() {
                this.inProgress = false;
            });
            this.listenTo(this, 'request', function() {
                this.inProgress = true;
            });
            ServerCollection.__super__.initialize.apply(this, arguments);
        },

        hasNextPage: function() {
            if (this.inProgress) {
                return false;
            } else {
                return this.Criteria.Page.hasNext();
            }
        },

        getNextPage: function(options) {
            if (!this.inProgress && this.Criteria.Page.hasNext()) {
                this.fetch(options);
            }
        },

        fetch: function(options) {
            var criteria = _.extend({}, _.get(options, 'criteria'), this.Criteria.getCriteria());
            options = _.extend({}, options, {
                remove: false,
                criteria: criteria
            });
            ServerCollection.__super__.fetch.call(this, options);
        },

        serverSort: function(sortKey, options) {
            sortKey = sortKey || this.Criteria.Order.default;
            if (!_.isString(sortKey)) {
                throw new Error('Default sort key must be defined as a String', this.options.sortKey);
            }
            // sortKey = sortKey || this.Criteria.Order.default;
            this.Criteria.Order.setSortKey(sortKey);
            this.reset([], { state: 'sorting' });
            this.fetch(options);
        },

        serverFilter: function(filterObject, options) {
            filterObject = _.extend({
                values: [],
                fields: []
            }, filterObject);

            this.Criteria.TextFilter.reset();

            var filterValues = filterObject.values;
            filterValues = _.isString(filterValues) ? [filterValues] : filterValues;
            if (_.isArray(filterValues)) {
                this.Criteria.TextFilter.addTextValues(filterValues);
            }

            var filterFields = filterObject.fields;
            filterFields = _.isString(filterFields) ? [filterFields] : filterFields;
            if (_.isArray(filterFields)) {
                this.Criteria.TextFilter.addFields(filterFields);
            }

            this.reset([], { state: 'filtering' });
            this.fetch(options);
        },

        reset: function(models, options) {
            this.Criteria.Page.reset();
            var newLimit = _.get(options, 'limit', this.options.limit);
            if (_.isNumber(newLimit) && newLimit > 0) {
                this.Criteria.Page.setPageSize(newLimit);
            }
            ServerCollection.__super__.reset.apply(this, arguments);
        },

        clone: function() {
            return new this.constructor(this.models, {
                model: this.model,
                Criteria: this.Criteria,
                resourceTitle: this.resourceTitle
            });
        },

        parse: function(response) {
            this.Criteria.Page.setMax(_.get(response, 'data.totalItems'));
            this.Criteria.Page.next(_.get(response, 'data.nextStartIndex'));
            var parsedResponse;
            if (response.data) {
                if (response.data.items) {
                    parsedResponse = response.data.items;
                } else {
                    parsedResponse = response.data;
                }
            } else {
                parsedResponse = response;
            }

            if (this.collectionParse) {
                parsedResponse = this.collectionParse(parsedResponse);
            }
            return parsedResponse;
        }
    });

    return ServerCollection;
});
