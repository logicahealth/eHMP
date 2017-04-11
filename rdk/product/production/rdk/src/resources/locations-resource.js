'use strict';

var util = require('util');
var querystring = require('querystring');
var _ = require('lodash');
var async = require('async');
var moment = require('moment');
var rdk = require('../core/rdk');
var RpcClient = require('vista-js').RpcClient;
var httpUtil = rdk.utils.http;
var dateUtil = require('../utils/fileman-date-converter');
var maskPtSelectSsn = require('./patient-search/search-mask-ssn').maskPtSelectSsn;
var patientSearchResource = require('./patient-search/patient-search-resource');
var locationUtil = rdk.utils.locationUtil;
var patientSearchUtil = require('./patient-search/results-parser');
var formatPatientSearchCommonFields = patientSearchUtil.formatPatientSearchCommonFields;
var pidValidatorIsSiteDfn = require('../utils/pid-validator').isSiteDfn;

function getResourceConfig() {
    return [].concat(
        _.map(['ward', 'clinic'], function(locationType) {
            return {
                name: util.format('locations-%ss-search', locationType),
                path: util.format('%ss/patients', locationType),
                get: searchLocation.bind(null, locationType),
                interceptors: {
                    jdsFilter: true,
                    synchronize: false
                },
                requiredPermissions: ['read-patient-record'],
                isPatientCentric: false,
                subsystems: ['patientrecord', 'jds', 'solr', 'jdsSync']
            };
        })
    );
}

function searchLocation(locationType, req, res) {
    /*
    locationUid come from /data/index/locations-{clinics,wards}

    location uid example: urn:va:location:C877:158
    location uids have a site code and the ien of a 'hospital location' file,
    which is not a clinic or ward.

    filter is required to prevent a search from showing every patient in a clinic or ward by default
     */
    var location = _.get(req,'query.uid','');

    if (!location) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing uid parameter');
    }

    var locationRegex = /^urn:(?:va:)?(?:location:)?([^:]*):(\w*)$/;
    if (!locationRegex.test(location)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Invalid location parameter');
    }

    var siteCode = location.match(locationRegex)[1];
    if (!_.has(req.app.config.vistaSites, siteCode)) {
        return res.status(500).rdkSend(new Error('Unknown VistA'));
    }
    var vistaConfig = _.extend({}, req.app.config.vistaSites[siteCode], {
        context: 'HMP UI CONTEXT',
        accessCode: req.session.user.accessCode,
        verifyCode: req.session.user.verifyCode
    });

    var vistaRpc;
    var parameters;
    if (locationType === 'clinic') {
        parameters = [locationUtil.getLocationIEN(location)];
        addClinicParameters(req, parameters);
        vistaRpc = 'ORQPT CLINIC PATIENTS';
    }
    if (locationType === 'ward') {
        parameters = [locationUtil.getLocationIEN(location)];
        vistaRpc = 'ORWPT BYWARD';
    }
    var hasDGAccess = _.result(req, 'session.user.dgSensitiveAccess', 'false') === 'true';

    async.waterfall(
        [
            RpcClient.callRpc.bind(RpcClient, req.logger, vistaConfig, vistaRpc, parameters),
            extractPatientInfoFromRpc.bind(null, req, locationType),
            selectPatientsFromDfnsInBatches.bind(null, req, locationType, siteCode),
            function(response, callback) {
                var auth = req.app.subsystems.authorization;
                var authObj = {
                    items: response,
                    logger: req.logger,
                    audit: req.audit,
                    app: req.app,
                    session: req.session,
                    sensitiveCheck: true
                };
                auth.execute(authObj, callback);
            }
        ],
        function(err, result) {
            if (err) {
                if (err instanceof Error) {
                    req.logger.error('Error searching location');
                    req.logger.error(err);
                    return res.status(rdk.httpstatus.internal_server_error).rdkSend(err.message);
                } else {
                    req.logger.warn('Potential error searching location');
                    req.logger.warn(err);
                    return res.status(rdk.httpstatus.ok).rdkSend(err);
                }
            }

            if (!_.isObject(result)) {
                req.logger.warn({
                    result: result
                }, 'result is not an object');
                return res.status(rdk.httpstatus.internal_server_error).rdkSend(result);
            }
            result = formatPatientSearchCommonFields(result, hasDGAccess);
            _.each(result.items, function(item) {
                item = patientSearchUtil.transformPatient(item, false);
            });
            return res.status(rdk.httpstatus.ok).rdkSend(result);
        }
    );

}

