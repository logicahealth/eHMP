'use strict';

var _ = require('lodash');
var async = require('async');
var jdsFilter = require('jds-filter');
var querystring = require('querystring');
var userUtil = require('./user-whitelist');
var rdk = require('../../core/rdk');
var nullChecker = rdk.utils.nullchecker;
var httpUtil = rdk.utils.http;
var RdkError = rdk.utils.RdkError;
var pjds = rdk.utils.pjdsStore;
var pjdsUtil = rdk.utils.pjdsUtil;

var users = {};

/**
 * Utility function to parse a string
 * * JSON.parse is known to cause the optimizer to disregard any functions it is within scope of
 * @param {Object} logger
 * @param {string} string - representation of json data as a string
 * @return {string}
 */
var parseString = function(logger, string) {
    var itemToReturn;
    try {
        itemToReturn = JSON.parse(string);
    } catch (error) {
        itemToReturn = new RdkError({
            code: '200.400.1021',
            logger: logger,
            error: error
        });
    }
    return itemToReturn;
};

/**
 * Gets the matching count for just the name section.
 * @param {string} userName
 * @param {string} filterName
 * @returns {number}
 */
var getNameMatchCount = function (userName, filterName) {
    var matchCount = 0;
    if (_.isString(userName) && _.isString(filterName)) {
        //note the regex is not global, it's meant to match from the beginning
        var regex = new RegExp(filterName, 'i');
        if (userName.search(regex) === _.size(userName)) {
            matchCount += 1;
        } else if (regex.test(userName)) {
            matchCount += 0.5;
        }
    }
    return matchCount;
};

/**
 * Gets the matching count for a user based on the filterParameters passed in the request.
 * @param {Object} user - the user returned from jds and pjds combination
 * @param {Object} filterParameters
 * @param {string} filterParameters.firstName
 * @param {string} filterParameters.lastName
 * @param {string} filterParameters.permissionSet
 * @returns {number}
 */
var getUserMatchCount = function (user, filterParameters) {
    var exactMatchCount = 0;
    var firstNameFilter = _.get(filterParameters, 'firstName');
    var lastNameFilter = _.get(filterParameters, 'lastName');
    var filterPermissionSet = _.get(filterParameters, 'permissionSet');
    var filterDuz = _.get(filterParameters, 'duz');
    var userFirstName = _.get(user, 'fname');
    var userLastName = _.get(user, 'lname');
    var userDuz = _.get(user, 'duz');
    var userPermissionSet = _.get(user, 'permissionSets');

    exactMatchCount += getNameMatchCount(userFirstName, firstNameFilter);
    exactMatchCount += getNameMatchCount(userLastName, lastNameFilter);
    if (!_.isUndefined(_.includes(userPermissionSet, filterPermissionSet))) {
        exactMatchCount += 1;
    }
    if (_.isEqual(userDuz, filterDuz)) {
        exactMatchCount += 1;
    }
    return exactMatchCount;
};

/**
 * Gets the proper number of users to return per page. Users are expected be sorted appropriately before being passed to this function.
 * @param {Object} req
 * @param {string} [req.query.start] - array index start number
 * @param {string} [req.query.page=1] - current page number of query
 * @param {string} [req.query.limit] - total number to return per request. Optional only if no paging is desired.
 * @param {Array} users - list of users to process again paging limits
 */
