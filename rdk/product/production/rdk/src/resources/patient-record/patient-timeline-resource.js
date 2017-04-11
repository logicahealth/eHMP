'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');
var jdsFilter = require('jds-filter');
var querystring = require('querystring');
var nullchecker = rdk.utils.nullchecker;
var async = require('async');
var paramUtil = require('../../utils/param-converter');
var moment = require('moment');
var array = require('lodash');
var resultUtils = rdk.utils.results;

var excludeEMcodeRules = rdk.patienttimelineResourceConfig.excludeEMcodeList || [];
//var excludeEMcodeRules = rdk.patienttimelineResourceConfig.excludeEMcodeList || [];
var excludeEMcodeList = excludeListBuilder(excludeEMcodeRules);

FetchError.prototype = Error.prototype;
NotFoundError.prototype = Error.prototype;

var description = {
    get: 'Get timeline data for one patient'
};

// List of JDS indexes that will be queried
var jdsIndexConfig = [{
    name: 'news-feed'
}, {
    name: 'appointment',
    filter: function() {
        // filter out all appointments before today (except DoD appointments -- those are treated as visits)
        return [
            [
                'or',
                ['eq', 'kind', 'DoD Appointment'],
                ['gte', 'dateTime', moment().format('YYYYMMDD')],
                ['lte', 'dateTime', moment().format('YYYYMMDD')]
            ]
        ];
    }
}, {
    name: 'laboratory'
},{
    name: 'visittreatment'   // ptf domain
},{
    name: 'visitcptcode'     // cpt domain
},{
    name: 'encounter'        // visit domain
}];

var getResourceConfig = function() {
    return [{
        name: 'patient-record-timeline',
        path: '',
        get: getPatientTimeline,
        description: description,
        subsystems: ['patientrecord', 'jds', 'solr', 'jdsSync', 'authorization'],
        interceptors: {
            jdsFilter: true,
            pep: {
              handlers: ['permission']
           }
        },
        requiredPermissions: ['read-encounter'],
        isPatientCentric: true,
        outerceptors: ['emulateJdsResponse']
    }];
};

function getPatientTimeline(req, res) {
    var config = req.app.config;
    var pid = req.param('pid');
    var uid = req.param('uid');
    var start = Math.max(0, paramUtil.parseIntParam(req, 'start', 0, 0));
    var limit = paramUtil.parseIntParam(req, 'limit', undefined, -1);
    var filter = req.interceptorResults.jdsFilter.filter || [];
    var order = req.query.order;
    if (nullchecker.isNullish(pid)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing pid parameter');
    }

    if (limit !== undefined && limit !== null && limit <= 0) {
        req.logger.error('For request parameter limit: invalid value "' + req.param('limit') + '": must be an integer greater than or equal to 0');
        res.status(400).rdkSend('There was an error processing your request. The error has been logged.');
        return;
    }

    var baseJdsResource = '/vpr/' + pid + '/index/';
    if (uid) {
        filter.push(['like', 'uid', uid]);
    }
    var results = [];

    // Query each JDS resource for timeline data.
    async.forEach(jdsIndexConfig, function(jdsIndex, callback) {
        var domainFilter = _.clone(filter);

        var jdsQuery = {};
        if (!nullchecker.isNullish(order)) {
            jdsQuery.order = order;
        }

        if (jdsIndex.filter) {
            var domainFilterVals = _.isFunction(jdsIndex.filter) ? jdsIndex.filter() : jdsIndex.filter;
            domainFilter = domainFilter.concat(domainFilterVals);
        }

        var filterString = jdsFilter.build(domainFilter);
        if (filterString) {
            if((jdsIndex.name != "visittreatment")&&(jdsIndex.name != "visitcptcode")){ // &&(jdsIndex.name != "encounter") no filters for PTF, CPT domains
                jdsQuery.filter = filterString;
            }
        }

        var jdsQueryString = querystring.stringify(jdsQuery);
        var path = baseJdsResource + jdsIndex.name + (jdsQueryString ? '?' + jdsQueryString : '');
        var options = _.extend({}, config.jdsServer, {
            url: path,
            logger: req.logger,
            json: true
        });

        fetchData(options, req, jdsIndex.name, function(err, result) {
            if (!err && result) {
                result.domain = jdsIndex.name; //add domain name to result
                results.push(result);
            }
            callback(err);
        });

    }, function(err) {
        if (err instanceof FetchError) {
            req.logger.error(err.message);
            res.status(rdk.httpstatus.internal_server_error).rdkSend('There was an error processing your request. The error has been logged.');
            return;
        } else if (err instanceof NotFoundError) {
            res.status(rdk.httpstatus.not_found).rdkSend(err.error);
            return;
        } else if (err) {
            res.status(rdk.httpstatus.internal_server_error).rdkSend(err.message);
            return;
        } else {
            // unify dates into a common field
            unifyData(req, res, results);

            // merge results of all the resources that were queried
            var mergedResults = mergeResults(results, order);
            var query = req.interceptorResults.jdsFilter.filter || [];
            //console.time("jdsFilter.applyFilters");
            var filteredResults = jdsFilter.applyFilters(query,mergedResults);
            //console.timeEnd("jdsFilter.applyFilters");
            var totalItems = filteredResults.length;

            if (limit > 0) {
                filteredResults = filteredResults.slice(start, start + limit);
            } else if (start > 0) {
                filteredResults = filteredResults.slice(start);
            }

            var responseData = {
               // filter: query, //!!!!!!!!!!!! debug
                totalItems: totalItems,
                currentItemCount: totalItems,
                items: filteredResults
            };

            addMicrobiologyProvider(req, res, responseData);
        }
    });
}

