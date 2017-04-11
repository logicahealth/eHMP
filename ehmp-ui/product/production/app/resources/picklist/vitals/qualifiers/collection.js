define([], function() {

    var Qualifier = ADK.Resources.Picklist.Model.extend({
        idAttribute: 'ien',
        label: 'name',
        value: 'ien',
        childParse: 'false',
        defaults: {
            ien: '',
            name: ''
        }
    });

    var Qualifiers = ADK.Resources.Picklist.Collection.extend({
        type: 'vitals',
        model: Qualifier
    });

    return Qualifiers;
});