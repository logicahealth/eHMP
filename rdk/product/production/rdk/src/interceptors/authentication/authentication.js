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
var NAME_INDEX = 1;
var CORTABS_INDEX = 21;
var RPC_INDEX = 22;
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
            if (_.get(req, 'body.accessCode') === req.session.user.accessCode &&
                _.get(req, 'body.verifyCode') === req.session.user.password &&
                _.get(req, 'body.site') === req.session.user.site) {
                req.logger.debug({user: req.session.user}, 'ALREADY LOGGED IN');
                return next();
            } else {
                // regenerate session if session user doesn't match req user
                return req.session.regenerate(regenerateCallback);
            }
        } else {
            return next();
        }
    }

    if (!isLoginResource(req)) {
        return res.status(rdk.httpstatus.unauthorized).rdkSend('Unauthorized. Please log in.');
    }

    function regenerateCallback(err) {
        if (err) {
            req.logger.error({error: err}, 'There was an error trying to regenerate an express session for a new user');
            return;
        }
        return processAuthentication(req, res, next);
    }

    req.logger.info('DOING LOGIN');
    return processAuthentication(req, res, next);
};

function isLoginResource(req) {
    return (req._resourceConfigItem.title === 'authentication-authentication' && req._resourceConfigItem.rel === 'vha.create');
}

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

    var accessCode = _.get(req, 'body.accessCode', '');
    var verifyCode = _.get(req, 'body.verifyCode', '');
    var site = _.get(req, 'body.site', '');

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
    var rpcClient = RpcClient.create(req.logger, vistaConfig);

    var jds = req.app.config.jdsServer;

    //User Information Vista and JDS waterfall calls
    async.waterfall([
            // call to vista for authentication
            function authenticate(authCallback) {
                var vistaAuthMetric = new Metrics({
                    'name': 'vistaAuthMetric'
                });
                //This is same as RpcClient instance connect.
                rpcClient.connect(function(error, vistaJSAuthResult) {

                    if (error) {
                        req.logger.debug({error: error}, 'Error during login');
                        //Error Handling for Authentication
                        statuscode = rdk.httpstatus.unauthorized;
                        errorObj = {
                            'error': error.toString()
                        };
                        vistaAuthMetric.stop().log(req.logger);
                        logAndAuditUnsuccessfulLogin(req.errorMessage);
                        req.session.destroy(); // todo: find a cleaner way to handle invalid logins destroying the session
                        return authCallback(errorObj, null);
                    }
                    
                    if (vistaJSAuthResult === undefined || !vistaJSAuthResult) { //_.isObject(vistaJSAuthResult)
                        statuscode = rdk.httpstatus.unauthorized;
                        errorObj = {
                            'error': 'No Result'
                        };
                        vistaAuthMetric.stop().log(req.logger);
                        logAndAuditUnsuccessfulLogin(req.errorMessage);
                        req.session.destroy();
                        return authCallback(errorObj, null);
                    }
                    req.logger.trace(vistaJSAuthResult, 'RpcClient Connect result');
                        
                    //Valid user so fill in result
                    var obj = {
                        duz: {},
                        consumerType: 'user'
                    };

                    obj.username = site + ';' + _.result(vistaJSAuthResult, 'accessCode', '');
                    obj.password = _.result(vistaJSAuthResult, 'verifyCode', '');
                    obj.facility = vistaSites[site].name;
                    obj.duz[site] = _.result(vistaJSAuthResult, 'duz', '');
                    obj.infoButtonOid = vistaSites[site].infoButtonOid;
                    obj.site = site;
                    obj.division = vistaSites[site].division;
                    //set req site property since valid user
                    req.site = site;
                    //set the audit username
                    req.audit.authuser = obj.duz;
                    vistaAuthMetric.stop().log(req.logger);
                    return authCallback(null, obj);
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
                            rpcClient.execute(USERCLASS_RPC, {
                                    '"command"': 'getUserInfo',
                                    '"userId"': data.duz[site]
                                },
                                function(error, result) {
                                    if (error) {
                                        req.logger.debug({
                                            error: error
                                        }, 'Error during User Class Request');
                                        //Error Handling for Authentication
                                        statuscode = rdk.httpstatus.unauthorized;
                                        errorObj = {
                                            'error': error.toString()
                                        };
                                        req.errorMessage = errorObj.error;
                                        userClassRPCCallMetric.stop().log(req.logger);
                                        logAndAuditUnsuccessfulLogin(req.errorMessage);
                                        return userClassRpcCallback(errorObj, null);
                                    }

                                    if (!_.isString(result)) {
                                        statuscode = rdk.httpstatus.unauthorized;
                                        errorObj = {
                                            'error': 'No User Class Results'
                                        };
                                        userClassRPCCallMetric.stop().log(req.logger);
                                        return userClassRpcCallback(errorObj, null);
                                    }

                                    try {
                                        result = JSON.parse(result);
                                    } catch (e) {
                                        statuscode = rdk.httpstatus.unauthorized;
                                        errorObj = {
                                            'error': 'Error parsing User Class RPC for DG Access and Provider results'
                                        };
                                        return userClassRpcCallback(errorObj, null);
                                    }
                                    req.logger.trace(result, "user class rpc parsed result");
                                    var returnObj = {};
                                    returnObj.vistaUserClass = _.result(result, 'vistaUserClass', []);
                                    returnObj.vistaKeys = _.keys(_.result(result, 'vistaKeys', {}));
                                    returnObj.title = _.result(result, 'vistaPositions.role') || '';
                                    returnObj.dgRecordAccess = (returnObj.vistaKeys.indexOf(DG_RECORD_ACCESS) > -1).toString();
                                    returnObj.dgSensitiveAccess = (returnObj.vistaKeys.indexOf(DG_SENSITIVITY) > -1).toString();
                                    returnObj.dgSecurityOfficer = (returnObj.vistaKeys.indexOf(DG_SECURITY_OFFICER) > -1).toString();
                                    returnObj.provider = (returnObj.vistaKeys.indexOf(PROVIDER) > -1);
                                    userClassRPCCallMetric.stop().log(req.logger);
                                    return userClassRpcCallback(null, returnObj);
                                });
                        },
                        //call to get corsTabs and rptTabs
                        'userInfoRPC': function(userInfoRpcCallback) {
                            var userInfoRPCCallMetric = new Metrics({
                                'name': 'userInfoRPCCallMetric'
                            });
                            rpcClient.execute(USERINFO_RPC, function(error, result) {

                                if (error) {
                                    req.logger.debug({error: error}, 'Error during Tabs Request');
                                    //Error Handling for Authentication
                                    statuscode = rdk.httpstatus.unauthorized;
                                    errorObj = {
                                        'error': error.toString()
                                    };
                                    req.errorMessage = errorObj.error;
                                    userInfoRPCCallMetric.stop().log(req.logger);
                                    logAndAuditUnsuccessfulLogin(req.errorMessage);
                                    return userInfoRpcCallback(errorObj, null);
                                }

                                if(!_.isString(result)){
                                    statuscode = rdk.httpstatus.unauthorized;
                                    errorObj = {
                                        'error': 'No Tabs Results'
                                    };
                                    req.errorMessage = errorObj.error;
                                    userInfoRPCCallMetric.stop().log(req.logger);
                                    logAndAuditUnsuccessfulLogin(req.errorMessage);
                                    return userInfoRpcCallback(errorObj, null);
                                }

                                result = result.split('^');
                                req.logger.trace(result, "user info rpc split result");

                                var obj = {
                                    firstname: '',
                                    lastname: ''
                                };
                                obj.corsTabs = (result[CORTABS_INDEX] === '1') ? 'true' : 'false';
                                obj.rptTabs = (result[RPC_INDEX] === '1') ? 'true' : 'false';

                                // This checks if the user has access to either CPRS tab setting
                                // TODO: This code should likely move to PEP/PDP as it related to authorization
                                // and is not an authentication issue. This is a short-term solution.
                                if (obj.corsTabs == 'false' && obj.rptTabs == 'false') {
                                    //return error
                                    statuscode = rdk.httpstatus.unauthorized;
                                    errorObj = {
                                        'error': 'VistA Security Error: No Tabs Permissions.'
                                    };
                                    req.errorMessage = errorObj.error;
                                    userInfoRPCCallMetric.stop().log(req.logger);
                                    logAndAuditUnsuccessfulLogin(req.errorMessage);
                                    return userInfoRpcCallback(errorObj, null);
                                }

                                //set the name parts to be used later 
                                var nameParts = (result[NAME_INDEX]).split(',');
                                if(_.size(nameParts) > 1){
                                    obj.firstname = nameParts[1];
                                    obj.lastname = nameParts[0];
                                }

                                return userInfoRpcCallback(null, obj);
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
                                uid: '',
                                firstname: '',
                                lastname: ''
                            };

                            if (_s.isBlank(data.duz[site])) {
                                jdsUserSSNMetric.stop().log(req.logger);
                                return jdsCallback(null, returnObj);
                            }

                            var jdsPath = '/data/urn:va:user:';
                            jdsPath += site + ':' + data.duz[site];

                            rdk.utils.http.get({
                                timeout: JDS_HTTP_FETCH_TIMEOUT_MILLS,
                                logger: req.logger,
                                baseUrl: jds.baseUrl,
                                url: jdsPath,
                                json: true
                            }, function(err, response, body) {
                                if (err) {
                                    statuscode = rdk.httpstatus.unauthorized;
                                    errorObj = {
                                        'error': 'Invalid User Info from JDS. Contact your local access control coordinator (ACC) for assistance'
                                    };
                                    req.logger.error(err, errorObj.error);
                                    jdsUserSSNMetric.stop().log(req.logger);
                                    return jdsCallback(errorObj, null);
                                }

                                var userItem = _.result(body, 'data.items[0]', {});
                                var name = _.result(userItem, 'name', '').split(',');

                                returnObj.ssn = _.result(userItem, 'ssn', '').toString();
                                returnObj.title = _.result(userItem, 'specialty') || 'Clinician';
                                returnObj.firstname = name[1] || '';
                                returnObj.lastname = name[0] || '';
                                returnObj.uid = _.result(userItem, 'uid', '');
                                req.logger.trace({
                                    returnObj: returnObj,
                                }, 'JDS user info return obj');

                                jdsUserSSNMetric.stop().log(req.logger);
                                return jdsCallback(null, returnObj);
                            });
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
                                errorObj.message = 'Invalid RPC Context.';
                            } else if (errorObj.error.match(/MULTIPLE SIGNONS/)) {
                                errorObj.message = 'Multiple signons not allowed.';
                            } else {
                                errorObj.message = errorObj.error;
                            }
                            req.errorMessage = errorObj.message;
                            errorObj.status = statuscode;
                            elapsedAuthentication.stop().log(req.logger);
                            logAndAuditUnsuccessfulLogin(errorObj.error);
                            return rpcCallback(errorObj, null);
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
                        data.title = result.userClassRPC.title || result.getUserSSNFromJDS.title;
                        data.uid = result.getUserSSNFromJDS.uid;
                        data.firstname = result.userInfoRPC.firstname || result.getUserSSNFromJDS.firstname;
                        data.lastname = result.userInfoRPC.lastname || result.getUserSSNFromJDS.lastname;
                        //transform names
                        data.firstname = _.capitalize(data.firstname);
                        data.lastname = _.capitalize(data.lastname);

                        return rpcCallback(null, data);
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
                        errorObj.status = rdk.httpstatus.internal_server_error;
                        req.logger.error(error);
                        pjdsUserPermissionsMetric.stop().log(req.logger);
                        return pjdsCallback(errorObj);
                    }
                    req.logger.trace(response, 'pJDS ehmp users result');

                    data.permissionSets = _.result(response, 'data.permissionSet.val', []);
                    data.eHMPUIContext = _.result(response, 'data.eHMPUIContext', {});
                    data.uid = _.result(response, 'data.uid', '');
                    data.permissions = _.result(response, 'data.permissionSet.additionalPermissions', []);
                    if (!_.isEmpty(data.permissions)) {
                        data.permissions = _.uniq(data.permissions);
                    }
                    //if permissionsets are empty just return because we don't need to get the permissions
                    if (_.isEmpty(data.permissionSets)) {
                        pjdsUserPermissionsMetric.stop().log(req.logger);
                        return pjdsCallback(null, data);
                    }
                        
                    var permissionSetsPjdsOptions = {
                        store: 'permset',
                        key: data.permissionSets
                    };
                    pjds.get(req, res, permissionSetsPjdsOptions, function(permissionSetsError, permissionSetsResponse) {
                        if (permissionSetsError) {
                            errorObj.message = 'Error retrieving Permission Sets List from P-JDS';
                            errorObj.status = rdk.httpstatus.internal_server_error;
                            req.logger.error(permissionSetsError);
                            pjdsUserPermissionsMetric.stop().log(req.logger);
                            return pjdsCallback(errorObj, null);
                        }
                        req.logger.trace(permissionSetsResponse, 'pJDS permsets returned for user');

                        _.each(permissionSetsResponse.data.items, function(item) {
                            data.permissions = data.permissions.concat(item.permissions);
                        });
                        data.permissions = _.uniq(data.permissions);
                        pjdsUserPermissionsMetric.stop().log(req.logger);
                        return pjdsCallback(null, data);
                    });
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
                        return getCurrentUsersJDSCallback(err, null);
                    }
                    var users_list_screen_id = 'osyncusers';
                    var result = {
                        '_id': users_list_screen_id,
                        'users': []
                    };
                    var newData;
                    try {
                        newData = JSON.parse(jdsResult).users;
                    } catch(err) {
                        req.logger.error(err, 'Parsing osyn users was unsuccessful');
                    }
                    if (!_.isUndefined(newData)) {
                        req.logger.debug('Osync active user list was %s items long.', newData.length);
                        _.remove(newData, function(item) {
                            if (item.duz && item.duz[data.site] && (item.duz[data.site] === data.duz[data.site])) {
                                return true;
                            }
                        });
                        /**
                         * TODO: these last logins should be the same as the utc session.expires not moment's now
                         */
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
                    return getCurrentUsersJDSCallback(null, result, data);
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
            rpcClient.close();
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
                req.audit.lastSuccessfulLogin = moment(req.session.expires).utc().format();
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
        httpUtil.post(options, callback);
    }
};
