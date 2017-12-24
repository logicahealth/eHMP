'use strict';

var _ = require('lodash');
var moment = require('moment');

var rdk = require('../../core/rdk');
var pjds = rdk.utils.pjdsStore;
var RdkError = rdk.utils.RdkError;

module.exports.getPrefetchPatients = getPrefetchPatients;
module.exports._buildParams = buildParams;
module.exports._removeDuplicatePatients = removeDuplicatePatients;

module.exports.getResourceConfig = function(app) {
    return [{
        name: 'prefetch-patients-get',
        path: '',
        get: getPrefetchPatients,
        description: 'Get list of patients they may be used by ehmp and other system in the near future.',
        subsystems: ['pjds'],
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['access-general-ehmp'],
        isPatientCentric: false,
        healthcheck: {}
    }];
};

/**
 * Retrieves list of patients that will likely be seen in a near future time frame so that external systems like DAS
 * can pre-cache patient data that eHMP and other systems may need.
 *
 * @param {object} req The node request object
 * @param {object} res The node response object
 */
function getPrefetchPatients(req, res) {
    if (!req.query.strategy) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing strategy parameter');
    }

    var pjdsOptions = {
        store: 'prefetch',
        indexName: req.query.strategy === 'appointment' ? 'ehmp-source' : 'ehmp-patients',
        template: 'minimal',
        parameters: buildParams(req.query)
    };


    pjds.get(req, res, pjdsOptions, function(error, response) {
        var errorObj;

        if (error) {
            errorObj = new RdkError({
                code: 'pjds.500.1005',
                error: {
                    original: error,
                    additionalInfo: 'ERROR: There was an error retrieving prefetch patients from pJDS.'
                },
                logger: req.logger
            });
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(errorObj);
        }

        var prefetchData = {
            patient: removeDuplicatePatients(response.data),
            outboundQueryCriteria: _.get(req.app, 'config.prefetch.outboundQueryCriteria', '')
        };

        return res.status(rdk.httpstatus.ok).rdkSend(prefetchData);
    });
}

function buildParams(query) {
    var params = {range: ''};

    // For date parameters we all use beginning of day for start date and end of day for end date.
    var timeframeStart = moment().hours(0).minutes(0).seconds(0).format('YYYYMMDDHHmmss');
    var timeframeEnd = moment().add(1, 'd').hours(23).minutes(59).seconds(59).format('YYYYMMDDHHmmss');

    if (query.timeframeStart && moment(query.timeframeStart, 'YYYY-MM-DD').isValid() && query.timeframeEnd  && moment(query.timeframeEnd, 'YYYY-MM-DD').isValid()) {
        timeframeStart = moment(query.timeframeStart, 'YYYY-MM-DD').hours(0).minutes(0).seconds(0).format('YYYYMMDDHHmmss');
        timeframeEnd = moment(query.timeframeEnd, 'YYYY-MM-DD').hours(23).minutes(59).seconds(59).format('YYYYMMDDHHmmss');
    }

    // The range filter must always match the order of the index.  There are two possible indexes with different fields that
    // make up the index but each uses dateRange. See design on wiki:
    // Design: API to discover patients to be pre-fetched [RP112, F1232].
    var dateRange = '[' + timeframeStart + '..' + timeframeEnd + ']';
    var preRange ='';
    var postRange ='';

    if (query.strategy !== 'eHMP' && query.strategy !== 'all') {
        preRange = query.strategy + '>';

        if (query.facility) {
            postRange = '>' + query.facility;
        }
        if (query.clinic) {
            params.filter = 'eq(clinic,"' +  query.clinic + '")';   //adding to params here
        }
    } else if (query.strategy === 'eHMP') {
        postRange = '>true';
    }

    params.range = preRange + dateRange + postRange;

    return params;
}

// The prefetch data store has one record per patient identifier and source.  This function removes duplicate patient
// records while preserving the isEhmpPatient flag.  If any record for a specific patient has isEhmpPatient true then
// isEhmpPatient should be true. See design on wiki: Design: API to discover patients to be pre-fetched [RP112, F1232].
function removeDuplicatePatients(prefetchPatients) {
    if (_.isUndefined(prefetchPatients.items)) {
        return [];
    }

    return _.chain(prefetchPatients.items)
        .groupBy('patientIdentifier')
        .map(function(dataByKey, key) {
            return {
                patientIdentifier: key,
                isEhmpPatient: _.reduce(dataByKey, function(memo, singleDataItem) {
                    return memo || singleDataItem.isEhmpPatient;
                }, false)
            };
        })
        .value();
}
