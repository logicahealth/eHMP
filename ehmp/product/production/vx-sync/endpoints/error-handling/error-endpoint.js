'use strict';

var format = require('util').format;
var _ = require('underscore');
var HttpHeaderUtils = require(global.VX_UTILS + 'http-header-utils');

function registerErrorAPI(logger, config, environment, app) {
    app.get('/error/find', fetchErrors.bind(null, logger, config, environment));
    app.post('/error/submit/:id', submitById.bind(null, logger, config, environment));
    app.get('/error/doSubmit/:id', submitById.bind(null, logger, config, environment));
}

function fetchErrors(logger, config, environment, request, response) {
    var httpHeaderUtil = new HttpHeaderUtils(logger);
    var referenceInfo = httpHeaderUtil.extractReferenceInfo(request);
    var childLog = logger.child(referenceInfo);
    childLog.debug('error-endpoint.fetchErrors()');

    var query = request.query;

    var filter = buildJdsFilter(childLog, query);

    environment.jds.childInstance(childLog).findErrorRecordsByFilter(filter, function(error, result) {
        if (error) {
            return response.status(500).send(error);
        }

        response.send(result);
    });
}

function submitById(logger, config, environment, request, response) {
    var httpHeaderUtil = new HttpHeaderUtils(logger);
    var referenceInfo = httpHeaderUtil.extractReferenceInfo(request);
    var childLog = logger.child(referenceInfo);
    childLog.debug('error-endpoint.submitById()');

    var id = request.params.id || '';
    childLog.debug('error-endpoint.submitById(%s)', id);

    var deleteRecord = _.has(request.query, 'delete-record') && request.query['delete-record'] !== 'false';
    var childJds = environment.jds.childInstance(childLog);

    childJds.findErrorRecordById(id, function(error, result) {
        var errorRecord;

        if (error) {
            return response.status(500).send(error);
        }

        if (_.isEmpty(result)) {
            return response.status(404).send({});
        }

        errorRecord = _.first(result);

        if (!errorRecord.job) {
            return response.status(500).send(format('Error Record does not have a job to resubmit'));
        }

        environment.publisherRouter.childInstance(childLog).publish(errorRecord.job, function(error) {
            if (error) {
                childLog.error('error-endpoint.submitById(): publisher error: %s', error);
                return response.status(500).send(format('Unable to publish message'));
            }

            childLog.debug('error-endpoint.submitById(): job published, complete status. jobId: %s, jobsToPublish: %j', errorRecord.job.jobId, errorRecord.job);

            if (deleteRecord) {
                childJds.deleteErrorRecordById(id, function(error) {
                    if (error) {
                        return childLog.error('error-endpoint.submitById(): unable to delete job %s after submitting: %s', id, error);
                    }

                    return childLog.debug('error-endpoint.submitById(): deleted job %s after submitting', id);
                });
            }

            return response.status(200).send(errorRecord);
        });
    });

}

function buildJdsFilter(logger, query) {
    logger.debug('error-endpoint.buildFilter()');
    var expressions = _.map(query, function(value, key) {
        var exp;
        if (_.isArray(value)) {
            exp = format('in(%s,[%s])', key, _.map(value, function(item) {
                return '"' + item + '"';
            }));
        } else {
            exp = format('eq(%s,"%s")', key, value);
        }

        return exp;
    });

    return _.reduce(expressions, function(memo, expression) {
        memo += (memo ? ',' : '') + expression;
        return memo;
    }, '');
}

module.exports = registerErrorAPI;
registerErrorAPI._buildJdsFilter = buildJdsFilter;
registerErrorAPI._fetchErrors = fetchErrors;
registerErrorAPI._submitById = submitById;
