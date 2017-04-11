'use strict';

var _ = require('lodash');
var async = require('async');
var rdk = require('../../../core/rdk');
var RpcClient = require('vista-js').RpcClient;
var RdkTimer = rdk.utils.RdkTimer;
var RdkError = rdk.utils.RdkError;
var userUtil = require('../../user/user-whitelist');
var authUtils = require('../../../subsystems/authentication/utils');
var vistaConnect = require('../../../subsystems/authentication/modules/vista-connection');
var vistaUserClass = require('../../../subsystems/authentication/modules/vista-user-class');
var vistaUserInfo = require('../../../subsystems/authentication/modules/vista-user-info');
var jdsUserData = require('../../../subsystems/authentication/modules/jds-user-data');
var pjdsUserData = require('../../../subsystems/authentication/modules/pjds-user-data');
var osyncUsers = require('../../../subsystems/authentication/modules/osync-users');

/**
 * Function to establish a new PERSON user session. Currently this person
 * must be active in the VistA they are logging into and assigned permissions
 * within the pJDS eHMP user store
 * This is used to track the eHMP user through the RDK as they interact
 * @param  {Object} req -typical default Express request object
 * @param  {Object} res -typical default Express response object
 * @return {Object|undefined)
 */
var getSession = function(req, res) {
    var logger = req.logger;
    req.audit.dataDomain = 'Authentication';
    req.audit.logCategory = 'AUTH';
    logger.debug('DOING LOGIN');
    //set the status code for audit initially
    res.statusCode = rdk.httpstatus.ok;
    var errorObj;
    var elapsedAuthentication = new RdkTimer({
        'name': 'elapsedAuthentication',
        'start': true
    });

    var accessCode = _.get(req, 'body.accessCode', '');
    var verifyCode = _.get(req, 'body.verifyCode', '');
    var site = _.get(req, 'body.site', '');
    var division = _.get(req, 'body.division', '');
    var userCredentials = {
        accessCode: accessCode,
        verifyCode: verifyCode,
        site: site
    };

    //check required parameters
    if (_.isEmpty(accessCode) ||
        _.isEmpty(verifyCode) ||
        _.isEmpty(site) ||
        _.isEmpty(division)) {
        errorObj = new RdkError({
            'code': 'rdk.400.1001'
        });
        return handleLoginAttempt(req, res, {
            timer: elapsedAuthentication,
            error: errorObj
        });
    }

    //check for existence of site code in sites configuration
    var vistaSites = _.get(req, 'app.config.vistaSites', {});
    if (_.isEmpty(vistaSites[site])) {
        errorObj = new RdkError({
            'code': 'rdk.400.1002'
        });
        return handleLoginAttempt(req, res, {
            timer: elapsedAuthentication,
            error: errorObj
        });
    }

    //create VistaJS configuration variables
    var vistaConfig = {
        context: _.get(req, 'app.config.rpcConfig.context', ''),
        host: _.get(vistaSites, [site, 'host'], ''),
        port: _.get(vistaSites, [site, 'port'], 0),
        accessCode: accessCode || '',
        verifyCode: verifyCode || '',
        division: division || '',
        localIP: '',
        localAddress: ''
    };

    //RPC Client Instance created for persistent connections
    var rpcClient = RpcClient.create(logger, vistaConfig);

    //User Information Vista and JDS waterfall calls
    async.waterfall([
            function vistaConnection(vistaConnectCallback) {
                // call to vista for authentication
                return vistaConnect(req, res, vistaConnectCallback, {
                    rpcClient: rpcClient,
                    site: site,
                    division: division
                });
            },
            function userDataCalls(data, userDataCallback) {
                //inner parallel userData calls to vista and jds
                return async.parallel({
                        'vistaUserClass': function(vistaUserClassCallback) {
                            return vistaUserClass(req, res, vistaUserClassCallback, {
                                rpcClient: rpcClient,
                                site: site,
                                data: data
                            });
                        },
                        'vistaUserInfo': function(vistaUserInfoCallback) {
                            return vistaUserInfo(req, res, vistaUserInfoCallback, {
                                rpcClient: rpcClient,
                                site: site,
                                data: data
                            });
                        },
                        'jdsUserData': function(jdsCallback) {
                            return jdsUserData(req, res, jdsCallback, {
                                site: site,
                                data: data
                            });
                        }
                    },
                    function(err, result) {
                        userDataCB(err, result, {
                            req: req,
                            data: data,
                            callback: userDataCallback
                        });
                    }
                );
            },
            function getUserPJDSData(data, pjdsCallback) {
                return pjdsUserData.getEhmpUserData(req, res, pjdsCallback, {
                    site: site,
                    data: data
                });
            },
            function getPJDSPermissions(data, authorizationCB) {
                return pjdsUserData.getPermissionsData(req, res, authorizationCB, {
                    data: data
                });
            },
            function saveUserToJDS(data, saveUserJDSCallback) {
                return osyncUsers.saveOsyncUsers(req, res, saveUserJDSCallback, {
                    site: site,
                    data: data
                });
            }
        ],
        function(err, result) {
            authenticationCallback(err, result, {
                req: req,
                res: res,
                rpcClient: rpcClient,
                userCredentials: userCredentials,
                timer: elapsedAuthentication
            });
        });
};