/**
 * Mutates parameters
 */
function addClinicParameters(req, parameters) {
    // start date and stop date are required but start date can be (an empty string, which defaults to today in vista)
    var startDate = _.get(req.query, 'date.start', '');
    var stopDate = _.get(req.query, 'date.end', moment().format('YYYYMMDD'));
    parameters.push(startDate);
    parameters.push(stopDate);
}

function extractPatientInfoFromRpc(req, locationType, rpcResponse, callback) {
    var error = rpcResponse.match(/^\s*\^(.*)/); // Only the errors start with ^
    if (error) {
        if (error[1].match(/^Server Error/i)) {
            return callback(new Error(error[1]));
        }
        return callback(error[1]);
    }
    var patients = rpcResponse.split('\r\n');
    var patientDfnRoomBed = _.map(patients, function(patient) {
        var patientInfo = patient.split('^');
        if (patientInfo.length === 0 || patientInfo[0].length === 0) {
            return;
        }
        var patientLocationInfo = {
            clinic: {
                dfn: patientInfo[0],
                appointmentTime: dateUtil.getVprDateTime(patientInfo[3])
            },
            ward: {
                dfn: patientInfo[0],
                roomBed: patientInfo[2].trim()
            }
        };
        return patientLocationInfo[locationType];
    });
    //If this request is for a ward, roll up any duplicate patients.
    //For clinics we want to show each appointment associated with a patient
    if (locationType === 'ward') {
        patientDfnRoomBed = _.uniq(_.compact(patientDfnRoomBed), function(patient) {
            return patient.dfn;
        });
    } else if (locationType === 'clinic') {
        patientDfnRoomBed = _.compact(patientDfnRoomBed);
    }
    if (patientDfnRoomBed.length === 0) {
        return callback('No patients found');
    }
    callback(null, patientDfnRoomBed);
}

function selectPatientsFromDfnsInBatches(req, locationType, siteCode, patientInfoFromRpc, callback) {
    var fullRange = _.uniq(_.map(_.pluck(patientInfoFromRpc, 'dfn'), function(dfn) {
        return siteCode + ';' + dfn;
    }));

    // 50 PIDs is ~500 characters long.
    // JDS reasonable maximum query parameter length is ~1000
    var JDS_PID_LIMIT = 50;
    var rangeChunks = _.chunk(fullRange, JDS_PID_LIMIT);

    var selectPatientsFromDfnsPartial = _.partial(selectPatientsFromDfns,
        req, locationType, _, patientInfoFromRpc);

    async.map(rangeChunks, selectPatientsFromDfnsPartial, function(err, responses) {
        if (err) {
            return callback(err);
        }
        var patientItems = _.reduce(responses, function(allResponses, response) {
            var items = _.get(response, 'data.items');
            if (_.isEmpty(items)) {
                return allResponses;
            }
            return allResponses.concat(items);
        }, []);
        callback(null, {
            data: {
                items: patientItems
            }
        });
    });
}