var processPagingUsers = function (req, users) {
    /* set paging options */
    var start = pjdsUtil.getRequestParameter(req, 'start', null);
    var limit = pjdsUtil.getRequestParameter(req, 'limit', null);
    var page = pjdsUtil.getRequestParameter(req, 'page', null);
    var userCount = _.size(users);
    if (!_.isNull(start)) {
        start = parseInt(start);
    }
    if (!_.isNull(limit)) {
        limit = parseInt(limit);
    }
    if (!_.isNull(page)) {
        page = parseInt(page);
    }
    req.logger.debug({
        start: start,
        limit: limit,
        page: page,
        userCount: userCount
    }, 'processPagingUsers paging inputs');
    if (limit && (page || start)) {
        var totalPages = Math.ceil(userCount / limit);
        if (page > totalPages) {
            page = totalPages;
        } else if (page < 1) {
            page = 1;
        }
        if (!_.isFinite(page)) {
            page = (start / limit) + 1;
        }
        if (!_.isFinite(start)) {
            start = limit * (page - 1);
        }
        req.logger.debug({
            start: start,
            limit: limit,
            page: page,
            totalPages: totalPages
        }, 'processPagingUsers paging stats');
        var nextPage = page + 1;
        var previousPage = page - 1;
        if (nextPage > totalPages) {
            nextPage = 1;
        }
        if (previousPage < 1) {
            previousPage = totalPages;
        }
        var nextPageResults = users.slice(start, start + limit);
        var firstUser = nextPageResults[0];
        if (!_.isUndefined(firstUser)) {
            var end = start + limit - 1;
            var nextStart = end + 1;
            var previousStart = start - limit;
            if (previousStart < 0) {
                previousStart = Math.floor(users.length / limit) * limit;
                if (users.length === limit) {
                    previousStart = 0;
                }
            }

            if (users.length - 1 <= end) {
                end = users.length - 1;
                nextStart = 0;
            }
            var message = 'Showing results ' + (start + 1) + ' - ' + (end + 1) + ' of ' + users.length;
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
        return nextPageResults;
    }
    return users;
};

/**
 * process the results of the async.parallel search call to get users data
 * @param {Object|null} errors - any errors during parallel async call to pjds and jds for user data
 * @param {Object|null} results - results of user data from parallel async call to pjds and jds
 * @param {Object} req
 * @param {*} res
 * @return {Object|Error} - a return object or an error is sent back to the client
 */
var processResults = function (errors, results, req, res) {
    var jdsUserData = _.get(results, 'jdsUserData.data.items');
    var ehmpUsers = _.get(results, 'ehmpUsers.data.items');

    if (errors) {
        req.logger
            .error('An error occured processing the results of user data' + errors);
        return res.status(500).rdkSend('An error occured processing the results of user data.');
    } else if (!ehmpUsers) {
        req.logger.debug('pJDS did not provide a list of user items.');
        return res.status(rdk.httpstatus.internal_server_error).rdkSend('Expected pJDS Conditions were not met for a list of users');
    } else if (!jdsUserData) {
        req.logger.debug('JDS did not provide a list of user items.');
        return res.status(rdk.httpstatus.internal_server_error).rdkSend('Expected JDS Conditions were not met for a list of users');
    }

    req.logger.info({
        ehmp: _.size(ehmpUsers),
        jds: _.size(jdsUserData)
    }, 'Retreived User Count');

    var whiteListUsers = [];
    var currentModifyingUser = _.get(req, 'session.user');
    var errorUsers = [];
    var reqFilterParameters = req.filterParameters;

    _.each(jdsUserData, function (user, index) {
        if (nullChecker.isNullish(user.uid)) {
            errorUsers.push(user);
            req.logger.error({
                user: user
            }, 'JDS User Information had no UID to evaluate');
            return;
        }
        req.logger.debug(user, 'JDS user data');
        var name = _.get(user, 'name', '').split(',');
        var uidParts = _.get(user, 'uid', '').split(':');
        //we need a first and last name and the third and fourth part of a uid
        if (_.size(name) < 2 || _.size(uidParts) < 4) {
            errorUsers.push(user);
            req.logger.error({
                user: user
            }, 'Error Reading JDS User Information');
            return;
        }

        user.lname = name[0] || '';
        user.fname = name[1] || '';
        user.site = uidParts[3] || '';
        user.duz = user.localId || uidParts[4] || '';
        user.facility = ''; //can not be determined at this time as we are getting ALL users at the site regardless of division
        /**
         * Currently we are not given the user's division from JDS so we can not look up the proper site name
         * this could be valid if we had divisions stored in JDS
         *
         * user.facility = _.result(_.find(_.get(vistaSites, [user.site, 'division']), function(division) {
         *     return division.id === user.division;
         * }, 'name'));
         */

        if (uidParts[3] !== currentModifyingUser.site) {
            errorUsers.push(user);
            req.logger.error({
                user: user
            }, 'JDS User did not match users current site');
            return;
        }
        /* TODO remove once there is first and last name fields in JDS */
        if (!_.isUndefined(_.get(reqFilterParameters, 'firstName')) && getNameMatchCount(user.fname, reqFilterParameters.firstName) < 0) {
            errorUsers.push(user);
            req.logger.error({
                user: user
            }, 'The first name does not match the requested name');
            return;
        }
        if (!_.isUndefined(_.get(reqFilterParameters, 'lastName')) && getNameMatchCount(user.lname, reqFilterParameters.lastName) < 0) {
            errorUsers.push(user);
            req.logger.error({
                user: user
            }, 'The last name does not match the requested name');
            return;
        }

        user.vistaStatus = 'active';
        if (user.disuser || user.terminated) {
            user.vistaStatus = 'inactive';
        }
        _.set(user, 'status', _.get(user, 'status', 'inactive'));

        var ehmpUserDefaults = _.get(pjds.getDefaults(), 'user');
        /* DE8406 override default '' uid */
        _.set(ehmpUserDefaults, 'uid', _.get(user, 'uid', ''));

        var ehmpUser = _.find(ehmpUsers, 'uid', user.uid) || ehmpUserDefaults;
        _.extend(user, ehmpUser); //map the ehmpUser data to the jds user data.
        if (ehmpUser) {
            // code needed for legacy users that did not have a status set in eHMP r1.2
            var hasPermissionSets = _.size(_.get(ehmpUser, 'permissionSet.val', [])) > 0;
            var hasAdditionalPermissions = _.size(_.get(ehmpUser, 'permissionSet.additionalPermissions', [])) > 0;
            if (hasPermissionSets) {
                //set permissionSets for match count later in process
                _.set(user, 'permissionSets', _.get(ehmpUser, 'permissionSet.val', []));
            }
            if (hasPermissionSets || hasAdditionalPermissions) {
                //user.permissions = pjds.getPermissionsForUser();
                user.status = 'active';
            }
        }

        var showVistaInactive = (pjdsUtil.getRequestParameter(req, ['show.vista.inactive'], 'false') === 'true');
        var showEhmpInactive = (pjdsUtil.getRequestParameter(req, ['show.ehmp.inactive'], 'false') === 'true');
        var addUserToWhiteList = (showVistaInactive && user.vistaStatus === 'inactive') ||
            (showEhmpInactive && user.status === 'inactive') ||
            (user.vistaStatus === 'active' && user.status === 'active');
        user.exactMatchCount = getUserMatchCount(user, reqFilterParameters);
        if (reqFilterParameters.permissionSet) {
            if ((_.size(_.intersection(_.get(user, 'permissionSet.val', []), _.get(reqFilterParameters, 'permissionSet', []))) > 0 || _.contains(_.get(user, 'permissionSet.val', []), _.get(reqFilterParameters, 'permissionSet'))) && addUserToWhiteList) {
                req.logger.trace('adding user %s to the whiteList by permission set match', user.uid);
                whiteListUsers.push(userUtil.sanitizeUser(user, userUtil.userListWhitelist));
            }
        } else {
            if (addUserToWhiteList) {
                req.logger.trace('adding user %s to the whiteList', user.uid);
                whiteListUsers.push(userUtil.sanitizeUser(user, userUtil.userListWhitelist));
            }
        }
    });

    whiteListUsers = _.sortBy(whiteListUsers, function (user) {
        return -user.exactMatchCount;
    });

    var usersToReturn = processPagingUsers(req, whiteListUsers);

    req.logger.trace({
        users: usersToReturn
    }, '.getUserList users to return');
    req.logger.info('.getUserList returning %s users', _.size(usersToReturn));

    return res.status(rdk.httpstatus.ok).rdkSend(usersToReturn);
};

/**
 * Gets a list of users from jds and combines the pjds objects that match based on the UID
 * @return {Object|Error} - a return object or an error is sent back to the client
 */
users.getUserList = function (req, res) {
    if (pjdsUtil.getRequestParameter(req, 'fetchEmptyCollection') && pjdsUtil.getRequestParameter(req, 'fetchEmptyCollection') === 'true') {
        return res.status(rdk.httpstatus.ok).rdkSend([]);
    }
    var reqFilterParameters = pjdsUtil.getRequestParameter(req, ['user.filter']);

    if (_.isString(reqFilterParameters)) {
        reqFilterParameters = parseString(req.logger, reqFilterParameters);
    }

    if (!reqFilterParameters || reqFilterParameters instanceof RdkError) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('No Search Criteria defined. Please be more specific in your search criteria.');
    }

    req.filterParameters = reqFilterParameters;

    async.parallel({
        ehmpUsers: function (ehmpUsersCB) {
            var pjdsOptions = {
                store: 'ehmpusers',
                indexName: 'ehmpusers_uid',
                range: 'urn:va:user:' + _.get(req, 'session.user.site') + '*'
            };
            pjds.get(req, res, pjdsOptions, function (error, response) {
                ehmpUsersCB(error, response);
            });
        },
        jdsUserData: function (jdsUserDataCb) {
            var jdsFilterObject = [];
            var reqFilterParametersModelIds = _.keys(reqFilterParameters);
            var hasDuz = !_.isUndefined(reqFilterParameters.duz);
            var hasOneSearchCriteriaField = (reqFilterParametersModelIds.length >= 1);
            var hasValidFilterCriteria = hasOneSearchCriteriaField || hasDuz;
            if (!hasValidFilterCriteria) {
                return res.status(rdk.httpstatus.bad_request).rdkSend('Insufficiant Search Criteria. Please be more specific in your search criteria.');
            }
            _.each(reqFilterParameters, function(value, key) {
                if (key === 'lastName' || key === 'firstName') {
                    jdsFilterObject.push(['ilike', 'name', '%' + value + '%']);
                } else if (key === 'duz') {
                    jdsFilterObject.push(['or', ['eq', 'localId', value],
                        ['ilike', 'uid', '%' + value + '%']
                    ]);
                } else if (key !== 'permissionSet') {
                    jdsFilterObject.push(['ilike', key, '%' + value + '%']);
                }
            });
            if (pjdsUtil.getRequestParameter(req, ['show.vista.inactive']) !== 'true') {
                jdsFilterObject.push(['ne', 'disuser', 'true']);
                jdsFilterObject.push(['ne', 'terminated', 'true']);
            }
            var jdsFilterPath = jdsFilter.build(jdsFilterObject);
            var jdsQuery = {
                filter: jdsFilterPath,
                order: 'name asc'
            };

            if (_.has(req, 'session.user.site')) {
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

            httpUtil.get(httpConfig, function (error, response, results) {
                jdsUserDataCb(error, results);
            });
        }
    }, function (errors, responses) {
        processResults(errors, responses, req, res);
    });
};

module.exports = users;
