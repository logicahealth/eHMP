'use strict';

var util = require('util');
var querystring = require('querystring');
var _ = require('lodash');
var async = require('async');
var moment = require('moment');
var dd = require('drilldown');
var rdk = require('../core/rdk');
var RpcClient = require('vista-js').RpcClient;
var httpUtil = rdk.utils.http;
var dateUtil = require('../utils/fileman-date-converter');
var maskPtSelectSsn = require('./patient-search/search-mask-ssn').maskPtSelectSsn;
var patientSearchResource = require('./patient-search/patient-search-resource');

function getResourceConfig() {
    return [].concat(
        _.map(['wards', 'clinics'], function(value) {
            return {
                name: 'locations-' + value,
                path: value,
                get: getLocationData.bind(null, value),
                interceptors: {
                    jdsFilter: true,
                    synchronize: false
                },
                requiredPermissions: [],
                isPatientCentric: false,
                subsystems: ['patientrecord','jds','solr','jdsSync']
            };
        }),
        _.map(['ward', 'clinic'], function(locationType) {
            return {
                name: util.format('locations-%ss-search', locationType),
                path: util.format('%ss/patients', locationType),
                get: searchLocation.bind(null, locationType),
                interceptors: {
                    jdsFilter: true,
                    synchronize: false
                },
                requiredPermissions: [],
                isPatientCentric: false,
                subsystems: ['patientrecord','jds','solr','jdsSync']
            };
        })
    );
}

function parseLocationsRpcResponse(rpcData, siteCode, locationType, req, res, callback) {
    var locations = [];

    var lines = _.filter(rpcData.split('\r\n'), Boolean);

    async.eachLimit(lines, 5, function(line, cb) {
        var fields = line.split('^');

        var thisUid = 'urn:va:location:' + siteCode + (locationType === 'W' ? ':w' : ':') + fields[0];

        var options = _.extend({}, req.app.config.jdsServer, {
            url: '/data/' + thisUid,
            timeout: 120000,
            logger: req.logger,
            json: true
        });

        rdk.utils.http.get(options, function(error, response, obj) {
            if (error) {
                return cb(error);
            }

            if (_.isObject(obj)) {
                if (obj.error) {
                    return cb(obj.error);
                }

                if (obj.data && obj.data.items) {
                    locations.push(obj.data.items[0]);
                    return cb();
                }

                obj.error = 'Did not recognize the format of the JDS response.';
                return cb(obj);
            }

            return cb('JDS response was not a JSON object.');
        });
    }, function(err) {
        if (err) {
            return callback(err, undefined, req, res);
        }

        return callback(null, locations, req, res);
    });
}

function applyOrderParam(items, order) {
    var dir = order.substring(order.indexOf('(') + 1, order.indexOf(')'));
    var field = order.split(' ')[0];
    return _.sortByOrder(items, [field], [dir]);
}

function applyNameParam(items, name) {
    return _.filter(items, function(value, index, collection) {
        if (name && value.name) {
            return _.startsWith(value.name.toLowerCase(), name.toLowerCase());
        } else {
            return false;
        }
    });
}

function applyStartParam(items, start) {
    return _.drop(items, start);
}

function applyLimitParam(items, limit) {
    return _.take(items, limit);
}

function applyFacilityCodeParam(items, facilityCode) {
    return _.filter(items, function(value, index, collection) {
        if (facilityCode && value.facilityCode) {
            return value.facilityCode == facilityCode;
        } else {
            return false;
        }
    });
}

// Callback for parseLocationsRpcResponse
function filterAndSendParsedLocations(error, locations, req, res) {
    if (error) {
        req.logger.warn(error);
        res.status(500).rdkSend(error);
        return;
    }

    var jsonResponse = {
        items: locations,
        totalItems: locations.length
    };

    var order = req.param('order');
    var name = req.param('name');
    var start = req.param('start');
    var limit = req.param('limit');
    var facilityCode = req.param('facility.code') || req.param('facilityCode');

    if (order) {
        jsonResponse.items = applyOrderParam(jsonResponse.items, order);
    }
    if (name) {
        jsonResponse.items = applyNameParam(jsonResponse.items, name);
        jsonResponse.totalItems = jsonResponse.items.length;
    }
    if (facilityCode) {
        jsonResponse.items = applyFacilityCodeParam(jsonResponse.items, facilityCode);
        jsonResponse.totalItems = jsonResponse.items.length;
    }
    if (start) {
        jsonResponse.items = applyStartParam(jsonResponse.items, Number(start));
        jsonResponse.startIndex = Number(start);
    }
    if (limit) {
        jsonResponse.items = applyLimitParam(jsonResponse.items, Number(limit));
        jsonResponse.itemsPerPage = Number(limit);
    }

    res.status(200).rdkSend(jsonResponse);
}

