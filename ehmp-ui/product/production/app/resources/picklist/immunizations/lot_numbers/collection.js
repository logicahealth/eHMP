define([], function() {

    var LotNumber = ADK.Resources.Picklist.Model.extend({
        idAttribute: 'lotNumber',
        label: 'lotNumber',
        value: function(){
            return this.get('lotNumber') + ';' + this.get('ien');
        },
        childParse: 'false',
        defaults: {
            lotNumber: ''
        }
    });

    var LotNumbers = ADK.Resources.Picklist.Collection.extend({
        type: 'immunization-lot',
        model: LotNumber,
    });

    return LotNumbers;
});