define([], function() {

    var RouteOfAdministration = ADK.Resources.Picklist.Model.extend({
        idAttribute: 'ien',
        label: 'name',
        value: function(){
            return this.get('name') + ';' + this.get('hl7Code') + ';' + this.get('ien');
        },
        childParse: 'false',
        defaults: {
            ien: '',
            name: ''
        }
    });

    var RoutesOfAdministration = ADK.Resources.Picklist.Collection.extend({
        type: 'immunization-admin-route',
        model: RouteOfAdministration,
    });

    return RoutesOfAdministration;
});