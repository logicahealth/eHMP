define([], function() {
    var OrderModel = ADK.Resources.Writeback.Model.extend({
        resource: 'orders-detail',
        vpr: 'orders',
        idAttribute: 'uid',
        parse: function(resp, options) {
            return {
                detail: _.get(resp, 'data.data', 'Unable to retrieve detail summary')
            };
        },
        getUrl: function(method, options) {
            var params = {
                pid: this.patient.get('pid'),
                resourceId: this.get('orderId')
            };

            var url = ADK.ResourceService.buildUrl('orders-detail', {
                dfn: this.patient.get('localId')
            });
            return ADK.ResourceService.replaceURLRouteParams(unescape(url), params);
        },
        execute: function() {
            var attributes = {
                contentType: "application/json"
            };

            this.fetch(attributes);
        }
    });

    return OrderModel;
});