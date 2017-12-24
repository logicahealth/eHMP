'use strict';

const _ = require('lodash');
const request = require('request');


function check(logger, config, callback, {_request = request} = {}) {
	logger.debug('record-enrichment-checker.check() Returns true if the Soap Handler terminology ping service succeeds');

    const url = config.terminology.protocol + '://' + config.terminology.host + ':' + config.terminology.port + config.terminology.terminologyPing;
    _request(url, function(error, response, body) {
        logger.debug('record-enrichment-checker.check() Response from terminology ping service.  error: %s; body: %s.', error, body);

        if (error) {
            logger.info('record-enrichment-checker.check() Error attempting to connect to "%s": %s', url, error);
            logger.debug('record-enrichment-checker.check() error returned from call to request - returning false.');
            return callback(null, false);
        }

        if (response.statusCode !== 200) {
            logger.debug('record-enrichment-checker.check() statusCode was not 200 - returning false.');
            return callback(null, false);
        }

        if (_.isEmpty(body)) {
            logger.debug('record-enrichment-checker.check() ping returned no response body - returning false.');
            return callback(null, false);
        }

        let parsedBody = null;
        try {
            parsedBody = JSON.parse(body);
        }
        catch (parseError) {
            logger.debug('record-enrichment-checker.check() failed to parse response from ping service  body: %s - returning false.', body);
            return callback(null, false);
        }

        if (_.get(parsedBody, 'message', '') !== 'pong') {
            logger.debug('record-enrichment-checker.check() message was not pong.  parsedBody: %j - returning false.', parsedBody);
            return callback(null, false);
        }

        logger.debug('record-enrichment-checker.check() Soap Handler terminology is up - returning true.');
        callback(null, true);
    });
}

module.exports = check;