function fetchData(httpConfig, req, index, callback) {
    var pid = req.param('pid');

    req.audit.patientId = pid;
    req.audit.dataDomain = index;
    req.audit.logCategory = 'RETRIEVE';

    req.logger.info('Retrieve pid=%s index=%s from server %s', pid, index, httpConfig.baseUrl);
    rdk.utils.http.get(httpConfig, function(error, response, obj) {
        if (error) {
            callback(new FetchError('Error fetching pid=' + pid + ' - ' + (error.message || error), error));
        } else {
            if (obj && obj.data) {
                return callback(null, obj);
            } else if (obj && obj.error) {
                if (isNotFound(obj)) {
                    req.logger.error('PatienttimelineResource.fetchData: Object not found %j',obj);
                    return callback(new NotFoundError('Object not found', obj));
                }
            }
            req.logger.error('PatienttimelineResource.fetchData: There was an error processing your request. The error has been logged.')
            return callback(new Error('There was an error processing your request. The error has been logged.'));
        }
    });
}

/**
 * Performs operations to unify data from multiple domains.
 * Currently it just adds a common date field for sorting
 */
function unifyData(req, res, allResults) {
    allResults.forEach(function(indexResults) {
        indexResults = indexResults.data.items;

        indexResults.forEach(function(item) {
            item.activityDateTime = getActivityDateTime(item);
        });
    });
}

function addMicrobiologyProvider(req, res, responseData) {
    async.forEach(responseData.items, function(item, callbackasync) {
        if (isMicrobiology(item) && item.results[0]) {
            var microbiologyHttpOptions = _.extend({}, req.app.config.jdsServer, {
                url: '/vpr/uid/' + item.results[0].resultUid,
                logger: req.logger,
                json: true
            });

            rdk.utils.http.get(microbiologyHttpOptions, function(error, result, obj) {
                if (error) {
                    return callbackasync(new FetchError('Error fetching uid=' + item.results[0].resultUid + ' - ' + (error.message || error), error));
                } else {
                    if ('data' in obj) {
                        if (obj.data.items && obj.data.items.length > 0) {
                            var microbiologyItems = obj.data.items;

                            if (microbiologyItems[0].text[0] && microbiologyItems[0].text[0].content) {
                                var contentTextUpper = microbiologyItems[0].text[0].content.toUpperCase();
                                var contentSplit = contentTextUpper.split('PROVIDER:');

                                if (contentSplit.length > 1) {
                                    contentSplit = contentSplit[1].split(/\r\n|\r|\n/g);

                                    if (contentSplit.length > 0) {
                                        var providerNameMixCase = '',
                                            providerName = contentSplit[0].trim().toLowerCase().split(',');

                                        for (var i = 0; i < providerName.length; i++) {
                                            providerNameMixCase += providerName[i].charAt(0).toUpperCase() + providerName[i].substr(1).toLowerCase();

                                            if (i !== providerName.length - 1) {
                                                providerNameMixCase += ',';
                                            }
                                        }

                                        item.secondaryProvider = providerNameMixCase;
                                        return callbackasync(null);
                                    }
                                }
                            }
                        } else {
                            return callbackasync(null);
                        }
                    } else if ('error' in obj) {
                        if (isNotFound(obj)) {
                            req.logger.warn('PatienttimelineResource.addMicrobiologyProvider: Object not found %j',obj);
                            //return callbackasync(new NotFoundError('Object not found', obj));
                        }
                    }
                    return callbackasync(null);
                }
            });
        } else {
            callbackasync(null);
        }
    }, function(error) {
        if (!error) {
            return res.rdkSend(responseData);
        } else {
            req.logger.error(error.message);
            res.status(rdk.httpstatus.internal_server_error).rdkSend(error.message);
            return;
        }
    });
}

