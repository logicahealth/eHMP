define([
    'app/resources/fetch/orders/model',
    'app/resources/fetch/orders/collection',
    'app/resources/fetch/orders/allOrders',
    'app/resources/fetch/orders/enterpriseOrderables',
    'app/resources/fetch/orders/detail',
], function(Order, Orders, AllOrders, EnterpriseOrderables, Detail) {
    'use strict';

    return {
        Model: Order,
        Collection: Orders,
        AllOrders: AllOrders,
        EnterpriseOrderables: EnterpriseOrderables,
        Detail: Detail
    };
});
