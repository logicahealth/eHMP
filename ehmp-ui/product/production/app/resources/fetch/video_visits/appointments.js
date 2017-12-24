define([
    'moment'
], function(Moment) {
    'use strict';

    var Appointments = ADK.ResourceService.PageableCollection.extend({
        model: ADK.ResourceService.DomainModel,
        state: {
            pageSize: 40
        },
        mode: 'client',
        comparator: 'dateTime',
        initialize: function() {
            var fetchOpts = {
                pageable: true,
                resourceTitle: 'video-visit-appointments-get',
                cache: false,
                timeout: 30000,
                criteria: {
                    'date.start': new Moment().format('YYYYMMDD'),
                    'date.end': new Moment().add(90, 'day').format('YYYYMMDD')
                }
            };
            this.fetchOptions = _.defaultsDeep(fetchOpts, ADK.utils.patient.setPatientFetchParams(ADK.PatientRecordService.getCurrentPatient(), fetchOpts));
        }
    });

    return Appointments;
});