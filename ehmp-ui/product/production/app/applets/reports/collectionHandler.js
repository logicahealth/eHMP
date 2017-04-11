define([
    "backbone",
    "underscore",
    "app/applets/documents/appletHelper"
], function(Backbone, _, AppletHelper) {
    "use strict";

    var DATE_FORMAT = 'YYYYMMDDHHmmSS';
    var DATE_LENGTH = DATE_FORMAT.length;
    var ZERO_FILL = DATE_FORMAT.replace(/./g, '0');

    return  {
        queryCollection: function(obj, existingCollection) {
            var fetchOptions = {
                cache: true,
                pageable: false,
                collectionConfig: {
                    comparator: function(model) {
                        var dateTime = model.get('referenceDateTime').substr(0, 14);
                        // Pad the end of the string with zeros
                        if (dateTime !== DATE_LENGTH) {
                            dateTime = String(dateTime + ZERO_FILL).substr(0, DATE_LENGTH);
                        }
                        return - dateTime;
                    }
                },
                resourceTitle: 'patient-record-document-view',
                viewModel: {
                    parse: function(response) {
                        return AppletHelper.parseDocResponse(response);
                    }
                },
                onSuccess: function(collection) {
                    collection.each(function(model){
                        var complexDocBool = model.get('complexDoc');
                        if (complexDocBool && model.get('authorDisplayName').toLowerCase() === 'none') {
                            var additionalDetail = AppletHelper.getResultsFromUid(model, function(additionalDetailCollection){
                                model.set('authorDisplayName', additionalDetailCollection.models[0].get('signerDisplayName'));
                            });
                        }
                    });
                },
                onError: function(collection, response) {
                     console.log("REPORTS------->>> fetch error");
                },
                criteria: {
                    filter: 'or(' + obj.buildJdsDateFilter('referenceDateTime') + ',' + obj.buildJdsDateFilter('dateTime') + '),' +
                        'not(and(in(kind,["Consult","Imaging","Procedure"]),ne(statusName,"COMPLETE"))),' + //fill out incomplete consults, images and procedures.
                        'in(kind,["Consult","Imaging","Procedure","Radiology","Laboratory Report","Laboratory Result","Surgery"])'
                }
            };

            return ADK.PatientRecordService.fetchCollection(fetchOptions, existingCollection);
        }
    };
});
