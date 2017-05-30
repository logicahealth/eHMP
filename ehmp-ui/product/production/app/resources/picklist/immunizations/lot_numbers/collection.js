define([], function() {
    'use strict';

    var LotNumber = ADK.Resources.Picklist.Model.extend({
        idAttribute: 'lotNumber',
        label: 'lotNumber',
        value: function() {
            return this.get('lotNumber') + ';' + this.get('ien');
        },
        childParse: 'false',
        defaults: {
            lotNumber: ''
        }
    });

    var LotNumbers = ADK.Resources.Picklist.Collection.extend({
        resource: 'write-pick-list-immunization-lot',
        model: LotNumber,
        params: function(method, options) {
            return {
                filter: 'S:A'
            };
        }
    });

    return LotNumbers;
});