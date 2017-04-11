'use strict';
var DATASTORE = 'commreq';
var rdk = require('../../../core/rdk');
var pjds = rdk.utils.pjdsStore;
var _ = require('lodash');
var async = require('async');
var httpUtil = rdk.utils.http;
var querystring = require('querystring');

function getAll(logger, appConfig, jdsQuery, callback) {
    var requestConfig = _.extend({}, appConfig.generalPurposeJdsServer, {
        logger: logger,
        url: '/' + DATASTORE + '/?' + querystring.stringify(jdsQuery),
        json: true
    });

    httpUtil.get(requestConfig, function(error, response, body) {
        if (error) {
            logger.error('Unable to retrieve queues from PJDS:', error);
            return callback({
                code: 500,
                message: error.message
            });
        }
        if (!_.isArray(_.get(body, 'items'))) {
            return callback(null, []); //empty store
        }

        return callback(null, _.get(body, 'items'));
    });
}

function save(queueNames, message, req, res, callback) {
    req.logger.debug('Saving communication request to pjds');
    return async.each(queueNames, function(queueName, callback) {
        var pjdsOptions = {
            store: DATASTORE,
            data: message,
            key: message.id
        };
        pjds.post(req, res, pjdsOptions, function(error, result, headers) {
            if (error) {
                req.logger.error('Communication request save: ', error);
                return callback({
                    code: 500,
                    message: error.message
                });
            }
            return callback();
        });
    }, function(err) {
        if (err) {
            return callback(err);
        }
        return callback();
    });
}

function update(queueName, message, req, res, callback) {
    req.logger.debug('Updating communication request from queue: ', queueName);
    var pjdsOptions = {
        store: DATASTORE,
        data: message,
        key: message.id
    };
    pjds.put(req, res, pjdsOptions, function(error, result, headers) {
        if (error) {
            req.logger.error('Communication request update: ', error);
            return callback({
                code: 500,
                message: error.message
            });
        }
        return callback(null, result);
    });
}

function get(queueName, req, res, callback) {
    req.logger.debug('Getting communication requests from queue:', queueName);

    var pjdsOptions = {
        store: DATASTORE,
        filterList: ['eq', 'recipient[].reference', queueName]
    };
    pjds.get(req, res, pjdsOptions, function(error, result, headers) {
        if (error) {
            req.logger.error('Communication request get: ', error);
            return callback({
                code: 500,
                message: error.message
            });
        }
        return callback(null, result.data.items);
    });
}

function remove(messageId, req, res, callback) {
    req.logger.debug('Deleting communication request with id:', messageId);

    var pjdsOptions = {
        store: DATASTORE,
        key: messageId
    };
    pjds.delete(req, res, pjdsOptions, function(error, result, headers) {
        if (error) {
            req.logger.error('Communication request delete: ', error);
            return callback({
                code: 500,
                message: error.message
            });
        }
        return callback();
    });
}

module.exports.remove = remove;
module.exports.get = get;
module.exports.save = save;
module.exports.update = update;
module.exports.getAll = getAll;
