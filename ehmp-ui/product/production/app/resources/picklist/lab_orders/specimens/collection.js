define([], function() {
    'use strict';

    var Specimen = ADK.Resources.Picklist.Model.extend({
        idAttribute: function() {
            return this.get('ien') + ':' + this.get('name');
        }, //primary key--must be unique
        label: 'name',
        value: 'ien',
        childParse: 'false', //we don't have any complex structures, don't bother trying to parse
        defaults: {
            ien: '',
            name: ''
        }
    });

    var Specimens = ADK.Resources.Picklist.Collection.extend({
        resource: 'write-pick-list-lab-order-specimens',
        model: Specimen,
    });

    return Specimens;
});