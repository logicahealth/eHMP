'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');
var jdsFilter = require('jds-filter');
var jds = require('../../subsystems/jds/jds-subsystem');
var jdsDomains = require('../../subsystems/jds/jds-domains');
var nullchecker = rdk.utils.nullchecker;
var immunizationDupes = require('./patient-record-immunization-dupes');
var querystring = require('querystring');
var documentSignatures = require('./patient-record-document-view-signatures');

var getResourceConfig = function() {

    var fetchRecordGet = _.map(jdsDomains.domains, function(domain) {
        var perms = getPermissions(domain.name);

        return {
            name: 'patient-record-' + domain.name,
            index: domain.index,
            path: '/domain/' + domain.name,
            interceptors: {
                convertPid: true,
                synchronize: true,
                jdsFilter: true
            },
            requiredPermissions: perms,
            isPatientCentric: true,
            get: fetchDomainData.bind(null, domain.index, domain.name),
            description: {
                get: 'Get record data of one domain for one patient'
            },
            subsystems: ['patientrecord', 'jds', 'solr', 'jdsSync', 'authorization']
        };
    });
    var fetchRecordPost = _.map(jdsDomains.domains, function(domain) {
        var perms = getPermissions(domain.name);

        return {
            name: 'patient-record-' + domain.name,
            index: domain.index,
            path: '/domain/' + domain.name,
            interceptors: {
                convertPid: true,
                synchronize: true,
                jdsFilter: false
            },
            requiredPermissions: perms,
            isPatientCentric: true,
            post: fetchDomainData.bind(null, domain.index, domain.name),
            description: {
                get: 'Get record data of one domain for one patient'
            },
            subsystems: ['patientrecord', 'jds', 'solr', 'jdsSync', 'authorization']
        };
    });

    return fetchRecordGet.concat(fetchRecordPost);
};

function getPermissions(name) {
    //lab,vital,allergy,document,med,immunization,problem,patient,vlerdocument,appointment
    switch (name) {
        case 'document':
        case 'document-view':
        case 'vlerdocument':
            return ['read-document'];
        case 'problem':
            return ['read-condition-problem'];
        case 'allergy':
            return ['read-allergy'];
        case 'appointment':
            return ['read-encounter'];
        case 'immunization':
            return ['read-immunization'];
        case 'lab':
            return ['read-order'];
        case 'med':
            return ['read-active-medication'];
        case 'vital':
            return ['read-vital'];
        default:
            return ['read-patient-record'];
    }
}

function JdsQuery(start, limit, order, uid, filter, range) {
    this.start = start || 0;
    if (limit) {
        this.limit = limit;
    }
    if (order) {
        this.order = order;
    }

    filter = filter || [];
    if (uid) {
        filter.push(['like', 'uid', uid]);
    }
    var filterString = jdsFilter.build(filter);
    if (filterString) {
        this.filter = filterString;
    }
    if (range) {
        this.range = range;
    }
}


JdsQuery.prototype.toString = function() {
    return querystring.stringify(this);
};

function noData(details) {
    return nullchecker.isNullish(details) || nullchecker.isNullish(details.data) ||
        nullchecker.isNullish(details.data.items) || !details.data.items.length;
}

function removeDuplicates(index, req, response) {
    if (index === 'immunization') {
        return immunizationDupes.removeDuplicateImmunizations(req.app.config.vistaSites, response.data.items);
    }
    return response;
}

function createFilter(filterList, fieldsList, originalFilters) {
    var createdFilter;

    if(_.isEmpty(originalFilters)) {
        createdFilter = [];
    } else if ( _.isString(originalFilters)) {
        createdFilter = [jdsFilter.parse(originalFilters)];
    } else {
        createdFilter = [originalFilters];
    }

    if (_.isEmpty(fieldsList) || _.isElement(fieldsList)) {
        return createdFilter;
    }

    var filterArray = _.isString(filterList) ? filterList.split(',') : filterList;
    var fieldArray = _.isString(fieldsList) ? fieldsList.split(',') : fieldsList;

    _.each(fieldArray, function(field) {
        var innerFilter = ['or'];
        _.each(filterArray, function(filter) {
            innerFilter.push(['ilike', field, wildCard(filter)]);
        });
        createdFilter.push(innerFilter);
    });
    return createdFilter;
}

