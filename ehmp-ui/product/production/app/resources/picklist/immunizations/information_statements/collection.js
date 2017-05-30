define([], function() {
    'use strict';

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
        resource: 'write-pick-list-immunization-vaccine-info-statement',
        model: InformationStatement
    });

    return InformationStatements;
});