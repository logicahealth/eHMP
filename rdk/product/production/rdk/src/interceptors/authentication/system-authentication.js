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
                permissionSets: [],
                permission: []
            };
            //Gets User Permission Sets for User
            var pjdsOptions = {
                store: 'trustsys',
                key: name
            };

            pjds.get(req, res, pjdsOptions, function(error, response) {
                if (error) {
                    return authenticationCB(error, data);
                }
                if (_.result(data, 'name', '') !== name) {
                    var err = {
                        message: 'A valid system user was not found.',
                        status: rdk.httpstatus.unauthorized
                    };
                    return authenticationCB(err, data);
                }

                data.permissionSets = response.data.permissionSet.val;
                //this system is allowed to see items like a CPRS user would
                data.corsTabs = true;
                data.rptTabs = true;
                //this system is definitely not bound by sensitive access
                data.dgSensitiveAccess = true;
                //this system always breaks the glass
                data.breakglass = true;

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

                var permissions = [];
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
        //interogate headers
        req.session.systemName = req.get('Authorization');
        return processAuthentication(req, res, next);
    }

    //we have a valid session
    req.logger.info('System Authentication using found session for %s', req.session.user.name);
    return finalizeCall(next);
};

module.exports = systemsAuthentication;