'use strict';
var rdk = require('../../core/rdk');
var rulesEngine = require('../pdp/rules-engine');
var rules = require('../pdp/user-policy-rules').rules;
var userPermissionsPolicyBuilder = require('./user-policy-builder')._buildUserPolicy;

/**
 * Handler used to determine if the session user has the needed access for the current request.
 *
 * @param req       current request that contain user session
 * @param res       response
 * @param callback  final processing callback
 */
module.exports = function(req, res, callback) {
    var userPermission = userPermissionsPolicyBuilder(req);
    rulesEngine.executeRules(rules, userPermission, function(results) {
        req.logger.debug('PEP User Policy: ' + results.code + ' pep response received.');
        if (results.code === 'Permit') {
            return callback(null, results);
        }
        return callback({
            message: results.text,
            code: rdk.httpstatus.forbidden
        }, null);
    });
};
