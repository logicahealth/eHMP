/**
 * Created by alexluong on 5/12/15.
 */

'use strict';

var _ = require('lodash');
var rdk = require('../core/rdk');
var nullchecker = rdk.utils.nullchecker;
var mask = require('json-mask');

module.exports = whitelistJson;

function whitelistJson(req, res, body, callback) {
    var fields = req.query.fields;
    
    if (req.method !== 'GET' || nullchecker.isNullish(fields) || fields.indexOf('*') !== -1) {
        return callback(null, req, res, body);
    }

    var responseObject = body;
    var bodyWasObject = _.isObject(body);
    if(!bodyWasObject) {
        responseObject = _.attempt(JSON.parse.bind(null, body));

        if (_.isError(responseObject)) {
            req.logger.error({body: responseObject}, 'Unable to parse body.');
            return callback(null, req, res, body);
        }
    }

    if (_.has(responseObject, 'data')) {
        // Convert to XPath like syntax that json-mask expects.
        fields = '*,data(*,items(' + fields + '))';
    }

    responseObject = mask(responseObject, fields);

    if (_.isEmpty(responseObject)) {
        return callback(null, req, res, body);
    }

    if (bodyWasObject) {
        body = responseObject;
    } else {
        body = JSON.stringify(responseObject);
    }

    return callback(null, req, res, body);
}
