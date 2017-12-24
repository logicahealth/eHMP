define(['underscore', 'jquery', 'backbone'], function(_, $, Backbone) {
    'use strict';

    var ATTRIBUTE_MAP = {
        'data-appletid': 'id',
        'data-instanceid': 'region',
        'data-row': 'dataRow',
        'data-col': 'dataCol',
        'data-sizex': 'dataSizeX',
        'data-sizey': 'dataSizeY',
        'data-min-sizex': 'dataMinSizeX',
        'data-min-sizey': 'dataMinSizeY',
        'data-max-sizex': 'dataMaxSizeX',
        'data-max-sizey': 'dataMaxSizeY',
        'data-view-type': 'viewType',
        'data-filter-name': 'filterName'
    };
    Object.freeze(ATTRIBUTE_MAP);

    var DEFAULT_ID_ATTRIBUTE = 'instanceId';

    var Model = Backbone.Model.extend({
        idAttribute: DEFAULT_ID_ATTRIBUTE,
        initialize: function() {
            if (_.isUndefined(this.get(DEFAULT_ID_ATTRIBUTE))) {
                this.idAttribute = 'id';
            }
        },
        setFromElement: function($element) {
            var data = this._extractGridsterData($element);
            this.set(data);
        },
        _extractGridsterData: function(element) {
            if (element instanceof $) {
                element = element[0];
            }
            var data = {};
            _.each(element.attributes, function(attribute) {
                var elementKey = attribute.name;
                var objectKey = _.get(ATTRIBUTE_MAP, elementKey, false);
                if (objectKey) {
                    data[objectKey] = attribute.value;
                }
            });
            if (data.region) {
                data.instanceId = data.region;
            }
            return data;
        }
    });

    return Backbone.Collection.extend({
        model: Model
    });
});