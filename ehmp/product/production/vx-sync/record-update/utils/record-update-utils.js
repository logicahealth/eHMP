'use strict';

require('../../env-setup');

var uuid = require('node-uuid');
var _ = require('underscore');

var pidUtil = require(global.VX_UTILS + 'patient-identifier-utils');


//---------------------------------------------------------------------------------
// Create a Patient Identifier object from 'id' where 'id' can be an ICN or a PID.
//
// id: The ID from which to create the Patient Identifier
//---------------------------------------------------------------------------------
function getPatientIdentifierFromRecordPid(id) {
    return pidUtil.create(pidUtil.isIcn(id) ? 'icn' : 'pid', id);
}


//---------------------------------------------------------------------------------
// Variadic Function:
// createErrorStatus(operation, pid, domain)
// createErrorStatus(operation, pid, domain, detail)
//
// This function creates an error log object to allow bunyan searching and filtering.
//
// operation: An description of the operation that failed.
//
// pid: The PID of the patient for which this operation failed.
//
// domain: The domain of data for which this operation failed.
//
// detail: The error object or message.
//---------------------------------------------------------------------------------
function createErrorStatus(operation, pid, domain, detail) {
    var status = {
        'record-update-error': {
            operation: operation,
            pid: pid,
            domain: domain
        }
    };

    if (detail) {
        status['record-update-error'].detail = detail;
    }

    return status;
}

//---------------------------------------------------------------------------------
// This function adds 'item' to 'list', but only if 'item' is not already contained
// in 'list'.
//
// list: An array.
//
// item: The function to call when this method is complete or when an error occurs.
//---------------------------------------------------------------------------------
function addDistinct(list, item) {
	if(!_.isArray(list)) {
		return list;
	}

    if (!_.contains(list, item)) {
        list.push(item);
    }

    return list;
}

//---------------------------------------------------------------------------------
// This function adds a domain to a collection of incomplete domains indexed by pid.
// When complete, this function returns the collection.
//
// The resulting object will look something like:
//     {
//         '9E7A;3': ['allergy', 'lab'],
//         'C877;1': ['allergy']
//     }
//
// incomplete: The collection of incomplete domains.
//
// pid: The patient's PID.
//
// domain: The domain to add to the collection.
//---------------------------------------------------------------------------------
function addIncompleteDomain(incomplete, pid, domain) {
    incomplete = incomplete || {};

    if (!_.has(incomplete, pid)) {
        incomplete[pid] = [];
    }

    incomplete[pid].push(domain);

    return incomplete;
}

//---------------------------------------------------------------------------------
// This function builds the empty pidStats object.
//
// pidsToResyncDomains: An object containing lists of domains keyed by PIDs, e.g.
//     {
//         '9E7A;3': ['med', 'allergy', 'consult'],
//         '9E7A;1': ['med', 'consult'],
//         'C877;8': ['allergy']
//     }
//
// referenceInfo: An object containing info for tracking the flow of a job through
//      the system via the log files, e.g.
//    {
//         sessionId: 'c45e45bf-55ab-453e-bd5e-7e9f66c58d03',
//         utilityType: 'record-update-enrichment'
//    }
//
// This function returns an object keyed on pid to keep track of domains and number
// of jobs published. For example, the above value would result in:
//	   {
//         '9E7A;3': {
//             domainsComplete: [],
//             jobsPublished: 0,
//             referenceInfo: {
//                 sessionId: 'c45e45bf-55ab-453e-bd5e-7e9f66c58d03',
//                 utilityType: 'record-update-enrichment',
//                 requestId: '5e60156e-134d-4220-be48-7a8a706d0528'
//             }
//         },
//         '9E7A;1': {
//             domainsComplete: [],
//             jobsPublished: 0,
//             referenceInfo: {
//                 sessionId: 'c45e45bf-55ab-453e-bd5e-7e9f66c58d03',
//                 utilityType: 'record-update-enrichment',
//                 requestId: '7f04a248-db65-492e-bb56-7e30b7ee4d0f'
//             }
//         },
//         'C877;8': {
//             domainsComplete: [],
//             jobsPublished: 0,
//             referenceInfo: {
//                 sessionId: 'c45e45bf-55ab-453e-bd5e-7e9f66c58d03',
//                 utilityType: 'record-update-enrichment',
//                 requestId: 'd21a5ebc-d11d-4c25-bb0c-53e156a124d9'
//             }
//         }
//     }
//---------------------------------------------------------------------------------
function buildPidStats(pidsToResyncDomains, referenceInfo) {
    var pidStats = {};

    _.each(pidsToResyncDomains, function(domains, pid) {
        pidStats[pid] = {
            domainsComplete: [],
            jobsPublished: 0,
            referenceInfo: _.extend({
                requestId: uuid.v4()
            }, referenceInfo)
        };
    });

    return pidStats;
}

//---------------------------------------------------------------------------------
// This function builds a list of all of the distinct pid/domain combinations.
//
// pidsToResyncDomains: An object containing lists of domains keyed by PIDs, e.g.
//     {
//         '9E7A;3': ['med', 'allergy'],
//         'C877;8': ['allergy']
//     }
//
//
// This function returns an array of objects with all of the pid/domain combinations.
// For example, the above value would result in:
//     [
//         {
//             pid: '9E7A;3',
//             domain: 'med'
//         },
//         {
//             pid: '9E7A;3',
//             domain: 'allergy'
//         },
//         {
//             pid: 'C877;8',
//             domain: 'allergy'
//         }
//     ]
//---------------------------------------------------------------------------------
function buildPidToDomainComboList(pidsToResyncDomains) {
    var pidToDomainComboList = _.map(pidsToResyncDomains, function(domains, pid) {
        return _.map(domains, function(domain) {
            return {
                pid: pid,
                domain: domain
            };
        });
    });

    return _.flatten(pidToDomainComboList);
}


//---------------------------------------------------------------------------------
// This function builds a list of tasks, each of which calls the beanstalk client
// to 'put' a job onto the currently used tube.
//
// beanstalkClient: An instance of the beanstalk client to use. Note that the
//      'use' must have been called previously to ensure that the jobs are put
//      on the correct tube.
//
// jobsToPublish: An array of job objects which will be 'put' onto beanstalk.
//---------------------------------------------------------------------------------
function buildJobTaskList(beanstalkClient, jobsToPublish) {
    var priority = 10;
    var delaySecs = 0;
    var ttrSecs = 60;

    var tasks = [];
    _.each(jobsToPublish, function(job) {
        tasks.push(beanstalkClient.put.bind(beanstalkClient, priority, delaySecs, ttrSecs, JSON.stringify(job)));
    });

    return tasks;
}


module.exports.getPatientIdentifierFromRecordPid = getPatientIdentifierFromRecordPid;
module.exports.createErrorStatus = createErrorStatus;
module.exports.addDistinct = addDistinct;
module.exports.addIncompleteDomain = addIncompleteDomain;
module.exports.buildPidStats = buildPidStats;
module.exports.buildPidToDomainComboList = buildPidToDomainComboList;
module.exports.buildJobTaskList = buildJobTaskList;
