'use strict';
var rdk = require('../../core/rdk');
var _ = require('lodash');
var dd = require('drilldown');
var http = rdk.utils.http;
var fs = require('fs');
var _s = require('underscore.string');
var parseString = require('xml2js').parseString;
var mvi = require('../../subsystems/mvi-subsystem');
var crypto = require('crypto');
var moment = require('moment');
var searchUtil = require('../patient-search/results-parser');
var RpcClient = require('vista-js').RpcClient;
var getVistaRpcConfiguration = require('../../utils/rpc-config').getVistaRpcConfiguration;
// The base64 encoded gender-neutral image to return when a patient photo is not found in VHIC
var genderNeutralEncodedImageString = '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';

function getResourceConfig() {
    return [{
        name: 'patientphoto-getPatientPhoto',
        path: '',
        get: getPatientPhoto,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false,
            convertPid: true
        },
        requiredPermissions: [],
        isPatientCentric: true,
        description: 'Get patient photo from VHIC',
        permitResponseFormat: true
    }];
}

/**
 * Retrieves a patient photo from VHIC based on the given patient ICN.
 *
 * @param  {Object} req - default Express request
 * @param  {Object} res - default Express response
 *
 * @return undefined
 *
 * 200 if user has access,
 * 308 if user needs to BTG,
 * 403 if unauthorized.
 */
function getPatientPhoto(req, res) {

    if (_.isUndefined(req.param('pid'))) {
        return res.status(rdk.httpstatus.bad_request).send('Missing parameter. Please include a pid parameter.');
    }

    // Set audit log parameters
    req.audit.dataDomain = 'Patient Photo';
    req.audit.logCategory = 'PATIENT_PHOTO';

    getVhicIdFromJds(req, res, function callback(vhicId) {
        if(!_.isUndefined(vhicId)){
            return fetchImageFromVhic(vhicId, req, res);
        }
        var requestedDfn;
        //Get the dfn from the request
        if (req.interceptorResults.patientIdentifiers && req.interceptorResults.patientIdentifiers.dfn) {
            requestedDfn = req.interceptorResults.patientIdentifiers.vhic;
        }

        var requestedLocalId = requestedDfn + '^PI^USVHA^500';
        //if we do not have local id,  go straight to mvi
        if (!requestedDfn) {
            return getImageUsingMVI(req, res);
        }

        //Otherwise go to local vista instance first to see if we have a VHIC ID stored
        var rpcConfig = getVistaRpcConfiguration(req.app.config, req.session.user.site);
        rpcConfig.context = 'HMP SYNCHRONIZATION CONTEXT';

        if (requestedDfn) {
            req.logger.debug(' VHIC ID found: %s', requestedDfn);
            return fetchImageFromVhic(requestedLocalId, req, res);
        }
        req.logger.debug(' VHIC ID not found.');
        RpcClient.callRpc(req.logger, rpcConfig, 'VAFC LOCAL GETCORRESPONDINGIDS', requestedLocalId, function(error, result) {
            getPatientPhotoCallRpcCallBack(error, result, req, res);
        });
    });


}

/**
 * Retrieves the VHIC Id from JDS based on patients PID.
 * @param  req The request from the client
 * @param  res The response for the client
 * @return the response
 */
function getVhicIdFromJds(req, res, callback) {
    var config = req.app.config;
    var domain = 'vhic-id';
    var pid;
    if (req.interceptorResults.patientIdentifiers && req.interceptorResults.patientIdentifiers.icn) {
        pid = req.interceptorResults.patientIdentifiers.icn;

        //Not using the JDS substem, because it makes a call to /vpr/{pid}/index/, and vpr/{pid}/index/vhic-id
        //doesn't exist, only /vpr/{pid}/find/vhic-id exists.
        var jdsPath = '/vpr/' + pid + '/find/' + domain;
        var options = _.extend({}, config.jdsServer, {
            url: jdsPath,
            logger: req.logger,
            json: true
        });

        rdk.utils.http.get(options, function(error, response, body) {
            if (error) {
                req.logger.warn('Received error response from JDS when retrieving vhicId. ' + error);
                return callback();
            }
            var ids = body.data.items[0].vhicIds;
            var vhicIdObj = _.find(ids, 'active');
            if (!_.isUndefined(vhicIdObj) && !_.isUndefined(vhicIdObj.vhicId)) {
                req.logger.warn('JDS did not have an active vhicId available. ' + error);
                return callback();
            }
            return callback(vhicIdObj.vhicId);
        });
    } else {
        callback();
    }
}

/**
 * Retrieves the patients image using the VHIC Image ID found in MVI.  If an error occurs,
 * contacting the MVI, the generic image will be returned on the response.
 * @param  req The request from the client
 * @param  res The response for the client
 * @return the response
 */
