'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');
var ConceptRelationships = require('./concept-relationships');

function getResourceConfig() {
    return [{
        name: 'concept-relationships',
        path: '',
        get: getRelatedConcepts,
        interceptors: {
            jdsFilter: false
        },
        requiredPermissions: ['read-concept-relationship'],
        isPatientCentric: false,
        subsystems: []
    }];
}

/**
 * Retrieves the ids of concepts that are related to a given starting concept.
 * For example, a starting concept could be "hypertension" which has a conceptId
 * (i.e. SNOMED code) of 59621000 and is part of the Problem domain. This function
 * will return the ids of concepts that are related to hypertension which could be
 * blood pressure which has a conceptId (i.e. LOINC code) of 55284-4 and is part of
 * the Vital domain.
 *
 * @param {object} req The default Express request
 * @param {array}  req.target.domains A comma-delimited string of domains to check
 *                 for related concepts (ex: Medication, Laboratory, Vital)
 * @param {string} req.concept.domain The domain of the starting concept
 * @param {string} req.concept.id The id of the starting concept
 * @param {object} res The default Express response
 */
function getRelatedConcepts(req, res) {
    var logger = req.logger;
    logger.debug('concept-relationships resource GET called');

    var targetDomains = req.param('target.domains');
    var conceptDomain = req.param('concept.domain');
    var conceptId = req.param('concept.id');

    logger.debug({
        targetDomains: targetDomains
    });
    logger.debug({
        conceptDomain: conceptDomain
    });
    logger.debug({
        conceptId: conceptId
    });

    targetDomains = targetDomains.split(',');
    _.forEach(targetDomains, function(domain, index) {
        targetDomains[index] = _.trim(domain);
    });

    ConceptRelationships.getRelatedConcepts(req, targetDomains, conceptDomain, conceptId, function(error, data) {
        if (error) {
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(error);
        }
        res.status(rdk.httpstatus.ok).rdkSend(data);
    });
}

module.exports.getResourceConfig = getResourceConfig;
