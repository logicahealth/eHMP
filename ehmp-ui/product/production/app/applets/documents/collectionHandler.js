define([
    "backbone",
    "underscore",
    "app/applets/documents/appletHelper",
    "app/applets/documents/imaging/helpers/thumbnailHelper"
], function(Backbone, _, AppletHelper, ThumbnailHelper) {
    "use strict";

    return {
        queryCollection: function(existingCollection) {
            //noinspection JSUnresolvedFunction
            var self = this;
            var fetchOptions = {
                cache: true,
                pageable: true,
                resourceTitle: 'patient-record-document-view',
                allowAbort: true,
                viewModel: {
                    parse: function(response) {
                        if (response.thumbnails) {
                            ThumbnailHelper.convertThumbnails(response);
                        }
                        return response;
                    }
                },
                criteria:{
                    filter: 'or(' + self.buildJdsDateFilter('referenceDateTime') + ',' + self.buildJdsDateFilter('dateTime') + '),' +
                        'not(and(in(kind,["Consult","Imaging","Procedure"]),ne(statusName,"COMPLETE")))' //fill out incomplete consults, images and procedures.
                }
            };

            //noinspection JSUnresolvedVariable,JSUnresolvedFunction
            return ADK.PatientRecordService.fetchCollection(fetchOptions, existingCollection);
        }
    };
});
