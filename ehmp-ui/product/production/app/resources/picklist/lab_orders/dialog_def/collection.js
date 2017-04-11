define([], function() {

    var OrderDef = ADK.Resources.Picklist.Model.extend({
        idAttribute: 'ien', //primary key--can't have duplicates
        label: 'name',
        //since value isn't defined, the model's cid will automatically
        //be added to the attributes and made the value so that a unique lookup exists
        value: 'code',
        childParse: true
    });

    var OrderDefGroup = ADK.Resources.Picklist.Group.extend({
        idAttribute: 'source', //primary key, might be useful to omit in some cases
        groupLabel: 'categoryName', //attribute that will be the group
        //picklist is the attribute that will be parsed into a Collection
        //and will be set as the picklist attribute in grouped lists
        picklist: ['values', 'default'],
        Collection: ADK.Resources.Picklist.Collection.extend({
            model: OrderDef
        }),
        defaults: { //remember to include every field
            values: ['name', 'code'] //this will be parsed into a Collection
        }
    });

    var orderDef = ADK.Resources.Picklist.Collection.extend({
        type: 'lab-order-dialog-def',
        model: OrderDefGroup,
        params: function(method, options) {
            return { //allergies.fetch({'searchString': 'ABC'})
                site: ADK.UserService.getUserSession().get('site'),
                 location: options.location
            };
        }
    });

    return orderDef;
});