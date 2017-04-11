define([], function() {

    var ImmunizationType = ADK.Resources.Picklist.Model.extend({
        idAttribute: 'ien',
        label: 'name',
        value: 'ien',
        childParse: 'false',
        defaults: {
            ien: '',
            name: '',
            shortName: '',
            cvxCode: '',
            maxInSeries: '',
            inactiveFlag: '',
            vaccineGroup: '',
            mnemonic: '',
            acronym: '',
            selectableHistoric: '',
            cdcFullVaccineName: '',
            codingSystem: '',
            vaccineInfoStmt: '',
            cdcProductName: '',
            synonym: ''
        }
    });

    var Data = ADK.Resources.Picklist.Collection.extend({
        type: 'immunization-data',
        model: ImmunizationType,
    });

    return Data;
});