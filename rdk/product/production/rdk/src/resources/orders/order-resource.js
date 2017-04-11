'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');
var moment = require('moment');
var querystring = require('querystring');
var clinicalObjectSubsystem = require('../../subsystems/clinical-objects/clinical-objects-subsystem');
var UidUtil = require('../../utils/uid-utils');
var QUERY_ENTERED_STRING = 'entered';

function getResourceConfig(app) {
    return [{
        name: 'all-orders',
        path: '/all-orders',
        get: getOrders,
        interceptors: {
            jdsFilter: true,
            convertPid: true
        },
        requiredPermissions: ['read-order'],
        isPatientCentric: true
    }];
}

function getQueryDates(query) {
    // Return the query end date otherwise just return empty.
    if (_.isEmpty(query) && query.indexOf(QUERY_ENTERED_STRING) === -1) {
        return {};
    }
    // The query end date is pulled from a query that looks like: between(\"entered\",\"20160607\",\"20160608235959\")
    var qArray = query.replace(/\"|\'|\)|\(/g, '').split(',');
    return {
        qEndDate: qArray.pop(),
        qStartDate: qArray.pop()
    };
}

function getOrders(req, res) {
    req.logger.debug('Orders resource GET called');
    var pid = req.query.pid;
    var loadReference;
    var emptyString = '';
    var jdsResource = '/vpr/' + pid + '/index/order';
    var jdsQuery = _.pick(req.query, 'start', 'limit', 'filter', 'order');
    var jdsPath = jdsResource + '?' + querystring.stringify(jdsQuery);
    var options = _.extend({}, req.app.config.jdsServer, {
        url: jdsPath,
        logger: req.logger,
        json: true
    });

    var patientIdentifiers = _.get(req, 'interceptorResults.patientIdentifiers', {});
    var patientUids = _.get(patientIdentifiers, 'uids', []);
    var patientUid;
    if (_.isUndefined(patientIdentifiers.dfn) && _.isUndefined(patientIdentifiers.icn)) {
        req.logger.debug('getOrders - Patient dfn or icn not found on interceptor results');
        return res.status(rdk.httpstatus.precondition_failed).rdkSend('Patient dfn or icn not found on interceptor results');
    }
    if (_.isEmpty(patientUids)) {
        req.logger.debug('getOrders - Patient uids not found on interceptor results');
        return res.status(rdk.httpstatus.precondition_failed).rdkSend('Patient uids not found on interceptor results');
    }
    if (patientIdentifiers.dfn && patientIdentifiers.site) {
        patientUid = UidUtil.getSiteDfnUidFromUidArray(req);
    } else if (patientIdentifiers.icn) {
        patientUid = UidUtil.getIcnUidFromUidArray(req);
    }
    if (_.isUndefined(patientUid)) {
        req.logger.debug('getOrders - Patient uid not found in interceptor results uids array');
        return res.status(rdk.httpstatus.precondition_failed).rdkSend('Patient uid not found in interceptor results uids array');
    }

    var qDates = getQueryDates(req.query.filter);
    var pjdsFilter = {
        ehmpState: 'active',
        patientUid: patientUid,
        domain: 'ehmp-activity',
        subDomain: 'consult',
        qStartDate: (!_.isEmpty(qDates)) ? qDates.qStartDate : '',
        qEndDate: (!_.isEmpty(qDates)) ? qDates.qEndDate : '',
    };
    var ehmpJdsOrders;

    rdk.utils.http.get(options, function(err, jdsResponse, data) {
        // Return 500 immediately if err.
        if (err) {
            return res.status(500).rdkSend(err);
        }
        parseJdsOrders(jdsResponse);
        // Process the clinical object subsystem.
        clinicalObjectSubsystem.find(req.logger, req.app.config, pjdsFilter, loadReference, function(err, pjdsResponse) {
            if (pjdsResponse && !_.isEmpty(pjdsResponse.items)) {
                // Store filtered items.
                var itemsToRemove = [];
                _.forEach(pjdsResponse.items, function(item, index) {
                    // Filter out item if it's not between the query dates.
                    var deltaStartDate = moment(pjdsFilter.qStartDate).diff(moment(item.creationDateTime), 'days');
                    var deltaEndDate = moment(pjdsFilter.qEndDate).diff(moment(item.creationDateTime), 'days');
                    if (!isNaN(deltaStartDate) && !isNaN(deltaEndDate) && (deltaStartDate > 0 || deltaEndDate < 0)) {
                        itemsToRemove.push(item);
                    } else {
                        // Process valid filtered pjds response.
                        if (!_.isEmpty(item.data) && !_.isEmpty(item.data.order)) {
                            var order = item.data.order;
                            item.displayGroup = 'eHMP CSLT';
                            item.mixedName = order.type ? order.type : emptyString;
                            item.statusName = order.status ? order.status : emptyString;
                            if (order.facility) {
                                item.facilityMoniker = order.facility.name ? order.facility.name : emptyString;
                            }
                            if (order.provider) {
                                item.providerDisplayName = order.provider.displayName ? order.provider.displayName : emptyString;
                            }
                            item.summary = order.orderName ? order.orderName : emptyString;
                            item.name = order.orderName ? order.orderName : emptyString;
                            item.kind = order.type ? order.type : emptyString;
                            item.entered = order.orderDate ? order.orderDate : emptyString;
                            item.start = order.startDate ? order.startDate : emptyString;
                            item.stop = order.stopDate ? order.stopDate : emptyString;
                            item.flag = order.flag ? order.flag : emptyString;
                        }
                    }
                });

                // Return the correct number of pjds and jds items.
                if (pjdsResponse.items.length > 0) {
                    // Remove the filtered items.
                    pjdsResponse.items = _.difference(pjdsResponse.items, itemsToRemove);
                    // Contcatenate return data.
                    ehmpJdsOrders = {
                        items: jdsResponse.body.data.items.concat(pjdsResponse.items)
                    };
                } else {
                    ehmpJdsOrders = jdsResponse.body;
                }
            } else if ((JSON.stringify(err).indexOf(clinicalObjectSubsystem.CLINICAL_OBJECT_NOT_FOUND) > -1) || !pjdsResponse && jdsResponse && !_.isEmpty(jdsResponse.body.data.items)) {
                // Return valid response, including no results.
                ehmpJdsOrders = jdsResponse.body;
            } else if (err) {
                return res.status(500).rdkSend(err);
            }

            return res.status(200).rdkSend(ehmpJdsOrders);
        });
    });
}

function parseJdsOrders(jdsResponse) {
    _.each(jdsResponse.body.data.items, function(order) {
        //Get Signers
        var clinicians = order.clinicians;
        _.each(clinicians, function(clinician) {
            switch (clinician.role) {
                case 'S':
                    order.provider = clinician.name;
                    break;
                case 'N':
                    order.nurse = clinician.name;
                    break;
                case 'C':
                    order.clerk = clinician.name;
                    break;
                case 'R':
                    order.chart = clinician.name;
                    break;
            }
        });

        //Split Long Summary Text
        if (order.summary && order.summary.length > 160) {
            order.shortSummary = order.summary.substr(0, 160);
            order.longSummary = true;
        } else {
            order.shortSummary = order.summary;
            order.longSummary = false;
        }

        //Get Orders Flag
        order.isFlagged = '';
        if (order.orderFlags) {
            if (_.size(order.orderFlags) > 0) {
                var orderFlagsCol = order.orderFlags;
                var lastElement = _.last(orderFlagsCol);
                if (lastElement.orderFlaggedBy) {
                    order.isFlagged = '1';
                }
            }
        }

        //Mark discontinued orders
        if (order.statusName === 'DISCONTINUED') {
            order.isDiscontinuedOrder = true;
        }

        //Re-label Text Orders
        if (order.service === 'OR') {
            order.kind = 'Text Order';
        }
        //Update Status Name
        if (order.statusName) {
            var lStatusName = order.statusName.toLowerCase();
            order.statusName = _.capitalize(lStatusName);
            if (lStatusName === 'complete' || lStatusName === 'completed') {
                order.statusName = 'Completed';
            }
        }
    });
}
/* For Testing */
module.exports._getOrders = getOrders;

module.exports.getResourceConfig = getResourceConfig;
