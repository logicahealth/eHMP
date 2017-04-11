'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');
var dd = require('drilldown');
var nullchecker = rdk.utils.nullchecker;
var httpUtil = rdk.utils.http;
var auditUtil = require('../../utils/audit');
var async = require('async');

// Clinical Reminders
var RpcClient = require('vista-js').RpcClient;
var RpcParameter = require('vista-js').RpcParameter;
var getVistaRpcConfiguration = require('../../utils/rpc-config').getVistaRpcConfiguration;
var filemanDateUtil = require('../../utils/fileman-date-converter');
var errorVistaJSCallback = 'VistaJS RPC callback error: ';

//Work Product
var cdsWorkProduct = require('../cds-work-product/cds-work-product');

// Cache
var adviceCache = require('./advice-cache');

/**
 * Advice Priority
 *      Critical:   80+
 *      High:       80-61
 *      Moderate:   60-41
 *      Low:        40-21
 *      Very Low:   20-0
 *      None:       0-
 *
 * Reminder Priority
 *      High:       1 (advice-80/High)
 *      Normal:     2 (advice-60/Moderate)
 *      Low:        3 (advice-40/Low)
 */
var ReminderToAdvicePriorityMap = {
    '1': 80,
    '2': 60,
    '3': 40
};

/**
 * Maps a reminder's priority value to match the scale of the advice priority values.
 *
 * param Number reminderPriority
 * returns Number Priority value mapped to Advice priority range.
 */
function mapToAdvicePriority(reminderPriority) {
    return ReminderToAdvicePriorityMap[reminderPriority];
}

/*
 * Transform the data returned from rules invocation into a UI usable common form
 *
 * @param {object} adviceList List of json objects containing advice information
 * @param {object} common List of transformed advice information objects
 */
function transformAdviceList(adviceList, common) {
    if (nullchecker.isNullish(adviceList)) {
        return;
    }
    _.forEach(adviceList, function(advice, index) {
        var item = {};
        item.id = 'advice' + index;
        item.priority = advice.priority;
        item.title = advice.title;
        item.details = advice.details;
        item.type = advice.type;
        item.dueDate = '';
        item.doneDate = '';
        item.interactive = true; // interactive advice
        common.push(item);
    });
}
/*
 * Transform the data returned from the Work Products store into a UI usable common form
 *
 * @param {object} wpList List of json objects containing work product information
 * @param {object} common List of transformed advice information objects
 */
function transformWorkProductList(wpList, common) {
    if (nullchecker.isNullish(wpList)) {
        return;
    }
    _.forEach(wpList, function(wp) {
        var item = {};
        item.id = wp.id;
        item.priority = wp.priority;
        item.title = wp.title;
        item.details = {
            detail: wp.details.detail,
            provenance: wp.details.provenance
        };
        item.type = wp.type;
        item.dueDate = '';
        item.doneDate = '';
        item.interactive = false; // offline generated advice
        common.push(item);
    });
}
/*
 *  Transform the data returned from clinical reminders into a UI usable common form
 *
 * @param {object} reminders List of json objects containing advice information
 * @param {object} common List of transformed advice information objects
 */
function transformReminders(reminders, common) {
    if (nullchecker.isNullish(reminders)) {
        return;
    }
    _.forEach(reminders, function(reminder) {
        var item = {};
        item.id = reminder.reminderId;
        item.priority = mapToAdvicePriority(reminder.priority); // Priority
        item.title = reminder.title;
        item.details = null;
        item.type = 'reminder'; // Reminder
        item.dueDate = reminder.dueDate;
        item.doneDate = reminder.doneDate;
        item.interactive = true; // interactive advice
        common.push(item);
    });
}

/*
 * Merge the advice and reminders lists
 *
 * @param {array} adviceList List of json objects containing advice information
 * @param {array} reminders List of json objects containing advice information
 * @param {array} workProducts List of json objects containing work product information
 */
function mergeLists(adviceList, reminders, workProducts) {
    var merged = [];
    transformAdviceList(adviceList, merged);
    transformReminders(reminders, merged);
    transformWorkProductList(workProducts, merged);
    return merged;
}
/*
 * Make an RPC call to retrieve clinical reminders. Uses the site id that is stored in the user session.
 *
 * @param {object} req The HTTP request object
 * @param {object} res The HTTP response object
 * @param {callback} next The next function
 * @param {string} pid The user identfier
 * @param {callback} callback The provided callback when complete
 */
