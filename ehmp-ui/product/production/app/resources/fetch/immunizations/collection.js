define([
    'underscore',
    'app/resources/fetch/immunizations/model'
], function (_, ImmunizationsModel){

    var RESOURCE = 'patient-record-immunization';

    var ImmunizationsCollection = ADK.ResourceService.PageableCollection.extend({
        resource: RESOURCE,
        vpr: 'immunizations',
        fetchType: 'GET',
        model: ImmunizationsModel,
        mode: "client",
        state: {
            pageSize: 40
        },
        parse: function(response) {
            return response.data.items;
        },
        fetchCollection: function(viewType, observedFrom, observedTo) {
            var currentPatient = ADK.PatientRecordService.getCurrentPatient();
            var fetchOptions = {
                resourceTitle: this.resource,
                fetchType: this.fetchType,
                pageable: true,
                criteria: {
                    'pid': currentPatient.get('pid')
                },
                cache: true,
                collectionConfig: {
                    comparator: function(modelOne, modelTwo) {
                        return -modelOne.get('administeredDateTime').localeCompare(modelTwo.get('administeredDateTime'))
                    }
                },
                viewType: viewType
            };

            _.set(fetchOptions, 'criteria.observedFrom', observedFrom);
            _.set(fetchOptions, 'criteria.observedTo', observedTo);
            _.set(fetchOptions, 'patient', currentPatient);

            return ADK.ResourceService.fetchCollection(fetchOptions, this);
        }
    });

    return ImmunizationsCollection;
});