define([
    'app/applets/orders/util'
], function(Util) {
    'use strict';
    var OrderDetail = ADK.Resources.Writeback.Model.extend({
        resource: 'orders-lab-detail',
        vpr: 'orders',
        idAttribute: 'uid',
        parse: function(resp, options) {
            return {
                detail: _.get(resp, 'data.data', 'Unable to retrieve detail summary'),
                detailSummary: _.get(resp, 'data.data', 'Unable to retrieve detail summary')
            };
        },
        getUrl: function(method, options) {
            var params = {
                pid: this.patient.get('pid'),
                resourceId: this.get('orderId') || Util.getFieldFromUid(this.get('uid'), 'orderId')
            };

            var url = ADK.ResourceService.buildUrl('orders-lab-detail', {
                dfn: this.patient.get('localId'),
                site: Util.getFieldFromUid(this.get('uid'), 'siteCode')
            });

            if (ADK.PatientRecordService.getCurrentPatient().get('acknowledged')) {
                url = url + '&_ack=true';
            }

            return ADK.ResourceService.replaceURLRouteParams(unescape(url), params);
        },
        execute: function() {
            var attributes = {
                contentType: "application/json"
            };

            this.fetch(attributes);
        }
    });

    return OrderDetail;
});