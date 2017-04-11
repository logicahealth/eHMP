'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');
var jdsFilter = require('jds-filter');
var jds = rdk.utils.jds;
var nullchecker = rdk.utils.nullchecker;
var async = require('async');
var immunizationDupes = require('./patient-record-immunization-dupes');
var querystring = require('querystring');
var documentSignatures = require('./patient-record-document-view-signatures');

var getResourceConfig = function() {

    return _.map(jds.Domains.domains, function(domain) {
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
            get: getDomain.bind(null, domain.index, domain.name),
            description: {
                get: 'Get record data of one domain for one patient'
            },
            subsystems: ['patientrecord', 'jds', 'solr', 'jdsSync', 'authorization']
        };
    });
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

function JdsQuery(start, limit, order, uid, filter) {
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

function getDomain(index, name, req, res) {
    req.logger.debug('getDomain(%s)', index);

    var pid = req.param('pid');

    req.audit.patientId = pid;
    req.audit.dataDomain = index;
    req.audit.logCategory = 'RETRIEVE';

    if (nullchecker.isNullish(pid)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing pid parameter');
    }

    var jdsQuery = new JdsQuery(req.param('start'), req.param('limit'), req.query.order, req.param('uid'),
        req.interceptorResults.jdsFilter.filter);

    var vlerQuery = {
        vlerCallType: req.param('callType'),
        vlerUid: req.param('vler_uid')
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

        if (index === 'docs-view' || index === 'document') {
            documentSignatures.processAddenda(req, response, function(error, result) {
                if (error) {
                    res.status(500).rdkSend(error);
                }

                return res.status(statusCode).rdkSend(result);
            });
        } else {
            return res.status(statusCode).rdkSend(response);
        }

    });
}

module.exports.getResourceConfig = getResourceConfig;

//used for unit testing
module.exports._JdsQuery = JdsQuery;
module.exports._noData = noData;
module.exports._getDomain = getDomain;
