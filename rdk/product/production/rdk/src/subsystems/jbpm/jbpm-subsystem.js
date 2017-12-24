'use strict';

var rdk = require('../../core/rdk');
var http = rdk.utils.http;
var activityDb = rdk.utils.pooledJbpmDatabase;

function doQuery(req, dbConfig, query, callback, maxRowsParam) {
    //NOTE: It's very likely for the following error to happen if you have 1 million records returned here
    //NJS-024: memory allocation failed
    //When that happens, a 500 error will be sent back from the resource.
    //Decreasing this to one hundred thousand records seemed to work just fine when 120 records were returned
    //(it would error out with 120 records when 1000000 was set).
    //Even with 100000 rows we are seeing "NJS-024: memory allocation failed" error. So reduced default to 10000.
    activityDb.doQuery(req, dbConfig, query, callback, (maxRowsParam || 10000));
}
module.exports.doQuery = doQuery;

//create a fake request object to wrap logger so we can re-use oracledb connection
function doQueryLogger(logger, dbConfig, query, callback, maxRowsParam) {
    var req = {};
    req.logger = logger;
    activityDb.doQuery(req, dbConfig, query, callback, (maxRowsParam || 10000));
}
module.exports.doQueryLogger = doQueryLogger;

function doQueryWithParams(req, dbConfig, query, queryParameters, callback, maxRowsParam) {
    activityDb.doQueryWithParams(req, dbConfig, query, queryParameters, callback, (maxRowsParam || 10000));
}
module.exports.doQueryWithParams = doQueryWithParams;

function doExecuteProcWithParams(req, dbConfig, query, parameters, callback, maxRowsParam) {
    activityDb.doExecuteProcWithParams(req, dbConfig, query, parameters, callback, (maxRowsParam || 10000));
}
module.exports.doExecuteProcWithParams = doExecuteProcWithParams;

function doExecuteProcMultipleRecordSets(req, dbConfig, query, parameters, callback, maxRowsParam) {
    activityDb.doExecuteProcMultipleRecordSets(req, dbConfig, query, parameters, callback, (maxRowsParam || 10000));
}
module.exports.doExecuteProcMultipleRecordSets = doExecuteProcMultipleRecordSets;

function doExecuteProcWithInOutParams(req, dbConfig, query, parameters, autoCommit, callback, maxRowsParam) {
    activityDb.doExecuteProcWithInOutParams(req, dbConfig, query, parameters, autoCommit, callback, (maxRowsParam || 10000));
}
module.exports.doExecuteProcWithInOutParams = doExecuteProcWithInOutParams;

function doQueryWithParamsLogger(logger, dbConfig, query, queryParameters, callback, maxRowsParam) {
    var req = {};
    req.logger = logger;
    activityDb.doQueryWithParams(req, dbConfig, query, queryParameters, callback, (maxRowsParam || 10000));
}

module.exports.doQueryWithParamsLogger = doQueryWithParamsLogger;

function getHealthcheck(app, logger) {
    return {
        name: 'jbpm',
        interval: 100000,
        check: function(callback) {
            var httpConfig = getJBPMHttpConfig(app.config, logger);
            httpConfig.url += app.config.jbpm.healthcheckEndpoint;

            //Add BASIC auth header to rest call
            if (app.config.jbpm.adminUser.username && app.config.jbpm.adminUser.password) {
                httpConfig = addAuthToConfig(app.config.jbpm.adminUser.username, app.config.jbpm.adminUser.password, httpConfig);
            }
            httpConfig.json = true;

            http.get(httpConfig, function(err, response, data) {
                if (!data || !data.deploymentUnitList) {
                    err = true;
                }

                if (err) {
                    return setImmediate(callback, false);
                }
                return setImmediate(callback, true);
            });
        }
    };
}
module.exports.getHealthcheck = getHealthcheck;

function getSubsystemConfig(app, logger) {
    return {
        healthcheck: getHealthcheck(app, logger)
    };
}

function addAuthToConfig(username, password, config) {
    config.headers.Authorization = createBasicAuth(username, password);
    return config;
}

function getJBPMHttpConfig(config, logger) {
    var httpConfig = {
        baseUrl: config.jbpm.baseUrl,
        logger: logger,
        url: config.jbpm.apiPath,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'application/json'
        }
    };

    // if certs are needed for communication in the future, this should be uncommented
    // var path;
    // if (config.jbpm.options) {
    //     _.extend(httpConfig, config.jbpm.options);
    // }
    // try {
    //     if (config.jbpm.options.key) {
    //         path = config.jbpm.options.key;
    //         httpConfig.key = fs.readFileSync(path);
    //     }
    //     if (config.jbpm.options.cert) {
    //         path = config.jbpm.options.cert;
    //         httpConfig.cert = fs.readFileSync(path);
    //     }
    // } catch (e) {
    //     if (logger) {
    //         logger.error('Error reading certificate for JBPM');
    //     } else {
    //         console.log('Error reading certificate information for JBPM');
    //     }
    // }

    return httpConfig;
}

function createBasicAuth(username, password) {
    return 'Basic ' + new Buffer(username + ':' + password).toString('base64');
}

module.exports.getSubsystemConfig = getSubsystemConfig;
module.exports.getJBPMHttpConfig = getJBPMHttpConfig;
module.exports.addAuthToConfig = addAuthToConfig;
module.exports.ExecutionError = activityDb.ExecutionError;
module.exports.ConnectionError = activityDb.ConnectionError;
