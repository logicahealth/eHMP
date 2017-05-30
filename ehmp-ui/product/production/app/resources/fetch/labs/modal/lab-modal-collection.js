/* global ADK */
define([
    'underscore',
    'app/resources/fetch/labs/modal/lab-modal-model'
], function  (_, Model){
    'use strict';

    var Collection = ADK.ResourceService.PageableCollection.extend({
        model: Model,
        mode: 'client',
        state: {
            pageSize: 40
        },
        fetchOptions: {
            resourceTitle: 'patient-record-lab',
            pageable: true,
            cache: false
        },
        constructor: function constructor(models, options) {
            var _options = _.extend({}, options, {isClientInfinite: true});
            Collection.__super__.constructor.call(this, _options);
            if (models) {
                this.set(models, options);
            }
        },
        fetchCollection: function fetchCollection(options) {
            var _options = _.merge({}, this.fetchOptions, options);
            return ADK.PatientRecordService.fetchCollection(_options, this);
        },
        parse: function parse(response) {
            if (_.has(response, 'data.items')) {
                return _.get(response, 'data.items');
            }
            if (_.has(response, 'data')) {
                return _.get(response, 'data');
            }
            return response;
        }
    });

    return Collection;
});