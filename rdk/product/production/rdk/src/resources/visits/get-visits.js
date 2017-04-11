'use strict';
var _ = require('lodash');
var querystring = require('querystring');
var util = require('util');
var async = require('async');
var dd = require('drilldown');
var rdk = require('../../core/rdk');
var httpUtil = rdk.utils.http;
var jdsFilter = require('jds-filter');
var moment = require('moment');
var RpcClient = require('vista-js').RpcClient;
var getVistaRpcConfiguration = require('../../utils/rpc-config').getVistaRpcConfiguration;
var nullchecker = rdk.utils.nullchecker;
var paramUtil = require('../../utils/param-converter');
var filemanDateUtil = require('../../utils/fileman-date-converter');
var locationUtil = rdk.utils.locationUtil;

/**
 * Constants
 * Default Date Range
 */
var DEFAULT_DATE_RANGE = 30;
var VISIT_RPC = 'ORWCV VST';

var interceptors = {};
interceptors.providers = {
    synchronize: false
};
interceptors.locations = {
    synchronize: false
};
interceptors.appointments = {
    synchronize: false,
    convertPid: true
};
interceptors.admissions = {
    synchronize: false,
    convertPid: true
};

var permissions = {};
permissions.providers = [];
permissions.locations = [];
permissions.appointments = ['read-encounter'];
permissions.admissions = ['read-encounter'];

var isPatientCentric = {};
isPatientCentric.providers = false;
isPatientCentric.locations = false;
isPatientCentric.appointments = true;
isPatientCentric.admissions = true;

function buildProvidersPath(req, callback) {
    var fcode = req.param('facility.code');
    var pname = req.param('provider.name') || '';
    var limit = req.param('limit');
    var order = req.query.order;

    if (!fcode) {
        return callback(new ParameterError('Missing facility.code'));
    }

    var jdsResource = '/data/find/user';
    var jdsQuery = {};
    jdsQuery.filter = jdsFilter.build([
        ['like', 'uid', '"%' + fcode + '%"'],
        ['eq', '"vistaKeys[].name"', 'PROVIDER'],
        ['ilike', 'name', '"%' + pname + '%"']
    ]);
    if (limit) {
        jdsQuery.limit = limit;
    }
    if (order) {
        jdsQuery.order = order;
    }
    var jdsQueryString = querystring.stringify(jdsQuery);
    var jdsPath = jdsResource + '?' + jdsQueryString;
    return callback(null, jdsPath);
}

function buildLocationsPath(req, callback) {
    var fcode = req.param('facility.code');
    var fname = req.param('facility.name');
    var order = req.query.order;

    var jdsResource = '/data/find/location';
    var jdsQuery = {};
    var filter = [];
    filter.push(['ne', 'inactive', 'true']);
    if (fcode) {
        filter.push(['eq', 'facilityCode', fcode]);
    }
    if (fname) {
        filter.push(['like', 'name', '%' + fname + '%']);
    }
    jdsQuery.filter = jdsFilter.build(filter);
    if (order) {
        jdsQuery.order = order;
    }
    var jdsQueryString = querystring.stringify(jdsQuery);
    var jdsPath = jdsResource + '?' + jdsQueryString;
    return callback(null, jdsPath);
}

function getVisits(visitType, req, res) {
    req.logger.warn('visit %s resource GET called', visitType);
    req.audit.logCategory = util.format('VISIT - %s', visitType.toUpperCase());

    if (visitType === 'appointments') {
        getAppointments(req, res);
    } else if (visitType === 'admissions') {
        getAdmissions(req, res);
    } else {
        var visitPathBuilders = {
            locations: buildLocationsPath,
            providers: buildProvidersPath
        };
        var tasks = [
            visitPathBuilders[visitType].bind(null, req),
            getJdsVisitResponse.bind(null, req)
        ];

        if (visitType === 'providers') {
            tasks.push(removeSsn.bind(null, req));
        }
        async.waterfall(tasks,
            function(err, results) {
                if (err instanceof ParameterError) {
                    return res.status(err.status || rdk.httpstatus.bad_request).rdkSend(err.message);
                }
                if (err) {
                    return res.status(err.status || 500).rdkSend(err.message);
                }
                return res.status(results.statusCode).rdkSend(results.data);
            }
        );
    }
}

