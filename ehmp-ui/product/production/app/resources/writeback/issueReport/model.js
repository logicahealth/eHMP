define([
    'underscore',
    'backbone'
], function(
    _,
    Backbone
) {
    'use strict';

    var IssueModel = ADK.Models.BaseModel.extend({
        defaults: {
            comment: '',
            _caughtIncidents: []
        },
        initialize: function(attributes, options) {
            var incidentData = {};
            if (this._onPatientScreen()) {
                var patient = ADK.PatientRecordService.getCurrentPatient();
                incidentData.pid = patient.get('pid');
                incidentData.icn = patient.get('icn');
                var simpleSyncStatus = ADK.Messaging.getChannel('patient_sync_status').request('get:simple:sync:status');
                if (simpleSyncStatus) incidentData.simpleSyncStatus = simpleSyncStatus;
            }
            var errorCollection = _.get(ADK, 'Errors.collection', []);
            this.set(_.extend({
                tracker: ADK.UserTracker.gatherInformation(),
                incidents: errorCollection,
                _caughtIncidents: this._getCaughtIncidents(errorCollection)
            }, incidentData));
            this.listenTo(errorCollection, 'update reset', function(collection) {
                this.set('_caughtIncidents', this._getCaughtIncidents(collection));
            });
        },
        _getCaughtIncidents: function(collection) {
            var jsonCollection = _.result(collection, 'toJSON', []);
            var caughtIncidents = _.reject(jsonCollection, { _type: 'uncaught' });
            if (_.find(jsonCollection, { _type: 'uncaught' })) {
                caughtIncidents.push({ message: 'An issue was detected that might be causing the page to display or function improperly.' });
            }
            return caughtIncidents;
        },
        _onPatientScreen: function() {
            return ADK.WorkspaceContextRepository.currentWorkspaceAndContext.get('context') === 'patient';
        },
        fetchOptions: function() {
            return {
                resourceTitle: 'incident-report'
            };
        },
        toJSON: function(options) {
            var attributes = this.attributes;
            if (_.get(options, 'omitPrivateAttributes')) {
                attributes = _.omit(attributes, function(value, key) {
                    return _.startsWith(key, '_');
                });
            }
            return _.transform(attributes, function(result, value, key) {
                result[key] = _.isFunction(_.get(value, 'toJSON')) ? value.toJSON.call(value, options) : value;
            });
        },
        validate: function(attributes, options) {
            this.errorModel.clear();
            if (_.isEmpty(_.get(attributes, '_caughtIncidents')) && _.isEmpty(_.get(attributes, 'comment'))) {
                this.errorModel.set('comment', 'Provide a description of the problem.');
            }
            if (!_.isEmpty(this.errorModel.toJSON())) {
                return "Validation errors. Please fix.";
            }
        }
    });
    return IssueModel;
});
