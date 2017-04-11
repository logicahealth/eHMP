'use strict';

var RpcParameter = require('vista-js').RpcParameter;
var rpcClientFactory = require('../core/rpc-client-factory');
var paramUtil = require('../../utils/param-converter');
var filemanDateUtil = require('../../utils/fileman-date-converter');
var nullChecker = require('../../utils/nullchecker');
var _ = require('lodash');
var async = require('async');
var rdk = require('../../core/rdk');
var locationUtil = rdk.utils.locationUtil;
var SAVE_RPC = 'ORWPCE SAVE';
var GETSVC_RPC = 'ORWPCE GETSVC';
var CARET = '^';
var SEMICOLON = ';';
var EMPTY_COMMENT = '@';
var REMOVE_ACTION = '-';
var MODIFIER_SEPARATOR = '/';
var HDR_PIECE = 'HDR^';
var VISIT_DATE_PIECE = 'VST^DT^';
var VISIT_PATIENT_PIECE = 'VST^PT^';
var VISIT_LOCATION_PIECE = 'VST^HL^';
var VISIT_SERVICE_CATEGORY_PIECE = 'VST^VC^';
var PROVIDER_PIECE = 'PRV';
var PRIMARY_PROVIDER = '1';
var CPT_PIECE = 'CPT';
var DIAGNOSIS_POV_PIECE = 'POV';
var PROCEDURE_CPT_PIECE = 'CPT';
var COMMENT_COM_PIECE = 'COM';
var VISIT_SC_PIECE = 'VST^SC^'; // (Service Connected)
var VISIT_CV_PIECE = 'VST^CV^'; // (Combat Veteran)
var VISIT_AO_PIECE = 'VST^AO^'; // (Agent Orange)
var VISIT_IR_PIECE = 'VST^IR^'; // (Ionizing Radiation)
var VISIT_SAC_PIECE = 'VST^EC^'; // (Southwest Asia Conditions)
var VISIT_SHD_PIECE = 'VST^SHD^'; // (Shipboard Hazard and Defense)
var VISIT_MST_PIECE = 'VST^MST^'; // (MST)
var VISIT_HNC_PIECE = 'VST^HNC^'; // (Head and/or Neck Cancer)



/**
 * Saves encounter form information to VistA.
 *
 * @param  {Object} writebackContext - context object which is shared across handlers
 * @param  {Object} callback - function to callback to
 *
 * @return 200 if the save was successful
 */
