'use strict';

var rdk = require('../../core/rdk');
var httpUtil = rdk.utils.http;
var async = require('async');
var nullchecker = rdk.utils.nullchecker;
var _ = require('lodash');
var videoVisitUtils = require('./utils');
var moment = require('moment-timezone');
var timeZones = require('./time-zones');
var uuid = require('node-uuid');

function updateTimeZone(obj) {

    var timeZoneId = _.get(obj, 'contactInformation.timeZone');
    var timeZone;
    if (timeZoneId) {
        timeZone = _.get(timeZones, '' + timeZoneId);
        if (timeZone) {
            _.set(obj, 'contactInformation.timeZone', timeZone.abbreviation);
        }
    }

    timeZoneId = _.get(obj, 'location.facility.timeZone');
    timeZone = null;
    if (timeZoneId) {
        timeZone = _.get(timeZones, '' + timeZoneId);
        if (timeZone) {
            _.set(obj, 'location.facility.timeZone', timeZone.abbreviation);
        }
    }

    return obj;
}

function getTimezoneIdByAbbreviation(abbreviation) {
    var timeZone = _.find(timeZones, function(tz) {
        return tz.abbreviation === abbreviation;
    });

    if (timeZone) {
        return timeZone.zoneId;
    }

    return abbreviation;
}

function processAppointmentsResult(result) {

    var formattedResponse = {
        data: {
            items: []
        }
    };

    if (!result) {
        return formattedResponse;
    }

    _.each(result, function(value, key) {
        value.dateTimeFormatted = moment.tz(value.dateTime, 'UTC').format('MM/DD/YYYY - HH:mm zz') + ' UTC';

        /* Time is displayed in the time zone assigned to the patient's facility for Store_Forward
        and for all other appointmentKind, it is provider's facility  */

        /*
         The Facility/Clinic displayed by appointment kind:
         Ad_Hoc/Mobile_Any/Mobile_GFE/Clinic_Based = Provider
         Store_Forward = Patient
        */

        var timeZoneId;
        if (value.appointmentKind === 'STORE_FORWARD') {
            if (value.patients && value.patients.patient) {
                timeZoneId = _.get(value.patients, 'patient[0].location.facility.timeZone');
                value.facility = _.get(value.patients, 'patient[0].location.facility.name');
                value.clinic = _.get(value.patients, 'patient[0].location.clinic.name');
            }

        } else {
            if (value.providers && value.providers.provider) {
                timeZoneId = _.get(value.providers, 'provider[0].location.facility.timeZone');
                value.facility = _.get(value.providers, 'provider[0].location.facility.name');
                value.clinic = _.get(value.providers, 'provider[0].location.clinic.name');
            }
        }

        if (timeZoneId) {
            var timeZone = _.get(timeZones, '' + timeZoneId);
            if (timeZone) {
                value.dateTimeFormatted = moment.tz(value.dateTime, 'UTC').tz(timeZone.zoneName).format('MM/DD/YYYY - HH:mm') + ' ' + timeZone.abbreviation;
            }
        }

        // update timeZone for providers
        if (value.providers && value.providers.provider) {
            _.each(value.providers.provider, function(provider) {
                updateTimeZone(provider);
            });
        }

        // update timeZone for all the patients.
        if (value.patients && value.patients.patient) {
            _.each(value.patients.patient, function(patient) {
                updateTimeZone(patient);
            });
        }

        formattedResponse.data.items.push(value);
    });

    return formattedResponse;
}

module.exports.getVideoVisitAppointments = function(req, res) {
    var pid = req.param('pid');
    var errorCode = 'rdk.400.1000';
    async.waterfall([
        videoVisitUtils.getIcn.bind(null, req, pid),
        function(icn, callback) {
            errorCode = 'vvs.500.1000';
            getAppointments(req, icn, callback);
        }
    ], function(err, result) {
        if (err) {
            return videoVisitUtils.buildResponse(req, res, err, null, null, errorCode);
        }
        return res.rdkSend(processAppointmentsResult(result));
    });
};