function getClinicalRemindersList(req, res, next, pid, callback) {
    if (!dd(req)('interceptorResults')('patientIdentifiers')('dfn').exists) {
        req.logger.error('CDS Advice - Error retrieving clinical reminders, DFN is nullish.');
        return callback(null, []); // Return empty list here!
    }
    req.logger.info('retrieve clinical reminder list');
    var dfn = req.interceptorResults.patientIdentifiers.dfn;
    req.logger.debug('DFN: ' + dfn);
    var vistaConfig = getVistaRpcConfiguration(req.app.config, req.session.user.site, req.session.user);

    RpcClient.callRpc(req.logger, vistaConfig, 'ORQQPX REMINDERS LIST', [RpcParameter.literal(dfn)], function(error, result) {
        if (error) {
            req.logger.error(errorVistaJSCallback + error);
            return callback(null, []); // Return empty list here!
        }
        req.logger.info('Successfully retrieved clinical reminder list from VistA.');

        var reminders = result.split('\r\n');
        var items = [];

        _.forEach(reminders, function(reminder) {
            if (nullchecker.isNullish(reminder)) {
                return;
            }
            // Reminders coming from Vista have the following pattern: {id}^{title}^{dueDate|'DUE NOW'}^{doneDate}....
            // ex.  500047^Hepatitis C risk Factor Screening^DUE NOW^^2^1^1^^^^0

            /**
             * ActiveReminder string format:
             *
             * IEN^PRINT NAME^DUE DATE/TIME^LAST OCCURENCE DATE/TIME^PRIORITY^DUE^DIALOG
             *
             * where    PRIORITY 1=High, 2=Normal, 3=Low
             *          DUE      0=Applicable, 1=Due, 2=Not Applicable
             *
             * ex. 500047^Hepatitis C risk Factor Screening^DUE NOW^^2^1^1^^^^0
             *
             * Source: CPRS code analysis by Seth Gainey
             */
            var reminderParts = reminder.split('^');
            var item = {
                reminderId: reminderParts[0],
                title: reminderParts[1],
                priority: reminderParts[4]
            };

            var dueDateStr = reminderParts[2];
            if (!dueDateStr) {
                item.dueDate = '';
            } else if (dueDateStr === 'DUE NOW') {
                item.dueDate = filemanDateUtil.getVprDateTime(filemanDateUtil.getFilemanDateTime(new Date()));
            } else {
                item.dueDate = filemanDateUtil.getVprDateTime(dueDateStr);
            }
            var doneDateStr = reminderParts[3];
            if (!doneDateStr) {
                item.doneDate = '';
            } else {
                item.doneDate = filemanDateUtil.getVprDateTime(doneDateStr);
            }
            items.push(item);
        });
        callback(null, items);
    });
}

/*
 * Make a REST call into the CDS Invocation service to retrieve advice
 *
 * @param {object} req The HTTP request object
 * @param {object} res The HTTP response object
 * @param {string} pid The user identfier
 * @param {string} use The use request code
 * @param {callback} The provided callback when complete
 */
function getRulesResultsList(req, res, pid, use, callback) {

    if (!dd(req.app)('subsystems')('cds')('isCDSMongoServerConfigured').exists || !req.app.subsystems.cds.isCDSMongoServerConfigured()) {
        return callback(null, []);
    }

    var content = {
        context: {
            patientId: pid,
            userId: req.session.user.username, // req.session.user.duz[0],
            siteId: req.session.user.site,
            credentials: '11111' // req.session.cookie
        },
        reason: use
    };

    var config = {
        timeout: 50000,
        logger: req.logger,
        baseUrl: req.app.subsystems.cds.getInvocationUrl(),
        url: '/cds-results-service/rest/invokeRulesForPatient',
        body: content
    };

    req.logger.info('CDS Advice - service post called');
    httpUtil.post(config, function(err, response, body) {
        req.logger.debug('callback from fetch()');

        if (err || !body) {
            // there was an error calling the invocationserver
            req.logger.debug({
                invocationError: err
            }, 'CDS Advice: cds invocation server returned error');
            return callback(null, []); // Return empty list here!
        }
        if (body.status && body.status.code !== '0' /* 0 == OK*/ ) {
            var invocationError = getInvocationError(body.status.info);
            // HTTP request was successful but the CDS Invocation service reported an error.
            req.logger.debug({
                invocationError: invocationError
            }, 'CDS Advice: cds invocation server returned error');
            return callback(null, []); // Return empty list here!
        }
        return callback(null, body.results || []); // send empty list if results is null
    });
}

/*
 * Retrieve the status from the invocation result
 *
 * @param {object} info the returned payload from an invocation call
 */
function getInvocationError(info) {
    return _.map(info, function(o) {
        return o.text;
    }).join(' ');
}

/**
 * Make asynchronous calls for cds advice, clinical reminders and cds work products
 *
 * @api {get} /resource/cds/advice/list?pid=123VQWE&use=test&readStatus=true Request CDS Advice list
 *
 * @apiName AdviceList
 * @apiGroup CDS Advice
 *
 * @apiparam {string} pid The patient identifier
 * @apiparam {string} use The CDS Use (Intent)
 * @apiparam {string} readStatus The advice read status
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *          "data": {
 *              "items": [
 *              {
 *                  "id": "500047",
 *                  "priority": 0,
 *                  "title": "Hepatitis C risk Factor Screening",
 *                  "details": null,
 *                  "type": "reminder",
 *                  "dueDate": "20150521142600",
 *                  "doneDate": "",
 *                  "interactive": true
 *              }
 *              ]
 *          }
 *      }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *        CDS Advice - missing or null parameters
 *     }
 */
