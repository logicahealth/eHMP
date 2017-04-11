define([
    'app/resources/fetch/allergies/model'
], function(AllergyModel) {
    'use strict';

    var RESOURCE = 'patient-record-allergy';

    var Allergies = ADK.Resources.Collection.extend({
        resource: RESOURCE,
        vpr: 'allergies',
        model: AllergyModel,
        parse: function(resp) {
            var allergies = _.get(resp, 'data.items');

            if (allergies) {
                return allergies;
            }

            return resp;
        },
        getFetchOptions: function(options) {
            var fetchOptions = {
                resourceTitle: RESOURCE
            };

            if (options.includeCollectionConfig) {
                fetchOptions.collectionConfig = {
                    comparator: function(a, b) {
                        var acuityNameA = a.get('acuityName') || '';
                        var acuityNameB = b.get('acuityName') || '';

                        var compared = acuityNameB.localeCompare(acuityNameA);
                        if (compared !== 0) {
                            return compared;
                        }

                        var enteredA = a.get('entered') || '';
                        var enteredB = b.get('entered') || '';
                        return enteredB.localeCompare(enteredA);
                    }
                };
            }

            fetchOptions.pageable = Boolean(options.isPageable);

            if (options.criteria) {
                fetchOptions.criteria = options.criteria;
            } else {
                fetchOptions.criteria = {
                    filter: 'ne(removed, true)'
                };
            }

            if (options.onSuccess) {
                fetchOptions.onSuccess = options.onSuccess;
            }

            return fetchOptions;
        },
        fetchCollection: function(options) {
            var fetchOptions = this.getFetchOptions(options);

            return ADK.PatientRecordService.fetchCollection(fetchOptions, this);
        }
    });

    return Allergies;
});