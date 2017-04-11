/*jslint node: true */
'use strict';

var _ = require('lodash');
var rdk = require('../../core/rdk');
var rulesEngine = require('../pdp/rules-engine');
var rules = require('../pdp/permission-rules').rules;

/**
 * Handler used to load a user's permissions in the session user object.
 *
 * @param req       current request that contain user session
 * @param res       response - not used
 * @param callback  final processing callback
 */
module.exports = function(req, res, callback) {
    if (!_.isObject(req.session.user)) {
        return setImmediate(callback, {message: 'No user defined for this session.', code: rdk.httpstatus.internal_server_error});
    }
    var msg = '';
    var permissionsObj = {
        'permissions': {
            'required': _.result(req, '_resourceConfigItem.requiredPermissions', []),
            'user': _.result(req, 'session.user.permissions', [])
        }
    };
    req.logger.info('permissions: %o ', permissionsObj);
    rulesEngine.executeRules(rules, permissionsObj, function(results) {
        if (_.isString(results)) {
            if(results === 'Permit'){
                msg = 'AUTHORIZED - User has the required permissions for this resource. Continuing pep... ';
                req.logger.info(msg);
                return callback(null, results);
            }else{
                msg = 'FORBIDDEN - User lacks permissions for this resource.';
                req.logger.info(msg);
                return callback({message: msg, code: rdk.httpstatus.forbidden}, null);
            }
        } else{
            msg = 'INTERNAL ERROR - User permissions not formatted properly';
            req.logger.info(msg);
            return callback({message: msg, code: rdk.httpstatus.internal_server_error}, null);
        }
    });
};
