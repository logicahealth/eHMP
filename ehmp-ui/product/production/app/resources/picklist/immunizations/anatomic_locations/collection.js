define([], function() {

    var AnatomicLocation = ADK.Resources.Picklist.Model.extend({
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

    var AnatomicLocations = ADK.Resources.Picklist.Collection.extend({
        type: 'immunization-admin-site',
        model: AnatomicLocation,
    });

    return AnatomicLocations;
});