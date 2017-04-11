define([], function() {

    var NewPerson = ADK.Resources.Picklist.Model.extend({
        idAttribute: 'code',
        label: 'name',
        value: function(){
            return this.get('code') + ';' + this.get('name');
        },
        childParse: 'false',
        defaults: {
            code: '',
            name: ''
        }
    });

    var NewPersons = ADK.Resources.Picklist.Collection.extend({
        type: 'new-persons',
        model: NewPerson,
    });

    return NewPersons;
});