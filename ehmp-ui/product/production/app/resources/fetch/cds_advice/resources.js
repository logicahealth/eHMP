define([
    'app/resources/fetch/cds_advice/list/model',
    'app/resources/fetch/cds_advice/list/collection',
    'app/resources/fetch/cds_advice/detail/model'
], function(CdsAdviceModel, CdsAdviceCollection, CdsAdviceDetail) {
    'use strict';

    return {
        List: CdsAdviceCollection,
        ListItem: CdsAdviceModel,
        Detail: CdsAdviceDetail
    };
});
