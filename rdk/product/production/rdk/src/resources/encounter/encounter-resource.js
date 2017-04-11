'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');
var jdsFilter = require('jds-filter');
var querystring = require('querystring');
var nullchecker = rdk.utils.nullchecker;
var httpUtil = rdk.utils.http;
var domains = require('../../fhir/common/domain-map.js');
var encounterFields = require('./encounter-data-obj');
var filemanDateUtil = require('../../utils/fileman-date-converter');
var async = require('async');
var vistaJs = require('vista-js');
var paramUtil = require('../../utils/param-converter');
var RpcClient = vistaJs.RpcClient;
var locationUtil = rdk.utils.locationUtil;
var RpcParameter = vistaJs.RpcParameter;
var visitCategories = require('../../write/pick-list/encounters/encounters-visit-categories-fetch-list');

var parameters = {
    get: {
        pid: {
            required: true,
            description: 'patient id'
        },
        dateTime: {
            required: true,
            description: 'Location datetime'
        },
        locationUid: {
            required: true,
            description: 'Location UID'
        }
    }
};

function getResourceConfig() {
    return [{
        name: 'encounter-encounterInfo',
        path: '/info',
        get: getEncounterData,
        parameters: parameters,
        subsystems: ['patientrecord', 'jds', 'solr', 'jdsSync', 'authorization'],
        outerceptors: ['emulateJdsResponse'],
        requiredPermissions: [],
        isPatientCentric: true,
        permitResponseFormat: true
    }];
}

