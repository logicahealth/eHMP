define([], function() {

    var Specimen = ADK.Resources.Picklist.Model.extend({
        idAttribute: 'ien', //primary key--must be unique
        label: 'name',
        value: 'ien',
        childParse: 'false', //we don't have any complex structures, don't bother trying to parse
        defaults: {
            ien: '',
            name: ''
        }
    });

    var Specimens = ADK.Resources.Picklist.Collection.extend({
        type: 'lab-order-specimens',
        model: Specimen,
    });

    return Specimens;
});