function getLocationData(locationType, req, res) {
    req.audit.dataDomain = locationType;
    req.audit.logCategory = 'SUPPORT';

    var siteCode = req.param('site.code');
    if (!siteCode) {
        siteCode = req.param('siteCode');
        if (!siteCode) {
            siteCode = req.param('site');
            if (!siteCode) {
                var message = 'Site Code was missing.';
                req.logger.warn(message);
                res.status(500).rdkSend(message);
                return;
            }
        }
    }
    siteCode = siteCode.toUpperCase();

    req.logger.info('Retrieving %s from %s', locationType, siteCode);

    var vistaConfig = _.extend({}, req.app.config.vistaSites[siteCode], {
        context: 'HMP UI CONTEXT',
        accessCode: req.session.user.accessCode,
        verifyCode: req.session.user.verifyCode
    });

    if (locationType === 'wards') {
        RpcClient.callRpc(req.logger, vistaConfig, 'ORQPT WARDS', function(error, rpcData) {
            if (error) {
                req.logger.warn(error);
                res.status(500).rdkSend(error);
                return;
            }

            parseLocationsRpcResponse(rpcData, siteCode, 'W', req, res, filterAndSendParsedLocations);
        });
        return;
    }

    if (locationType === 'clinics') {
        RpcClient.callRpc(req.logger, vistaConfig, 'ORWU CLINLOC', '0', '1', function(error, rpcData) {
            if (error) {
                req.logger.warn(error);
                res.status(500).rdkSend(error);
                return;
            }

            parseLocationsRpcResponse(rpcData, siteCode, 'C', req, res, filterAndSendParsedLocations);
        });
        return;
    }

    res.status(400).rdkSend('Did not recognize location type: ' + locationType);
}

function searchLocation(locationType, req, res) {
    /*
    locationUid and refId come from /data/index/locations-{clinics,wards}

    location uid example: urn:va:location:C877:158
    location uids have a site code and the ien of a 'hospital location' file,
    which is not a clinic or ward.

    refId is the ward or clinic ien

    filter is required to prevent a search from showing every patient in a clinic or ward by default
     */
    var location = req.param('uid');
    var refId;
    if (req.param('ref.id') !== undefined) {
        refId = req.param('ref.id');
    }

    if(!location && !refId) {
        if (locationType === 'clinic') {
            return res.status(rdk.httpstatus.bad_request).rdkSend('Missing uid parameter');
        } else if (locationType === 'ward') {
            return res.status(rdk.httpstatus.bad_request).rdkSend('Missing ref.id parameter');
        }
    }
    var locationRegex = /^urn:(?:va:)?(?:location:)?([^:]*):(\w*)$/;
    if(!locationRegex.test(location)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Invalid location parameter');
    }

    var siteCode = location.match(locationRegex)[1];
    if(!_.has(req.app.config.vistaSites, siteCode)) {
        return res.status(500).rdkSend(new Error('Unknown VistA'));
    }
    var vistaConfig = _.extend({}, req.app.config.vistaSites[siteCode], {
        context: 'HMP UI CONTEXT',
        accessCode: req.session.user.accessCode,
        verifyCode: req.session.user.verifyCode
    });

    var vistaRpc;
    var parameters;
    if(locationType === 'clinic') {
        location = location.split(':')[4];
        parameters = [location];
        addClinicParameters(req, parameters);
        vistaRpc = 'ORQPT CLINIC PATIENTS';
    }
    if(locationType === 'ward') {
        parameters = [refId];
        vistaRpc = 'ORWPT BYWARD';
    }

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
            result = maskPtSelectSsn(result);
            if(err) {
                if(err instanceof Error) {
                    return res.status(rdk.httpstatus.internal_server_error).rdkSend(err.message);
                } else {
                    return res.status(rdk.httpstatus.ok).rdkSend(err);
                }
            }

            if(!_.isObject(result)) {
                return res.status(rdk.httpstatus.internal_server_error).rdkSend(result);
            }
            return res.status(rdk.httpstatus.ok).rdkSend(result);
        }
    );

}

/**
 * Mutates parameters
 */
