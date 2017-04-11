define([], function() {

    var InformationStatement = ADK.Resources.Picklist.Model.extend({
        idAttribute: 'record',
        label: 'name',
        value: 'ien',
        childParse: 'false',
        defaults: {
            ien: '',
            name: ''
        }
    });

    var InformationStatements = ADK.Resources.Picklist.Collection.extend({
        type: 'immunization-vaccine-info-statement',
        model: InformationStatement,
    });

    return InformationStatements;
});