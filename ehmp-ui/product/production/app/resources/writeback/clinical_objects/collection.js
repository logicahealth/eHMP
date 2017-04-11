define([
    'app/resources/writeback/clinical_objects/model'
], function(ClinicalObject) {
    "use strict";

    var ClinicalObjects = ADK.Resources.Writeback.Collection.extend({
        vpr: 'clinical-objects',
        model: ClinicalObject,
        parse: function(resp) {
            return _.map(resp.data.items, function(item) {
                return {data: item};
            });
        },
        params: {
            loadReference: true
        },
        methodMap: {
            read: {
                resource: 'clinical-object-find'
            }
        },
        find: function(queryParams) {
            this.fetch({
                contentType: 'application/json',
                type: 'POST',
                data: JSON.stringify(queryParams)
            });
        }
    });

    return ClinicalObjects;
});