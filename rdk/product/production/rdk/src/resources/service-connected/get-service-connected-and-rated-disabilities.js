'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');
var dd = require('drilldown');
var httpUtil = rdk.utils.http;

var noRatedDisabilitiesMessage = 'NONE STATED';
var serviceConnectedFlag = 'NO';

module.exports = getServiceConnectedAndRatedDisabilities;
module.exports._getServiceConnectedAndRatedDisabilities = getServiceConnectedAndRatedDisabilities;

/**
* Retrieves a list of a patient's disabilities and whether or not they are
* service connected.
*
* @param {Object} req - The default Express request that contains the
*                       parameters needed to retrieve disabilities for
*                       a specific patient.
* @param {Object} res - The default Express response that will contain a
*                       list of disabilities for a specific patient.
*/
function getServiceConnectedAndRatedDisabilities(req, res) {
    req.logger.debug('Service connected resource GET called');

    // Set audit log parameters
    req.audit.dataDomain = 'Service Connected';
    req.audit.logCategory = 'SERVICE_CONNECTED_RATED_DISABILITIES';
    req.audit.patientId = req.param('pid');

    var dfn = dd(req.interceptorResults)('patientIdentifiers')('siteDfn').val;

    if(!dfn) {
        req.logger.info('pid not provided');
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing pid parameter');
    }

    var appConfig = req.app.config;
    var jdsServer = appConfig.jdsServer;
    var jdsResource = '/vpr/';

    var jdsOptions = _.extend({}, jdsServer, {
        url: jdsResource + dfn,
        logger: req.logger,
        json: true
    });

    httpUtil.get(jdsOptions,
        function(err, response, data) {
            var scPercent = '',
                serviceConnected = false,
                disability = [];

            if(err) {
                req.logger.error('The fetch sent back an error:' + err);
                return res.status(500).rdkSend(err);
            } else if (response.statusCode >= 300) {
                return res.status(response.statusCode).rdkSend(data);
            }

            if (_.isObject(data.data.items[0])) {
                scPercent = data.data.items[0].scPercent;
                serviceConnected = data.data.items[0].serviceConnected;
                disability = data.data.items[0].disability;
            }

            if(!_.isArray(disability)){
                req.logger.debug('Service Connected Disability data was unavailable for this patient');
                serviceConnected = serviceConnectedFlag;
                disability = noRatedDisabilitiesMessage;
            }

            req.logger.debug('Service Connected Disability data succesfully retrieved.');
            return res.send({status: response.statusCode, data:{
                scPercent: scPercent,
                serviceConnected: serviceConnected,
                disability: disability
            }});
        }
    );
}
