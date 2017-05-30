/* global ADK */
define([
    'underscore',
    'backbone',
    'app/resources/fetch/narrative_labs/model'
], function (_, Backbone, Model) {
    "use strict";

    var DATE_LENGTH = 'YYYYMMDDHHmmss'.length;

    var Collection = ADK.ResourceService.PageableCollection.extend({
        model: Model,
        filter: 'ne(categoryCode , "urn:va:lab-category:CH")',
        fetchOptions: {
            resourceTitle: 'patient-record-labsbypanel',
            pageable: true,
            cache: true,
            allowAbort: true,
            type: 'GET'
        },
        initialize: function (models, options) {
            this.options = options || {};
            _.set(this.options, 'isClientInfinite', true);
            _.set(this.options, 'mode', 'client');
            _.set(this.options, 'state.pageSize', 40);

            if (_.isString(this.options.resourceTitle)) {
                this.resourceTitle = this.options.resourceTitle;
            }
            this.listenTo(this, 'sync', function () {
                delete this.xhr;
            });
            Collection.__super__.initialize.call(this, models, this.options);
        },
        parse: function parse(response) {
            var data = _.get(response, 'data.items');
            return Collection.__super__.parse.call(this, data);
        },
        comparator: function comparator(model) {
            var orderDateStr = model.get('observed') || model.get('resulted');
            if (!_.isString(orderDateStr) || isNaN(orderDateStr)) {
                return 0;
            }
            return -(_.padRight(orderDateStr, DATE_LENGTH, '0').slice(0, DATE_LENGTH));
        },
        fetchCollection: function (options) {
            var fetchOptions = _.extend({}, this.fetchOptions, options);
            return ADK.PatientRecordService.fetchCollection(fetchOptions, this);
        }
    });

    return Collection;
});