function addClinicParameters(req, parameters) {
    // start date and stop date are required but start date can be (an empty string, which defaults to today in vista)
    var startDate = req.param('date.start') || '';
    var stopDate = req.param('date.end') || moment().format('YYYYMMDD');
    parameters.push(startDate);
    parameters.push(stopDate);
}

function extractPatientInfoFromRpc(req, locationType, rpcResponse, callback) {
    var error = rpcResponse.match(/^\s*\^(.*)/);  // Only the errors start with ^
    if(error) {
        if(error[1].match(/^Server Error/i)) {
            return callback(new Error(error[1]));
        }
        return callback(error[1]);
    }
    var patients = rpcResponse.split('\r\n');
    var patientDfnRoomBed = _.map(patients, function (patient) {
        var patientInfo = patient.split('^');
        if (patientInfo.length === 0 || patientInfo[0].length === 0) {
            return;
        }
        var patientLocationInfo = {
            clinic: { dfn: patientInfo[0], appointmentTime: dateUtil.getVprDateTime(patientInfo[3]) },
            ward: { dfn: patientInfo[0], roomBed: patientInfo[2].trim() }
        };
        return patientLocationInfo[locationType];
    });
    //If this request is for a ward, roll up any duplicate patients.
    //For clinics we want to show each appointment associated with a patient
    if(locationType === 'ward'){
        patientDfnRoomBed = _.uniq(_.compact(patientDfnRoomBed), function(patient) {return patient.dfn;});
    }
    else if( locationType === 'clinic'){
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
        if(err) {
            return callback(err);
        }
        var patientItems = _.reduce(responses, function(allResponses, response) {
            var items = dd(response)('data')('items').val;
            if(_.isEmpty(items)) {
                return allResponses;
            }
            return allResponses.concat(items);
        }, []);
        callback(null, {data: { items: patientItems } });
    });
}

function selectPatientsFromDfns(req, locationType, range, patientInfoFromRpc, callback) {
    var order = req.query.order;

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
        patientSearchResource.callVxSyncPatientSearch(req.logger, 'rdk.locations-resource', req.app.config.vxSyncServer, req.app.config.jdsServer, site, 'PID', pid, function(error, retvalue) {
            //req.logger.debug('locations-resource.selectPatientsFromDfns: inside httpUtil: ' + JSON.stringify(retvalue, null, 2));
            req.logger.debug('locations-resource.selectPatientsFromDfns: retrieved data for pid: ' + pid);
            try {
                if (locationType === 'ward') {
                    var dfnsWithRoomBed = _.filter(patientInfoFromRpc, function (dfnRoomBedItem) {
                        return (dfnRoomBedItem.roomBed !== '');
                    });
                    addRoomBedToPatientInfo(dfnsWithRoomBed, retvalue);
                }
                else if (locationType === 'clinic') {
                    addAppointmentDateToPatientInfo(patientInfoFromRpc, retvalue);
                }
            } catch (e) {
                req.logger.error('locations-resource.selectPatientsFromDfns: caught error: ' + e);
                // do nothing
            }

            return mapcallback(error, retvalue);
        });
    }, function(err, results) {
        if (err) {
            req.logger.error('locations-resource.selectPatientsFromDfns: error occurred after calling patientSearchResource.callVxSyncPatientSearch: ' + err);
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
        var patientThatNeedsRoomBed = _.findWhere(patientInfo.data.items, {localId: dfnWithRoomBed.dfn});
        if(patientThatNeedsRoomBed) {
            patientThatNeedsRoomBed.roomBed = dfnWithRoomBed.roomBed;
        }
    });
}

/**
 * Adds the appointment time to the patient info object
 */
function addAppointmentDateToPatientInfo(dataFromRpc, patientInfo) {
    _.each(dataFromRpc, function(dataFromRpc) {
        var patient= _.findWhere(patientInfo.data.items, {localId: dataFromRpc.dfn});
        if(patient) {
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
module.exports._getLocationData = getLocationData;
module.exports._handleError = handleError;
module.exports._parseLocationsRpcResponse = parseLocationsRpcResponse;
module.exports._extractDfnsFromRpc = extractPatientInfoFromRpc;
module.exports._applyOrderParam = applyOrderParam;
module.exports._applyNameParam = applyNameParam;
module.exports._applyStartParam = applyStartParam;
module.exports._applyLimitParam = applyLimitParam;
module.exports._applyFacilityCodeParam = applyFacilityCodeParam;
module.exports._selectPatientsFromDfnsInBatches = selectPatientsFromDfnsInBatches;
