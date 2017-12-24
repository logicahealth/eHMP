'use strict';

var _ = require('lodash');
var oracleConnectionPool = require('../../utils/oracle-connection-pool');
var oracledb = require('oracledb');

var rdk = require('../../core/rdk');
var RdkError = rdk.utils.RdkError;

var PROCEDURE_GET_ATTACHMENT = 'BEGIN COMMUNICATION.MESSAGE_API.FETCH_MESSAGE_ATTACHMENT(:identifier, :contentType, :output); END;';
var PROCEDURE_UPDATE_USER_PREFERENCES = 'BEGIN COMMUNICATION.MESSAGE_API.UPDATE_USER_PREFERENCES(:userId, :categorySystem, :categoryCode, :enabled, :output); END;';
var NO_DATA_ERROR_CODE = 'ORA-01403';


function getResourceConfig() {
    return [{
        name: 'ehmp-announcements',
        path: '',
        get: getCommunications,
        interceptors: {
            synchronize: false,
            validatePid: false
        },
        requiredPermissions: ['read-message'],
        isPatientCentric: false,
        subsystems: []
    }, {
        name: 'ehmp-announcements-attachment',
        path: '/:identifier/attachment/:idAttachment',
        get: getAttachment,
        interceptors: {
            synchronize: false,
            validatePid: false
        },
        requiredPermissions: ['read-message'],
        isPatientCentric: false,
        subsystems: []
    }, {
        name: 'ehmp-announcements-preferences',
        path: '/preferences',
        post: postUserPreferences,
        interceptors: {
            synchronize: false,
            validatePid: false
        },
        requiredPermissions: ['read-message'],
        isPatientCentric: false,
        subsystems: []
    }];
}

/**
 * A mapping between keys used in the fetch messages procedure and keys used within getMessages()
 * @type {{userId: string, version: string, category: string, status: string, override: string}}
 */
var fetchProcedureMap = {
    userId: 'i_user_id',
    version: 'i_version',
    category: 'i_category',
    status: 'i_status',
    override: 'i_override_preferences'
};
Object.freeze(fetchProcedureMap);


/**
 * Data type prefixes for images.
 * @type {{jpg: string, jpeg: string, bmp: string, png: string}}
 */
var contentTypeMap = {
    'image/jpg': 'data:image/jpeg;base64,',
    'image/jpeg': 'data:image/jpeg;base64,',
    'image/bmp': 'data:image/bmp;base64,',
    'image/png': 'data:image/png;base64,'
};
Object.freeze(contentTypeMap);


var PREFERENCE_WHITE_LIST = ['http://ehmp.DNS   /messageCategories/announcements-promotions'];


/**
 * BEGIN
 *      COMMUNICATION.MESSAGE_API.FETCH_MESSAGES(
 *         :userId,            -- VARCHAR2 (Required)
 *         :version,           -- VARCHAR2 (Required)
 *         :category,          -- VARCHAR2 (Required)
 *         :status,            -- VARCHAR2 (optional)
 *         :override,          -- VARCHAR2 (optional) 'Y' or 'N'
 *         :output             -- CLOB (Output)
 *       );
 *  END;
 */