// Copy Visit properties
function cpVisitProp(from, to){
  if(!_.isUndefined(to)){
    if(!_.isUndefined(from.service)) {to.service = from.service;}
    if(!_.isUndefined(from.providerDisplayName)) {to.providerDisplayName = from.providerDisplayName;}
    if(!_.isUndefined(from.providers)) {to.providers = from.providers;}
    to.visitInfo = from;
  }
}
// Converts events from CPT domain to Procedure domain and implements GDF
 function cptToProcedure(to,from) {
  from.forEach(function(cptRecord) {
    var fError = false;
    var fLaborotry = false;
    var visit;
    // Filter out Labs from procedures
    if(_.isUndefined(cptRecord.encounterName) || !(cptRecord.encounterName.indexOf('LAB') === 0)) {
        if(!_.isUndefined(cptRecord.entered)){
          cptRecord.dateTime = cptRecord.entered;
          cptRecord.activityDateTime = cptRecord.entered;
        }else{
          fError = true;
        }
        cptRecord.isCPTdomain = true;
        if(!_.isUndefined(cptRecord.uid)){
          cptRecord.original_uid = cptRecord.uid;
          }else{
          fError = true;
        }
        if(!_.isUndefined(cptRecord.encounterUid)){
          cptRecord.uid = cptRecord.encounterUid;
          }else{
          fError = true;
        }
        cptRecord.kind = "Procedure";
        if(!fError){
          visit = _.findWhere(to, {kind: "Visit", uid: cptRecord.encounterUid});
          if(!_.isUndefined(visit)){
            if(!_.isUndefined(visit.stopCodeName)){
              if(visit.stopCodeName === "LABORATORY") fLaborotry = true;
            }
          }
          if((!fLaborotry)&(!isInExcludeList(cptRecord.cptCode))&(!_.isUndefined(visit))){
            cpVisitProp(visit,cptRecord);
            for(var ind=0; ind<cptRecord.quantity; ind++){ // if CPT record contains more than one procedure
              to.push(cptRecord);
            }
          }
        }
    }
  });
}
function excludeListBuilder(arrRules){
  var result = [];
  if((_.isUndefined(arrRules))||(!_.isArray(arrRules))){
    return [];
  }
  arrRules.forEach(function(item){
    if(_.isArray(item)){
      if(item.length === 1){
        if(_.isString(item[0])){
          if(item[0].indexOf("*") != -1){ // check if it range of codes  991** -> 99100-99199
            // generate range of codes
            var startRange = "";
            var stopRange = "";
            for(var cind=0; cind < item[0].length; cind++){
              if(item[0].charAt(cind) === "*"){
                startRange = startRange + "0";
                stopRange = stopRange + "9";
              }else{
                startRange = startRange + item[0].charAt(cind);
                stopRange = stopRange + item[0].charAt(cind);
              }
            }
           result =_.union(result,_.range(Number(startRange),Number(stopRange)),[Number(stopRange)]);
          }
        }else{
          result.push(item[0]);
        }
      }else{ // 99120-99200
        if(item[0]<=item[1]){
          result =_.union(result,_.range(item[0],item[1]),[item[1]]);
        }else{
          // wrong code range
        }
      }
    }
  });
  return (_.uniq(result)).sort();
}

function isInExcludeList(cptcode){
  var clearCptCode;
  if(_.isString(cptcode)){
    var arrCpt = cptcode.split(":");
    if(arrCpt.length === 3){
      clearCptCode = Number(arrCpt[2]);
    }
  }else{
    clearCptCode = cptcode;
  }
  if(_.indexOf(excludeEMcodeList, clearCptCode) != -1){
    return true;
  }
  return false;
}
/**
 * Combines JDS results from multiple collections into one big sorted collection.
 */
