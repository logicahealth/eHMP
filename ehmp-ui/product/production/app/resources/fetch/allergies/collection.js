define([
    'underscore',
    'app/resources/fetch/allergies/model'
], function(_, AllergyModel) {
    'use strict';

    var RESOURCE = 'patient-record-allergy';

    var Allergies = ADK.ResourceService.PageableCollection.extend({
        resource: RESOURCE,
        vpr: 'allergies',
        model: AllergyModel,
        mode: 'client',
        state: {
            pageSize: 40
        },
        constructor: function(models, options) {
            var _options = _.extend({}, options, {
                isClientInfinite: true
            });
            Allergies.__super__.constructor.call(this, _options);
            if (models) {
                this.set(models, _options);
            }
        },
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

            if (options.criteria) {
                fetchOptions.criteria = options.criteria;
            }

            if (options.onSuccess) {
                fetchOptions.onSuccess = options.onSuccess;
            }

            return fetchOptions;
        },
        fetchCollection: function(options) {
            var fetchOptions = this.getFetchOptions(options);
            this.isClientInfinite = Boolean(options.isPageable);

            return ADK.PatientRecordService.fetchCollection(fetchOptions, this);
        }
    });

    return Allergies;
});