/**
 * Handle an attempt to log into eHMP
 * @param {Object} req - typical default Express request object
 * @param {Object} res - typical default Express response object
 * @param {Object} params - Optional items used to determine how the attempt will be dealt with
 * @return {Object|undefined}
 */
var handleLoginAttempt = function(req, res, params) {
    params = params || {};
    var error = _.get(params, 'error');
    //audit call
    authUtils.auditLoginResult(req, error);
    //pjds call for successful and unsuccessful login times
    pjdsUserData.setLoginAttempt(req, res, loginAttemptCallback, params);

    function loginAttemptCallback(err, result) {
        var timer = _.get(params, 'timer');
        if (timer) {
            timer.log(req.logger, {
                'stop': true
            });
        }
        //exit early on errors
        if (err) {
            if (err.log) {
                err.log(req.logger);
            }
            req.session.destroy(); // todo: find a cleaner way to handle invalid logins destroying the session
            return res.status(err.status).rdkSend(err);
        }

        if (!authUtils.hasValidSession(req)) {
            req.logger.warn('No Session Found');
            return res.status(rdk.httpstatus.unauthorized).rdkSend();
        }

        req.logger.info('Session Found');
        //set the csrf token just before we send back to user
        rdk.utils.jwt.addJwtHeader(req, res);
        //set the user session expiration to be equal to the new cookie expiration
        _.set(req, 'session.user.expires', _.get(req, 'session.cookie.expires'));
        return res.status(rdk.httpstatus.ok).rdkSend(userUtil.sanitizeUser(req.session.user));
    }
};

/**
 * Handles the callback to vista and jds for user data
 * @param {Object=|null} err - error object
 * @param {Object=|null} result - data object
 * @param {Object} params - Items used to determine how the attempt will be dealt with
 * @param {function} params.callback
 * @return {Object|undefined}
 */
var userDataCB = function(err, result, params) {
    var req = _.get(params, 'req');
    var data = _.get(params, 'data');
    var callback = _.get(params, 'callback');
    //pass any data to try and process the users attempted login result
    data.dgRecordAccess = _.get(result, 'vistaUserClass.dgRecordAccess');
    data.dgSensitiveAccess = _.get(result, 'vistaUserClass.dgSensitiveAccess');
    data.dgSecurityOfficer = _.get(result, 'vistaUserClass.dgSecurityOfficer');
    data.provider = _.get(result, 'vistaUserClass.provider');
    data.vistaUserClass = _.get(result, 'vistaUserClass.vistaUserClass');
    data.vistaKeys = _.get(result, 'vistaUserClass.vistaKeys');
    data.corsTabs = _.get(result, 'vistaUserInfo.corsTabs');
    data.rptTabs = _.get(result, 'vistaUserInfo.rptTabs');
    data.ssn = _.get(result, 'jdsUserData.ssn');
    data.title = _.get(result, 'vistaUserClass.title') || _.get(result, 'jdsUserData.title');
    data.uid = _.get(result, 'jdsUserData.uid');
    data.firstname = _.get(result, 'vistaUserInfo.firstname') || _.get(result, 'jdsUserData.firstname');
    data.lastname = _.get(result, 'vistaUserInfo.lastname') || _.get(result, 'jdsUserData.lastname');
    //transform names
    data.firstname = _.capitalize(data.firstname);
    data.lastname = _.capitalize(data.lastname);
    req.logger.trace(data, 'Calls for data finished with resulting data');

    if (err) {
        return callback(err, data);
    }

    return callback(null, data);
};

/**
 * Handles the callback for user authentication
 * @param {Object|null} err - error object
 * @param {Object|null} result - data object
 * @param {Object} params - Optional items used to determine how the attempt will be dealt with
 * @return {Object|undefined}
 */
var authenticationCallback = function(err, result, params) {
    var rpcClient = _.get(params, 'rpcClient');
    var timer = _.get(params, 'timer');
    var req = _.get(params, 'req');
    var res = _.get(params, 'res');
    var accessCode = _.get(params, 'userCredentials.accessCode');
    var verifyCode = _.get(params, 'userCredentials.verifyCode');
    var site = _.get(params, 'userCredentials.site');
    var errorObj;
    //close our persistent rpc connection before anything else
    rpcClient.close();

    if (err) {
        return handleLoginAttempt(req, res, {
            timer: timer,
            error: err,
            data: result
        });
    }

    //Deny Users with no permission sets EHMP access
    if (_.size(result.permissions) < 1) {
        errorObj = new RdkError({
            'code': 'rdk.403.1001'
        });
        return handleLoginAttempt(req, res, {
            timer: timer,
            error: errorObj,
            data: result
        });
    }

    result.accessCode = accessCode;
    result.verifyCode = verifyCode;
    //TODO - reset this to the data coming from User Class or User Info??
    result.section = 'Medicine';
    result.disabled = false;
    result.requiresReset = false;
    result.divisionSelect = false;
    result.site = site;
    result.sessionLength = _.clone(req.app.config.sessionLength);
    //user roles for JBPM
    result.pcmm = _.get(rdk, ['rolesConfig', 'user', accessCode], []);

    req.session.user = result;

    //Adding to RDK audit.log
    req.audit.permissionSets = result.permissionSets;
    req.audit.permissions = result.permissions;

    return handleLoginAttempt(req, res, {
        timer: timer,
        data: result
    });
};

module.exports = getSession;
