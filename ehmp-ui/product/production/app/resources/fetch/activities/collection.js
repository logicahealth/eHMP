/* global ADK */
define([
    'backbone',
    'underscore',
    'app/resources/fetch/activities/model'
], function(Backbone, _, ActivitiesModel) {
    "use strict";

    var ActivitiesCollection = ADK.ResourceService.PageableCollection.extend({
        model: ActivitiesModel,
        mode: 'client',
        state: {
            pageSize: 40
        },
        setFetchOptions: function(options) {
            this.fetchOptions = {
                resourceTitle: 'activities-instances-available',
                cache: false,
                pageable: true,
                criteria: {
                    context: ADK.WorkspaceContextRepository.currentContextId,
                    mode: 'Open',
                    createdByMe: true,
                    intendedForMeAndMyTeams: true,
                    endDate: null,
                    startDate: null
                }
            };
            if (ADK.WorkspaceContextRepository.currentContextId === 'patient') {
                this.fetchOptions.criteria.pid = ADK.PatientRecordService.getCurrentPatient().get('pid');
            }
            return this.setCriteria(options.criteria);
        },
        constructor: function(options) {
            var collectionOptions = _.extend({}, options);
            _.set(collectionOptions, 'isClientInfinite', true);
            ADK.ResourceService.PageableCollection.prototype.constructor.call(this, collectionOptions);
        },
        setCriteria: function(criteria) {
            _.extend(this.fetchOptions.criteria, _.pick(criteria, ['domain', 'showOnlyFlagged', 'mode', 'createdByMe', 'intendedForMeAndMyTeams', 'endDate', 'startDate']));
        },
        parse: function(response) {
            var activities = _.get(response, 'data.items');
            if (activities) {
                return activities;
            }
            return response;
        },
        fetchCollection: function(options) {
            this.setFetchOptions(options);
            return ADK.ResourceService.fetchCollection(this.fetchOptions, this);
        }
    });

    return ActivitiesCollection;
});