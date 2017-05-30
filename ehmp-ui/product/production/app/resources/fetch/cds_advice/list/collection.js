define([
    'app/resources/fetch/cds_advice/list/model'
], function (CdsAdviceModel) {
    'use strict';

    return ADK.ResourceService.PageableCollection.extend({
        model: CdsAdviceModel,
        state: {
            pageSize: 40
        },
        mode: 'client',
        fetchOptions: {
            pageable: true,
            resourceTitle: 'cds-advice-list',
            cache: true
        },
        fetchCollection: function (criteria) {
            this.fetchOptions.criteria = criteria;
            return ADK.PatientRecordService.fetchCollection(this.fetchOptions, this);
        }
    });
});