function getEncounterData(req, res, next) {
    //the encounter object that will be added to as the RPC response is parse
    var encounter = {};
    var config = req.app.config;
    var pid = req.param('pid');
    var dateTime = req.param('dateTime');
    var locationUid = req.param('locationUid');
    var serviceCategory = req.param('serviceCategory');
    var site = req.session.user.site;
    var HMP_UI_CONTEXT = 'HMP UI CONTEXT';
    var RPC_NAME = 'ORWPCE PCE4NOTE';
    //NOTE_IEN is an optional parameter for the PCE4NOTE
    var NOTE_IEN = '-2';
    var dfn = req.interceptorResults.patientIdentifiers.dfn;
    var locationIEN = locationUtil.getLocationIEN(locationUid);
    var dateTimeMoment = paramUtil.convertWriteBackInputDate(dateTime);
    var filemanDate = filemanDateUtil.getFilemanDateTimeWithSeconds(dateTimeMoment.toDate());

    if(nullchecker.isNullish(dfn)){
        return res.status(500).rdkSend('Missing required patient identifiers.');
    }
    //this will be replaced with an RPC call ORWCV VST
    var visitString = locationIEN + ';' + filemanDate + ';' + serviceCategory;

    // Extend onto an empty object to prevent overwriting the
    // running configuration with our custom values in the
    // last object
    var vistaConfig = _.extend({}, req.app.config.vistaSites[site], {
        context: HMP_UI_CONTEXT,
        accessCode: req.session.user.accessCode,
        verifyCode: req.session.user.verifyCode
    });

    var parameters = [];
    parameters.push(RpcParameter.literal(NOTE_IEN));
    parameters.push(RpcParameter.literal(dfn));
    parameters.push(RpcParameter.literal(visitString));

    var rpc = RpcClient.callRpc(req.logger, vistaConfig, RPC_NAME, parameters, function(err, result) {
        if (err) {
            req.logger.error(err, 'ORWPCE PCE4NOTE: response error');
            return res.status(500).rdkSend(err);
        }

        var cleanResult = getCleanResultInfo(result);
        var allResponseComments = getAllComments(cleanResult);

        encounter = getProvidersInfo(cleanResult, encounter);
        encounter = getVisitAndProcedureInfo(cleanResult, encounter, allResponseComments);
        encounter = getDiagnosisInfo(cleanResult, encounter, allResponseComments);
        encounter = getServiceRelatedItems(cleanResult, encounter);

        var visitConfig = _.extend({}, req.app.config.vistaSites[site], {
            context: 'OR CPRS GUI CHART',
            accessCode: req.session.user.accessCode,
            verifyCode: req.session.user.verifyCode,
        });

        // Since the Visit section and the Procedures section both contain CPT data,
        // we distinguish them by grabbing a list of Visit Categories. If the data
        // contains one of the Visit Categories, we can assume we are processing a
        // Visit. Otherwise, we will process the data as a Procedure.
        var visitCategoriesCallback = function(err, fetchResult) {
            encounter.visitType = {};
            encounter.procedures = {};
            var categoryArray = [];
            var visitFound = false;

            if (err) {
                req.logger.error({error: err}, 'An error occurred while retrieving the visit categories pick list');
            } else if (!_.isUndefined(fetchResult)) {
                _.each(fetchResult, function(pickListObj) {
                    categoryArray.push(pickListObj.categoryName);
                });
            }

            for (var i = 0; i < categoryArray.length && visitFound === false; ++i) {
                for (var j = 0; j < encounter.visitAndProcedures.length; ++j) {
                    if (categoryArray[i] === encounter.visitAndProcedures[j].category) {
                        encounter.visitType = encounter.visitAndProcedures[j];
                        encounter.visitAndProcedures.splice(j, 1);
                        encounter.procedures = encounter.visitAndProcedures;
                        visitFound = true;
                        delete encounter.visitAndProcedures;
                        break;
                    }
                }
            }

            if (visitFound === false) {
                encounter.procedures = encounter.visitAndProcedures;
                delete encounter.visitAndProcedures;
            }

            req.logger.debug('ORWPCE PCE4NOTE: response success');
            return res.rdkSend({
                data: encounter
            });
        };

        visitCategories.fetch(req.logger, visitConfig, visitCategoriesCallback, {
            locationUid: locationUid,
            visitDate: dateTime
        });
    });

    var getAllComments = function(cleanResult) {
        var allComment = [];
        for (var i = 0; i < cleanResult.length; ++i) {
            if (cleanResult[i].substring(0, 3) === 'COM') {
                allComment.push(cleanResult[i]);
            }
        }
        return allComment;
    };

    var getSpecificComment = function(commentNum, comments) {
        var retComment = '';
        var choppedComment = [];
        for (var i = 0; i < comments.length; ++i) {
            choppedComment = lineChopper(comments[i]);
            if (commentNum === choppedComment[1]) {
                retComment = choppedComment[2];
            }
        }
        return retComment;
    };

    var getCleanResultInfo = function(cleanResult) {
        return JSON.stringify(cleanResult).split('\\r\\n');
    };

    var lineChopper = function(lineToBeSplit) {
        var caret = String.fromCharCode(94);
        var splitLine = lineToBeSplit.split(caret);
        return splitLine;
    };

    var getModifierCodes = function(codes) {
        var codeArray = codes.split(';');
        codeArray.shift();
        for (var k = 0; k < codeArray.length; ++k) {
            codeArray[k] = codeArray[k].substring(1);
        }

        var retArray = [];
        for (var i = 0; i < codeArray.length; ++i) {
            retArray.push({
                'ien': codeArray[i]
            });
        }
        return retArray;
    };

    var getVisitAndProcedureInfo = function(cleanResult, encounter, comments) {
        var allProcedures = [];
        for (var i = 0; i < cleanResult.length; ++i) {
            if (cleanResult[i].substring(0, 3) === 'CPT') {
                allProcedures.push(cleanResult[i]);
            }
        }
        var cptObjArray = [];
        for (var k = 0; k < allProcedures.length; ++k) {
            var splitProcedureLine = lineChopper(allProcedures[k]);
            var proceduresObj = parseVisitAndProceduresInfo(splitProcedureLine, encounter, comments);
            cptObjArray.push(proceduresObj);
        }
        encounter.visitAndProcedures = cptObjArray;
        return encounter;
    };

    var parseVisitAndProceduresInfo = function(cpt, encounter, comments) {
        var cptObj = {
            category: '',
            description: '',
            code: '',
            quantity: '',
            providerIen: '',
            cptModifiers: [{
                ien: ''
            }],
            comment: ''
        };
        if (cpt[2] !== '' && cpt[2] !== undefined && cpt[2] !== 'OTHER') {
            cptObj.category = cpt[2];
        } else {
            cptObj.category = 'OTHER PROCEDURES';
        }
        cptObj.description = cpt[3];
        cptObj.code = cpt[1];
        cptObj.quantity = cpt[4];
        cptObj.providerIen = cpt[5];
        cptObj.cptModifiers = getModifierCodes(cpt[8]);
        if (cpt[9] !== undefined && cpt[9] !== '') {
            cptObj.comment = getSpecificComment(cpt[9], comments);
        }
        return cptObj;
    };

    var getDiagnosisInfo = function(cleanResult, encounter, comments) {
        var allDiagnoses = [];
        for (var i = 0; i < cleanResult.length; ++i) {
            if (cleanResult[i].substring(0, 3) === 'POV') {
                allDiagnoses.push(cleanResult[i]);
            }
        }
        var diagnosesObjArray = [];
        for (var k = 0; k < allDiagnoses.length; ++k) {
            var splitDiagnosisLine = lineChopper(allDiagnoses[k]);
            var diagnosisObj = parseDiagnosisInfo(splitDiagnosisLine, comments);
            diagnosesObjArray.push(diagnosisObj);
        }
        encounter.diagnoses = diagnosesObjArray;
        return encounter;
    };

    var parseDiagnosisInfo = function(diagnosis, comments) {
        var diagnosisObj = {
            category: '',
            code: '',
            description: '',
            primary: false,
            comment: ''
        };
        if (diagnosis[2] !== '' && diagnosis[2] !== undefined && diagnosis[2] !== 'OTHER') {
            diagnosisObj.category = diagnosis[2];
        } else {
            diagnosisObj.category = 'OTHER DIAGNOSES';
        }
        diagnosisObj.code = diagnosis[1];
        diagnosisObj.description = diagnosis[3];
        if (diagnosis[4] === '1') {
            diagnosisObj.primary = true;
        }
        if (diagnosis[9] !== undefined && diagnosis[9] !== '') {
            diagnosisObj.comment = getSpecificComment(diagnosis[9], comments);
        }
        return diagnosisObj;
    };

    var getProvidersInfo = function(splitResult, encounter) {
        var allProviders = [];
        var providers = [];

        //find all the providers
        _.each(splitResult, function(element) {
            if (element.indexOf('PRV') !== -1) {
                allProviders.push(element);
            }
        });

        //extract details for each provider
        _.each(allProviders, function(element) {
            var provider = {};
            var providerArray = [];
            if (element) {
                var splitElement = lineChopper(element);
                provider.ien = '';
                provider.name = '';
                provider.primary = false;
                if (splitElement) {
                    if (splitElement[1]) {
                        provider.ien = splitElement[1];
                    }
                    if (splitElement[4]) {
                        provider.name = splitElement[4];
                    }
                    if (splitElement[5] === '1') {
                        provider.primary = true;
                    }
                }
            }

            providers.push(provider);
        });

        encounter.providers = providers;
        return encounter;
    };

    var getServiceRelatedItems = function(splitResult, encounter) {
        var SERVICE_CONNECTED        = 'SC',
            AGENT_ORANGE             = 'AO',
            IONIZING_RADIATION       = 'IR',
            SW_ASIA                  = 'EC',
            MILITARY_SEXUAL_TRAUMA   = 'MST',
            HEAD_NECK_CANCER         = 'HNC',
            COMBAT_VETERAN           = 'CV',
            SHIPBOARD_HAZARD_DEFENSE = 'SHD';
        var visitRelatedArray = [];
        var allServiceRelatedItems = [];

        function convertVisitRelatedValueToYesNo(value) {
            return (value === '1') ? 'yes' : 'no';
        }

        _.each(splitResult, function(element) {
            if (element.indexOf('VST') !== -1) {
                allServiceRelatedItems.push(element);
            }
        });

        //extract details for the service related items
        _.each(allServiceRelatedItems, function(element) {
            if (element) {
                var splitElement;
                if (element.indexOf(SERVICE_CONNECTED) !== -1) {
                    splitElement = lineChopper(element);
                    if (!_.isEmpty(splitElement[2])) {
                        visitRelatedArray.push({visitRelated: SERVICE_CONNECTED, value: convertVisitRelatedValueToYesNo(splitElement[2])});
                    }
                }
                if (element.indexOf(COMBAT_VETERAN) !== -1) {
                    splitElement = lineChopper(element);
                    if (!_.isEmpty(splitElement[2])) {
                        visitRelatedArray.push({visitRelated: COMBAT_VETERAN, value: convertVisitRelatedValueToYesNo(splitElement[2])});
                        COMBAT_VETERAN = splitElement[2];
                    }
                }
                if (element.indexOf(AGENT_ORANGE) !== -1) {
                    splitElement = lineChopper(element);
                    if (!_.isEmpty(splitElement[2])) {
                       visitRelatedArray.push({visitRelated: AGENT_ORANGE, value: convertVisitRelatedValueToYesNo(splitElement[2])});
                    }
                }
                if (element.indexOf(IONIZING_RADIATION) !== -1) {
                    splitElement = lineChopper(element);
                    if (!_.isEmpty(splitElement[2])) {
                        visitRelatedArray.push({visitRelated: IONIZING_RADIATION, value: convertVisitRelatedValueToYesNo(splitElement[2])});
                    }
                }
                if (element.indexOf(SW_ASIA) !== -1) {
                    splitElement = lineChopper(element);
                    if (!_.isEmpty(splitElement[2])) {
                        visitRelatedArray.push({visitRelated: SW_ASIA, value: convertVisitRelatedValueToYesNo(splitElement[2])});
                    }
                }
                if (element.indexOf(SHIPBOARD_HAZARD_DEFENSE) !== -1) {
                    splitElement = lineChopper(element);
                    if (!_.isEmpty(splitElement[2])) {
                        visitRelatedArray.push({visitRelated: SHIPBOARD_HAZARD_DEFENSE, value: convertVisitRelatedValueToYesNo(splitElement[2])});
                    }
                }
                if (element.indexOf(MILITARY_SEXUAL_TRAUMA) !== -1) {
                    splitElement = lineChopper(element);
                    if (!_.isEmpty(splitElement[2])) {
                        visitRelatedArray.push({visitRelated: MILITARY_SEXUAL_TRAUMA, value: convertVisitRelatedValueToYesNo(splitElement[2])});
                    }
                }
                if (element.indexOf(HEAD_NECK_CANCER) !== -1) {
                    splitElement = lineChopper(element);
                    if (!_.isEmpty(splitElement[2])) {
                        visitRelatedArray.push({visitRelated: HEAD_NECK_CANCER, value: convertVisitRelatedValueToYesNo(splitElement[2])});
                    }
                }
            }
        });
        encounter.visitRelated = visitRelatedArray;
        return encounter;
    };

}

module.exports.getResourceConfig = getResourceConfig;
