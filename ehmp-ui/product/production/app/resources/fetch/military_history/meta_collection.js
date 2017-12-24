define([
    'moment',
    'underscore',
    'app/resources/fetch/military_history/meta_model'
], function(moment, _, MetaModel) {
    'use strict';

    var RESOURCE = 'patient-meta-get';
    var DATA_VERSION = '2.0.r01';

    var defaultData = {
        'Branch of Service': {
            'name': 'Branch of Service',
            'displayName': 'Branch(es) of service'
        },
        'Years of Service': {
            'name': 'Years of Service',
            'displayName': 'Service date(s)'
        },
        'Areas of Service': {
            'name': 'Areas of Service',
            'displayName': 'Areas of service'
        },
        'Occupational Specialties': {
            'name': 'Occupational Specialties',
            'displayName': 'Occupational specialties'
        }
    };

    var MetaData = ADK.Resources.Collection.extend({
        resource: RESOURCE,
        vpr: 'meta',
        model: MetaModel,
        parse: function(resp) {
            var metaData = _.get(resp, 'data.items[0]');
            if (metaData) {
                var val = _.get(metaData, 'val', []);

                return _.map(defaultData, function(item) {
                    var metaDataItem = _.find(val, {
                        name: _.get(item, 'name')
                    });
                    if (!metaDataItem) {
                        return item;
                    }
                    return this.preProcessDataItem(metaDataItem, DATA_VERSION);
                }.bind(this));
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
        preProcessDataItem: function(item, currentVersion) {
            item.displayName = _.get(defaultData, [item.name, 'displayName'], item.displayName);
            if (item.version === currentVersion) {
                var touchedOnMomentDate = moment(item.touchedOn);
                item.touchedOnDisplay = (touchedOnMomentDate.isValid()) ? touchedOnMomentDate.format('MM/DD/YYYY') : '';
                item.applet_id = _.get(item, 'appletId');
            } else {
                //this is the old version (only two versions now)
                item.siteDisplayName = _.get(item, 'location');
                item.touchedByName = _.get(item, 'modifiedBy');
                item.touchedOnDisplay = _.get(item, 'modifiedOn');
            }
            return item;
        }
    });

    return MetaData;
});