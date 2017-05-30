define([
    'backbone'
], function (Backbone) {
    'use strict';

    return Backbone.Model.extend({
        resource: 'healthsummaries-getReportContentByReportID',
        defaults: function () {
            return {
                pid: ADK.PatientRecordService.getCurrentPatient().get('icn')
            };
        },
        initialize: function (options) {
            this.url = ADK.ResourceService.buildUrl(this.resource, this.attributes);
        }
    });
});