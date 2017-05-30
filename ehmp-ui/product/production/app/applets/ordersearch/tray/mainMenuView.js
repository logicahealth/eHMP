define([
    'underscore',
    'backbone',
    'handlebars',
    'app/applets/ordersearch/tray/groupView',
    'app/applets/orders/tray/labs/trayUtils',
    'app/applets/orders/tray/requests/requestTrayUtils',
    'app/applets/orders/tray/consults/orderEntryUtils'
], function(_, Backbone, Handlebars, GroupView, LabOrderTrayUtils, RequestTrayUtils, OrderEntryTrayUtils) {
    'use strict';

    var consultOrders = {
        id: 'consult',
        name: 'Consult Order',
        icon: 'fa-user-md',
        onClick: OrderEntryTrayUtils.launchOrderEntryForm
    };
    var labOrders = {
        id: 'lab',
        name: 'Lab Order',
        icon: 'fa-flask',
        onClick: LabOrderTrayUtils.launchLabForm
    };

    var activitiesGroup = [{
        id: 'request',
        name: 'Request',
        icon: 'fa-list-alt',
        onClick: RequestTrayUtils.launchRequestForm
    }];

    var MenuView = GroupView.extend({
        initialize: function(options) {
            var permissions = new ADK.UIResources.Fetch.Permission.Collection();
            this.collection = new Backbone.Collection();

            var ordersGroup = [];
            if (permissions.hasOrderPermissions('add-consult-order')) {
                ordersGroup.push(consultOrders);
            }
            if (permissions.hasLabPermissions('add-lab-order')) {
                ordersGroup.push(labOrders);
            }

            if (ordersGroup.length) {
                this.collection.add({
                    name: 'Orders',
                    items: new Backbone.Collection(ordersGroup)
                });
            }
            if (permissions.hasRequestPermissions('add-coordination-request')) {
                this.collection.add({
                    name: 'Activities',
                    items: new Backbone.Collection(activitiesGroup)
                });
            }
            this.searchCriteriaModel = options.searchCriteriaModel;
        },
        options: {
            onClick: function(model) {
                var onClickHandler = model.get('onClick');
                if (_.isFunction(onClickHandler)) {
                    onClickHandler.call();
                }
            },
            attributeMapping: {
                groupLabel: 'name',
                groupItems: 'items',
                itemUniqueId: 'id',
                itemLabel: 'name'
            }
        }
    });
    return MenuView;
});
