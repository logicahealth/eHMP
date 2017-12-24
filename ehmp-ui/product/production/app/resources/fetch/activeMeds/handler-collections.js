/* global ADK */
define([
    'backbone',
    'marionette',
    'underscore',
    'app/resources/fetch/activeMeds/model'
], function ActiveMedsCollection(Backbone, Marionette, _, MedicationModel) {
    'use strict';

    var DATE_FORMAT = 'YYYYMMDDHHmmSSsss';
    var DATE_LENGTH = DATE_FORMAT.length;

    var MedicationPageableCollection = ADK.ResourceService.PageableCollection.extend({
        model: MedicationModel,
        initialize: function initialize(models, options) {
            this.fetchOptions = _.extend({}, this.fetchOptions, options);
            _.set(this.fetchOptions, 'isClientInfinite', true);
            _.set(this.fetchOptions, 'mode', 'client');
            _.set(this.fetchOptions, 'state.pageSize', 40);

            // Block these from firing too quickly
            this.customFilter = _.debounce(this._customFilter, 600);
            this.clearFilter = _.debounce(this._clearFilter, 600);

            MedicationPageableCollection.__super__.initialize.call(this, models, this.fetchOptions);
        },
        comparator: function dateComparator(first, second) {
            first = _.padRight(first, DATE_LENGTH, '0');
            second = _.padRight(second, DATE_LENGTH, '0');

            if (first < second) {
                return 1;
            } else if (first > second) {
                return -1;
            }
            return 0;
        },
        _filterDrugClass: function(model) {
            var filterString = '';
            var products = model.get('products');
            _.each(products, function(product) {
                var drugClassName = _.get(product, 'drugClassName');
                if (drugClassName) {
                    filterString += drugClassName + ' ';
                }
            });
            return filterString;
        },
        _customFilter: function customFilter(search, filterFields) {
            if (_.isUndefined(search) || _.isUndefined(filterFields)) {
                return false;
            }

            if (_.get(this, 'fullCollection', false)) {
                return this._filter(this.fullCollection, search, filterFields);
            }

            if (_.get(this, 'originalModels', false)) {
                return this._filter(this.originalModels, search, filterFields);
            }

            return false;
        },
        _filter: function(collection, search, filterFields) {
            var filtered = collection.filter(function(model) {
                var filterString = '';
                _.each(filterFields, function drugClassFilters(filter) {
                    if (filter === 'drugClassName') {
                        filterString += this._filterDrugClass(model);
                        return;
                    }
                    var attrStr = model.get(filter);
                    if (attrStr) {
                        filterString += attrStr + ' ';
                    }
                }, this);
                return search.test(filterString);
            }, this);

            this.reset(filtered);
            return true;
        },
        _clearFilter: function clearFilter(search, filterFields) {
            if (search && filterFields) {
                return this.customFilter(search, filterFields);
            }
            this.reset(this.options.collection);
            return true;
        }
    });

    var proto = MedicationPageableCollection.prototype;

    var MedicationFullCollection = ADK.Resources.Collection.extend({
        model: MedicationModel,
        initialize: function(models, options) {
            this.fetchOptions = _.extend({}, this.fetchOptions, options);

            this.customFilter = _.debounce(this._customFilter, 600);
            this.clearFilter = _.debounce(this._clearFilter, 600);

            MedicationFullCollection.__super__.initialize.call(this, models, this.fetchOptions);
        },
        comparator: proto.comparator,
        _filterDrugClass: proto._filterDrugClass,
        _filter: proto._filter,
        _customFilter: proto._customFilter,
        _clearFilter: proto._clearFilter
    });

    return {
        MedicationPageableCollection: MedicationPageableCollection,
        MedicationFullCollection: MedicationFullCollection
    };
});