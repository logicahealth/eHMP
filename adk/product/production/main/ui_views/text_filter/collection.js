define([
    'underscore'
], function(_) {
    "use strict";
    var FilterItem = Backbone.Model.extend({
        defaults: {
            text: '',
            shouldShow: true,
            removable: true
        },
        idAttribute: "text"
    });
    var FilterCollection = Backbone.Collection.extend({
        model: FilterItem,
        parse: function(response) {
            var items = _.isArray(response) ? response : [response];
            var responseArray = [];
            _.each(items, function(filterObject) {
                var newFilterText = _.get(filterObject, 'text');
                var filterArray = _.isEmpty(newFilterText) ? [] : newFilterText.trim().replace(/\s+/g, ' ').split(' ');
                responseArray.push.apply(responseArray, _.map(filterArray, function(filterText) {
                    return _.extend({}, filterObject, {
                        text: filterText
                    });
                }, this));
            }, this);
            return responseArray;
        },
        getCombinedFilterString: function(conditionObject) {
            return _.reduce(this.where(conditionObject || {}), function(combinedString, model) {
                if (!_.isString(model.get('text'))) return combinedString;
                if (combinedString) {
                    return combinedString + ' ' + model.get('text');
                }
                return model.get('text');
            }, '');
        },
        add: function(models, options) {
            options = _.extend({ parse: true }, options);
            return Backbone.Collection.prototype.add.apply(this, [models, options]);
        },
        set: function(models, options) {
            options = _.extend({ parse: true }, options);
            return Backbone.Collection.prototype.set.apply(this, [models, options]);
        }
    });

    return FilterCollection;
});
