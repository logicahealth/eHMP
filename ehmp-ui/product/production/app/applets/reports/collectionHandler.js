define([
    "backbone",
    "underscore",
    "app/applets/documents/appletHelper"
], function (Backbone, _, appletHelper) {
    "use strict";
    var DATE_FORMAT = 'YYYYMMDDHHmmSS';
    var DATE_LENGTH = DATE_FORMAT.length;
    var ZERO_FILL = DATE_FORMAT.replace(/./g, '0');

    return {
        queryCollection: function (existingCollection) {
            var self = this;
            var fetchOptions = {
                cache: true,
                pageable: true,
                allowAbort: true,
                resourceTitle: 'patient-record-document-view',
                criteria: {
                    filter: 'or(' + self.buildJdsDateFilter('referenceDateTime') + ',' + self.buildJdsDateFilter('dateTime') + '),' +
                        'not(and(in(kind,["Consult","Imaging","Procedure"]),ne(statusName,"COMPLETE"))),' + //fill out incomplete consults, images and procedures.
                        'in(kind,["Consult","Imaging","Procedure","Radiology","Laboratory Report","Laboratory Result","Surgery"])'
                }
            };

            return ADK.PatientRecordService.fetchCollection(fetchOptions, existingCollection);
        }
    };
});
