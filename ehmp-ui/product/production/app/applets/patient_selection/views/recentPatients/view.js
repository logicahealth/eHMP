define([
    'backbone',
    'marionette',
    'app/applets/patient_selection/views/baseSearchView',
], function(
    Backbone,
    Marionette,
    BaseSearchView
) {
    'use strict';

    var SearchView = BaseSearchView.extend({
        initialize: function() {
            this.listenToOnce(ADK.Messaging.getChannel(this.getOption('eventChannelName')), this.getOption('_eventPrefix') + '.show', this.executeSearch);
            this.bindEntityEvents(this.collection, this.patientRecordResultsCollectionEvents);
        },
        executeSearch: function(){
            ADK.PatientRecordService.getRecentPatients(this.collection);
        },
        onError: function(collection, resp, options) {
            collection.reset(null, {
                silent: true
            });
            if (_.isEqual(resp.statusText, "abort")) {
                return;
            }
            if (_.isEqual(resp.status, 200) && _.isString(resp.responseText)) {
                this.showError(resp.responseText);
            } else {
                this.showError('There was an error retrieving the patient list.  Try again later.');
            }
        },
        patientRecordResultsCollectionEvents: {
            'error': 'onError'
        },
        onBeforeDestroy: function() {
            this.unbindEntityEvents(this.collection, this.patientRecordResultsCollectionEvents);
        }
    });
    return SearchView;
});
