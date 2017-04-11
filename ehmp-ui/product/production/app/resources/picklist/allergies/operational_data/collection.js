define([], function() {

    var OperationalDatum = ADK.Resources.Picklist.Model.extend({
        idAttribute: 'ien',
        childParse: 'false',
        label: 'name',
        defaults: {
            ien: '',
            name: ''
        }
    });

    var OperationalData = ADK.Resources.Picklist.Collection.extend({
        resource: 'write-pick-list-allergies-symptoms-all-with-top-ten',
        model: OperationalDatum
    });

    return OperationalData;
});