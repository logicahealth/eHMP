'use strict';
var rdk = require('../../../core/rdk');
var httpUtil = rdk.utils.http;
var querystring = require('querystring');
//var _ = require('lodash');
//var moment = require('moment');

var searchModes = {
    FullText: 'fullText',
    PartialMatching: 'partialMatching',
    RegularExp: 'regex'
};



module.exports.executeTermQuery = executeTermQuery;
module.exports.createUnavailableResults = createUnavailbleResults;

function executeTermQuery(queryString, req, callback) {
    var params = {
        query: queryString,
        lang: 'english',
        statusFilter: 'activeOnly',
        normalize: 'true',
        returnLimit: '100',
        skipTo: '0',
        //semanticFilter: semanticFilters.substance, //hardcoded for now
        groupByConcept: 1,
        searchMode: searchModes.PartialMatching
    };
    var config = {
        logger: req.logger,
        baseUrl: req.app.config.ontologySuggest.baseUrl,
        url: req.app.config.ontologySuggest.url + '/' + req.app.config.ontologySuggest.database + '/' + req.app.config.ontologySuggest.version + '/descriptions?' + querystring.stringify(params),
        json: true
    };

    req.logger.info('GET ' + config.baseUrl + config.url);

    httpUtil.get(config, function(error, response, ontoResult) {

        if (error ) {
            req.logger.error('Error performing search', (error.message || error));
            //eat the error
            return callback(null, createUnavailbleResults());
        }
        else if (response.statusCode !== 200){
            req.logger.error('Error performing search, http status: %j Body: %j', response.statusCode, response.body);
            //eat the error
            return callback(null, createUnavailbleResults());
        }
        else {
            //result code says it's ok, but response could still be bad

            // Lets check for valid response, make sure it has matches property

            var isValid = false;
                var matches = ontoResult.matches;
            if (matches === undefined){
                isValid = false;
            }
            else{
                isValid = true;
            }

            if (isValid){
                return callback(null, ontoResult);
            }
            else{
                req.logger.error('Error performing search, http status: %j Body: %j', response.statusCode, response.body);
                //eat the error
                return callback(null, createUnavailbleResults());
            }
        }
    });
}

function createUnavailbleResults(){
    var result = {};
    result.details = {};
    result.details.total = 1;

    result.matches = [];

    var item = {};
    item.term = 'Ontology Suggestions unavailable';

    result.matches[0] = item;
    return result;
}

// Dead Code
//function executeReferenceQuery(conceptid, req, callback) {
//    var params = {
//        form: 'inferred'
//    };
//    var config = {
//        logger: req.logger,
//        baseUrl: req.app.config.ontologySuggest.baseUrl,
//        url: req.app.config.ontologySuggest.path + '/' + req.app.config.ontologySuggest.database + '/' + req.app.config.ontologySuggest.version + '/concepts/' + conceptid + '?' + querystring.stringify(params),
//        json: true
//    };
//    httpUtil.get(config, function(error, response, ontoResult) {
//
//        if (error) {
//            req.logger.error('Error performing search', (error.message || error));
//            return callback(error);
//        } else {
//            callback(null, ontoResult);
//        }
//    });
//}