function getImageUsingMVI(req, res) {

    //Build the full ICN patient identifier so we can pass it into MVI
    var requestedMviId = req.param('pid') + '^NI^200M^USVHA';

    // Get the MVI HTTP configuration
    var mviHttpConfig = mvi.getMVIHttpConfig(req.app.config, req.logger);

    // Define the substitution values to use for the MVI query
    var mviQuerySub = {
        time: moment().format('YYYYMMDDHHmmss'),
        id: requestedMviId,
        firstname: req.session.user.firstname || '',
        lastname: req.session.user.lastname || '',
        sender: req.app.config.mvi.senderCode,
        msgID: crypto.randomBytes(8).toString('hex')
    };

    // Load the MVI SOAP request XML
    var xml_1309 = fs.readFileSync(__dirname + '/../patient-search/xml/1309.xml').toString();
    // Replace the variables inside the XML with the corresponding substitution values
    // to build the MVI SOAP request
    mviHttpConfig.body = _s.sprintf(xml_1309, mviQuerySub);
    // Send the SOAP request to MVI
    http.post(mviHttpConfig, function(error, response, data) {

        if (error) {
            req.logger.warn({error: error}, 'Received error response from MVI when attempting a POST request.');
            return res.status(rdk.httpstatus.ok).type('jpeg').set('Content-Encoding', 'base64').send(genderNeutralEncodedImageString);
        }
        var getIdCallback = getIdFromSoapEnvelope.bind(null, req, res);
        return parseString(data, getIdCallback);
    });
}

/**
 * Extracts the VHIC image ID from the soap envelope.  If no VHIC ID is found in the soap
 * envelope, the generic image wil be returned on the response.
 *
 * @param  req The request from the client
 * @param  res The response for the client
 * @param  err Error message in case of a parse exception
 * @param  result  The result of the parse function
 * @return the response
 */
function getIdFromSoapEnvelope(req, res, err, result) {

    if (err) {
        req.logger.warn({error: err}, 'A problem occurred while attempting to parse results from MVI');
        return res.status(rdk.httpstatus.ok).type('jpeg').set('Content-Encoding', 'base64').send(genderNeutralEncodedImageString);
    }
    // Get the id element out of the MVI SOAP response
    if (JSON.stringify(result).indexOf('subject1') === -1) {

        req.logger.warn('The MVI did not return any patient IDs.');
        return res.status(rdk.httpstatus.ok).type('jpeg').set('Content-Encoding', 'base64').send(genderNeutralEncodedImageString);
    }
    var idObjectFromTree = searchUtil.retrieveObjFromTree(result, ['Envelope', 'Body', 0, 'PRPA_IN201310UV02', 0, 'controlActProcess', 0, 'subject', 0, 'registrationEvent', 0, 'subject1', 0, 'patient', 0, 'id']);

    // Create a map of the patient ids that are in the SOAP response
    var idList = _.map(idObjectFromTree, function(value) {
        return value.$.extension;
    });

    var vhicId;

    // Iterate through the idList to find the VHIC id
    _.each(idList, function(item) {
        var idType = searchUtil.determineIDType(item);
        if (idType === 'VHIC') {
            vhicId = item;
        }
    });

    if (!_.isString(vhicId)) {
        req.logger.warn('The MVI did not return a VHIC ID.');
        return res.status(rdk.httpstatus.ok).type('jpeg').set('Content-Encoding', 'base64').send(genderNeutralEncodedImageString);
    } else {
        return fetchImageFromVhic(vhicId, req, res);
    }
}

/**
 * Queries the VHIC server with the given VHIC ID.  If no image is found, the generic image will be returned on the response.
 * @param  The fully qualified VHIC ID
 * @param  req The request from the client
 * @param  res The response for the client
 * @return the response.
 */
function fetchImageFromVhic(vhicId, req, res) {
    req.logger.debug(' Using VHIC: %s', vhicId);
    var vhicIdOnly = vhicId.split('^');
    vhicIdOnly = vhicIdOnly[0];
    if (!_.isString(vhicIdOnly)) {
        req.logger.warn(' The VHIC ID was not in the expected format:  ' + vhicId);
        return res.status(rdk.httpstatus.ok).type('jpeg').set('Content-Encoding', 'base64').send(genderNeutralEncodedImageString);
    }

    // Get the VHIC HTTP configuration
    var vhicHttpConfig = getVHICHttpConfig(req);
    if (!vhicHttpConfig) {
        req.logger.warn(' The VHIC endpoint was not configured correctly.');
        return res.status(rdk.httpstatus.ok).type('jpeg').set('Content-Encoding', 'base64').send(genderNeutralEncodedImageString);
    }

    // Define the substitution values to use for the VHIC query
    var vhicQuerySub = {
        time: moment().format('YYYYMMDDHHmmss'),
        id: req.param('pid'),
        firstname: req.session.user.firstname || '',
        lastname: req.session.user.lastname || '',
        sender: req.app.config.vhic.senderCode,
        msgID: crypto.randomBytes(8).toString('hex'),
        cardid: vhicIdOnly
    };
    // Load the VHIC SOAP request XML
    var xml_vhic = fs.readFileSync(__dirname + '/xml/vhic.xml').toString();

    // Replace the variables inside the XML with the corresponding substitution values
    // to build the VHIC SOAP request
    vhicHttpConfig.body = _s.sprintf(xml_vhic, vhicQuerySub);

    if (vhicHttpConfig.baseUrl) {
        //Send the soap request to VHIC
        req.logger.debug(' Sending Vhic soap request ');
        return sendSoapRequestToVhic(vhicHttpConfig, req, res);
    } else {
        req.logger.debug(' Sending Gender Neutral response. ');
        return res.status(rdk.httpstatus.ok).type('jpeg').set('Content-Encoding', 'base64').send(genderNeutralEncodedImageString);
    }

}

