define([
    'app/resources/fetch/document/model',
    'app/resources/fetch/document/parser'
], function(Document, Parser) {
    'use strict';
    var fetchOptions = {
        cache: true,
        allowAbort: true,
        resourceTitle: 'patient-record-document-view'
    };

    var DocumentCollection = ADK.Resources.Collection.extend({
        model: Document,
        parse: function(response) {
            return _.get(response, 'data.items') || response;
        },
        fetchOptions: fetchOptions,
        fetchCollection: function(options, collection) {
            var fetchOptions = _.extend({}, this.fetchOptions, options);
            return ADK.PatientRecordService.fetchCollection(fetchOptions, collection || this);
        }
    });

    var DocumentPageableCollection = ADK.ResourceService.PageableCollection.extend({
        model: Document,
        fetchOptions: fetchOptions,
        state: {
            pageSize: 40
        },
        mode: 'client',
        initialize: function() {
            this.fetchOptions.pageable = true;
        },
        fetchCollection: function(options, collection) {
            var fetchOptions = _.extend({}, this.fetchOptions, options);
            return ADK.PatientRecordService.fetchCollection(fetchOptions, collection || this);
        }
    });

    var DocumentGroupCollection = ADK.Collections.GroupingCollection.extend({
        parse: function(resp) {
            _.each(_.get(resp, 'data.items'), Parser);
            return ADK.Collections.GroupingCollection.prototype.parse.apply(this, arguments);
        }
    });

    return {
        PageableCollection: DocumentPageableCollection,
        Collection: DocumentCollection,
        GroupCollection: DocumentGroupCollection
    };
});