function getAppointments(req, icn, callback) {
    // Takes an Task ID
    // Returns the details of the task with that id, including: taskID, taskType (Human or System), and task state etc.
    req.audit.dataDomain = 'Video Visits';
    req.audit.logCategory = 'GET_APPOINTMENTS';

    var config = _.extend({}, req.app.config.videoVisit.vvService, {
        logger: req.logger,
        json: true,
        url: '/appointment/patient/id/ICN/' + icn + '/appointments'
    });

    var query = {};

    var startDate = req.param('date.start');
    if (nullchecker.isNotNullish(startDate)) {
        query.startDate = moment(startDate).format('MM/DD/YYYY');
    }

    var endDate = req.param('date.end');
    if (nullchecker.isNotNullish(endDate)) {
        query.endDate = moment(endDate).format('MM/DD/YYYY');
    }

    config.qs = query;

    httpUtil.get(config, function(err, response, returnedData) {

        if (err) {
            return callback(err);
        } else if (response.statusCode !== rdk.httpstatus.ok && response.statusCode !== rdk.httpstatus.no_content) {
            return callback({
                'error': response.body
            });
        }

        if (response && response.statusCode !== rdk.httpstatus.no_content) {
            return callback(null, returnedData);
        }

        return callback(null, []);
    });
}

function generateUUID() {
    return uuid.v4();
}

function getVirtualMeetingRoomDetails(req, appointment, callback) {
    var vmrLinkServiceCallCallback = function(err, vmrData) {

        if (err) {
            return callback(err);
        }

        var virtualRoomList = {
            'provider': {
                'conference': vmrData.meetingRoomName,
                'pin': vmrData.hostPin,
                'url': vmrData.hostLinkUrl
            },
            'veteran': {
                'conference': vmrData.meetingRoomName,
                'pin': vmrData.guestPin,
                'url': vmrData.guestLinkUrl
            }
        };

        return callback(null, virtualRoomList);
    };

    return vmrLinkServiceCall(req, appointment, vmrLinkServiceCallCallback);
}

function validateVyoptaServiceResponse(response) {
    if (!_.isEmpty(response.meetingRoomName) &&
        !_.isEmpty(response.guestPin) &&
        !_.isEmpty(response.hostPin) &&
        !_.isEmpty(response.guestLinkUrl) &&
        !_.isEmpty(response.hostLinkUrl)
    ) {
        return true;
    }

    return false;
}

function vmrLinkServiceCall(req, appointment, callback) {
    var startTime = moment(appointment.dateTime, 'YYYY-MM-DDTHH:mm');
    var endTime = moment(appointment.dateTime, 'YYYY-MM-DDTHH:mm');
    endTime = endTime.add(parseInt(appointment.duration), 'm');

    var providerName = _.get(appointment, 'providers.provider[0].name.firstName') + ' ' + _.get(appointment, 'providers.provider[0].name.lastName');

    var config = _.extend({}, req.app.config.videoVisit.vvService, {
        logger: req.logger,
        json: true,
        url: '/vmrlink'
    });

    var query = {};
    query.appName = 'VVC';
    query.appointmentId = _.get(appointment, 'id');
    query.startDate = startTime.format('YYYY-MM-DDTHH:mm:ss');
    query.endDate = endTime.format('YYYY-MM-DDTHH:mm:ss');
    query.guestId = _.get(appointment, 'patients.patient[0].id.uniqueId');
    query.hostId = _.get(appointment, 'providers.provider[0].id.uniqueId');
    query.hostName = providerName;

    config.qs = query;

    httpUtil.get(config, function(err, response, returnedData) {

        if (err) {
            return callback(err);
        } else if (response.statusCode !== rdk.httpstatus.ok && response.statusCode !== rdk.httpstatus.no_content) {
            return callback({
                'error': response.body
            });
        }

        if (!validateVyoptaServiceResponse(returnedData)) {
            return callback({
                'error': 'Invalid response received from VVS vmrlink resource'
            });
        }

        return callback(null, returnedData);
    });
}