function getCDSAdviceList(req, res, next) {
    req.logger.info('CDS Advice - list resource GET called');

    var pid = req.param('pid');
    var use = req.param('use');
    var useCachedValue = req.param('cache');
    var readStatus = req.param('readStatus');

    req.logger.debug('PID: ' + pid);
    req.logger.debug('USE: ' + use);
    req.logger.debug('USE CACHED RESULTS: ' + useCachedValue);
    req.logger.debug('READSTATUS: ' + readStatus);

    // Audit this access
    req.audit.dataDomain = 'CDS';
    req.audit.logCategory = 'ADVICE';
    req.audit.patientId = pid;
    auditUtil.addAdditionalMessage(req, 'use', use);
    auditUtil.addAdditionalMessage(req, 'cache', useCachedValue);

    if (nullchecker.isNullish(pid) || nullchecker.isNullish(use)) {
        req.logger.error('CDS Advice - missing or null parameters');
        return res.status(rdk.httpstatus.bad_request).rdkSend('CDS Advice - missing or null parameters');
    }

    //if we scope this to the session, we can get it here: 'req.session.id';
    var cachedObj = adviceCache.get(req.session.id, pid, use);

    if (useCachedValue === 'true' && cachedObj && cachedObj.readStatus === readStatus) {
        req.logger.debug({
            sessionId: req.session.id,
            pid: pid,
            use: use,
            value: cachedObj.data
        }, 'CDS Advice cache hit');
        return res.status(rdk.httpstatus.ok).rdkSend(cachedObj.data);
    }
    async.parallel([

            function(callback) {
                getRulesResultsList(req, res, pid, use, callback);
            },
            function(callback) {
                getClinicalRemindersList(req, res, next, pid, callback);
            },
            function(callback) {
                var provider = getKeyValue(req.session.user.duz);
                cdsWorkProduct.retrieveWorkProductsForProvider(req, provider, pid, readStatus, callback);
            }
        ],

        function(err, results) {
            if (err) {
                return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
            }
            var mergedList = mergeLists(results[0], results[1], results[2]);
            var responseBody = {
                data: {
                    items: mergedList
                }
            };
            adviceCache.set(req.session.id, pid, use, mergedList, readStatus);

            return res.status(rdk.httpstatus.ok).rdkSend(responseBody);
        }
    );
}


/**
 * @api {put} /resource/cds/advice/read-status Set read status
 * @apiName setReadStatus
 * @apiGroup CDS Advice
 *
 * @apiParam {String} id The id of the work product.
 * @apiParam {String} readStatus The readStatus of the workproduct.  Supported values are 'true' and 'false'.
 *
 * @apiDescription Sets the 'read' status of an assigned work product in the database.
 *
 * NOTE: This method calls code in cds-work-product.js, as that is the appropriate place for the business logic
 * to reside.  For more information, see the method in cdsWorkProduct that has the same name.  This method is secured
 * and the read status is set for the authenticated user.
 *
 * @apiSuccess {json} data Json object containing a one for successful match and update, zero if there was no record to update.
 *
 * @apiError (Error 500) Unable to connect to data store.
 * @apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 * {
 *     "code": "ETIMEDOUT"
 * }
 */
function setReadStatus(req, res) {
    req.logger.info('CDS Advice - setReadStatus resource POST called');

    var id = req.param('id');
    var readStatus = req.param('value');
    var provider = getKeyValue(req.session.user.duz);

    req.logger.debug('ID: ' + id);
    req.logger.debug('READSTATUS: ' + readStatus);
    req.logger.debug('PROVIDER: ' + provider);

    if (nullchecker.isNullish(id) || nullchecker.isNullish(readStatus) || nullchecker.isNullish(provider)) {
        var error = 'Missing required parameters. The following parameters are required: id, value.';
        req.logger.error('CDS Read Status - ' + error);
        return res.status(rdk.httpstatus.bad_request).rdkSend(error);
    }
    cdsWorkProduct.setReadStatus(id, readStatus, provider, function(body, error) {
        if (error) {
            req.logger.error('CDS Read Status - ' + error);
            return res.status(rdk.httpstatus.not_found).rdkSend(error);
        }
        return res.status(rdk.httpstatus.ok).rdkSend(body);
    });
}

function getKeyValue(obj) {
    var property;
    if (obj !== null) {
        for (property in obj) {
            if (property !== undefined) {
                return property + ':' + obj[property];
            }
        }
    }
    return 'BAD OBJECT';
}

module.exports.getCDSAdviceList = getCDSAdviceList;
module.exports.setReadStatus = setReadStatus;
