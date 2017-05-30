define([
    'moment',
    'backbone',
    'underscore'
], function (moment, Backbone, _) {
    'use strict';

    var Appointment = ADK.Resources.Model.extend({
        childParse: false,
        defaults: {
            'categoryCode': '',
            'categoryName': '',
            'createdByName': '',
            'current': false,
            'dateTime': '',
            'encounterType': '',
            'facilityCode': '',
            'facilityName': '',
            'kind': 'Visit',
            'lastUpdateTime': '',
            'localId': '',
            'locationDisplayName': '',
            'locationName': '',
            'locationOos': false,
            'locationUid': '',
            'patientClassCode': '',
            'patientClassName': '',
            'pid': '',
            'service': '',
            'shortLocationName': '',
            'stampTime': '',
            'stopCodeName': '',
            'stopCodeUid': '',
            'summary': '',
            'typeDisplayName': '',
            'typeName': '',
            'uid': ''
        },
        parse: function (response) {
            if (_.isEmpty(response)) return response;
            var monikers = ADK.Messaging.request('facilityMonikers');
            if (monikers) {
                var moniker = monikers.findWhere({
                        facilityCode: response.facilityCode
                    }) || new Backbone.Model();
                response.facilityMoniker = moniker.get('facilityMoniker');
            }
            var activityDate = this.getActivityDateTime(response);
            activityDate = activityDate.substr(0, 8);
            response.eventDate = activityDate;
            response.showDate = this.formatDisplayDate(activityDate);
            response.encProvider = this.encounterProvider(response);

            response.dateTime = _.padRight(response.dateTime, 8, '0');
            if (this.isAppointment(response)) {
                response.kind = 'Appointment';
                response.custom_filter_field = response.stopCodeName;
            }
            if (this.isDoDAppointment(response)) {
                if (this.isDoDAppointmentFuture(response)) {
                    response.kind = 'Appointment';
                } else {
                    response.kind = 'Visit';
                }
                response.stopCodeName = response.stopCodeName || 'UNKNOWN';
                response.custom_filter_field = response.stopCodeName;
            }
            if (this.isDoDEncounter(response)) {
                response.kind = 'Visit';
                response.stopCodeName = response.stopCodeName || 'UNKNOWN';
                response.appointmentStatus = response.appointmentStatus || "Unknown";
                response.custom_filter_field = response.stopCodeName;
            }
            if (this.isProcedure(response)) {
                response.service = response.service || "Unknown";
                response.procName = response.name || response.consultProcedure || "Unknown";
                response.custom_filter_field = response.procName;
            }
            if (this.isAdmission(response)) {
                response.reasonName = this.admissionDiagnosis(response);
                response.custom_filter_field = response.reasonName;
            }
            if (this.isVisit(response)) {
                if (_.isUndefined(response.stopCodeName)) {
                    response.stopCodeName = 'UNKNOWN';
                }
                response.appointmentStatus = response.appointmentStatus || "Unknown";
                response.custom_filter_field = response.stopCodeName;
            }
            return response;
        },
        admissionDiagnosis: function (obj) {
            var result;
            var Unknown = "Unknown";
            var diagnosis = [];
            if (_.isUndefined(obj.dischargeDiagnoses)) {
                result = obj.reasonName || Unknown;
            } else {
                _.each(obj.dischargeDiagnoses, function (val) {
                    if (!_.isUndefined(val.icdName)) {
                        if (val.icdName === "") {
                            diagnosis.push(Unknown);
                        } else {
                            diagnosis.push(val.icdName);
                        }
                    }
                });
                if (diagnosis.length > 0) {
                    result = diagnosis.join(";//");
                } else {
                    result = Unknown;
                }
            }
            return result;
        },
        commaStringFormatter: function (str) {
            return _.isUndefined(str) ? '' : str.replace(',', ', ');
        },
        encounterProvider: function (obj) {
            var provider = [];
            var primary = [];
            var arrResult = [];
            var result = "Unknown";
            if (obj.providers) {
                for (var m = 0; m < obj.providers.length; m++) {
                    if (obj.providers[m].primary) {
                        if (obj.providers[m].providerDisplayName) {
                            primary.push(this.commaStringFormatter(obj.providers[m].providerDisplayName));
                        }
                    }
                    if (obj.providers[m].providerDisplayName) {
                        provider.push(this.commaStringFormatter(obj.providers[m].providerDisplayName));
                    }
                }
                if (primary.length !== 0) {
                    arrResult = _.difference(provider, primary);
                    arrResult.unshift(primary);
                } else {
                    arrResult = provider;
                }
                if (arrResult.length !== 0) {
                    result = arrResult[0];
                }
            } else {
                if (obj.providerDisplayName) {
                    result = _.isEmpty(obj.providerDisplayName) ? "Unknown" : obj.providerDisplayName;
                }
            }
            return result;
        },
        formatDisplayDate: function (datetime) {
            return [(datetime.substring(0, 4)), '/', (datetime.substring(4, 6)), '/', (datetime.substring(6, 8))].join('');
        },
        getActivityDateTime: function (resp) {
            if (this.isVisit(resp) && this.isHospitalization(resp) && this.isDischarged(resp)) {
                return _.get(resp, 'stay.dischargeDateTime');
            }
            return resp.dateTime;
        },
        isHospitalization: function (resp) {
            return resp.categoryCode === 'urn:va:encounter-category:AD';
        },
        isDischarged: function (resp) {
            return !!_.get(resp, 'stay.dischargeDateTime');
        },
        isVisit: function (resp) {
            return this.isKindTypeHelper(resp, "visit");
        },
        isKindTypeHelper: function (resp, kindType) {
            var kind = resp.kind;
            if (kind === undefined) return false;
            kind = kind.toLowerCase();
            return (kind === kindType);
        },
        isAppointment: function (resp) {
            return !!((resp.uid.indexOf('appointment') !== -1) && (this.isVisit(resp)));
        },
        isProcedure: function (resp) {
            return resp.kind.indexOf('Procedure') !== -1;
        },
        isAdmission: function (resp) {
            return resp.kind.indexOf('Admission') !== -1;
        },
        isDoDAppointment: function (resp) {
            return resp.kind.indexOf('DoD Appointment') !== -1;
        },
        isDoDAppointmentFuture: function (resp) {
            if (this.isDoDAppointment(resp)) {
                return !!moment(resp.dateTime, 'YYYYMMDDHHmm').isAfter(moment());
            }
            return false;
        },
        isDoDEncounter: function (resp) {
            return resp.kind.indexOf('DoD Encounter') !== -1;
        }
    });

    return Appointment;
});