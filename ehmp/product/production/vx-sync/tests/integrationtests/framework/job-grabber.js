'use strict';

require('../../../env-setup');

var async = require('async');
var _ = require('underscore');

var BeanstalkClient = require(global.VX_JOBFRAMEWORK).BeanstalkClient;


var defaultConfig = {
	host: '127.0.0.1',
	port: 5000,
	tubenames: ['vx-sync'],
	reserveTimeout: 0
};

/*
Variadic function:
grabJobsFromTubes(logger, host, port, tubenames, reserveTimeout, callback)
grabJobsFromTubes(logger, config, callback)
grabJobsFromTubes(logger, callback)

A config object should have all some or all of the following fields:
	host
	port
	tubenames
	reserveTimeout

tubenames should either be a single string (i.e. the name of a single tube),
of an array of strings (an array of tubenames).

If any fields are missing in the config object or if no configuration is passed,
then the values in defaultConfig will be used.

The callback should be of the standard "errorback" type with two parameters: error,
and result.

If the call is successful, the callback will be called with the second parameter
(result) populated an array of all of the jobs for all of the tubes that were on
beanstalk when this function was run and all of the jobs will be destroyed. If an
error occurs, the callback will be called with the error passed as the value of the
first parameter with the second parameter having the value of an array containing
any jobs grabbed before the error occurred.
*/
function grabJobsFromTubes(logger, host, port, tubenames, reserveTimeout, callback) {
	logger.debug('job-grabber.grabJobsFromTubes() %s:%s [%s]', host, port, tubenames);

	var config = {};

	if(arguments.length === 2) {
		config = {};
		callback = arguments[1];
	} else if(arguments.length === 3) {
		config = arguments[1];
		callback = arguments[2];
	} else {
		config = {};

		if(host) {
			config.host = host;
		}

		if(port) {
			config.port = port;
		}

		if(tubenames) {
			config.tubenames = tubenames;
		}

		if(reserveTimeout || reserveTimeout === 0) {
			config.reserveTimeout = reserveTimeout;
		}
	}

	config = _.defaults(config, defaultConfig);

	if (!_.isArray(config.tubenames)) {
		config.tubenames = [config.tubenames];
	}

	var client = new BeanstalkClient(logger, config.host, config.port);

	client.connect(function(error) {
		if (error) {
			logger.warn('job-grabber.grabJobsFromTubes() Unable to connect to beanstalk. ERROR: %j', error);
			return callback(error);
		}

		client.on('error', function(error) {
			logger.warn('error with connection. ERROR: %j', error);
			client.end();
			callback(error);
		});

        return processTubes(client, logger, config.tubenames, callback);
	});
}
function processTubes(client, logger, tubenames, callback) {
    var previousTubeName = null;
    var results =[];

    async.eachSeries(tubenames,
        function(tubename, eachCallback) {
            async.series([
                    watchTube.bind(null, client, logger, tubename),
                    ignoreTube.bind(null, client, logger, previousTubeName),
                    retrieveJobs.bind(null, client, logger, tubename)],
                function(error, result) {
                    if (error) {
                        logger.warn('job-grabber.processTubes() Unable to process tubes. ERROR: %j', error);
                        return setTimeout(eachCallback, 0, error);
                    }

                    if (result[2]) {
                        results.push(result[2]);
                    }

                    previousTubeName = tubename;
                    setTimeout(eachCallback, 0);
                }
            )
        },
        function(error) {
            client.end();
            callback(error || null, results);
        }
    );
}

function watchTube(client, logger, tubename, callback) {
    logger.debug('job-grabber.watchTube() Watching tube %s.', tubename);

    client.watch(tubename, function(error) {
        if (error) {
            logger.warn('job-grabber.watchTube() Unable to watch tube. ERROR: %j', error);
            return callback(error);
        }

        return callback();
    });
}

function ignoreTube(client, logger, tubename, callback) {
    if (_.isNull(tubename)) {
        return callback();
    }

    logger.debug('job-grabber.ignoreTube() Ignoring tube %s.', tubename);

    client.ignore(tubename, function() {
        callback();
    });
}

function retrieveJobs(client, logger, tubename, callback) {
    var done = true;

    var result = {tubename: tubename, jobs: []};

    async.whilst(
        function () { return done; },
        function (loopCallback) {
            client.reserve_with_timeout(0, function(error, beanstalkJobId, beanstalkJobPayload) {
                if (error && error !== 'TIMED_OUT' && error !== 'DEADLINE_SOON') {
                    logger.warn('job-grabber.retrieveJobs(): Error trying to retrieve message from tube. ERROR: %j', error);

                    done = false;
                    return setTimeout(loopCallback, 0, error);
                }

                if (error === 'TIMED_OUT') {
                    done = false;
                    return setTimeout(loopCallback, 0);
                }

                var job = parseJob(beanstalkJobPayload);
                logger.debug('job-grabber.retrieveJobs() %j', job);

                result.jobs.push(job);

                client.destroy(beanstalkJobId, function(error) {
                    if (error) {
                        logger.warn('job-grabber.retrieveJobs(): Error trying to remove message from tube. ERROR: %j', error);
                        return setTimeout(loopCallback, 0, error);
                    }

                    return setTimeout(loopCallback, 0);
                });
            });
        },
        function (error) {
            return setTimeout(callback, 0, error, result);
        }
    );
}

function parseJob(payload) {
	var job = payload.toString();

	try {
		job = JSON.parse(job);
	} catch (error) {
		// do nothing and accept default
	}

	return job;
}

module.exports = grabJobsFromTubes;