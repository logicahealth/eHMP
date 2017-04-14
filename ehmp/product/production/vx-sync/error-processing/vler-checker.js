'use strict';

var request = require('request');

function check(logger, config, callback) {
	logger.debug('vler-checker.check()');

    var url = 'http://' + config.vler.defaults.host + ':' + config.vler.defaults.adminPort + '/ping';
	request(url, function(error, response, body) {
		if (error) {
			logger.info('vler-checker.check() Error attempting to connect to "%s": %s', url, error);
			return callback(null, false);
		}

		if (response.statusCode !== 200) {
			return callback(null, false);
		}

		if (String(body).trim() !== 'pong') {
			return callback(null, false);
		}

		callback(null, true);
	});
}

module.exports = check;