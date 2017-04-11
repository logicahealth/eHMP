'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');
var crsSPARQL = require('./crs-sparql');
var crsDataTransformer = require('./crs-data-transformer');


/**
 * Retrieves related concept ids from the Concept Relationship Service (CRS).
 *
 * @param {object} Request object
 * @param {array}  targetDomains An array of domains to check
 *                 for related concepts (ex: Medication, Laboratory, Vital)
 * @param {string} conceptDomain The domain of the starting concept
 * @param {string} conceptId The id of the starting concept
 * @param {function} callback Function to call with results or errors from CRS (signature: callback(error, data))
 */
function getRelatedConcepts(req, targetDomains, conceptDomain, conceptId, callback) {
    var internalError = 'There was an error processing your request. The error has been logged.';
    var crsPath = '/ehmp/query';
    var sparqlQuery = crsSPARQL.buildQuery(conceptId);
    var crsServerConfig = req.app.config.CRSServer;

    var options = {
        baseUrl: 'http://' + crsServerConfig.host + ':' + crsServerConfig.port,
        url: crsPath,
        logger: req.logger,
        json: true,
        body: encodeURI(sparqlQuery), // we're passing the query on the body but it must be URL encoded
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded', // mime-type of the query we're passing
            'Accept': 'application/sparql-results+json' // mime-type we want back on the response
        }
    };

    rdk.utils.http.post(options, function(error, response, body) {
        if (error) {
            req.logger.error({error: error}, 'concept-relationships::getRelatedConceptsFromCRS: ' + internalError);
            return callback(internalError);
        }
        var data = _.get(body, 'results.bindings');
        return callback(null, crsDataTransformer.transform(targetDomains, data));
    });
}

module.exports.getRelatedConcepts = getRelatedConcepts;
