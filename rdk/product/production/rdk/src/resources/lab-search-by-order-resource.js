'use strict';

var rdk = require('../core/rdk');
var async = require('async');
var querystring = require('querystring');
var _ = require('lodash');
var nullchecker = rdk.utils.nullchecker;
var jdsFilter = require('jds-filter');

FetchError.prototype = Error.prototype;
NotFoundError.prototype = Error.prototype;

function getResourceConfig() {
    return [{
        name: 'patient-record-labsbyorder',
        path: '',
        get: performSearch,
        subsystems: ['patientrecord','jds','solr','jdsSync','authorization'],
        requiredPermissions: ['read-patient-record'],
        isPatientCentric: true
    }];
}

function performSearch(req, res) {
    req.logger.info('perform search for labsearchbyorder resource GET called');
    var config = req.app.config;

    var orderUid = req.param('uid');
    var pid = req.param('pid');
    var start = parseInt(req.param('start')) || 0;
    var limit = parseInt(req.param('limit')) || 0;

    req.audit.patientId = pid;
    req.audit.logCategory = 'RETRIEVE';

    if(nullchecker.isNullish(orderUid)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing uid parameter');
    } else if (nullchecker.isNullish(pid)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing pid parameter');
    }


    req.logger.info('Retrieve pid=%s order=%s from server %s', pid, orderUid, config.jdsServer.baseUrl);

    var paginationData = {};
    async.waterfall(
        [
            function(callback) {
                getOrder(orderUid, pid, req, callback);
            },
            function(order, callback) {
                var labUids = getLabUidsFromOrder(order);
                paginationData.totalItems = labUids.length;
                if(limit > 0) {
                    var end = start + limit;
                    labUids = labUids.slice(start, end);
                    paginationData.startIndex = start;
                    paginationData.itemsPerPage = limit;
                    // (a/b|0) is truncating division
                    paginationData.pageIndex = (start / limit | 0);  // jshint ignore:line
                    paginationData.totalPages = (paginationData.totalItems / limit | 0) + paginationData.totalItems % limit;  // jshint ignore:line
                } else {
                    labUids = labUids.slice(start);
                }
                paginationData.currentItemCount = labUids.length;
                callback(null, labUids);
            },
            function(labUids, callback) {
                getLabs(labUids, pid, req, callback);
            }
        ],
        function(err, labs) {
            if(err instanceof FetchError) {
                req.logger.error(err.message);
                res.status(rdk.httpstatus.internal_server_error).rdkSend('There was an error processing your request. The error has been logged.');
            } else if(err instanceof NotFoundError) {
                res.status(rdk.httpstatus.not_found).rdkSend(err.error);
            } else if(err) {
                res.status(rdk.httpstatus.internal_server_error).rdkSend(err.message);
            } else {
                var response = _.extend({}, paginationData, labs);
                if (req.query.order) {
                    var field = req.query.order.split(' ')[0];
                    var order = req.query.order.split(' ')[1];
                    if (order === 'asc') {
                        response.data.items = _.sortBy(response.data.items, field);
                    } else {
                        response.data.items = _.sortBy(response.data.items, field).reverse();
                    }
                }
                res.rdkSend(response);
            }
        }
    );
}

function getOrder(orderUid, pid, req, callback) {
    var jdsResource = '/vpr/' + pid + '/find/order';
    var jdsQuery = {};

    var filter = [['like', 'uid', orderUid]];
    jdsQuery.filter = jdsFilter.build(filter);
    var jdsQueryString = querystring.stringify(jdsQuery);

    var options = _.extend({}, req.app.config.jdsServer, {
        url: jdsResource + '?' + jdsQueryString,
        logger: req.logger,
        json: true
    });

    rdk.utils.http.get(options, function(error, response, jdsResponse) {
        req.logger.debug('callback from order fetch()');
        if(error) {
            return callback(new FetchError('Error fetching pid=' + pid + ' - ' + (error.message || error), error));
        }
        if (!_.isObject(jdsResponse)) {
            return callback(new FetchError('Error: bad response ' + jdsResponse));
        }
        if('error' in jdsResponse) {
            if(isNotFound(jdsResponse)) {
                return callback(new NotFoundError('Object not found', jdsResponse));
            }
            return callback(new Error('Server error'), jdsResponse);
        }
        return callback(null, jdsResponse);
    });
}

function getLabs(labUids, pid, req, orderCallback) {
    var consolidatedLabs = [];
    async.eachSeries(labUids,
        function(uid, callback) {
            var jdsResource = '/vpr/' + pid + '/find/lab';
            var jdsQuery = querystring.stringify({
                filter: jdsFilter.build([['like', 'uid', uid]])
            });
            var jdsOptions = _.extend({}, req.app.config.jdsServer, {
                url: jdsResource + '?' + jdsQuery,
                logger: req.logger,
                json: true
            });

            rdk.utils.http.get(jdsOptions, function(error, response, jdsResponse) {
                req.logger.debug('callback from lab=%s fetch()', uid);

                if(error) {
                    return callback(new FetchError('Error fetching lab=' + uid + ' - ' + (error.message || error), error));
                } else {
                    if('error' in jdsResponse) {
                        if(isNotFound(jdsResponse)) {
                            return callback(new NotFoundError('Object not found', jdsResponse));
                        }
                        return callback(new Error('Server error'), jdsResponse);
                    }
                    var items = (jdsResponse.data || {}).items || [];
                    _.each(items, function(item) {
                        consolidatedLabs.push(item);
                    });
                    return callback(null);
                }
            });
        },
        function(err) {
            if(err) {
                return orderCallback(err);
            }
            var labData = {
                data: {
                    items: consolidatedLabs
                }
            };
            req.logger.debug({labData: labData}, 'responseObject');
            return orderCallback(null, labData);
        }
    );
}

function FetchError(message, error) {
    this.name = 'FetchError';
    this.error = error;
    this.message = message;
}

function NotFoundError(message, error) {
    this.name = 'NotFoundError';
    this.error = error;
    this.message = message;
}

function getLabUidsFromOrder(jsonOrder) {
    var labs = [];
    var items = (jsonOrder.data || {}).items || [];
    _.each(items, function(item) {
        var results = item.results || [];
        _.each(results, function(result) {
            if(result.uid) {
                labs.push(result.uid);
            }
        });
    });
    return labs;
}

function isNotFound(obj) {
    return ('code' in obj.error && String(obj.error.code) === String(rdk.httpstatus.not_found));
}

module.exports.getResourceConfig = getResourceConfig;
