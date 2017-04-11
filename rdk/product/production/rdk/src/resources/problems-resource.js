'use strict';

var rdk = require('../core/rdk');
var RpcClient = require('vista-js').RpcClient;
var errorVistaJSCallback = 'VistaJS RPC callback error: ';
var getVistaRpcConfiguration = require('../utils/rpc-config').getVistaRpcConfiguration;
var _ = require('lodash');

var MATCHES_FOUND = 'matches found';

function getResourceConfig() {
    return [{
        name: 'problems-getProblems',
        path: '',
        get: getProblems,
        description: {
            get: 'Returns array of problem items that match submitted search term'
        },
        interceptors: {
            synchronize: false
        },
        requiredPermissions: ['read-condition-problem'],
        isPatientCentric: false,
        subsystems: ['patientrecord', 'jdsSync']
    }];
}

function getProblems(req, res) {
    req.logger.info('Problems resource GET called');
    req.audit.logCategory = 'PROBLEMS';

    getData(req, function (err, data) {
        if (typeof (err) === 'string') {
            req.logger.debug(err);
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        }
        if (err) {
            req.logger.error(err.message);
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        }
        res.status(rdk.httpstatus.ok).rdkSend({
            data: {
                items: data
            }
        });
    });
}

function massageData(req, input, limit) {
    if (_.isUndefined(input) || _.isNull(input)) {
        req.logger.debug('massageData: input is missing');
        return '';
    }

    var problems = input.split('\r\n');
    if (!_.isArray(problems)) {
        req.logger.debug('input is not an array');
        return '';
    }

    var retVals = [];

    // turn limit into an integer...
    var limitNumber = Number(limit);
    _.each(problems, function (problem, index) {
        var parts = problem.split('^');

        if (parts !== problem && (limitNumber === 0 || index < limitNumber)) {
            var foundProblem = new ProblemDefinition(problem);
            retVals.push(foundProblem);
        }
    });

    if (retVals.length !== 0) {
        // do not add the last entry if it is a mere count...
        var lastIndex = retVals.length - 1;
        if (retVals[lastIndex].problemNumber.indexOf(MATCHES_FOUND) !== -1) {
            retVals.splice(lastIndex, 1);
        }
    }

    return retVals;
}

function ProblemDefinition(input) {
    var parts = input.split('^');
    this.problemNumber = parts[0];
    this.problem = parts[1];
    this.icd = parts[2];
    this.lexiconCode = parts[2] + '^' + parts[3];
    this.snomed = parts[5];
    this.problemText = this.problem + ' ICD-10CM:(' + this.icd + ')';
}

/**
 * Calls the problems RPC. Uses the site id that is stored in the user session.
 *
 * @param {Object} req - The default Express request.
 * @param {function} callback - The function to call back to.
 */
function getData(req, callback) {
    var searchfor = req.param('query') || '';
    var uncoded = req.param('uncoded');
    var limit = req.param('limit') || '';

    var params = [];

    params[0] = searchfor;
    params[1] = (uncoded === undefined) ? 'PLS' : 'CLF';
    params[2] = 0;

    var rpcConfiguration = getVistaRpcConfiguration(req.app.config, req.session.user);
    rpcConfiguration.accessCode = req.session.user.accessCode;
    rpcConfiguration.verifyCode = req.session.user.verifyCode;

    RpcClient.callRpc(req.logger, rpcConfiguration, 'ORQQPL4 LEX', params, function (error, result) {
        if (error) {
            req.logger.error(errorVistaJSCallback + error);
            return callback(error);
        }
        var returnMessage = result.trim();

        req.logger.debug('for ' + searchfor + ' we got ' + returnMessage);
        req.logger.debug('Type for: ' + returnMessage + ' is ' + typeof (returnMessage));
        if (returnMessage === '') {
            callback(null, 'No data');
            return;
        }
        if (typeof (returnMessage) === 'string') {
            if (returnMessage.indexOf('Please try a different search') !== -1) {
                callback('Search is unsupported');
                return;
            }
            if (returnMessage.indexOf('Code search failed') !== -1) {
                callback(null, 'No data');
                return;
            }
        }
        var problems = massageData(req, returnMessage, limit);
        callback(null, problems);
    });
}

module.exports.getResourceConfig = getResourceConfig;
module.exports.getProblems = getProblems;
