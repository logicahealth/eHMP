'use strict';

var util = require('util');
var rdk = require('../../core/rdk');
var RpcClient = require('vista-js').RpcClient;
var httpUtil = rdk.utils.http;
var _ = require('lodash');
var _s = require('underscore.string');
var async = require('async');
var moment = require('moment');
var dd = require('drilldown');
var now = require('performance-now');

var USERKEYS_RPC = 'YTQ ALLKEYS';
var USERCLASS_RPC = 'HMPCRPC RPC';
var DG_RECORD_ACCESS = 'DG RECORD ACCESS';
var DG_SENSITIVITY = 'DG SENSITIVITY';
var DG_SECURITY_OFFICER = 'DG SECURITY OFFICER';
var PROVIDER = 'PROVIDER';
var CORTABS_INDEX = 21;
var RPC_INDEX = 22;
var NAME_INDEX = 1;
var USERINFO_RPC = 'ORWU USERINFO';
var JDS_HTTP_FETCH_TIMEOUT_MILLS = 5000;
var nullChecker = rdk.utils.nullchecker;
var pjds = rdk.utils.pjdsStore;
var readOnly;

function Metrics(params) {
    this.name = _.result(params, 'name', '');
    this.start = now();
    return this;
}

Metrics.prototype.stop = function() {
    this.end = now();
    this.elapsedMilliseconds = this.end - this.start;
    return this;
};

Metrics.prototype.log = function(logger) {
    logger.info({
            'name': this.name,
            'start': this.start,
            'stop': this.end,
            'elapsedMilliseconds': this.elapsedMilliseconds
        },
        'Authentication step %s finished', this.name);
    return this;
};

module.exports = function(req, res, next) {

    var config = req.app.config;

    if ('interceptors' in config && 'authentication' in config.interceptors && config.interceptors.authentication.disabled) {
        req.logger.warn('authentication disabled');
        return next();
    }

    if ('interceptors' in config && 'authentication' in config.interceptors && config.interceptors.authentication.readOnly) {
        req.logger.info('Read Only Access Permission Set Requirement Configuration Active');
        readOnly = true;
    } else {
        req.logger.info('Read Only Access Permission Set Requirement Configuration Inactive');
        readOnly = false;
    }

    if (req.session && req.session.user) {
        if (req._resourceConfigItem.title === 'authentication-authentication') {
            if (req.param('accessCode') === req.session.user.accessCode &&
                req.param('verifyCode') === req.session.user.password &&
                req.param('site') === req.session.user.site) {
                req.logger.debug('ALREADY LOGGED IN: ' + util.inspect(req.session.user, {
                    depth: null
                }));
                return next();
            } else {
                // regenerate session if session user doesn't match req user
                req.session.regenerate(regenerateCallback);
            }
        } else {
            return next();
        }
    }

    function regenerateCallback(err) {
        if (err) {
            req.logger.error('There was an error trying to regenerate an express session for a new user ' + err);
            return;
        }
    }

    req.logger.info('DOING LOGIN');
    return processAuthentication(req, res, next);
};

/**
 * Modifys a default user object to put in the body response
 * @param  {Object} req -typical default Express request object
 * @param  {Object} res -typical default Express response object
 * @param  {Object} next - typical Express middleware next function
 * @return {Object} || undefined
 */