function getVHICHttpConfig(req) {
    var vhicConfig = req.app.config.vhic;
    var httpConfig = _.extend({}, vhicConfig, {
        url: vhicConfig.search.path, // search.path and sync.path are the same in config, but refactor this
        logger: req.logger,
        headers: {
            'Content-Type': 'text/xml; charset=utf-8'
        }
    });
    var key = dd(httpConfig)('agentOptions')('key').val;
    var cert = dd(httpConfig)('agentOptions')('cert').val;
    var ca = dd(httpConfig)('agentOptions')('ca').val;
    var certificateHeader = /^-+BEGIN.*?(KEY|CERTIFICATE)-+/;
    try {
        if (_.isString(key) && !certificateHeader.test(key)) {
            httpConfig.agentOptions.key = fs.readFileSync(key); // TODO: remove sync
        }
        if (_.isString(cert) && !certificateHeader.test(cert)) {
            httpConfig.agentOptions.cert = fs.readFileSync(cert); // TODO: remove sync
        }
        if (_.isString(ca) && !certificateHeader.test(ca)) {
            httpConfig.agentOptions.ca = fs.readFileSync(ca); // TODO: remove sync
        }
        if (_.isArray(ca)) {
            httpConfig.agentOptions.ca = _.map(ca, function(item) {
                if (_.isString(item) && !certificateHeader.test(item)) {
                    return fs.readFileSync(item);
                }
                return item;
            });
        }
    } catch (ex) {
        req.logger.error('Error reading certificate for VHIC');
        req.logger.error(ex);
        req.logger.error(httpConfig);
        process.exit(1);
    }
    return httpConfig;
}


/**
 * Sends the soap request to the VHIC
 * @param  The VHIC configuration
 * @param  req The request from the client
 * @param  res The response for the client
 * @return undefined
 */
function sendSoapRequestToVhic(vhicHttpConfig, req, res) {
    // Send the SOAP request to VHIC
    http.post(vhicHttpConfig, function(error, response, data) {
        if (!data) {
            req.logger.warn(' Received error response from VHIC: ');
            return res.status(rdk.httpstatus.ok).type('jpeg').set('Content-Encoding', 'base64').send(genderNeutralEncodedImageString);
        }

        req.logger.info(' Received data from VHIC:  ' + data);
        parseString(data, function(err, result) {
            if (!err) {
                req.logger.info({result: result}, ' Parsed results from VHIC');
                var results = searchUtil.retrieveObjFromTree(result, ['Envelope', 'Body', 0, 'getVeteranPicturesResponse', 0, 'return', 0, 'results', 0]);
                if (_.has(results, 'picture')) {
                    var patientPhoto = results.picture[0];
                    return res.status(rdk.httpstatus.ok).type('jpeg').set('Content-Encoding', 'base64').send(JSON.stringify(patientPhoto).replace('"', '').replace('"', ''));
                }
                req.logger.debug(' The patient does not have a picture.');
            } else {
                req.logger.warn({error: err}, ' Got error from VHIC');
            }
            req.logger.debug('Returning default image, since no image found in VHIC.');
            return res.status(rdk.httpstatus.ok).type('jpeg').set('Content-Encoding', 'base64').send(genderNeutralEncodedImageString);
        });
    });
}

function isVhicId(mviID) {
    if (!_.isString(mviID)) {
        return false;
    }
    var idParts = mviID.split('^');
    if (idParts[1] === 'PI' && idParts[3] === '742V1' && idParts[2] === 'USVHA') {
        return true;
    }
}

function getPatientPhotoCallRpcCallBack(error, result, req, res) {
    if (error) {
        req.logger.warn({
            error: error
        }, 'Received error calling VAFC LOCAL GETCORRESPONDINGIDS');
        //don't return the gender neutral image yet, try MVI first
    }
    if (!result) {
        // If we still have not found the VHIC ID, look it up in MVI
        return getImageUsingMVI(req, res);
    }
    var vistaIdList = result.split('\r\n');
    //This is coded with the assumption that we will only have one VHIC Id, the first will be the latest,
    //or all VHIC Ids in the list will point to the same latest photo, according to discussion
    var vhicId = _.find(vistaIdList, isVhicId);
    //if we found a valid VHIC ID from the local instance use that
    if (_.isString(vhicId)) {
        return fetchImageFromVhic(vhicId, req, res);
    }
}
module.exports._getPatientPhotoCallRpcCallback = getPatientPhotoCallRpcCallBack;
module.exports.getResourceConfig = getResourceConfig;
module.exports.getPatientPhoto = getPatientPhoto;
module.exports._getVHICHttpConfig = getVHICHttpConfig;
