define([
    'moment',
    'underscore',
    'app/resources/fetch/military_history/meta_model'
], function(moment, _, MetaModel) {
    'use strict';

    var RESOURCE = 'patient-meta-get';
    var DATA_VERSION = '2.0.r01';

    var displayNames = {
        //display names by 'name' key
        //'name':'displayName'
        'Branch of Service': 'Branch(es) of service',
        'Years of Service': 'Service date(s)',
        'Areas of Service': 'Areas of service',
        'Occupational Specialties': 'Occupational specialties'
    };

    var MetaData = ADK.Resources.Collection.extend({
        resource: RESOURCE,
        vpr: 'meta',
        model: MetaModel,
        parse: function(resp) {
            var metaData = _.get(resp, 'data.items[0]');

            if (metaData) {
                if (_.get(metaData, 'status') === 202) {
                    var defaults = [{
                        'name': 'Branch of Service',
                        'displayName': 'Branch(es) of service'
                    }, {
                        'name': 'Years of Service',
                        'displayName': 'Service date(s)'
                    }, {
                        'name': 'Areas of Service',
                        'displayName': 'Areas of service'
                    }, {
                        'name': 'Occupational Specialties',
                        'displayName': 'Occupational specialties'
                    }];
                    return defaults;
                }
                var val = _.get(metaData, 'val');
                return this.preProcessData(val, DATA_VERSION);
            }

            return resp;
        },
        getFetchOptions: function() {
            var fetchOptions = {
                resourceTitle: RESOURCE,
                patient: ADK.PatientRecordService.getCurrentPatient(),
                fetchType: 'GET',
                pageable: false
            };

            return fetchOptions;
        },
        fetchCollection: function() {
            var fetchOptions = this.getFetchOptions();
            return ADK.PatientRecordService.fetchCollection(fetchOptions, this);
        },
        preProcessData: function(data, currentVersion) {
            var ret = _.map(data, function(d) {
                if (d.version === currentVersion) {
                    d.displayName = displayNames[d.name] || d.displayName;

                    var touchedOnMomentDate = moment(d.touchedOn);
                    d.touchedOnDisplay = (touchedOnMomentDate.isValid()) ? touchedOnMomentDate.format('MM/DD/YYYY') : '';
                    d.applet_id = d.appletId;
                } else {
                    //this is the old version (only two versions now)
                    d.displayName = displayNames[d.name] || d.displayName;
                    d.siteDisplayName = d.location;
                    d.touchedByName = d.modifiedBy;
                    d.touchedOnDisplay = d.modifiedOn;
                }
                return d;
            });
            return ret;
        }
    });

    return MetaData;
});