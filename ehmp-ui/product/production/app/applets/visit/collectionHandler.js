define([
    'backbone',
    'marionette',
    'jquery',
    'handlebars'
], function(Backbone, Marionette, $, Handlebars) {
    "use strict";

    var ADMISSION_LIMIT = '5';
    var DATE_TIME_FORMAT = 'YYYYMMDDHHmm';
    var DISPLAY_TIME_FORMAT = 'MM/DD/YYYY HH:mm';
    var DATE_FORMAT = 'MM/DD/YYYY';
    var DATE_DISPLAY_FORMAT = 'YYYYMMDD';
    var INHOSPITAL_SC = 'I';
    var AMBULATORY_SC = 'A';
    var DAILY_SC = 'D';
    var ANCILLARY_PACKAGE_SC = 'X';
    var TELEHEALTH_SC = 'T';
    var HISTORICAL_SC = 'E';

    var collectionHandler = {
        getServiceCategory: function(visit, currentTab, isInpatient, callback) {
            var result;
            if (visit.get('newVisit') && visit.get('newVisit').isHistorical) {
                result = {
                    'data': {
                        'serviceCategory': HISTORICAL_SC
                    }
                };
                return callback(result);
            }

            if (visit.get('locationDisplayName').toUpperCase().indexOf('TELE') > -1) {
                result = {
                    'data': {
                        'serviceCategory': TELEHEALTH_SC
                    }
                };
                return callback(result);
            }

            if (currentTab.indexOf('Clinic-Appointments-tab-panel') >= 0 || currentTab.indexOf('New-Visit-tab-panel') >= 0) {
                if (isInpatient) {
                    result = {
                        'data': {
                            'serviceCategory': INHOSPITAL_SC
                        }
                    };
                    return callback(result);
                } else {
                    result = {
                        'data': {
                            'serviceCategory': AMBULATORY_SC
                        }
                    };
                    return callback(result);
                }
            } else if (currentTab.indexOf('Hospital-Admissions-tab-panel') >= 0) {
                if (isInpatient) {
                    result = {
                        'data': {
                            'serviceCategory': DAILY_SC
                        }
                    };
                    return callback(result);
                } else {
                    result = {
                        'data': {
                            'serviceCategory': ANCILLARY_PACKAGE_SC
                        }
                    };
                    return callback(result);
                }
            }
        },
        getProviders: function(callback) {
            var siteCode = ADK.UserService.getUserSession().get('site');
            var providersfetchOptions = {
                resourceTitle: "visits-providers",
                onSuccess: callback,
                criteria: {
                    "facility.code": siteCode
                }
            };
            ADK.ResourceService.fetchCollection(providersfetchOptions);
        },
        getProvidersPicklist: function(callback) {
            var collection = new Backbone.Collection();
            var site = ADK.UserService.getUserSession().get('site');
            collection.url = '/resource/write-pick-list?type=new-persons&new-persons-type=PROVIDER&site=' + site;
            collection.fetch({
                success: callback
            });
        },
        getLocations: function(callback) {
            var siteCode = ADK.UserService.getUserSession().get('site');
            var locationsfetchOptions = {};
            locationsfetchOptions.resourceTitle = "locations-clinics";
            locationsfetchOptions.onSuccess = callback;
            locationsfetchOptions.criteria = {
                "site.code": siteCode
            };
            ADK.ResourceService.fetchCollection(locationsfetchOptions);
        },
        getAdmissions: function(callback) {
            var admissionsfetchOptions = {
                patient: ADK.PatientRecordService.getCurrentPatient(),
                resourceTitle: 'visits-admissions',
                criteria: {
                    limit: ADMISSION_LIMIT
                },
                onSuccess: callback,
                onError: callback
            };
            return ADK.PatientRecordService.fetchCollection(admissionsfetchOptions);
        },
        getAppointments: function(criteria, callback) {
            var currentPatient = ADK.PatientRecordService.getCurrentPatient();
            var appointmentsfetchOptions = {
                patient: currentPatient,
                resourceTitle: 'visits-appointments',
                criteria: {
                    pid: criteria.pid,
                    site: criteria.site,
                    'date.start': moment(criteria.fromDate, DATE_FORMAT).format(DATE_DISPLAY_FORMAT),
                    'date.end': moment(criteria.toDate, DATE_FORMAT).format(DATE_DISPLAY_FORMAT)
                },
                onSuccess: callback,
                onError: callback
            };
            if (currentPatient.has('acknowledged')) {
                appointmentsfetchOptions.criteria._ack = true;
            }
            var url = ADK.ResourceService.buildUrl(appointmentsfetchOptions.resourceTitle, appointmentsfetchOptions.criteria);
            ADK.ResourceService.clearCache(url);
            return ADK.PatientRecordService.fetchCollection(appointmentsfetchOptions);
        },
        collectionDateFilter: function(col, fromDate, toDate) {
            this.fromDate = fromDate;
            this.toDate = toDate;
            var self = this;
            return _.filter(col.models, function(model) {
                var d = moment(model.get('visitDateTime'), DATE_TIME_FORMAT);
                return (moment(this.fromDate || '01/01/1900') <= d) && (d <= moment(this.toDate || '01/01/2999'));
            }, self);
        },
        admissionsParser: function(col) {
            col.forEach(function(model) {
                model.set({
                    formatteddateTime: moment(model.get('dateTime'), DATE_TIME_FORMAT).format(DISPLAY_TIME_FORMAT),
                    visitDateTime: model.get('dateTime'),
                    locationIEN: model.get('locationIEN')
                });
            });
            return col;
        },
        appointmentsParser: function(col) {
            col.forEach(function(model) {
                model.set({
                    formatteddateTime: moment(model.get('visitDateTime'), DATE_TIME_FORMAT).format(DISPLAY_TIME_FORMAT)
                });
            });
            return col;
        },
        locationsParser: function(collection) {
            var pickListArray = [{
                pickList: [{}]
            }];
            var pickList = collection.map(function(model) {
                return {
                    label: model.get('name'),
                    value: model.get('uid')
                };
            });
            pickListArray[0].group = 'All Locations';
            pickListArray[0].pickList = pickList;
            return pickListArray;
        },
        providerParser: function(collection) {
            var pickListArray = [{
                pickList: [{}]
            }];
            var pickList = collection.map(function(model) {
                return {
                    label: model.get('name'),
                    value: model.get('code')
                };
            });
            pickListArray[0].group = 'All Providers';
            pickListArray[0].pickList = pickList;
            return pickListArray;
        }
    };
    return collectionHandler;
});