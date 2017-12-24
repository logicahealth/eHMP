define([], function() {
    'use strict';
    var OrderDetail = ADK.Resources.Model.extend({
        resource: 'order-detail',
        idAttribute: 'uid',
        parse: function(resp, options) {
            var detail = _.get(resp, 'data.data', 'Unable to retrieve detail summary');
            return {
                detail: detail,
                detailSummary: detail
            };
        },
        execute: function() {
            var options = {
                contentType: 'application/json',
                data: {
                    pid: ADK.PatientRecordService.getCurrentPatient().getIdentifier()
                }
            };
            if (ADK.PatientRecordService.getCurrentPatient().get('acknowledged')) {
                options.data._ack = true;
            }
            this.methodMap = {
                read: {
                    parameters: {
                        uid: this.get('uid')
                    }
                }
            };
            this.fetch(options);
        }
    });

    return OrderDetail;
});