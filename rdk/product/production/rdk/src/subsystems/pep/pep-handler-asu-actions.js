/*jslint node: true */
'use strict';

var _ = require('lodash');
var rdk = require('../../core/rdk');
var nullchecker = rdk.utils.nullchecker;
var asu = require('../../subsystems/asu/asu-process');

/**
 * Handler used to load a user's permissions in the session user object.
 *
 * @param req       current request that contain user session
 * @param res       response - not used
 * @param callback  final processing callback
 */

module.exports = function(req, res, callback) {
    var actions = _.result(req ,'_resourceConfigItem.requiredASUActions');
    if (!_.isObject(req.session.user)) {
        return setImmediate(callback, {message: 'No user defined for this session.', code: rdk.httpstatus.internal_server_error});
    }
    var item = req.body;
    if (_.has(item, 'itemChecklist')) {
        item = item.itemChecklist[0];
    }
    var asuItem = {
            data: {
                items: [item]
            },
            actionNames: actions
        };
    var msg = '';
    asu.getAsuPermissionForActionNames(req, asuItem, function(asuError, asuResult) {
        var item = asuItem.data.items[0];

        if (!nullchecker.isNullish(asuError) || _.isNull(asuResult)) {
            req.logger.error('asu-utils.applyAsuRules: Failed to check ASU for item %j: Error %j .asuResult %j', item.localTitle, asuError, asuResult);
            return callback(asuError);
        }
        req.logger.debug('asu-utils.applyAsuRules: Displaying result for item %j ASU result: %j', item.localTitle, asuResult);

        var denied = _.chain(asuResult)
                        .filter(function(perm) {return perm.hasPermission === false;})
                        .map(function(perm) { return perm.actionName;})
                        .value();

        if (denied.length === 0) {
            msg = 'AUTHORIZED - User has the required permissions for this resource.';
            req.logger.info(msg);
            return callback(null, 'asu success');
        }
        else {
            msg = 'UNAUTHORIZED - User lacks ASU permissions for this resource.';
            req.logger.info(msg);
            return callback({message: msg, code: rdk.httpstatus.unauthorized}, null);
        }
    });
    //Do some calls based on the documents on the request to ASU rules
    //callback(null, 'asu success');
};
