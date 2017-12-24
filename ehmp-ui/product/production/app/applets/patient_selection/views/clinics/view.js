define([
    'backbone',
    'marionette',
    'moment',
    'app/applets/patient_selection/views/baseSearchView',
    'app/applets/patient_selection/views/table/view',
    'app/applets/patient_selection/views/table/row',
    'app/applets/patient_selection/views/clinics/filter'
], function(
    Backbone,
    Marionette,
    moment,
    BaseSearchView,
    SearchResultsCollectionView,
    PatientSearchResultView,
    ClinicFilter
) {
    'use strict';

    var SearchView = BaseSearchView.extend({
        FilterView: ClinicFilter,
        patientRecordResultsCollectionEvents: {
            'error': 'onError'
        },
        resultsView: SearchResultsCollectionView.extend({
            templateName: 'clinics',
            childView: PatientSearchResultView.extend({
                templateName: 'clinics'
            }),
            viewComparator: function(a, b) {
                var appt = a.attributes.appointmentTime - b.attributes.appointmentTime;
                if (appt === 0) {
                    return appt;
                } else {
                    return a.attributes.appointmentTime < b.attributes.appointmentTime ? -1 : 1;
                }
            }
        }),
        initialize: function() {
            this.bindEntityEvents(this.collection, this.patientRecordResultsCollectionEvents);
            this.listenTo(ADK.Messaging.getChannel(this.getOption('eventChannelName')), 'execute-search', this.executeSearch);
            this.setEmpty();
        },
        onBeforeShow: function() {
            this.searchResultsRegion.$el.addClass('hidden');
        },
        executeSearch: function(model) {
            if (this.collection.xhr) this.collection.xhr.abort();
            var fromDate = moment(model.get('fromDate'));
            var toDate = moment(model.get('toDate'));

            if (_.isEqual(fromDate.toString(), 'Invalid date') || _.isEqual(toDate.toString(), 'Invalid date') || toDate.isBefore(fromDate)) {
                this.showError('Invalid dates entered.');
                return;
            }
            this.searchResultsRegion.$el.removeClass('hidden');
            var criteria = {
                'date.start': fromDate.format('YYYYMMDD'),
                'date.end': toDate.format('YYYYMMDD'),
                'uid': model.get('clinicLocation')
            };
            var searchOptions = {
                resourceTitle: 'locations-clinics-search',
                criteria: criteria,
                cache: true
            };

            ADK.ResourceService.fetchCollection(searchOptions, this.collection);
        },
        onError: function(collection, resp, options) {
            collection.reset(null, {
                silent: true
            });
            if (_.isEqual(resp.statusText,"abort")){
                return;
            }
            this.showError('There was an error retrieving the patient list.  Try again later.');
        },
        onBeforeDestroy: function() {
            this.unbindEntityEvents(this.collection, this.patientRecordResultsCollectionEvents);
        }
    });

    return SearchView;
});