define([
    "backbone",
    "underscore",
    "app/applets/documents/appletHelper"
], function(Backbone, _, AppletHelper) {
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
