define([], function() {
    var order = ADK.Resources.Writeback.Model.extend({
        resource: 'orders-lab-create',
        vpr: 'orders',
        childParse: false,
        parse: function(resp, options) {
            //[Edison]: rdk returns resp.data.data when there's order check
            var respData = resp.data.data || resp.data;
            var labOrders = [JSON.parse(respData)];
            if (!labOrders[0].orderCheckList) {
                return {
                    orderCheckList: [],
                    orderCheckOriginalList: []
                };
            }

            var orderCheck = labOrders[0].orderCheckList;
            var orderCheckList = _.map(labOrders, function(v, i) {
                var size = v.orderCheckList.length;
                return _.map(v.orderCheckList, function(v, i) {
                    return {
                        orderCheck: '(' + (i + 1) + ' of ' + size + ') ' + (v.orderCheck.split('^')[3])
                    };
                });
            });

            return {
                orderCheckList: orderCheckList[0],
                orderCheckOriginalList: labOrders[0].orderCheckList
            };
        },
        methodMap: {
            'create': {
                resource: 'orders-lab-create',
                parameters: {
                    'pid': 'pid'
                }
            }
        }
    });

    return order;
});