function wildCard(original) {
    if (_.isString(original)) {
        return ['%', original, '%'].join('');
    }
    return '';
}

function fetchDomainData(index, name, req, res) {
    req.logger.debug('fetchDomainData(%s)', index);

    var pid = req.body.pid || req.query.pid;

    req.audit.patientId = pid;
    req.audit.dataDomain = index;
    req.audit.logCategory = 'RETRIEVE';

    if (nullchecker.isNullish(pid)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing pid parameter');
    }

    var isPostPidValid = validatePostPid(req);
    if (_.isError(isPostPidValid)) {
        return res.status(400).rdkSend(isPostPidValid.message);
    }

    var filter = getFilter(req);
    if (_.isError(filter)) {
        return res.status(400).rdkSend('Malformed filter parameter');
    }
    var start = req.body.start || req.query.start;
    var limit = req.body.limit || req.query.limit;
    var order = req.body.order || req.query.order;
    var uid = req.body.uid || req.query.uid;
    var range = req.body.range || req.query.range;

    var filterList = req.body.filterList || req.query.filterList;
    var filterFields = req.body.filterFields || req.query.filterFields;

    if (!_.isUndefined(filterList) && !_.isUndefined(filterFields)) {
        filter = createFilter(filterList, filterFields, filter);
    }

    var jdsQuery = new JdsQuery(start, limit, order, uid, filter, range);

    var vlerQuery = {
        vlerCallType: req.body.callType || req.query.callType,
        vlerUid: req.body.vler_uid || req.query.vler_uid
    };

    jds.getPatientDomainData(req, pid, index, jdsQuery, vlerQuery, function(error, response, statusCode) {
        statusCode = statusCode || 500;
        if (error) {
            return res.status(statusCode).rdkSend(error);
        }
        if (noData(response)) {
            return res.status(statusCode).rdkSend(response);
        }

        response = removeDuplicates(index, req, response);

        if (index === 'document' || index === 'docs-view') {
            documentSignatures.processAddenda(req, response, function(error, result) {
                if (error) {
                    return res.status(500).rdkSend(error);
                }
                return res.status(statusCode).rdkSend(result);
            });
        } else {
            return res.status(statusCode).rdkSend(response);
        }

    });
}

function getFilter(req) {
    var filter;
    if (req.method === 'POST') {
        filter = req.body.filter;
        if (!filter) {
            return;
        }
        var filterObj;
        try {
            filterObj = jdsFilter.parse(filter);
        } catch (e) {
            return e;
        }
        return filterObj;
    }
    if (req.method === 'GET') {
        filter = req.interceptorResults.jdsFilter.filter;
        if (filter) {
            return filter;
        }
        var error = req.interceptorResults.jdsFilter.error;
        if (error) {
            return error;
        }
    }
    // other HTTP methods not handled
}


function validatePostPid(req) {
    if (req.method !== 'POST') {
        return;
    }
    var bodyPid = req.body.pid;
    var queryPid = req.query.pid;
    if (_.isUndefined(bodyPid) || _.isUndefined(queryPid)) {
        return;
    }
    if (queryPid !== bodyPid) {
        return new Error('Body pid must match query parameter pid');
    }
}

module.exports.getResourceConfig = getResourceConfig;

//used for unit testing
module.exports._JdsQuery = JdsQuery;
module.exports._noData = noData;
module.exports._fetchDomainData = fetchDomainData;
module.exports._getFilter = getFilter;
module.exports._validatePostPid = validatePostPid;
module.exports._removeDuplicates = removeDuplicates;
module.exports._wildCard = wildCard;
module.exports._createTextFilter = createFilter;
