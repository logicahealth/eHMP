define([
    "backbone",
    "underscore",
    "app/applets/documents/appletHelper"
], function(Backbone, _, AppletHelper) {
    "use strict";

    var DATE_FORMAT = 'YYYYMMDDHHmmSSsss';
    var DATE_LENGTH = DATE_FORMAT.length;
    var ZERO_FILL = DATE_FORMAT.replace(/./g, '0');

    return {
        queryCollection: function(context, existingCollection) {
            //noinspection JSUnresolvedFunction
            var fetchOptions = {
                cache: true,
                pageable: true,
                collectionConfig: {
                    comparator: function(model) {
                        var dateTime = model.get('referenceDateTime');

                        if (dateTime.length !== DATE_LENGTH) {
                            dateTime = String(dateTime + ZERO_FILL).substr(0, DATE_LENGTH);
                        }
                        return -dateTime;
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
                            AppletHelper.getResultsFromUid(model, function(additionalDetailCollection){
                                model.set('authorDisplayName', additionalDetailCollection.models[0].get('signerDisplayName'));
                            });
                        }
                    });
                },
                criteria:{
                    filter: 'or(' + context.buildJdsDateFilter('referenceDateTime') + ',' + context.buildJdsDateFilter('dateTime') + '),' +
                        'not(and(in(kind,["Consult","Imaging","Procedure"]),ne(statusName,"COMPLETE")))' //fill out incomplete consults, images and procedures.
                }
            };

            //noinspection JSUnresolvedVariable,JSUnresolvedFunction
            return ADK.PatientRecordService.fetchCollection(fetchOptions, existingCollection);
        }
    };

});
