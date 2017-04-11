'use strict';
var _ = require('lodash');
var moment = require('moment');
var async = require('async');
var rdk = require('../../core/rdk');
var pjds = rdk.utils.pjdsStore;

var hasValidSession = function(req) {
    var valid = false;
    //This might be redundant if express-session already handles this
    if (_.has(req, 'session.cookie.expires') && _.has(req, 'session.user')) {
        var timeLeft = Math.floor(moment(req.session.cookie.expires).diff(moment().utc()) / (60000));
        if (timeLeft > 0) {
            valid = true;
        }
    }
    return valid;
};

var finalizeCall = function(next) {
    next();
};

var processAuthentication = function(req, res, next) {
    var name = req.session.systemName;
    if (_.isEmpty(name)) {
        var err = {
            message: 'No Credentials provided for system authentication.',
            status: rdk.httpstatus.unauthorized
        };
        return res.status(err.status).rdkSend(err);
    }

    async.waterfall([
        function authentication(authenticationCB) {
            req.logger.debug('System Authentication authenticating %s', name);
            var data = {
                name: name,
                consumerType: 'system',
                permissionSets: [],
                permissions: []
            };
            //Gets User Permission Sets for User
            var pjdsOptions = {
                store: 'trustsys',
                key: name
            };

            pjds.get(req, res, pjdsOptions, function(error, response) {
                if (error) {
                    req.logger.error(error, "ERROR: There was an error finding system user " + name + " in pJDS");
                    return authenticationCB({
                        status: rdk.httpstatus.unauthorized,
                        message: "Error: There was an error logging in. The error has been logged."
                    }, data);
                }
                if (_.result(data, 'name', '') !== name) {
                    var err = {
                        message: 'A valid system user was not found.',
                        status: rdk.httpstatus.unauthorized
                    };
                    return authenticationCB(err, data);
                }

                data.permissionSets = _.result(response, 'data.permissionSet.val', []);
                data.permissions = _.result(response, 'data.permissionSet.additionalPermissions', []);
                //this system is allowed to see items like a CPRS user would
                data.corsTabs = true; //TODO: remove these in future as they would no longer be needed with new consumerType pdp policy
                data.rptTabs = true;  //TODO: remove these in future as they would no longer be needed with new consumerType pdp policy
                //this system is definitely not bound by sensitive access
                data.dgSensitiveAccess = true; //TODO: remove these in future as they would no longer be needed with new consumerType pdp policy
                //this system always breaks the glass
                data.breakglass = true; //TODO: remove these in future as they would no longer be needed with new consumerType pdp policy

                return authenticationCB(null, data);

            });
        },
        function authorization(data, authorizationCB){
            req.logger.debug('System Authentication authorizing %s', name);
            var permissionSetsPjdsOptions = {
                store: 'permset',
                key: data.permissionSets
            };
            pjds.get(req, res, permissionSetsPjdsOptions, function(error, response) {
                if (error) {
                    return authorizationCB(error, data);
                }

                var permissions = data.permissions;
                _.each(response.data.items, function(item) {
                    permissions = permissions.concat(item.permissions);
                });
                permissions = _.uniq(permissions);
                data.permissions = permissions;
                return authorizationCB(null, data);
            });
        }
    ], function finalCallback(err, data) {
        req.logger.info(data, 'Session data returned in finalCallback.');
        if (err) {
            var status = err.status || rdk.httpstatus.internal_server_error;
            req.logger.error(err);
            return res.status(status).rdkSend(err.message);
        }
        var user = _.result(req, 'session.user', {});
        user = _.extend(user, data);
        req.session.user = user;
        return finalizeCall(next);
    });

};

var systemsAuthentication = function(req, res, next) {
    //check to see if we have a valid session
    if (!hasValidSession(req)) {
        if (!isSystemLoginResource(req)) {
            return res.status(rdk.httpstatus.unauthorized).rdkSend('Unauthorized. Please log in.');
        }
        //interogate headers
        req.session.systemName = req.get('Authorization');
        return processAuthentication(req, res, next);
    }

    //we have a valid session
    req.logger.info('System Authentication using found session for %s', req.session.user.name);
    return finalizeCall(next);
};

function isSystemLoginResource(req) {
    var authenticateResourceRegex = /^authentication-(internal|external)-systems-authenticate$/;
    return (authenticateResourceRegex.test(req._resourceConfigItem.title) && req._resourceConfigItem.rel === 'vha.create');
}

module.exports = systemsAuthentication;
