define([], function () {
    'use strict';


    var NewPerson = ADK.Resources.Picklist.Model.extend({
        idAttribute: 'code',
        label: 'name',
        value: function () {
            return this.get('code') + ';' + this.get('name');
        },
        childParse: 'false',
        defaults: {
            code: '',
            name: ''
        }
    });

    var NewPersons = ADK.Resources.Picklist.Collection.extend({
        model: NewPerson,
        resource: 'write-pick-list-new-persons-direct',
        params: function (method, options) {
            return {
                date: options.date || '',
                newPersonsType: options.newPersonsType || ''
            };
        }
    });

    return NewPersons;
});