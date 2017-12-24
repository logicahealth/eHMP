'use strict';
var _ = require('lodash');

var MAXIMUM_NUMBER_OF_IDS_PER_REQUEST = 10;
var OPENINSTANCES = 'open';
var CLOSEDINSTANCES = 'closed';

function isStaffRequest(req) {
    return req.query.context.toLowerCase() === 'staff';
}

function isPatientRequest(req) {
    return req.query.context.toLowerCase() === 'patient';
}

function getErrorMessage(req) {
    var context = req.query.context;
    var domain = req.query.domain;
    if (context !== 'patient' && context !== 'staff') {
        return 'Context must be either patient or staff.';
    }

    if (context === 'staff' && _.isEmpty(req.query.createdByMe) && _.isEmpty(req.query.intendedForMeAndMyTeams) && _.isUndefined(domain)) {
        return 'Malformed staff context request.';
    }

    if (context === 'patient' && _.isEmpty(req.query.pid)) {
        return 'Missing pid for patient context request.';
    }

    if (_.has(req, 'query.startDate') !== _.has(req, 'query.endDate')) {
        return 'start date or end date is missing.';
    }

    return '';
}

function getUserId(req) {
    var site = req.session.user.site;
    var user = req.session.user.duz[site];
    var userId = site + ';' + user;
    return userId;
}

function isUserPartOfIntendedUsers(result, userId) {
    return (!_.isEmpty(result.INTENDEDFORUSERS) && (result.INTENDEDFORUSERS).indexOf(userId) > -1);
}

function isIntendedForMyTeams(myTeams, myTeamFoci, record) {
    if (_.isEmpty(myTeams)) {
        return false;
    }

    var recordTeams = record.TEAMS || '';
    var recordTeamFoci = record.TEAMFOCI || '';

    recordTeams = recordTeams.split(',');
    recordTeamFoci = recordTeamFoci.split(',');

    var partOfMyTeams = !_.isEmpty(_.intersection(myTeams, recordTeams));
    var partOfMyTeamFoci = !_.isEmpty(_.intersection(myTeamFoci, recordTeamFoci));

    return partOfMyTeams || partOfMyTeamFoci;
}

function getJDSQueryFromIds(logger, type, ids) {
    // I need to get an array of chunked array coming back
    // I will iterate through the returned array
    // and create a JDS query for each entry.
    // var ids = ['SITE;1', 'SITE;2','SITE;3','SITE;4','SITE;5','SITE;6','SITE;7','SITE;8','SITE;9','3;3','4;4'];
    // should become
    // var batchedIds = [['SITE;1' , 'SITE;2'], [ 'SITE;3' , 'SITE;4'] ....]

    var batchedIds = _.chunk(ids, MAXIMUM_NUMBER_OF_IDS_PER_REQUEST);
    var retVal = [];

    _.each(batchedIds, function (ids) {
        if (type === 'user') {
            retVal.push('/data/index/user-uid?range=' + ids);
        } else if (type === 'patient') {
            retVal.push('/data/index/pt-select-pid?range=' + ids);
        }
    });
    return retVal;
}

function adjustUserIds(logger, ids) {
    var retVal = [];
    if (_.isEmpty(ids)) {
        return retVal;
    }

    var parts = [];
    _.each(ids, function (id) {
        parts = id.split(';');
        if (!_.isEmpty(parts) && parts.length === 2) {
            id = 'urn:va:user:' + parts[0] + ':' + parts[1];
            retVal.push(id);
        } else {
            logger.error({
                'bad user id': id
            });
        }
    });

    return retVal;
}

function getRecordSetMaximumCount(req) {
    return _.get(req, 'app.config.maximum_resultset_record') || 0;
}

function isRequestForOpenOnly(req) {
    return (req.query.mode === OPENINSTANCES);
}

function isRequestForClosedOnly(req) {
    return (req.query.mode === CLOSEDINSTANCES);
}

function truncateResultSetToMaximum(req, resultSet) {
    var maximumCount = getRecordSetMaximumCount(req);
    if (maximumCount === 0) {
        req.logger.error({
            'truncate result set': 'missing parameter'
        });
        return resultSet;
    }
    if (resultSet.length <= maximumCount) {
        return resultSet;
    }

    if (isRequestForOpenOnly(req) || isRequestForClosedOnly(req)) {
        resultSet.length = maximumCount;
        return resultSet;
    }

    var openActivities = _.filter(resultSet, function (record) {
        return record.MODE.toLowerCase() === 'open';
    });

    if (openActivities.length > maximumCount) {
        resultSet.length = maximumCount;
        return resultSet;
    }

    var spaceLeft = maximumCount - openActivities.length;

    var closedActivities = _.filter(resultSet, function (record) {
        return record.MODE.toLowerCase() === 'CLOSED';
    });

    resultSet.length = spaceLeft;

    resultSet = openActivities.concat(closedActivities);
    return resultSet;
}

module.exports.getErrorMessage = getErrorMessage;
module.exports.isStaffRequest = isStaffRequest;
module.exports.getUserId = getUserId;
module.exports.getJDSQueryFromIds = getJDSQueryFromIds;
module.exports.adjustUserIds = adjustUserIds;
module.exports._getRecordSetMaximumCount = getRecordSetMaximumCount;
module.exports._isRequestForOpenOnly = isRequestForOpenOnly;
module.exports._isRequestForClosedOnly = isRequestForClosedOnly;
module.exports.isPatientRequest = isPatientRequest;
module.exports.isUserPartOfIntendedUsers = isUserPartOfIntendedUsers;
module.exports.isIntendedForMyTeams = isIntendedForMyTeams;
module.exports.truncateResultSetToMaximum = truncateResultSetToMaximum;