function updateTimeZoneByAbbreviationToZoneId(appointment) {

    var patients = _.get(appointment, 'patients.patient');
    var timezoneAbbreviation;
    if (_.isArray(patients)) {
        _.each(patients, function(patient) {
            timezoneAbbreviation = _.get(patient, 'location.facility.timeZone');
            _.set(patient, 'location.facility.timeZone', getTimezoneIdByAbbreviation(timezoneAbbreviation));
            timezoneAbbreviation = _.get(patient, 'contactInformation.timeZone');
            if (timezoneAbbreviation) {
                _.set(patient, 'contactInformation.timeZone', getTimezoneIdByAbbreviation(timezoneAbbreviation));
            }

        });
    }

    var providers = _.get(appointment, 'providers.provider');
    if (_.isArray(providers)) {
        _.each(providers, function(provider) {
            timezoneAbbreviation = _.get(provider, 'location.facility.timeZone');
            _.set(provider, 'location.facility.timeZone', getTimezoneIdByAbbreviation(timezoneAbbreviation));
            timezoneAbbreviation = _.get(provider, 'contactInformation.timeZone');
            if (timezoneAbbreviation) {
                _.set(provider, 'contactInformation.timeZone', getTimezoneIdByAbbreviation(timezoneAbbreviation));
            }
        });
    }

    return appointment;
}

module.exports.createVideoVisitAppointment = function(req, res) {
    req.audit.dataDomain = 'Video Visits';
    req.audit.logCategory = 'CREATE_APPOINTMENT';

    var config = _.extend({}, req.app.config.videoVisit.vvService, {
        logger: req.logger,
        json: true,
        url: '/appointment'
    });

    var appointment = req.body;
    appointment.id = generateUUID();

    var vmrCallback = function(err, vmrList) {
        if (err) {
            return videoVisitUtils.buildResponse(req, res, err, null, null, 'vvs.500.1000');
        }

        var providers = _.get(appointment, 'providers.provider');
        if (_.isArray(providers)) {
            _.each(providers, function(provider) {
                provider.virtualMeetingRoom = vmrList.provider;
            });
        }

        var patients = _.get(appointment, 'patients.patient');
        if (_.isArray(patients)) {
            _.each(patients, function(patient) {
                patient.virtualMeetingRoom = vmrList.veteran;
            });
        }

        //update Time Zone from Abbreviation to ZoneId
        appointment = updateTimeZoneByAbbreviationToZoneId(appointment);
        appointment.sourceSystem = _.get(req.app.config, 'videoVisit.sourceSystemName');

        config.body = appointment;

        httpUtil.post(config, function(err, response, returnedData) {
            if (err) {
                return videoVisitUtils.buildResponse(req, res, err, null, null, 'vvs.500.1000');
            } else if (response.statusCode !== rdk.httpstatus.ok && response.statusCode !== rdk.httpstatus.created) {
                return videoVisitUtils.buildResponse(req, res, {
                    'error': response.body
                }, null, null, 'vvs.500.1000');
            }

            var formattedResponse = {
                data: {
                    items: [returnedData]
                }
            };

            return res.rdkSend(formattedResponse);
        });
    };

    return getVirtualMeetingRoomDetails(req, appointment, vmrCallback);

};

module.exports.updateTimeZone = updateTimeZone;
module.exports.processAppointmentsResult = processAppointmentsResult;
module.exports.getTimezoneIdByAbbreviation = getTimezoneIdByAbbreviation;
module.exports.updateTimeZoneByAbbreviationToZoneId = updateTimeZoneByAbbreviationToZoneId;
module.exports.getAppointments = getAppointments;
