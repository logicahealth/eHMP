define([], function() {

    var InformationSource = ADK.Resources.Picklist.Model.extend({
        idAttribute: 'ien',
        label: 'name',
        value: function(){
            return this.get('hl7Code') + ';' + this.get('ien');
        },
        childParse: 'false',
        defaults: {
            ien: '',
            name: ''
        }
    });

    var InformationSources = ADK.Resources.Picklist.Collection.extend({
        type: 'immunization-info-source',
        model: InformationSource,
    });

    return InformationSources;
});