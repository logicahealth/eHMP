'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');
var httpUtil = rdk.utils.http;


module.exports = getServiceConnectedAndServiceExposureList;
module.exports._getServiceConnectedAndServiceExposureList = getServiceConnectedAndServiceExposureList;

/**
* Retrieves indication of which checkbox form fields should be enabled.
*
* @param {Object} req - The default Express request that contains the
*                       parameters needed to retrieve disabilities for
*                       a specific patient.
* @param {Object} res - The default Express response that will contain a
*                       list of disabilities for a specific patient.
*/
function getServiceConnectedAndServiceExposureList(req, res) {
    req.logger.debug('Service connected resource GET called');

    // Set audit log parameters
    req.audit.dataDomain = 'Service Connected';
    req.audit.logCategory = 'SERVICE_CONNECTED_EXPOSURE_LIST';
    req.audit.patientId = req.param('pid');

    var sitePid = _.get(req.interceptorResults, 'patientIdentifiers.siteDfn');

    var appConfig = req.app.config;
    var jdsServer = appConfig.jdsServer;
    var jdsResource = '/vpr/';

    if(!sitePid) {
        req.logger.info('pid not provided');
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing pid parameter');
    }

    var jdsOptions = _.extend({}, jdsServer, {
        url: jdsResource + sitePid,
        logger: req.logger,
        json: true
    });

    httpUtil.get(jdsOptions,
        function(err, response, data) {
            var exposure = [];

            if(err) {
                req.logger.error({error: err}, 'The fetch sent back an error');
                return res.status(500).rdkSend(err);
            } else if (response.statusCode >= 300) {
                return res.status(response.statusCode).rdkSend(data);
            }

            if (_.isObject(data.data.items[0])) {
                exposure = data.data.items[0].exposure;
            }

            if(!_.isArray(exposure)){
                req.logger.debug('This patient has no Service Connected Exposure Data');
                exposure = 'NONE';
            }

            req.logger.debug('Service Connected Exposure Data successfully retrieved.');
            return res.send({status: response.statusCode, data: {exposure: exposure}});

        });

}