function selectPatientsFromDfns(req, locationType, range, patientInfoFromRpc, callback) {
    var order = _.get(req, 'query.order', '');

    var site = patientSearchResource.getSite(req.logger, 'locations-resource.selectPatientsFromDfns', '', req);

    var filter = req.query.filter;
    req.logger.debug('locations-resource.selectPatientsFromDfns Entering method');

    async.mapSeries(range, function(pid, mapcallback) {
        if (site === null) {
            site = patientSearchResource.getSite(req.logger, 'locations-resource.selectPatientsFromDfns', pid, req);
            if (site === null) {
                req.logger.error('locations-resource.selectPatientsFromDfns.selectPatientsFromDfns ERROR couldn\'t obtain site');
                return mapcallback('Missing site information from session or request');
            }
        }

        if (!pidValidatorIsSiteDfn(pid)) {
            req.logger.error('locations-resource.ERROR invalid pid: data missing');
            return mapcallback('Invalid PID: Missing pid information');
        }

        var searchOptions = {
            site: site,
            searchType: 'PID',
            searchString: pid
        };
        patientSearchResource.callPatientSearch(req, 'rdk.locations-resource', req.app.config.jdsServer, searchOptions, function(error, retvalue) {
            //req.logger.debug('locations-resource.selectPatientsFromDfns: inside httpUtil: ' + JSON.stringify(retvalue, null, 2));
            req.logger.debug('locations-resource.selectPatientsFromDfns: retrieved data for pid: ' + pid);
            try {
                if (locationType === 'ward') {
                    var dfnsWithRoomBed = _.filter(patientInfoFromRpc, function(dfnRoomBedItem) {
                        return (dfnRoomBedItem.roomBed !== '');
                    });
                    addRoomBedToPatientInfo(dfnsWithRoomBed, retvalue);
                } else if (locationType === 'clinic') {
                    addAppointmentDateToPatientInfo(patientInfoFromRpc, retvalue);
                }
            } catch (e) {
                req.logger.error({
                    error: e
                }, 'locations-resource.selectPatientsFromDfns: caught error');
                // do nothing
            }

            return mapcallback(error, retvalue);
        });
    }, function(err, results) {
        if (err) {
            req.logger.error({
                error: err
            }, 'locations-resource.selectPatientsFromDfns: error occurred after calling patientSearchResource.callPatientSearch');
            return callback(err);
        }

        req.logger.debug('locations-resource.selectPatientsFromDfns: retrieved data for ALL pids');
        var ptRetvalue = selectPatientsFromDfnsCreateReturn(results);

        //req.logger.debug('locations-resource.selectPatientsFromDfns Before filter: ' + JSON.stringify(ptRetvalue, null, 2));
        patientSearchResource.filter(req.logger, 'locations-resource.selectPatientsFromDfns', filter, ptRetvalue);
        //req.logger.debug('locations-resource.selectPatientsFromDfns After filter: ' + JSON.stringify(ptRetvalue, null, 2));

        //req.logger.debug('locations-resource.selectPatientsFromDfns Before sort: ' + JSON.stringify(ptRetvalue, null, 2));
        patientSearchResource.sort(req.logger, 'locations-resource.selectPatientsFromDfns', order, ptRetvalue);
        //req.logger.debug('locations-resource.selectPatientsFromDfns After sort: ' + JSON.stringify(ptRetvalue, null, 2));

        callback(null, ptRetvalue);
    });
}

/**
 * Mutates patientInfo
 */
function selectPatientsFromDfnsCreateReturn(resultsFromVxSyncCall) {
    var ptRetvalue = {
        apiVersion: '1.0',
        data: {
            totalItems: 0,
            currentItemCount: 0,
            items: []
        },
        status: 200
    };

    _.each(resultsFromVxSyncCall, function(resultFromVxSyncCall) {
        _.each(resultFromVxSyncCall.data.items, function(item) {
            ptRetvalue.data.items.push(item);
        });
    });

    ptRetvalue.data.totalItems = ptRetvalue.data.items.length;
    ptRetvalue.data.currentItemCount = ptRetvalue.data.items.length;
    return ptRetvalue;
}

/**
 * Mutates patientInfo
 */
function addRoomBedToPatientInfo(dfnsWithRoomBed, patientInfo) {
    _.each(dfnsWithRoomBed, function(dfnWithRoomBed) {
        var patientThatNeedsRoomBed = _.findWhere(patientInfo.data.items, {
            localId: dfnWithRoomBed.dfn
        });
        if (patientThatNeedsRoomBed) {
            patientThatNeedsRoomBed.roomBed = dfnWithRoomBed.roomBed;
        }
    });
}

/**
 * Adds the appointment time to the patient info object
 */
function addAppointmentDateToPatientInfo(dataFromRpc, patientInfo) {
    _.each(dataFromRpc, function(dataFromRpc) {
        var patient = _.findWhere(patientInfo.data.items, {
            localId: dataFromRpc.dfn
        });
        if (patient) {
            patient.appointmentTime = dataFromRpc.appointmentTime;
        }
    });
}

function handleError(logger, res, error, locationType, jdsPath) {
    logger.error('Error parsing results of retrieving %s with path=%s\n%s', locationType, jdsPath, util.inspect(error, {
        depth: null
    }));

    res.status(rdk.httpstatus.internal_server_error).rdkSend('There was an error processing your request. The error has been logged.');
}


module.exports.getResourceConfig = getResourceConfig;
module.exports._handleError = handleError;
module.exports._extractDfnsFromRpc = extractPatientInfoFromRpc;
module.exports._selectPatientsFromDfnsInBatches = selectPatientsFromDfnsInBatches;