function mergeResults(allResults, order) {
    // extract PTF data from allResults
    var ptf = _.where(allResults, {domain: "visittreatment"});
    // extract CPT data from allResults
    var cpt = _.where(allResults, {domain: "visitcptcode"});
    // extract Visit data from allResults
    var visit = _.where(allResults, {domain: "encounter"});
    // flatten the PTF result set
    ptf = _.map(ptf, function(indexResults) {
        return indexResults.data.items;
    });
    var arrPTF = _.flatten(ptf, true);
   // flatten the CPT result set
    cpt = _.map(cpt, function(indexResults) {
        return indexResults.data.items;
    });
    var arrCPT = _.flatten(cpt, true);
   // flatten the Visit result set
    visit = _.map(visit, function(indexResults) {
        return indexResults.data.items;
    });
    var arrVisit = _.flatten(visit, true);
    // filter out PTF from allResults
    allResults = _.reject(allResults, function(resultItem){
        return resultItem.domain === "visittreatment";
    });
    // filter out CPT from allResults
    allResults = _.reject(allResults, function(resultItem){
        return resultItem.domain === "visitcptcode";
    });
    // filter out Visits from allResults
    /*allResults = _.reject(allResults, function(resultItem){
        return resultItem.domain === "encounter";
    });*/

    // flatten the result sets
    allResults = _.map(allResults, function(indexResults) {
        return indexResults.data.items;
    });

    // merge results into a single array
    var mergedResults = _.flatten(allResults, true);

    // remove duplicate uids
    mergedResults = _.uniq(mergedResults, false, function(resultItem) {
        return resultItem.uid;
    });

    // enrich admission events with discharge diagnosis from PTF
    var indResults =-1;
    for(var indPTF=0; indPTF < arrPTF.length; indPTF++){
        if(!_.isUndefined(arrPTF[indPTF].admissionUid)){
            indResults = array.findIndex(mergedResults,{uid: arrPTF[indPTF].admissionUid});
            if(indResults != -1){
                if(_.isUndefined(mergedResults[indResults].dischargeDiagnoses)){
                    mergedResults[indResults].dischargeDiagnoses = [];
                }
                mergedResults[indResults].dischargeDiagnoses.push(arrPTF[indPTF]);
            }
        }
    }
   // enrich visit events with CPT information
    indResults =-1;
    for(var indCPT=0; indCPT < arrCPT.length; indCPT++){
        if(!_.isUndefined(arrCPT[indCPT].encounterUid)){
            indResults = array.findIndex(mergedResults,{uid: arrCPT[indCPT].encounterUid});
            if(indResults != -1){
                if(_.isUndefined(mergedResults[indResults].cptInfo)){
                    mergedResults[indResults].cptInfo = [];
                }
                mergedResults[indResults].cptInfo.push(arrCPT[indCPT]);
            }
        }
    }
    // add procedure events to procedure
    cptToProcedure(mergedResults,JSON.parse(JSON.stringify(arrCPT))); //arrVisit,
    mergedResults = resultUtils.sortResults(mergedResults, order);

    return mergedResults;
}

function getActivityDateTime(resultItem) {
    if (isVisit(resultItem)) {
        if (isHospitalization(resultItem) && isDischargedOrAdmitted(resultItem)) {
            return resultItem.stay.dischargeDateTime;
        }
        return resultItem.dateTime;
    } else if (isImmunization(resultItem)) {
        return resultItem.administeredDateTime;
    } else if (isLaboratory(resultItem)) {
        return resultItem.observed;
    } else {
        //generally it's dateTime, so try that if there is an unhandled usecase
        return resultItem.dateTime;
    }
}

function isVisit(resultItem) {
    if (resultItem.kind) {
        var kind = resultItem.kind.toLowerCase();
        return kind === 'visit' || kind === 'admission';
    }
    return false;
}

function isHospitalization(resultItem) {
    return resultItem.categoryCode === 'urn:va:encounter-category:AD';
}

//returns true if discharged, false if admitted
function isDischargedOrAdmitted(resultItem) {
    if (resultItem.stay) {
        return resultItem.stay.dischargeDateTime !== undefined;
    }
    return false;
}

function isImmunization(resultItem) {
    if (resultItem.kind) {
        var kind = resultItem.kind.toLowerCase();
        return kind === 'immunization';
    }
    return false;
}

function isLaboratory(resultItem) {
    if (resultItem.kind) {
        var kind = resultItem.kind.toLowerCase();
        return kind === 'laboratory' || kind === 'microbiology';
    }
    return false;
}

function isMicrobiology(resultItem) {
    if (resultItem.kind) {
        var kind = resultItem.kind.toLowerCase();
        return kind === 'microbiology';
    }
    return false;
}

function isNotFound(obj) {
    return ('code' in obj.error && String(obj.error.code) === String(rdk.httpstatus.not_found));
}

function FetchError(message, error) {
    this.name = 'FetchError';
    this.error = error;
    this.message = message;
}

function NotFoundError(message, error) {
    this.name = 'NotFoundError';
    this.error = error;
    this.message = message;
}

exports.getResourceConfig = getResourceConfig;
exports.mergeResults = mergeResults; // for testing only
exports.getActivityDateTime = getActivityDateTime; // for testing only
exports.isVisit = isVisit; // for testing only
exports.isHospitalization = isHospitalization; // for testing only
exports.isDischargedOrAdmitted = isDischargedOrAdmitted; // for testing only
exports.isImmunization = isImmunization; // for testing only
exports.isLaboratory = isLaboratory; // for testing only