function getCommunications(req, res) {
    var dbConfig = _.get(req, 'app.config.oracledb.communicationsDatabase');
    if (!dbConfig) {
        var unavailableError = new RdkError({
            logger: req.logger,
            code: 'oracledb.503.1000'
        });
        return res.status(unavailableError.status).rdkSend(unavailableError.error);
    }

    var inputData = {
        userId: _.get(req, ['query', 'requester.userId']),
        version: _.get(req, ['query', 'requester.ehmpAppVersion'], ''),
        category: _.get(req, ['query', 'category']),
        status: _.get(req, ['query', 'status']),
        override: _.get(req, ['query', 'overridePreferences'])
    };

    if (_.isString(inputData.category)) {
        inputData.category = [inputData.category];
    }

    var currentUser = req.session.user.uid;
    if (inputData.userId !== currentUser) {
        var message = 'request.userId: (' + inputData.userId + ') does not match the user authenticated to this session';
        return res.status(400).rdkSend(message);
    }

    var version = inputData.version.split('.');
    if (version.length > 2) {
        version.length = 2;
    }
    inputData.version = version.join('.');

    if (_.isBoolean(inputData.override)) {
        inputData.override = inputData.override ? 'Y' : 'N';
    } else if (_.isString(inputData.override)) {
        inputData.override = inputData.override.toLowerCase() === 'true' ? 'Y' : 'N';
    }

    oracleConnectionPool.getPool(req, dbConfig, function getPool(err, pool) {
        if (err) {
            var error = new RdkError({
                code: 'oracledb.500.1000',
                logger: req.logger,
                error: _.get(err, 'message', 'Failed to get resource from connection pool')
            });
            return res.status(error.status).rdkSend(error);
        }
        pool.getConnection(function getConnection(err, connection) {
            if (err) {
                req.logger.debug('failed to connection to oracle');
                var error = new RdkError({
                    code: 'oracledb.500.1000',
                    logger: req.logger,
                    error: _.get(err, 'message', 'Failed to open oracle connection')
                });
                return res.status(error.status).rdkSend(error);
            }

            var data = createFetchOracleBindings(inputData);
            var query = createFetchProcedureString(data);
            req.logger.info({query: query, binds: data, message: 'Generated query and oracle binds'});

            connection.execute(query, data, function execute(err, result) {
                if (err) {
                    oracleConnectionPool.doClose(req, connection);
                    var connectionError = new RdkError({
                        code: 'oracledb.500.1000',
                        logger: req.logger,
                        error: _.get(err, 'message', 'Failed to execute get user preferences')
                    });
                    return res.status(connectionError.status).rdkSend(connectionError);
                }

                var clob = _.get(result, 'outBinds.output');
                if (_.isUndefined(clob) || !_.isFunction(_.get(clob, 'on'))) {
                    oracleConnectionPool.doClose(req, connection);
                    req.logger.debug('clob was not returned');
                    var undefinedError = new RdkError({
                        code: 'oracledb.500.1000',
                        logger: req.logger,
                        error: _.get(err, 'message', 'Did not receive a clob buffer object')
                    });
                    return res.status(undefinedError.status).rdkSend(undefinedError);
                }

                var output = '';
                clob.on('err', function(err) {
                    oracleConnectionPool.doClose(req, connection);
                    req.logger.debug('The connection to the CLOB was interrupted');
                    var clobError = new RdkError({
                        code: 'oracledb.500.1000',
                        logger: req.logger,
                        error: _.get(err, 'message', 'Clob read error')
                    });
                    return res.status(clobError.status).rdkSend(clobError);
                });

                clob.on('data', function(chunk) {
                    output += chunk;
                });

                clob.on('close', function() {
                    oracleConnectionPool.doClose(req, connection);
                    return res.status(200).rdkSend({
                        data: {
                            items: parse(output)
                        }
                    });
                });
            });
        });
    });
}


/**
 * BEGIN
 *      COMMUNICATION.MESSAGE_API.FETCH_MESSAGE_ATTACHMENT(
 *          :identifier     -- VARCHAR (Required)
 *          :contentType    -- VARCHAR (Output)
 *          :output         -- BLOB (Output) The image
 *      );
 * END;
 */
