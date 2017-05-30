define([
    'app/resources/fetch/timeline/model'
], function (TimelineModel) {
    'use strict';

    var TimelineCollection = ADK.Resources.Collection.extend({
        model: TimelineModel,
        fetchOptions: {
            cache: true,
            resourceTitle: 'patient-record-timeline',
            allowAbort: true
        },
        fetchCollection: function (criteria) {
            this.fetchOptions.criteria = criteria;
            return ADK.PatientRecordService.fetchCollection(this.fetchOptions, this);
        }
    });

    var _proto = TimelineCollection.prototype;
    var TimelinePageableCollection = ADK.ResourceService.PageableCollection.extend({
        model: _proto.model,
        fetchOptions: _proto.fetchOptions,
        state: {
            pageSize: 40
        },
        mode: 'client',
        initialize: function () {
            this.fetchOptions.pageable = true;
        },
        fetchCollection: _proto.fetchCollection
    });

    return {
        Collection: TimelineCollection,
        PageableCollection: TimelinePageableCollection
    };
});