module.exports.save = function(writebackContext, callback) {
    var logger = writebackContext.logger;
    var model = writebackContext.model;

    // required
    var patientDFN = writebackContext.interceptorResults.patientIdentifiers.dfn;

    if(nullChecker.isNullish(patientDFN)){
        return callback('Missing required patient identifiers');
    }

    var isInpatient = model.isInpatient;
    var locationIEN = locationUtil.getLocationIEN(model.locationUid);
    var encounterDateTime = getFilemanDate(model.encounterDateTime);

    // optional
    var noteIEN = model.noteIEN || '';
    var isHistoricalVisit = model.isHistoricalVisit || '0';
    // 'E' is the service category that indicates a historical visit
    var startingServiceCategory = (isHistoricalVisit === '1') ? 'E' : 'A';

    rpcClientFactory.getRpcClient(writebackContext, null, function(error, rpcClient) {
        if (error) {
            logger.error({
                encounterRpcClientError: error
            });
            return callback(error);
        }
        async.waterfall([
            function getVisitServiceCategory(callback) {

                //if the model does not have a service category (as in the case of new visits),
                // fetch it from ORWPCE GETSVC
                if (nullChecker.isNullish(model.serviceCategory)) {
                    var parameters = [];
                    parameters.push(new RpcParameter.literal(startingServiceCategory));
                    parameters.push(new RpcParameter.literal(locationIEN));
                    parameters.push(new RpcParameter.literal(isInpatient));

                    logger.debug('Calling ORWPCE GETSVC with the following parameters:');
                    logger.debug('  startingServiceCategory (LITERAL):', startingServiceCategory);
                    logger.debug('  locationIEN (LITERAL):', locationIEN);
                    logger.debug('  isInpatient (LITERAL):', isInpatient);

                    rpcClient.execute(GETSVC_RPC, parameters, function(error, result) {
                        if (error) {
                            logger.error({
                                encounterServiceCategoryError: error
                            });
                            callback(error);
                        }
                        logger.debug({
                            encounterServiceCategoryResult: result
                        });
                        callback(null, result);

                    });
                } else {
                    callback(null, model.serviceCategory);
                }
            },
            function saveEncounterForm(serviceCategory, callback) {
                if (!serviceCategory) {
                    var error = 'ORWPCE GETSVC did not return a service category, unable to save encounter information.';
                    logger.error({
                        encounterServiceCategoryError: error
                    });
                    callback(error);
                }

                var pceList = {};
                var pceIndex = 0;
                var commentIndex = 0;
                // ORWPCE SAVE list parameter must start at index 1
                pceList[++pceIndex] = HDR_PIECE + isInpatient + CARET + CARET + locationIEN + SEMICOLON + encounterDateTime + SEMICOLON + serviceCategory;
                pceList[++pceIndex] = VISIT_DATE_PIECE + encounterDateTime;
                pceList[++pceIndex] = VISIT_PATIENT_PIECE + patientDFN;
                pceList[++pceIndex] = VISIT_LOCATION_PIECE + locationIEN;
                pceList[++pceIndex] = VISIT_SERVICE_CATEGORY_PIECE + serviceCategory;

                //Add each service connected field to the parameters
                if (model.serviceConnected) {
                    pceList[++pceIndex] = VISIT_SC_PIECE + model.serviceConnected;
                }
                if (model.combatVeteran) {
                    pceList[++pceIndex] = VISIT_CV_PIECE + model.combatVeteran;
                }
                if (model.agentOrange) {
                    pceList[++pceIndex] = VISIT_AO_PIECE + model.agentOrange;
                }
                if (model.ionizingRadiation) {
                    pceList[++pceIndex] = VISIT_IR_PIECE + model.ionizingRadiation;
                }
                if (model.southwestAsiaConditions) {
                    pceList[++pceIndex] = VISIT_SAC_PIECE + model.southwestAsiaConditions;
                }
                if (model.shipboardHazardAndDefense) {
                    pceList[++pceIndex] = VISIT_SHD_PIECE + model.shipboardHazardAndDefense;
                }
                if (model.militarySexualTrauma) {
                    pceList[++pceIndex] = VISIT_MST_PIECE + model.militarySexualTrauma;
                }
                if (model.headAndNeckCancer) {
                    pceList[++pceIndex] = VISIT_HNC_PIECE + model.headAndNeckCancer;
                }

                //Add each provider to the list of parameters
                _.each(model.providers, function(provider) {
                    var providerPiece = PROVIDER_PIECE;

                    if (provider.action === REMOVE_ACTION) {
                        providerPiece += provider.action;
                    }
                    providerPiece += CARET + provider.ien + CARET + CARET + CARET + provider.name + CARET;
                    if (provider.primary) {
                        providerPiece += PRIMARY_PROVIDER;
                    }
                    pceList[++pceIndex] = providerPiece;
                });

                //Add the diagnoses to the list of parameters
                _.each(model.diagnoses, function(diagnosis) {
                    var diagnosisPiece = DIAGNOSIS_POV_PIECE;
                    if (diagnosis.action) {
                        diagnosisPiece += diagnosis.action;
                    }
                    diagnosis.primary = (diagnosis.primary === true) ? '1' : '0';
                    diagnosisPiece += CARET + diagnosis.code + CARET + diagnosis.category + CARET + diagnosis.description + CARET;
                    diagnosisPiece += diagnosis.primary + CARET + CARET + 0 + CARET + CARET + CARET + (++commentIndex);
                    pceList[++pceIndex] = diagnosisPiece;
                    pceList[++pceIndex] = COMMENT_COM_PIECE + CARET + (commentIndex) + EMPTY_COMMENT;
                });

                //Add the visit types to the list of parameters
                _.each(model.visitTypeData, function(visit) {
                    var visitPiece = CPT_PIECE;
                    if (visit.action) {
                        visitPiece += visit.action;

                        //if removing the visit type, set the quantity to 0, else set the quantity to 1
                        if (visit.action === REMOVE_ACTION) {
                            visit.quantity = 0;
                        } else {
                            visit.quantity = 1;
                        }
                    }
                    visitPiece += CARET + visit.code + CARET + visit.category + CARET + visit.description + CARET;
                    visitPiece += visit.quantity + CARET + visit.providerIen + CARET + CARET + CARET;

                    //if there are modifiers, add them to the param line
                    if (visit.cptModifiers) {
                        //get the number of modifiers and add each one with its code
                        visitPiece += visit.cptModifiers.length;
                        _.each(visit.cptModifiers, function(modifier) {
                            visitPiece += SEMICOLON + modifier.code + MODIFIER_SEPARATOR + modifier.ien;
                        });
                    }

                    visitPiece += CARET + (++commentIndex) + CARET;
                    pceList[++pceIndex] = visitPiece;
                    pceList[++pceIndex] = COMMENT_COM_PIECE + CARET + (commentIndex) + EMPTY_COMMENT;
                });

                //Add the procedures to the list of parameters
                _.each(model.procedureData, function(procedure) {
                    var procedurePiece = CPT_PIECE;
                    if (procedure.action) {
                        procedurePiece += procedure.action;
                    }
                    procedurePiece += CARET + procedure.code + CARET + procedure.category + CARET + procedure.description + CARET;
                    procedurePiece += procedure.quantity + CARET + procedure.providerIen + CARET + CARET + CARET;

                    //if there are modifiers, add them to the param line
                    if (procedure.cptModifiers) {
                        //get the number of modifiers and add each one with its code
                        procedurePiece += procedure.cptModifiers.length;
                        _.each(procedure.cptModifiers, function(modifier) {
                            procedurePiece += SEMICOLON + modifier.code + MODIFIER_SEPARATOR + modifier.ien;
                        });
                    }

                    //get the comments associated with the procedure
                    procedurePiece += CARET + (++commentIndex) + CARET;
                    pceList[++pceIndex] = procedurePiece;
                    if (procedure.comment) {
                        pceList[++pceIndex] = COMMENT_COM_PIECE + CARET + (commentIndex) + CARET + procedure.comment;
                    } else {
                        pceList[++pceIndex] = COMMENT_COM_PIECE + CARET + (commentIndex) + CARET + EMPTY_COMMENT;
                    }
                });

                var parameters = [];
                parameters.push(new RpcParameter.list(pceList));
                parameters.push(new RpcParameter.literal(noteIEN));
                parameters.push(new RpcParameter.literal(locationIEN));

                // these debug statements are formatted to match Last Broker Call in CPRS for easier comparison and debugging
                logger.debug('Calling ORWPCE SAVE with the following parameters:');
                logger.debug('  pceList (LIST):');
                _.each(pceList, function(element, index) {
                    logger.debug('    (' + (index) + ')=' + pceList[index]);
                });
                logger.debug('  noteIEN (LITERAL):', noteIEN);
                logger.debug('  locationIEN (LITERAL):', locationIEN);

                rpcClient.execute(SAVE_RPC, parameters, function(error, result) {
                    if (error) {
                        logger.error({
                            encounterSaveError: error
                        });
                        callback(error);
                    }
                    logger.debug({
                        encounterSaveResult: result
                    });
                    callback(null, result);
                });
            }
        ], function(err, data) {
            if (err) {
                logger.error({
                    encounterSaveError: err
                });
                return callback(err, data);
            }
            logger.debug({
                encounterSaveResult: data
            });

            writebackContext.vprModel = null;
            writebackContext.vprResponse = 'SUCCESS';
            var error = null;
            return callback(error);
        });
    });
};

/**
 * Converts a date/time object into Fileman format.
 *
 * @param  {Object} dateTime - The date/time object to convert.
 *
 * @return The date/time object in Fileman format.
 */
function getFilemanDate(dateTime) {
    var dateTimeMoment = paramUtil.convertWriteBackInputDate(dateTime);
    var dateTimeFileman = filemanDateUtil.getFilemanDateTimeWithSeconds(dateTimeMoment.toDate());
    return dateTimeFileman;
}