function getAttachment(req, res) {
    var dbConfig = _.get(req, 'app.config.oracledb.communicationsDatabase');
    if (!dbConfig) {
        var unavailableError = new RdkError({
            logger: req.logger,
            code: 'oracledb.503.1000'
        });
        return res.status(unavailableError.status).rdkSend(unavailableError.error);
    }


    var identifier = _.get(req, 'params.identifier');

    oracleConnectionPool.getPool(req, dbConfig, function getPool(err, pool) {
        if (err) {
            var error = new RdkError({
                code: 'oracledb.500.1000',
                logger: req.logger,
                error: _.get(err, 'message', 'Failed to get resource from connection pool')
            });
            return res.status(error.status).rdkSend(error);
        }
        pool.getConnection(function getConnection(err, connection) {
            if (err) {
                var error = new RdkError({
                    code: 'jbpm.500.1000',
                    logger: req.logger,
                    error: _.get(err, 'message', 'Was not able to establish oracle connection')
                });
                return res.status(error.status).rdkSend(error);
            }

            var data = {
                identifier: {val: identifier, dir: oracledb.BIND_IN, type: oracledb.STRING},
                contentType: {dir: oracledb.BIND_OUT, type: oracledb.STRING},
                output: {dir: oracledb.BIND_OUT, type: oracledb.BLOB}
            };
            req.logger.info('getAttachment oracle binds', data);

            connection.execute(PROCEDURE_GET_ATTACHMENT, data, function execute(err, result) {
                if (err) {
                    oracleConnectionPool.doClose(req, connection);
                    var message = _.get(err, 'message', '');
                    if (_.contains(message, NO_DATA_ERROR_CODE)) {
                        var noDataError = new RdkError({
                            code: 'oracledb.404.1000',
                            logger: req.logger,
                            error: message
                        });
                        return res.status(noDataError.status).rdkSend(noDataError);
                    }

                    var error = new RdkError({
                        code: 'oracledb.500.1000',
                        logger: req.logger,
                        error: message
                    });
                    return res.status(error.status).rdkSend(error);
                }

                var contentType = _.get(result, 'outBinds.contentType');
                var blob = _.get(result, 'outBinds.output');
                if (_.isUndefined(blob) || !_.isFunction(_.get(blob, 'on'))) {
                    oracleConnectionPool.doClose(req, connection);
                    var undefinedError = new RdkError({
                        code: 'oracledb.404.1000',
                        logger: req.logger,
                        error: 'Blob not returned'
                    });
                    return res.status(undefinedError.status).rdkSend(undefinedError);
                }

                var output = new Buffer(0);
                blob.on('err', function(err) {
                    oracleConnectionPool.doClose(req, connection);
                    var blobError = new RdkError({
                        code: 'oracledb.500.1000',
                        logger: req.logger,
                        error: _.get(err, 'message', 'Blob read error')
                    });
                    return res.status(blobError.status).rdkSend(blobError);
                });

                blob.on('data', function(chunk) {
                    output = Buffer.concat([output, chunk]);
                });

                blob.on('close', function() {
                    oracleConnectionPool.doClose(req, connection);
                    var response = {
                        contentType: contentType
                    };
                    var imagePrefix = _.get(contentTypeMap, contentType, null);
                    if (imagePrefix) {
                        response.src = imagePrefix + output.toString('base64');
                    } else {
                        response.src = output.toString('base64');
                    }
                    response.imagePrefix = imagePrefix;
                    response.hasPrefix = !_.isNull(imagePrefix);
                    return res.status(200).rdkSend(response);
                });
            });
        });
    });
}


/***
 * BEGIN
 *      COMMUNICATION.MESSAGE_API.UPDATE_USER_PREFERENCES(
 *          :userId,            -- VARCHAR (Required)
 *          :categorySystem,    -- VARCHAR (Required)
 *          :categoryCode,      -- VARCHAR (Required)
 *          :enabled,           -- VARCHAR (Required) 'Y' or 'N'
 *          :output             -- NUMBER (Output) The number of rows affected
 *     );
 * END;
 */
