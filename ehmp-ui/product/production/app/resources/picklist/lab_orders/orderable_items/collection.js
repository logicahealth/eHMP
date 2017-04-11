define([], function() {

    var OrderableItem = ADK.Resources.Picklist.Model.extend({
        label: 'synonym',
        value: 'ien'
    });

    var OrderableItems = ADK.Resources.Picklist.Collection.extend({
        type: 'lab-order-orderable-items',
        model: OrderableItem,
        params: function(method, options) {
            return {
                labType: 'S.LAB',
                site: ADK.UserService.getUserSession().get('site')
            };
        }
    });

    return OrderableItems;
});