'use strict';

const request = require('request');
const _ = require('lodash');

//----------------------------------------------------------------------------
// Verify that VLER DAS is running by using PING URL.  If it is running, then
// callback with true, otherwise call back with false.
//
// Note that this uses destructuring so that unit tests can be written using
// an overridden request object.
//
// logger: The bunyan logger to be used.
// config: The config settings
// callback: The call back function.  It has the following signature:
//    function(error, systemUpFlag)  where:
//         error: is an error if one is being sent
//         systemUpFlag: is true if the system is up
//-----------------------------------------------------------------------------
function check(logger, config, callback, {_request = request} = {}) {
	logger.debug('vler-checker.check()');

	const protocol = _.get(config, 'vlerdas.defaults.protocol', '');
	const host = _.get(config, 'vlerdas.defaults.host', '');
	const port = _.get(config, 'vlerdas.defaults.port', '');
	const urlPath = _.get(config, 'vlerdas.vlerdocument.ping', '');
    const url = protocol + '://' + host + ':' + port + urlPath;
	_request(url, function(error, response, body) {
		if (error) {
			logger.info('vler-checker.check() Error attempting to connect to "%s": %s', url, error);
			return callback(null, false);
		}

		if (response.statusCode !== 200) {
			return callback(null, false);
		}

		callback(null, true);
	});
}

module.exports = check;