/**
 * Retrieves a patient's hospital admissions from VistA.
 *
 * @param {Object} req - The request object containing a patient DFN.
 * @param {Object} res - The response object that will contain admissions.
 *
 * @return 400 (bad request) if the patient PID or DFN is not on the request object
           200 (success) returns matching hospital admissions
*/
function getAdmissions(req, res) {
    if (nullchecker.isNullish(req.param('pid'))) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing pid parameter');
    }

    var patientDFN;
    if (req.interceptorResults.patientIdentifiers && req.interceptorResults.patientIdentifiers.dfn) {
        patientDFN = req.interceptorResults.patientIdentifiers.dfn;
    }

    if (nullchecker.isNullish(patientDFN)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing dfn parameter');
    }

    req.logger.debug({
        patientDFN: patientDFN
    });

    var limit = req.param('limit');
    var skipAdmissions = '0';
    var params = [patientDFN, '', '', skipAdmissions];
    var rpcConfig = getVistaRpcConfiguration(req.app.config, req.session.user.site);

    RpcClient.callRpc(req.logger, rpcConfig, VISIT_RPC, params, function(error, result) {
        if (error) {
            req.logger.error({admissionsRpcError: error});
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(error);
        }

        var response = {
            'items': []
        };

        if (result) {
            req.logger.debug({admissionsRpcResult: result});

            var admissions = result.split('\r\n');

            _.forEach(admissions, function(element) {
                if (element) {
                    element = element.split(';');

                    var visitType = element[0];

                    if (visitType === 'I') {
                        var dateTime = filemanDateUtil.getVprDateTime(element[1]);
                        var visitString = element[2];

                        if (visitString) {
                            visitString = visitString.split('^');
                            req.logger.debug({
                                visitString: visitString
                            });

                            var locationUid = locationUtil.getLocationUid(req.session.user.site,'W',visitString[0]);  
                            var locationName = visitString[3];
                            var details = visitString[4];

                            var admission = {};
                            admission.visitType = visitType;
                            admission.dateTime = dateTime;
                            admission.locationUid = locationUid;
                            admission.locationDisplayName = locationName;
                            admission.details = details;

                            response.items.push(admission);
                        }
                    }
                }
            });
            response.items = _.sortBy(response.items, ['dateTime']).reverse();
            response.items = _.slice(response.items, 0, limit);
        }
        return res.status(rdk.httpstatus.ok).rdkSend(response);
    });
}

function removeSsn(req, response, callback) {
    if (!dd(response)('data')('data')('items').val) {
        var error = new Error('No items in response');
        error.status = response.statusCode;
        return callback(error);
    }
    response.data.data.items = _.map(response.data.data.items, function(item) {
        return _.omit(item, 'ssn');
    });
    callback(null, response);
}

/**
 * Retrieves a patient's clinic appointments from VistA. Returns appointments for
 * the last 30 days and the next 30 days unless a different date range is specified.
 *
 * @param {Object} req - The request object containing a patient DFN.
 * @param {Object} res - The response object that will contain appointments.
 *
 * @return 400 (bad request) if the patient PID or DFN is not on the request object
           200 (success) returns matching clinic appointments
*/
function getAppointments(req, res) {
    if (nullchecker.isNullish(req.param('pid'))) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing pid parameter');
    }

    var patientDFN;
    if (req.interceptorResults.patientIdentifiers && req.interceptorResults.patientIdentifiers.dfn) {
        patientDFN = req.interceptorResults.patientIdentifiers.dfn;
    }

    if (nullchecker.isNullish(patientDFN)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing dfn parameter');
    }

    req.logger.debug({patientDFN: patientDFN});

    var startDate = req.param('date.start') ||  moment().subtract('days', DEFAULT_DATE_RANGE).format('YYYYMMDDHHmmss');
    var endDate = req.param('date.end') || moment().add('days', DEFAULT_DATE_RANGE).format('YYYYMMDDHHmmss');
    var filemanStartDate = getFilemanDate(startDate);
    var filemanEndDate = getFilemanDate(endDate);
    var skipAdmissions = '1';
    var rpcConfig = getVistaRpcConfiguration(req.app.config, req.session.user.site);
    var params = [patientDFN, filemanStartDate, filemanEndDate, skipAdmissions];

    RpcClient.callRpc(req.logger, rpcConfig, VISIT_RPC, params, function(error, result) {
        if (error) {
            req.logger.error({appointmentsRpcError: error});
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(error);
        }

        var response = {'items': []};

        if (result) {
            req.logger.debug({appointmentsRpcResult: result});

            var appointments = result.split('\r\n');

            _.forEach (appointments, function(element) {
                if (element) {
                    element = element.split(';');

                    var visitType = element[0];
                    var dateTime = filemanDateUtil.getVprDateTime(element[1]);
                    var visitString = element[2];

                    if (visitString) {
                        visitString = visitString.split('^');

                        var locationUid = locationUtil.getLocationUid(req.session.user.site,'',visitString[0] ); 
                        var locationDisplayName = visitString[2];
                        var details = visitString[3];

                        var appointment = {};
                        appointment.visitType = visitType;
                        appointment.dateTime = dateTime;
                        appointment.locationUid = locationUid;
                        appointment.locationDisplayName = locationDisplayName;
                        appointment.details = details;

                        response.items.push(appointment);
                    }
                }
            });
        }
        return res.status(rdk.httpstatus.ok).rdkSend(response);
    });
}

/**
 * Converts a date/time object into Fileman format.
 *
 * @param {Object} dateTime - The date/time object to convert.
 *
 * @return The date/time object in Fileman format.
*/
function getFilemanDate(dateTime) {
    var dateTimeMoment = paramUtil.convertWriteBackInputDate(dateTime);
    var dateTimeFileman = filemanDateUtil.getFilemanDateTime(dateTimeMoment.toDate());
    return dateTimeFileman;
}

function getJdsVisitResponse(req, path, callback) {
    var jdsServer = req.app.config.jdsServer;
    var options = _.extend({}, jdsServer, {
        url: path,
        logger: req.logger,
        json: true
    });
    httpUtil.get(options, function(error, response, data) {
        var resultObj = {};
        resultObj.data = data;
        resultObj.statusCode = dd(response)('statusCode').val;
        callback(error, resultObj);
    });
}

function ParameterError(message) {
    this.message = message;
}
ParameterError.prototype = Error.prototype;


module.exports = getVisits;
module.exports.interceptors = interceptors;
module.exports.permissions = permissions;
module.exports.isPatientCentric = isPatientCentric;
