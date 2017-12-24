'use strict';

require('../../env-setup');

/**
 *  This module is an internal subsystem interface for the retrieval and re-publishing of jobs that where sent to the
 *  JDS error store.
 */

var _ = require('underscore');
var async = require('async');

var errorProcessingAlgorithm = require(global.VX_UTILS + 'error-processing/error-processing-algorithm');

/**
 * This object encapsulates all configuration and results of error processing. It is a stable interface that allows the
 * error processing functions to access data without needing to test for their existence.
 *
 * Error processing results from the error processing algorithm are store in this object using the
 * two arrays called errors and results.
 *
 * @param logger - valid logging object
 * @param config - valid worker-config object
 * @param environment - valid environment object
 * @param constraints - contains any query parameters including processing flags
 * @returns {ErrorProcessingContext} - current context for use during a single processing of errors
 */
function ErrorProcessingContext(logger, config, environment, constraints) {
    if (!(this instanceof ErrorProcessingContext)) {
        return new ErrorProcessingContext(logger, config, environment, constraints);
    }

    this.errors = [];
    this.results = [];

    this.logger = logger;
    this.config = config;
    this.environment = environment;
    this.jdsClient = environment.jds.childInstance(logger);

    this.query = _.omit(constraints, 'ignore-retry', 'delete-only', 'keep-record');

    if (constraints) {
        this.ignoreRetry = constraints['ignore-retry'] || false;
        this.deleteOnly = constraints['delete-only'] || false;
        this.keepRecord = constraints['keep-record'] || false;
    } else {
        this.ignoreRetry = false;
        this.deleteOnly = false;
        this.keepRecord = false;
    }
}

/**
 * This interface is used to retrieve errors from the JDS error store.
 *
 * @param errorProcessingContext - contains the query parameters used to find error records
 * @param callback - used to return an error or the results of the search for errors
 */
function fetchErrors(errorProcessingContext, callback) {
    errorProcessingContext.logger.debug('error-processing-api.fetchErrors: Query: ' + errorProcessingContext.query);

    errorProcessingContext.jdsClient.findErrorRecords(errorProcessingContext.query, function(error, response, results) {
        if (error) {
            errorProcessingContext.logger.error('error-processing-api.fetchErrors: Error retrieving error records. Error: ' + error);
            return callback('Error retrieving error records from jds. Error: ' + error);
        }
        if (response.statusCode !== 200) {
            errorProcessingContext.logger.error('error-processing-api.fetchErrors: Error retrieving error records. JDS returned error: %j', results);
            return callback('Error retrieve error records. JDS returned error: ' + JSON.stringify(results));
        }

        callback(null, results);
    });
}

/**
 * An interface to fetch and re-process one or more errors found in JDS.
 *
 * @param errorProcessingContext - contains both the find error query parameters and the re-processing directives
 * @param callback - returns either an error, 'No records to process.' message or null results.  The 3 results are by
 *                   design. the submitByBatchQuery uses the result to control the batch loop.
 */
function submit(errorProcessingContext, callback) {

    fetchErrors(errorProcessingContext, function(error, results) {
        if (error) {
            return callback(error);
        }

        var errorRecords = (results && _.isArray(results.items)) ? results.items : [];

        if (_.isEmpty(errorRecords)) {
            errorProcessingContext.logger.debug('error-processing-api.submit: No records to process.');
            return callback(null, 'No records to process.'); //by design - see function doc
        }

        errorProcessingAlgorithm.processErrorRecords(errorRecords, errorProcessingContext, function(error) {
            if (error) {
                return callback(error);
            }

            return callback(); //by design - see function doc
        });
    });
}

/**
 * This interface is similar to the submit interface.  However, this interface supports queries that return subsets of
 * errors from the JDS store using the limit query parameter. Technically, this method could replace submit but it
 * would result in an extra fetch call if no limit is set for the query.
 *
 * @param errorProcessingContext - contains both the find error query parameters and the re-processing directives
 * @param callback - returns either an error or null results.
 */
function submitByBatchQuery(errorProcessingContext, callback) {
    var submitResult;

    async.doWhilst(function(whileCallback) {
        submit(errorProcessingContext, function(error, result) {
            if (error) {
                return whileCallback(error);
            }

            submitResult = result;
            whileCallback();
        });
    }, function() {
        return _.isUndefined(submitResult);
    }, function(error) {
        if (error) {
            errorProcessingContext.logger.error('error-processing-api.submitByBatchQuery: Error: %s', error);
            return callback(error);
        }

        errorProcessingContext.logger.info('error-processing-api.submitByBatchQuery: Processed ALL error records for query %j', errorProcessingContext.query);
        callback();
    });
}

/**
 * An interface to fetch and re-process a single error found in JDS.
 *
 * @param uid - unique identifier used to retrieve error from the error stored in JDS
 * @param errorProcessingContext - contains processing directives
 * @param callback - returns either an error, 'No records to process.' message or null results.  By design to be
 *                   consistent with submit interface.
 */
function submitByUid(uid, errorProcessingContext, callback) {
    errorProcessingContext.logger.debug('error-processing-api.submitByUid: Uid: ' + uid);

    errorProcessingContext.jdsClient.findErrorRecordByUid(uid, function(error, response, result) {
        if (error) {
            errorProcessingContext.logger.error('error-processing-api.findErrorRecordByUid: Error retrieving error record. Error: ' + error);
            return callback('Error retrieving error record from jds. Error: ' + error);
        }

        if (response.statusCode !== 200) {
            errorProcessingContext.logger.error('error-processing-api.submitByUid: Error retrieving error records. JDS returned error: %j', result);
            return callback('Error retrieve error records. JDS returned error: ' + JSON.stringify(result));
        }

        if (_.isEmpty(result)) {
            errorProcessingContext.logger.debug('error-processing-api.submitByUid: No record to process.');
            return callback(null, 'No record to process.');
        }

        errorProcessingAlgorithm.processErrorRecords([result], errorProcessingContext, function(error) {
            if (error) {
                return callback(error);
            }

            return callback();
        });
    });
}

module.exports.ErrorProcessingContext = ErrorProcessingContext;
module.exports.fetchErrors = fetchErrors;
module.exports.submit = submit;
module.exports.submitByBatchQuery = submitByBatchQuery;
module.exports.submitByUid = submitByUid;