var processAuthentication = function(req, res, next) {
    req.audit.dataDomain = 'Authentication';
    req.audit.logCategory = 'AUTH';

    var elapsedAuthentication = new Metrics({
        'name': 'elapsedAuthentication'
    });

    var statuscode = rdk.httpstatus.ok;
    var errorObj = {};

    var accessCode = req.param('accessCode', '');
    var verifyCode = req.param('verifyCode', '');
    var site = req.param('site', '');

    req.logger.debug('Authentication = { accessCode: %s, verifyCode: %s, site: %s }', accessCode, verifyCode, site);
    //check required parameters
    if (_.isEmpty(accessCode) === true ||
        _.isEmpty(verifyCode) === true ||
        _.isEmpty(site) === true) {
        statuscode = rdk.httpstatus.bad_request;
        errorObj = {
            'message': 'Missing Required Credential',
            'status': statuscode
        };
        elapsedAuthentication.stop().log(req.logger);
        logAndAuditUnsuccessfulLogin(errorObj.message);
        res.status(statuscode).rdkSend(errorObj);
        return;
    }

    //check for existence of site code in sites configuration
    //get corresponding host and port and assign to configuration
    var vistaSites = req.app.config.vistaSites;
    if (_.isEmpty(vistaSites[site]) === true) {
        statuscode = rdk.httpstatus.bad_request;
        errorObj = {
            'message': 'Invalid Site Code',
            'status': statuscode
        };
        res.status(statuscode).rdkSend(errorObj);
        return;
    }

    //create VistaJS configuration variables
    var vistaConfig = {
        context: '',
        host: '',
        port: 0,
        accessCode: '',
        verifyCode: '',
        localIP: '',
        localAddress: ''
    };



    vistaConfig.context = req.app.config.rpcConfig.context;
    vistaConfig.accessCode = accessCode;
    vistaConfig.verifyCode = verifyCode;
    vistaConfig.host = vistaSites[site].host;
    vistaConfig.port = vistaSites[site].port;

    //RPC Client Instance created for persistent connections
    var rpcClientInstance = RpcClient.create(req.logger, vistaConfig);

    var jds = req.app.config.jdsServer;

    //User Information Vista and JDS waterfall calls
    async.waterfall([
            // call to vista for authentication
            function authenticate(authCallback) {
                var vistaAuthMetric = new Metrics({
                    'name': 'vistaAuthMetric'
                });
                //This is same as RpcClient instance connect.
                rpcClientInstance.connect(function(error, vistaJSAuthResult) {

                    if (error) {
                        req.logger.debug('Error during login: ' + util.inspect(error, {
                            depth: null
                        }));
                        //Error Handling for Authentication
                        statuscode = rdk.httpstatus.unauthorized;
                        errorObj = {
                            'error': error.toString()
                        };
                        vistaAuthMetric.stop().log(req.logger);
                        logAndAuditUnsuccessfulLogin(req.errorMessage);
                        req.session.destroy(); // todo: find a cleaner way to handle invalid logins destroying the session
                        authCallback(errorObj, null);
                    } else if (vistaJSAuthResult === undefined || !vistaJSAuthResult) { //_.isObject(vistaJSAuthResult)
                        statuscode = rdk.httpstatus.unauthorized;
                        errorObj = {
                            'error': 'No Result'
                        };
                        vistaAuthMetric.stop().log(req.logger);
                        logAndAuditUnsuccessfulLogin(req.errorMessage);
                        req.session.destroy();
                        authCallback(errorObj, null);
                    } else {
                        //Pull the users first and last names from the greeting
                        var greeting = vistaJSAuthResult.greeting.split(' ');
                        var name = greeting[2].split(',');

                        //Valid user so fill in result
                        var obj = {
                            duz: {}
                        };
                        obj.username = site + ';' + vistaJSAuthResult.accessCode;
                        obj.password = vistaJSAuthResult.verifyCode;
                        obj.facility = vistaSites[site].name;
                        obj.firstname = name[1];
                        obj.lastname = name[0];
                        obj.duz[site] = vistaJSAuthResult.duz;
                        obj.infoButtonOid = vistaSites[site].infoButtonOid;
                        obj.site = site;
                        //set req site property since valid user
                        req.site = site;
                        //set the audit username
                        req.audit.authuser = obj.duz;
                        vistaAuthMetric.stop().log(req.logger);
                        authCallback(null, obj);
                    }
                });

            },
            //inner parallel rpc calls to vista
            function rpcCalls(data, rpcCallback) {
                async.parallel({
                        //call to get User Classes
                        'userClassRPC': function(userClassRpcCallback) {
                            var userClassRPCCallMetric = new Metrics({
                                'name': 'userClassRPCCallMetric'
                            });
                            rpcClientInstance.execute(USERCLASS_RPC, {
                                    '"command"': 'getUserInfo',
                                    '"userId"': data.duz[site]
                                },
                                function(error, result) {

                                    if (error) {

                                        req.logger.debug('Error during User Class Request: ' + util.inspect(error, {
                                            depth: null
                                        }));
                                        //Error Handling for Authentication
                                        statuscode = rdk.httpstatus.unauthorized;
                                        errorObj = {
                                            'error': error.toString()
                                        };
                                        req.errorMessage = errorObj.error;
                                        userClassRPCCallMetric.stop().log(req.logger);
                                        logAndAuditUnsuccessfulLogin(req.errorMessage);
                                        userClassRpcCallback(errorObj, null);

                                    } else if (typeof result === 'string') {
                                        try {
                                            result = JSON.parse(result);
                                        } catch (ex) {
                                            req.logger.error('Unable to parse results due to ' + ex + ' exception.');
                                        }
                                        var returnObj = {
                                            dgRecordAccess: 'false',
                                            dgSensitiveAccess: 'false',
                                            dgSecurityOfficer: 'false',
                                            provider: false
                                        };

                                        returnObj.vistaUserClass = (_.isNull(result.vistaUserClass) || _.isUndefined(result.vistaUserClass)) ? [] : result.vistaUserClass;
                                        returnObj.vistaKeys = _.keys(result.vistaKeys);
                                        if (result.vistaKeys) {
                                            if (!(_.isNull(result.vistaKeys[DG_RECORD_ACCESS]) || _.isUndefined(result.vistaKeys[DG_RECORD_ACCESS]))) {
                                                //DG RECORD ACCESS exists
                                                returnObj.dgRecordAccess = 'true';
                                            }

                                            if (!(_.isNull(result.vistaKeys[DG_SENSITIVITY]) || _.isUndefined(result.vistaKeys[DG_SENSITIVITY]))) {
                                                //DG SENSITIVITY ACCESS exists
                                                returnObj.dgSensitiveAccess = 'true';
                                            }

                                            if (!(_.isNull(result.vistaKeys[DG_SECURITY_OFFICER]) || _.isUndefined(result.vistaKeys[DG_SECURITY_OFFICER]))) {
                                                //DG SECURITY OFFICER ACCESS exists
                                                returnObj.dgSecurityOfficer = 'true';
                                            }

                                            if (!(_.isNull(result.vistaKeys[PROVIDER]) || _.isUndefined(result.vistaKeys[PROVIDER]))) {
                                                //PROVIDER ACCESS exists
                                                returnObj.provider = true;
                                            }
                                        }
                                        userClassRPCCallMetric.stop().log(req.logger);
                                        userClassRpcCallback(null, returnObj);
                                    } else {
                                        statuscode = rdk.httpstatus.unauthorized;
                                        errorObj = {
                                            'error': 'No User Class Results'
                                        };
                                        userClassRPCCallMetric.stop().log(req.logger);
                                        userClassRpcCallback(errorObj, null);
                                    }
                                });
                        },
                        //call to get corsTabs and rptTabs
                        'userInfoRPC': function(userInfoRpcCallback) {
                            var userInfoRPCCallMetric = new Metrics({
                                'name': 'userInfoRPCCallMetric'
                            });
                            rpcClientInstance.execute(USERINFO_RPC, function(error, result) {

                                if (error) {

                                    req.logger.debug('Error during Tabs Request: ' + util.inspect(error, {
                                        depth: null
                                    }));
                                    //Error Handling for Authentication
                                    statuscode = rdk.httpstatus.unauthorized;
                                    errorObj = {
                                        'error': error.toString()
                                    };
                                    req.errorMessage = errorObj.error;
                                    userInfoRPCCallMetric.stop().log(req.logger);
                                    logAndAuditUnsuccessfulLogin(req.errorMessage);
                                    userInfoRpcCallback(errorObj, null);

                                } else if (typeof result === 'string') {

                                    result = result.split('^');

                                    var obj = {};
                                    obj.corsTabs = (result[CORTABS_INDEX] === '1') ? 'true' : 'false';
                                    obj.rptTabs = (result[RPC_INDEX] === '1') ? 'true' : 'false';

                                    // This checks if the user has access to either CPRS tab setting
                                    // This code should likely move to PEP/PDP as it related to authorization
                                    // and is not an authentication issue. This is a short-term solution.
                                    if (obj.corsTabs === 'true' || obj.rptTabs === 'true') {
                                        userInfoRpcCallback(null, obj);
                                    } else {
                                        statuscode = rdk.httpstatus.unauthorized;
                                        errorObj = {
                                            'error': 'VistA Security Error: No Tabs Permissions.'
                                        };
                                        req.errorMessage = errorObj.error;
                                        userInfoRPCCallMetric.stop().log(req.logger);
                                        logAndAuditUnsuccessfulLogin(req.errorMessage);
                                        userInfoRpcCallback(errorObj, null);
                                    }


                                } else {

                                    statuscode = rdk.httpstatus.unauthorized;
                                    errorObj = {
                                        'error': 'No Tabs Results'
                                    };
                                    req.errorMessage = errorObj.error;
                                    userInfoRPCCallMetric.stop().log(req.logger);
                                    logAndAuditUnsuccessfulLogin(req.errorMessage);
                                    userInfoRpcCallback(errorObj, null);
                                }

                            });
                        },
                        //call to get user SSN
                        'getUserSSNFromJDS': function(jdsCallback) {
                            var jdsUserSSNMetric = new Metrics({
                                'name': 'jdsUserSSNMetric'
                            });
                            // the username format being sent to the jds end point is site code combined with user duz
                            // ex. siteCode:username
                            var returnObj = {
                                ssn: '',
                                title: '',
                                uid: ''
                            };

                            if (!_s.isBlank(data.duz)) {
                                var jdsPath = '/data/urn:va:user:';
                                jdsPath += site + ':' + data.duz[site];

                                rdk.utils.http.get({
                                    timeout: JDS_HTTP_FETCH_TIMEOUT_MILLS,
                                    logger: req.logger,
                                    baseUrl: jds.baseUrl,
                                    url: jdsPath,
                                    json: true
                                }, function(err, response, userInfo) {
                                    if (err) {
                                        statuscode = rdk.httpstatus.unauthorized;
                                        errorObj = {
                                            'error': err.toString()
                                        };
                                        jdsUserSSNMetric.stop().log(req.logger);
                                        return jdsCallback(errorObj);
                                    }

                                    try {
                                        returnObj.ssn = userInfo.data.items[0].ssn || '';
                                        returnObj.title = userInfo.data.items[0].specialty || 'Clinician';
                                        returnObj.uid = userInfo.data.items[0].uid || '';
                                    } catch (e) {
                                        statuscode = rdk.httpstatus.unauthorized;
                                        errorObj = {
                                            'error': 'Invalid JDS User Info'
                                        };
                                        jdsUserSSNMetric.stop().log(req.logger);
                                        return jdsCallback(errorObj, null);
                                    }
                                    jdsUserSSNMetric.stop().log(req.logger);
                                    return jdsCallback(null, returnObj);
                                });
                            } else {
                                jdsUserSSNMetric.stop().log(req.logger);
                                return jdsCallback(null, returnObj);
                            }
                        }
                    },
                    function(err, result) {
                        if (err) {
                            // assign custom login error messages for ui
                            if (!errorObj.error) {
                                errorObj.error = err;
                                errorObj.message = 'Unexpected error.';
                            } else if (errorObj.error.match(/No DUZ returned from login request/)) {
                                errorObj.message = 'Not a valid ACCESS CODE/VERIFY CODE pair.';
                            } else if (errorObj.error.match(/context .+ does not exist/)) {
                                errorObj.message = 'Invalid rpc context.';
                            } else if (errorObj.error.match(/MULTIPLE SIGNONS/)) {
                                errorObj.message = 'Multiple signons not allowed.';
                            } else {
                                errorObj.message = errorObj.error;
                            }
                            req.errorMessage = errorObj.message;
                            errorObj.status = statuscode;
                            elapsedAuthentication.stop().log(req.logger);
                            logAndAuditUnsuccessfulLogin(errorObj.error);
                            return res.status(statuscode).rdkSend(errorObj);
                        }

                        data.dgRecordAccess = result.userClassRPC.dgRecordAccess;
                        data.dgSensitiveAccess = result.userClassRPC.dgSensitiveAccess;
                        data.dgSecurityOfficer = result.userClassRPC.dgSecurityOfficer;
                        data.provider = result.userClassRPC.provider;
                        data.vistaUserClass = result.userClassRPC.vistaUserClass;
                        data.vistaKeys = result.userClassRPC.vistaKeys;
                        data.corsTabs = result.userInfoRPC.corsTabs;
                        data.rptTabs = result.userInfoRPC.rptTabs;
                        data.ssn = result.getUserSSNFromJDS.ssn;
                        data.title = result.getUserSSNFromJDS.title;
                        data.uid = result.getUserSSNFromJDS.uid;

                        rpcCallback(null, data);

                    }
                );
            },
            //get user PJDS data
            function getUserPJDSData(data, pjdsCallback) {
                var pjdsUserPermissionsMetric = new Metrics({
                    'name': 'pjdsUserPermissionsMetric'
                });
                //Gets User Permission Sets for User
                var pjdsOptions = {
                    store: 'ehmpusers',
                    key: data.uid
                };
                var errorObj = {
                    'error': 'P-JDS Connection Error',
                    'status': rdk.httpstatus.internal_server_error
                };
                pjds.get(req, res, pjdsOptions, function(error, response) {
                    if (error) {
                        errorObj.message = 'Error retrieving user data from P-JDS';
                        req.logger.error(errorObj.message);
                        pjdsUserPermissionsMetric.stop().log(req.logger);
                        return res.status(rdk.httpstatus.internal_server_error).rdkSend(errorObj);
                    } else {
                        data.permissionSets = response.data.permissionSet.val;
                        data.eHMPUIContext = response.data.eHMPUIContext || {};
                        data.uid = response.data.uid;
                        data.permissions = response.data.permissionSet.additionalPermissions || [];
                        if (_.isUndefined(data.permissions)) {
                            data.permissions = [];
                        }else if (!_.isEmpty(data.permissions)) {
                            data.permissions = _.uniq(data.permissions);
                        }
                        if (_.isUndefined(data.permissionSets) || _.isEmpty(data.permissionSets)) {
                            pjdsUserPermissionsMetric.stop().log(req.logger);
                            return pjdsCallback(null, data);
                        } else {
                            var permissionSetsPjdsOptions = {
                                store: 'permset',
                                key: data.permissionSets
                            };
                            pjds.get(req, res, permissionSetsPjdsOptions, function(permissionSetsError, permissionSetsResponse) {
                                if (permissionSetsError) {
                                    errorObj.message = 'Error retrieving Permission Sets List from P-JDS';
                                    req.logger.error(errorObj.message);
                                    pjdsUserPermissionsMetric.stop().log(req.logger);
                                    return res.status(rdk.httpstatus.internal_server_error).rdkSend(errorObj);
                                } else {
                                    _.each(permissionSetsResponse.data.items, function(item) {
                                        data.permissions = data.permissions.concat(item.permissions);
                                    });
                                    data.permissions = _.uniq(data.permissions);
                                    pjdsUserPermissionsMetric.stop().log(req.logger);
                                    return pjdsCallback(null, data);
                                }
                            });
                        }
                    }
                });
            },
            //get current active users from JDS
            function getCurrentUsersFromJDS(data, getCurrentUsersJDSCallback) {
                var jdsCurrentActiveOsyncUsersMetric = new Metrics({
                    'name': 'jdsCurrentActiveOsyncUsersMetric'
                });
                getOsyncActiveUserList(req, function(err, response, jdsResult) {
                    if (err) {
                        req.logger.debug('Error connecting to JDS to get active user list for osync');
                        jdsCurrentActiveOsyncUsersMetric.stop().log(req.logger);
                        getCurrentUsersJDSCallback(err, null);
                    }
                    var users_list_screen_id = 'osyncusers';
                    var result = {
                        '_id': users_list_screen_id,
                        'users': []
                    };
                    var newData = JSON.parse(jdsResult).users;
                    if (!_.isUndefined(newData)) {
                        req.logger.debug('Osync active user list was %s items long.', newData.length);
                        _.remove(newData, function(item) {
                            if (item.duz && item.duz[data.site] && (item.duz[data.site] === data.duz[data.site])) {
                                return true;
                            }
                        });

                        newData.push({
                            duz: data.duz,
                            lastlogin: moment().format()
                        });

                        result.users = newData;
                    } else {
                        req.logger.debug('active user list WAS undefined');
                        result.users = [{
                            duz: data.duz,
                            lastlogin: moment().format()
                        }];
                    }
                    req.logger.debug('About to save %s osync active users to JDS', result.users.length);
                    jdsCurrentActiveOsyncUsersMetric.stop().log(req.logger);
                    getCurrentUsersJDSCallback(null, result, data);
                });
            },
            //save current active user in JDS
            function saveUserToJDS(usersData, data, saveUserJDSCallback) {
                var jdsSaveActiveOsyncUserListMetric = new Metrics({
                    'name': 'jdsSaveActiveOsyncUserListMetric'
                });
                setOsyncActiveUserList(req, usersData, function(err, result, status) {
                    if (err) {
                        req.logger.debug('Failed to save osync Active User list to JDS');
                        jdsSaveActiveOsyncUserListMetric.stop().log(req.logger);
                        return saveUserJDSCallback(err, null);
                    }
                    req.logger.debug('Saved osync Active Users to JDS');
                    jdsSaveActiveOsyncUserListMetric.stop().log(req.logger);
                    saveUserJDSCallback(null, data);
                });
            }
        ],
        function(finalError, finalData) {
            //close our persistent rpc connection
            rpcClientInstance.close();
            if (finalError) {
                // assign custom login error messages
                if (errorObj.error.match(/No DUZ returned from login request/)) {
                    errorObj.message = 'Not a valid ACCESS CODE/VERIFY CODE pair.';
                } else if (errorObj.error.match(/context .+ does not exist/)) {
                    errorObj.message = 'Invalid rpc context.';
                } else if (errorObj.error.match(/MULTIPLE SIGNONS/)) {
                    errorObj.message = 'Multiple signons not allowed.';
                } else {
                    errorObj.message = errorObj.error;
                }
                elapsedAuthentication.stop().log(req.logger);
                return res.status(statuscode).rdkSend(errorObj);
            }
            finalData.accessCode = accessCode;
            finalData.verifyCode = verifyCode;
            finalData.section = 'Medicine';
            finalData.disabled = false;
            finalData.requiresReset = false;
            finalData.divisionSelect = false;
            finalData.site = site;
            finalData.sessionLength = _.clone(req.app.config.sessionLength);

            //Adding to RDK audit.log
            req.audit.permissionSets = finalData.permissionSets;
            req.audit.permissions = finalData.permissions;

            //Deny Users with no permission sets EHMP access
            var unAuthCode = rdk.httpstatus.forbidden;
            if (readOnly === true) {
                if (_.isUndefined(finalData.permissions) || finalData.permissions.length < 1) {
                    errorObj = {
                        'message': 'You are not an authorized user of eHMP. Please contact your local access control coordinator (ACC) for assistance.',
                        'status': unAuthCode
                    };
                    req.errorMessage = errorObj.message;
                    logAndAuditUnsuccessfulLogin(req.errorMessage);
                    elapsedAuthentication.stop().log(req.logger);
                    res.status(unAuthCode).rdkSend(errorObj);
                    return;
                }
            }

            //Authentication Logging for Successful Login Dates
            if (req.originalUrl === '/resource/authentication' && res.statusCode === 200) {
                req.audit.lastSuccessfulLogin = new Date();
                req.audit.msg = 'Successful Login';
            }

            //user roles for JBPM
            finalData.pcmm = rdk.rolesConfig.user[accessCode] || [];

            req.session.user = finalData;
            elapsedAuthentication.stop().log(req.logger);
            next();
        });

    function logAndAuditUnsuccessfulLogin(errorMessage) {
        req.logger.error(errorMessage);
        req.audit.msg = errorMessage;
        req.audit.lastUnsuccessfulLogin = new Date();
    }

    function getOsyncActiveUserList(req, callback) {
        var users_list_screen_id = 'osyncusers';
        var options = _.extend({}, req.app.config.jdsServer, {
            url: '/user/get/' + users_list_screen_id,
            logger: req.logger
        });
        httpUtil.get(options, callback);
    }

    function setOsyncActiveUserList(req, details, callback) {
        var options = _.extend({}, req.app.config.jdsServer, {
            url: '/user/set/this',
            logger: req.logger,
            body: details
        });
        // console.dir(options);
        // console.log('SR');
        // console.dir(details);
        httpUtil.post(options, callback);
    }
};
