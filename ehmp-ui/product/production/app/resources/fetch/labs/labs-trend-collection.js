/* global ADK */
define([
    'underscore',
    'app/resources/fetch/labs/labs-trend-model'
], function(_, LabsModel) {
   'use strict';

    //noinspection UnnecessaryLocalVariableJS
    var Collection = ADK.ResourceService.PageableCollection.extend({
        model: LabsModel,
        mode: 'client',
        state: {
            pageSize: 40
        },
        fetchOptions: {
            resourceTitle: 'patient-record-lab',
            pageable: true,
            cache: true,
            allowAbort: true
        },
        constructor: function (models, options) {
            var _options = _.extend({}, options, {isClientInfinite: true});
            Collection.__super__.constructor.call(this, _options);
            if (models) {
                this.set(models, _options);
            }
        },
        fetchCollection: function(options) {
            var fetchOptions = _.extend({}, this.fetchOptions, options);
            return ADK.PatientRecordService.fetchCollection(fetchOptions, this);
        },
        parse: function(response) {
            if(_.has(response, 'data.items')) {
                response = _.get(response, 'data.items');
            } else if (_.has(response, 'data')) {
                response = _.get(response, 'data');
            }

            var types = {};
            _.each(response, function(val) {
                if (_.get(val, 'kind') === 'Laboratory') {
                    var key = this._getGroupKey(val);
                    if (!_.has(types, key)) {
                        types[key] = [];
                    }
                    types[key].push(val);
                }
            }, this);

            var data = _.map(types, this._prepareData, this);
            return _.sortBy(data, this._getSortValue);
        },
        _getGroupKey: function getGroupKey(responseItem) {
            if (_.get(responseItem, 'facilityCode') === 'DOD') {
                return _.get(responseItem, 'codes[0].code');
            }
            return _.get(responseItem, 'typeName') + _.get(responseItem, 'specimen');
        },
        _getSortValue: function getSortValue(item) {
            var compareTo = _.get(item, 'observed') || _.get(item, 'resulted') || -1;
            return -_.padRight(compareTo, 12, '0');
        },
        _prepareData: function perpareData(modelGroup) {
            var sortedGroup = _.sortBy(modelGroup, this._getSortValue);
            var mostRecentModel = sortedGroup.shift();

            mostRecentModel.oldValues = sortedGroup.slice(0, 5);
            mostRecentModel.previousResult = _.get(sortedGroup, '[0].result');
            mostRecentModel.previousInterpretationCode = _.get(sortedGroup, '[0].interpretationCode');

            return mostRecentModel;
        }
    });

    return Collection;
});