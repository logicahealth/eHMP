define([
    'app/resources/fetch/orders/model',
    'app/resources/fetch/orders/collection',
    'app/resources/fetch/orders/allOrders',
    'app/resources/fetch/orders/enterpriseOrderables'
], function(Order, Orders, AllOrders, EnterpriseOrderables) {
    'use strict';

    return {
        Model: Order,
        Collection: Orders,
        AllOrders: AllOrders,
        EnterpriseOrderables: EnterpriseOrderables
    };
});
