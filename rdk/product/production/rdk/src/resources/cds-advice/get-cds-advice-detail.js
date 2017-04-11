'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');
var RpcClient = require('vista-js').RpcClient;
var getVistaRpcConfiguration = require('../../utils/rpc-config').getVistaRpcConfiguration;
var nullchecker = rdk.utils.nullchecker;
var adviceCache = require('./advice-cache');
var auditUtil = require('../../utils/audit');

var errorVistaJSCallback = 'VistaJS RPC callback error: ';
var errorDetailNotFound = 'Advice detail not available';
var errorMissingRequiredParam = 'Missing required parameters. The following parameters are required: pid, use, id.';

/*
 * Create a JSON object from the parameters
 *
 * @param {string} detail the advice detail information
 * @param {string} provenance the advice provenance information
 */
function createDetails(detail, provenance) {
    return {
        detail: detail,
        provenance: provenance
    };
}

/*
 * Create a JSON response object for details
 *
 * @param {object} details the details information
 */
function createResponse(details) {
    return {
        data: {
            items: [details]
        }
    };
}

/**
 * Retrieve the advice/reminder detail. Uses the site id that is stored in the user session.
 *
 * @api {get} /resource/cds/advice/detail?pid=123VQWE&use=test&id=4567 Request CDS Advice Detail
 *
 * @apiName AdviceDetail
 * @apiGroup CDS Advice
 *
 * @apiparam {string} pid The patient identifier
 * @apiparam {string} use The CDS Use (Intent)
 * @apiparam {string} id The advice list id
 *
 * @apiSuccess (Success 200) {json} payload Detailed information
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 Success
  {
     “details”:{
          “detail”:“Patient John Smith is due for lab tests.”,
          “provenance”:“The U.S. Preventive Service s Task Force (USPSTF) recommends screening…”
      }
   }
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 400 Bad Request
  {
    CDS Advice - missing or null parameters
  }
 * @param {object} req The HTTP request object
 * @param {object} res The HTTP response object
 * @returns Details object
 */
module.exports = {
    getCDSAdviceDetail: function(req, res) {
        req.logger.info('retrieve cds advice detail resource GET called');

        var pid = req.param('pid');
        var use = req.param('use');
        var adviceId = req.param('id');

        req.logger.debug('pid: ' + pid);
        req.logger.debug('use: ' + use);
        req.logger.debug('advice detail id: ' + adviceId);

        // Audit this access
        req.audit.dataDomain = 'CDS';
        req.audit.logCategory = 'ADVICE';
        req.audit.patientId = pid;
        auditUtil.addAdditionalMessage(req, 'use', use);
        auditUtil.addAdditionalMessage(req, 'id', adviceId);

        // check for required parameters
        if (nullchecker.isNullish(pid) || nullchecker.isNullish(use) || nullchecker.isNullish(adviceId)) {
            return res.status(rdk.httpstatus.bad_request).end(errorMissingRequiredParam);
        }

        var cached = adviceCache.getCachedAdvice(req.session, pid, use, adviceId);
        if (cached && !_.isEmpty(cached.details)) {
            return res.rdkSend(createResponse(cached.details));
        }

        if (_.isUndefined(_.get(req, 'interceptorResults.patientIdentifiers.dfn'))) {
            req.logger.error('CDS Advice - Error retrieving clinical reminder details, DFN is nullish.');
            return res.status(rdk.httpstatus.not_found).rdkSend(errorDetailNotFound);
        }

        var dfn = req.interceptorResults.patientIdentifiers.dfn;
        req.logger.info('retrieve cds advice detail');
        req.logger.debug('dfn: ' + dfn);

        // Make the RPC call and cache the result
        RpcClient.callRpc(req.logger, getVistaRpcConfiguration(req.app.config, req.session.user), 'ORQQPX REMINDER DETAIL', [dfn, adviceId], function(error, result) {
            if (error) {
                req.logger.error(errorVistaJSCallback + error);
                return res.status(rdk.httpstatus.not_found).rdkSend(errorDetailNotFound);
            }
            req.logger.info('Successfully retrieved cds advice detail from VistA.');
            var details = createDetails(result || null, null);
            if (cached) {
                cached.details = details;
            }
            return res.status(rdk.httpstatus.ok).rdkSend(createResponse(details));
        });
    }
};
