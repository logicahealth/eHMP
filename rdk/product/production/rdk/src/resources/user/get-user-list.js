'use strict';

var jdsFilter = require('jds-filter');
var querystring = require('querystring');
var rdk = require('../../core/rdk');
var nullChecker = rdk.utils.nullchecker;
var httpUtil = rdk.utils.http;
var _ = require('lodash');
var userUtil = require('./user-whitelist');
var pjds = rdk.utils.pjdsStore;

var users = {};

users.getUserList = function(req, res) {
    if (req.param('fetchEmptyCollection') && req.param('fetchEmptyCollection') === 'true') {
        return res.status(rdk.httpstatus.ok).rdkSend([]);
    }
    var vistaSites = req.app.config.vistaSites;
    var ehmpUsers;
    var reqFilterParameters = req.param('user.filter');
    /* set paging options */
    var start = null;
    var limit = null;
    var page = null;
    var usePaging = false;
    if (!_.isUndefined(req.param('start'))) {
        start = parseInt(req.param('start'));
    }
    if (!_.isUndefined(req.param('limit'))) {
        limit = parseInt(req.param('limit'));
    }
    if (!_.isUndefined(req.param('page'))) {
        page = parseInt(req.param('page'));
    }
    if ((start !== null && limit !== null) || (page !== null && limit !== null)) {
        usePaging = true;
    }

    try {
        reqFilterParameters = JSON.parse(reqFilterParameters);
    } catch (exception) {
        return res.status(rdk.httpstatus.internal_server_error).rdkSend('cannot parse filter parameters');
    }
    var processResults = function(err, response, result) {
        if (err) {
            req.logger
                .error('An error occured in pep while gathering data from JDS' + err);
            return res.status(err.status || 500).rdkSend('An error occured in pep while gathering user list data.');
        } else if (!_.get(result, 'data.items')) {
            req.logger.debug('JDS did not provide a list of user items.');
            return res.status(rdk.httpstatus.internal_server_error).rdkSend('Expected Conditions were not met for a list of users');
        }
        var whiteListUsers = [];
        var currentModifyingUser = req.session.user;
        result.data.items = _.filter(result.data.items, function(user) {
            var uidParts = user.uid.split(':');
            var site = uidParts[3];
            if (site === currentModifyingUser.site) {
                return true;
            }
            return false;
        });
        var errorLooping = false;
        _.each(result.data.items, function(user, index) {
            if (errorLooping) {
                return;
            }
            try {
                var name = user.name.split(',');
                var uidParts = user.uid.split(':');
                user.lname = name[0];
                user.fname = name[1];
                user.site = uidParts[3];
                user.duz = user.localId || uidParts[4];
                user.facility = vistaSites[user.site].name;
            } catch (exception) {
                errorLooping = true;
                req.logger.error({
                    exception: exception,
                    user: user
                }, 'Error reading user information');
                return res.status(rdk.httpstatus.internal_server_error).rdkSend('Error retrieving user from database');
            }
            if (nullChecker.isNullish(user.uid)) {
                errorLooping = true;
                return res.status(rdk.httpstatus.bad_request).rdkSend('User uid missing from request');
            }
            /* TODO remove once there is first and last name fields in JDS */
            if (!_.isUndefined(reqFilterParameters.firstName) && user.fname.toLowerCase().indexOf(reqFilterParameters.firstName.toLowerCase()) <= -1) {
                return;
            }
            if (!_.isUndefined(reqFilterParameters.lastName) && user.lname.toLowerCase().indexOf(reqFilterParameters.lastName.toLowerCase()) <= -1) {
                return;
            }

            user.vistaStatus = 'active';
            if (user.disuser || user.terminated) {
                user.vistaStatus = 'inactive';
            }
            user.permissionSets = {
                val: [],
                modifiedBy: null,
                modifiedOn: null
            };
            user.ehmpStatus = 'inactive';
            _.each(ehmpUsers, function(ehmpUser) {
                if (ehmpUser.uid === user.uid) {
                    user.permissionSets = ehmpUser.permissionSet;
                    var hasPermissionSets = _.size(_.get(ehmpUser, 'permissionSet.val', [])) > 0;
                    var hasAdditionalPermissions = _.size(_.get(ehmpUser, 'permissionSet.additionalPermissions', [])) > 0;
                    if (hasPermissionSets || hasAdditionalPermissions) {
                        user.ehmpStatus = 'active';
                    }
                }
            });
            var showVistaInactive = (req.param('show.vista.inactive') && req.param('show.vista.inactive') === 'true');
            var showEhmpInactive = (req.param('show.ehmp.inactive') && req.param('show.ehmp.inactive') === 'true');
            var addUserToWhiteList = (showVistaInactive && user.vistaStatus === 'inactive') ||
                (showEhmpInactive && user.ehmpStatus === 'inactive') ||
                (user.vistaStatus === 'active' && user.ehmpStatus === 'active');
            var exactMatchCount = 0;
            if (!_.isUndefined(reqFilterParameters.firstName)) {
                if (user.fname.toLowerCase() === reqFilterParameters.firstName.toLowerCase()) {
                    exactMatchCount++;
                } else if ((user.fname.length > reqFilterParameters.firstName.length) && (user.fname.toLowerCase().substring(0, reqFilterParameters.firstName.length) === reqFilterParameters.firstName.toLowerCase())) {
                    exactMatchCount += 0.5;
                }
            }
            if (!_.isUndefined(reqFilterParameters.lastName)) {
                if (user.lname.toLowerCase() === reqFilterParameters.lastName.toLowerCase()) {
                    exactMatchCount++;
                } else if ((user.lname.length > reqFilterParameters.lastName.length) && (user.lname.toLowerCase().substring(0, reqFilterParameters.lastName.length) === reqFilterParameters.lastName.toLowerCase())) {
                    exactMatchCount += 0.5;
                }
            }
            if (!_.isUndefined(reqFilterParameters.permissionSet) &&
                !_.isUndefined(_.find(user.permissionSets, reqFilterParameters.permissionSet))) {
                exactMatchCount++;
            }
            if (!_.isUndefined(reqFilterParameters.duz) &&
                _(user.duz).toString() === _(reqFilterParameters.duz).toString()) {
                exactMatchCount++;
            }
            user.exactMatchCount = exactMatchCount;
            if (reqFilterParameters.permissionSet) {
                if ((_.contains(user.permissionSets.val, reqFilterParameters.permissionSet)) && addUserToWhiteList) {
                    whiteListUsers.push(userUtil.sanitizeUser(user, userUtil.userListWhitelist));
                }
            } else {
                if (addUserToWhiteList) {
                    whiteListUsers.push(userUtil.sanitizeUser(user, userUtil.userListWhitelist));
                }
            }
        });
        whiteListUsers = _.sortBy(whiteListUsers, function(user) {
            return -user.exactMatchCount;
        });
        req.logger.trace({
            users: whiteListUsers
        }, 'sorted user list');
        if (usePaging === true) {
            var totalPages = Math.ceil(whiteListUsers.length / limit);
            if (page > totalPages) {
                page = totalPages;
            } else if (page < 1) {
                page = 1;
            }
            if (start === null) {
                start = limit * (page - 1);
            }
            if (page === null) {
                page = (start / limit) + 1;
            }
            var nextPage = page + 1;
            var previousPage = page - 1;
            if (nextPage > totalPages) {
                nextPage = 1;
            }
            if (previousPage < 1) {
                previousPage = totalPages;
            }
            var nextPageResults = whiteListUsers.slice(start, start + limit);
            var firstUser = nextPageResults[0];
            if (!_.isUndefined(firstUser)) {
                var end = start + limit - 1;
                var nextStart = end + 1;
                var previousStart = start - limit;
                if (previousStart < 0) {
                    previousStart = Math.floor(whiteListUsers.length / limit) * limit;
                    if (whiteListUsers.length === limit) {
                        previousStart = 0;
                    }
                }

                if (whiteListUsers.length - 1 <= end) {
                    end = whiteListUsers.length - 1;
                    nextStart = 0;
                }
                var message = 'Showing results ' + (start + 1) + ' - ' + (end + 1) + ' of ' + whiteListUsers.length;
                firstUser.paging_data = {
                    nextStart: nextStart,
                    previousStart: previousStart,
                    currentStart: start,
                    nextPage: nextPage,
                    previousPage: previousPage,
                    currentPage: page,
                    totalPages: totalPages,
                    message: message
                };
                firstUser.has_paging_data = true;
            }
            return res.status(rdk.httpstatus.ok).rdkSend(nextPageResults);
        }
        return res.status(rdk.httpstatus.ok).rdkSend(whiteListUsers);
    };
    var pjdsOptions = {
        store: 'ehmpusers',
        indexName: 'ehmpusers_uid',
        range: 'urn:va:user:' + req.session.user.site + '*'
    };
    pjds.get(req, res, pjdsOptions, function(error, response) {
        if (error) {
            return res.status(rdk.httpstatus.bad_request).rdkSend(error.message);
        }
        ehmpUsers = response.data.items;
        var jdsFilterObject = [];

        var reqFilterParameters = req.param('user.filter');
        if (_.isString(reqFilterParameters)) {
            try {
                reqFilterParameters = JSON.parse(reqFilterParameters);
            } catch (error) {
                return res.status(rdk.httpstatus.internal_server_error).rdkSend(error);
            }
        }

        if (!reqFilterParameters) {
            return res.status(rdk.httpstatus.bad_request).rdkSend('No Search Criteria defined. Please be more specific in your search criteria.');
        }
        var reqFilterParametersModelIds = _.keys(reqFilterParameters);
        var hasDuz = !_.isUndefined(reqFilterParameters.duz);
        var hasOneSearchCriteriaField = (reqFilterParametersModelIds.length >= 1);
        var hasValidFilterCriteria = hasOneSearchCriteriaField || hasDuz;
        if (!hasValidFilterCriteria) {
            return res.status(rdk.httpstatus.bad_request).rdkSend('Insufficiant Search Criteria. Please be more specific in your search criteria.');
        }
        _.each(reqFilterParameters, function(value, key) {
            if (key !== 'permissionSet') {
                if (key === 'lastName' || key === 'firstName') {
                    jdsFilterObject.push(['ilike', 'name', '%' + value + '%']);
                } else if (key === 'duz') {
                    jdsFilterObject.push(['or', ['eq', 'localId', value],
                        ['ilike', 'uid', '%' + value + '%']
                    ]);
                } else {
                    jdsFilterObject.push(['ilike', key, '%' + value + '%']);
                }
            }
        });
        if (!req.param('show.vista.inactive') || req.param('show.vista.inactive') === 'false') {
            jdsFilterObject.push(['ne', 'disuser', 'true']);
            jdsFilterObject.push(['ne', 'terminated', 'true']);
        }
        var jdsFilterPath = jdsFilter.build(jdsFilterObject);
        var jdsQuery = {
            filter: jdsFilterPath,
            order: 'name asc'
        };

        if (_.has(req.session, 'user.site')) {
            jdsQuery.range = 'urn:va:user:' + req.session.user.site + ':*';
        }

        var jdsPath = '/data/index/user-uid' + '?' + querystring.stringify(jdsQuery);
        var jdsConfig = req.app.config.jdsServer;
        var httpConfig = {
            logger: req.logger,
            baseUrl: jdsConfig.baseUrl,
            url: jdsPath,
            json: true
        };

        httpUtil.get(httpConfig, processResults);


    });
};
module.exports = users;
