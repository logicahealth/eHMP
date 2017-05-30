define([
    'app/resources/fetch/document/complex_note/model'
], function(Note) {
    'use strict';
    var Collection = ADK.Resources.Collection.extend({
        model: Note,
        parse: function(response) {
            return _.get(response, 'data') || response;
        },
        fetchOptions: {
            cache: true,
            resourceTitle: 'patient-record-complexnote-html'
        },
        fetchCollection: function(options, collection) {
            var fetchOptions = _.extend({}, this.fetchOptions, options);
            return ADK.PatientRecordService.fetchCollection(fetchOptions, collection || this);
        }
    });

    return {
        Collection: Collection
    };
});