function postUserPreferences(req, res) {
    var dbConfig = _.get(req, 'app.config.oracledb.communicationsDatabase');
    if (!dbConfig) {
        var unavailableError = new RdkError({
            logger: req.logger,
            code: 'oracledb.503.1000'
        });
        return res.status(unavailableError.status).rdkSend(unavailableError.error);
    }


    var userId = _.get(req, 'body.userId');
    var categorySystem = _.get(req, 'body.category.system');
    var categoryCode = _.get(req, 'body.category.code');
    var enabled = _.get(req, 'body.enabled');

    if (categorySystem[categorySystem.length - 1] === '/') {
        categorySystem = categorySystem.substr(0, categorySystem.length - 1);
    }

    if (!_.contains(PREFERENCE_WHITE_LIST, categorySystem + '/' + categoryCode)) {
        return res.status(400).rdkSend('Invalid category.system and category.code combination.');
    }

    var currentUser = req.session.user.uid;
    if (userId !== currentUser) {
        var message = 'request.userId: (' + userId + ') does not match the user authenticated to this session';
        return res.status(400).rdkSend(message);
    }

    if (_.isBoolean(enabled)) {
        enabled = enabled ? 'Y' : 'N';
    }

    oracleConnectionPool.getPool(req, dbConfig, function getPool(err, pool) {
        if (err) {
            var error = new RdkError({
                code: 'oracledb.500.1000',
                logger: req.logger,
                error: _.get(err, 'message', 'Could not get resource from connection pool')
            });
            return res.status(error.status).rdkSend(error);
        }
        pool.getConnection(function getConnection(err, connection) {
            if (err) {
                var error = new RdkError({
                    code: 'oracledb.500.1000',
                    logger: req.logger,
                    error: _.get(err, 'message', 'Was not able to establish oracle connection')
                });
                return res.status(error.status).rdkSend(error);
            }

            var data = {
                userId: {val: userId, dir: oracledb.BIND_IN, type: oracledb.STRING},
                categorySystem: {val: categorySystem, dir: oracledb.BIND_IN, type: oracledb.STRING},
                categoryCode: {val: categoryCode, dir: oracledb.BIND_IN, type: oracledb.STRING},
                enabled: {val: enabled, dir: oracledb.BIND_IN, type: oracledb.STRING},
                output: {dir: oracledb.BIND_OUT, type: oracledb.NUMBER}
            };

            connection.execute(PROCEDURE_UPDATE_USER_PREFERENCES, data, {autoCommit: true}, function(err, result) {
                if (err) {
                    oracleConnectionPool.doClose(req, connection);
                    var error = new RdkError({
                        code: 'oracledb.500.1000',
                        logger: req.logger,
                        error: _.get(err, 'message', 'Failed to execute update users preferences')
                    });
                    return res.status(error.status).rdkSend(error);
                }
                oracleConnectionPool.doClose(req, connection);
                var output = _.get(result, 'outBinds.output');
                return res.status(200).rdkSend({rowsAltered: output});
            });
        });
    });
}


/**
 * Wrapper for JSON.parse encase it fails
 */
function parse(str) {
    var out;
    try {
        out = JSON.parse(str);
    } catch (e) {
        out = str;
    }
    return out;
}


/**
 * Creates the fetch_messages query based on the input binds supplied
 * @param {*} oracleBindings The data bindings used to make the request
 * @returns {string}
 */
function createFetchProcedureString(oracleBindings) {
    var params = '';
    _.each(oracleBindings, function(val, key) {
        var paramValue = _.get(fetchProcedureMap, key);
        if (paramValue) {
            params += paramValue + ' => :' + key + ', ';
        }
    });
    params += 'o_messages => :output';
    return 'BEGIN COMMUNICATION.MESSAGE_API.FETCH_MESSAGES(' + params + '); END;';
}


/**
 * Creates the oracle bindings based on the values received from the the request.
 * @param {*} inputData Flattened data from the request
 * @returns {{}}
 */
function createFetchOracleBindings(inputData) {
    var oracleBindings = {};
    _.each(inputData, function(val, key) {
        if (!_.isUndefined(val)) {
            oracleBindings[key] = {val: val, dir: oracledb.BIND_IN, type: oracledb.STRING};
        }
    });
    oracleBindings.output = {dir: oracledb.BIND_OUT, type: oracledb.CLOB};
    return oracleBindings;
}


module.exports.getResourceConfig = getResourceConfig;
module.exports._getCommunications = getCommunications;
module.exports._getAttachment = getAttachment;
module.exports._postUserPreferences = postUserPreferences;
module.exports._createFetchProcedureString = createFetchProcedureString;
module.exports._createFetchOracleBindings = createFetchOracleBindings;
