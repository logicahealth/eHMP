define([
    'app/resources/fetch/document/model'
], function(Document) {
    'use strict';
    var DocumentCollection = ADK.Resources.Collection.extend({
        model: Document,
        parse: function(response) {
            return _.get(response, 'data.items') || response;
        },
        fetchOptions: {
            cache: true,
            resourceTitle: 'patient-record-document',
        },
        fetchCollection: function(options, collection) {
            var fetchOptions = _.extend({}, this.fetchOptions, options);
            return ADK.PatientRecordService.fetchCollection(fetchOptions, collection || this);
        }
    });
    var ResultsByUidCollection = DocumentCollection.extend({
        model: Document.extend({
            parse: function(response) {
                response = Document.prototype.parse.apply(this, arguments);
                if (response.authorDisplayName.toLowerCase() === 'none' && response.signerDisplayName) {
                    response.authorDisplayName = response.signerDisplayName;
                    response.providerDisplayName = response.signerDisplayName;
                }
                return response;
            }
        })
    });

    return {
        DocumentCollection: DocumentCollection,
        ResultsByUidCollection: ResultsByUidCollection
    };
});