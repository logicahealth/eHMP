'use strict';
var rdk = require('../../../core/rdk');
var nullchecker = rdk.utils.nullchecker;
var nutritionOrder = require('./nutrition-order');

function getResourceConfig() {
    return [{
        name: 'nutrition-order-nutrition-order',
        path: '',
        get: getNutritionOrder,
        subsystems: ['patientrecord', 'jds', 'solr', 'jdsSync', 'authorization'],
        interceptors: {
            fhirPid: true
        },
        requiredPermissions: [],
        isPatientCentric: true,
        permitResponseFormat: true
    }];
}

/**
 * @api {get} /fhir/patient/{id}/nutritionorder Get Nutrition Order
 * @apiName getNutritionOrder
 * @apiGroup Nutrition Order
 * @apiParam {Number} [_count] The number of results to show.
 *
 * @apiDescription
 *
 * @apiExample {js} Request Examples:
 *      // Limiting results count
 *      http://IP           /resource/fhir/patient/9E7A;253/nutritionorder?_count=1
 *
 * @apiSuccess {json} data Json object conforming to the <a href="http://www.hl7.org/FHIR/2015May/nutritionorder.html">Nutrition Order FHIR DTSU2 specification</a>.
 * @apiSuccessExample Success-Response:
 *
 * @apiError (Error 400) Invalid parameter values.
 * @apiErrorExample Error-Response:
 * HTTP/1.1 400 Bad Request
 * {
 *      Invalid parameter values.
 * }
 */
function getNutritionOrder(req, res) {
    var pid = req.query.pid;
    var params = {
        _count: req.query._count
    };

    if (nullchecker.isNullish(pid)) {
        return res.status(rdk.httpstatus.bad_format).send('Missing required parameter: pid');
    }

    nutritionOrder.getData(req.app.config, req.logger, pid, params, function(err, inputJSON) {
        if (nullchecker.isNotNullish(err)) {
            res.status(err.code).send(err.message);
        } else {
            var fhirBundle = nutritionOrder.convertToFhir(inputJSON, req);
            res.status(rdk.httpstatus.ok).send(fhirBundle);
        }
    });
}

module.exports.getResourceConfig = getResourceConfig;
module.exports.getNutritionOrder = getNutritionOrder;
