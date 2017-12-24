define([
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'moment'
], function(Backbone, Marionette, $, Handlebars, moment) {
    "use strict";

    var ADMISSION_LIMIT = '5';
    var DATE_TIME_FORMAT = 'YYYYMMDDHHmm';
    var DISPLAY_TIME_FORMAT = 'MM/DD/YYYY HH:mm';
    var DATE_FORMAT = 'MM/DD/YYYY';
    var DATE_DISPLAY_FORMAT = 'YYYYMMDD';
    var collectionHandler = {
        getProvidersPicklist: function(filterDate, callback) {
            var people = new ADK.UIResources.Picklist.Encounters.Providers();
            var date = '';
            var formattedDate = moment(filterDate, DISPLAY_TIME_FORMAT).format(DATE_TIME_FORMAT);
            if (formattedDate !== 'Invalid date') {
                date = formattedDate;
            }
            people.fetch({
                dateTime: date,
                success: callback
            }).fail(function(child, response) {
                //If the picklist fetch fails
                callback(null, response);
            });
            return people;
        },
        getLocations: function(form, callback) {
            var locations = new ADK.UIResources.Picklist.Encounters.Locations();
            var siteCode = ADK.UserService.getUserSession().get('site');
            form.listenTo(locations, 'read:success', function(collection, response) {
                form.stopListening(locations, 'read:error');
                callback(collection);
            });
            locations.fetch({
                site: siteCode
            });
            return locations;
        },
        getAdmissions: function(callback) {
            var admissionsfetchOptions = {
                patient: ADK.PatientRecordService.getCurrentPatient(),
                resourceTitle: 'visits-admissions',
                criteria: {
                    limit: ADMISSION_LIMIT
                },
                cache: false,
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
                    pid: currentPatient.getIdentifier(),
                    site: criteria.site,
                    'date.start': moment(criteria.fromDate, DATE_FORMAT).format(DATE_DISPLAY_FORMAT),
                    'date.end': moment(criteria.toDate, DATE_FORMAT).format(DATE_DISPLAY_FORMAT)
                },
                cache: false,
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
                var d = moment(model.get('dateTime'), DATE_TIME_FORMAT);
                return (moment(this.fromDate || '01/01/1900') <= d) && (d <= moment(this.toDate || '01/01/2999'));
            }, self);
        },
        admissionsParser: function(col) {
            col.forEach(function(model) {
                model.set({
                    formattedDateTime: moment(model.get('dateTime'), DATE_TIME_FORMAT).format(DISPLAY_TIME_FORMAT),
                    dateTime: model.get('dateTime')
                });
            });
            return col;
        },
        appointmentsParser: function(col) {
            col.forEach(function(model) {
                model.set({
                    formattedDateTime: moment(model.get('dateTime'), DATE_TIME_FORMAT).format(DISPLAY_TIME_FORMAT)
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
                    label: model.get('displayName'),
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