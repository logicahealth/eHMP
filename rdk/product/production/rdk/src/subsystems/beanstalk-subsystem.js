'use strict';

//Wrapper around fivebeans beanstalk client.

var beanstalkClient = require('fivebeans');
var _ = require('lodash');


function client(appLogger, beanstalkHost, beanstalkPort) {
    return new Beanstalk(appLogger, beanstalkHost, beanstalkPort);
}

function Beanstalk(appLogger, beanstalkHost, beanstalkPort) {
    this.host = beanstalkHost;
    this.port = beanstalkPort;
    this.logger = appLogger;

    this.client = null;
}

//Creates new open connection to beanstalk.
//
//open(function(err, this) {});
Beanstalk.prototype.openConnection = function(callback) {
    this.logger.debug('Creating new Beanstalk connection.');

    this.client = new beanstalkClient.client(this.host, this.port);

    var self = this;

    this.client.on('connect', function () {
            self.logger.debug('Beanstalk connection created.');
            return callback(null, self);
        })
        .on('error', function (err) {
            self.logger.error('Unable to create Beanstalk connection. ' + err);
            return callback(err, this);
        })
        .on('close', function () {
            self.logger.debug('Beanstalk connection closed.');
        });

    return this.client.connect();
};

//Close beanstalk connection.
Beanstalk.prototype.closeConnection = function() {
    if (_.isObject(this.client)) {
        this.logger.debug('Closing beanstalk connection.');
        this.client.quit();
    }
};

// Use the specified tube. Responds with the name of the tube being used.
//
// use(tube, function(err, tubename) {});
Beanstalk.prototype.use = function(tube, callback) {
    this.client.use(tube, callback);
};

// Responds with the name of the tube currently being used by the client.
//
// listTubeUsed(function(err, tubename) {});
Beanstalk.prototype.listTubeUsed = function(callback) {
    this.client.list_tube_used(callback);
};

// Submit a job with the specified priority (smaller integers are higher priority), delay in seconds, and
// allowed time-to-run in seconds. The payload contains the job data the server will return to clients reserving jobs;
// it can be either a Buffer object or a string. No processing is done on the data. Responds with the id of the
// newly-created job.
//
// put(priority, delay, ttr, payload, function(err, jobid) {});
Beanstalk.prototype.put = function(priority, delay, ttr, payload, callback) {
    this.client.put(priority, delay, ttr, payload, callback);
};

// Peek at the data for the job at the top of the ready queue of the tube currently in use.
// Responds with the job id and payload of the next job, or 'NOT_FOUND' if there are no qualifying jobs in the tube.
// The payload is a Buffer object.
//
// peekReady(function(err, jobid, payload) {});
Beanstalk.prototype.peekReady = function(callback) {
    this.client.peek_ready(callback);
};

// Peek at the data for the delayed job with the shortest delay in the tube currently in use. Responds with the job id
// and payload of the next job, or 'NOT_FOUND' in err if there are no qualifying jobs in the tube.
// The payload is a Buffer object.
//
//peekDelayed(function(err, jobid, payload) {});
Beanstalk.prototype.peekDelayed = function(callback) {
    this.client.peek_delayed(callback);
};

// Peek at the data for the next buried job in the tube currently in use.
// Responds with the job id and payload of the next job, or 'NOT_FOUND' in err if there are no qualifying
// jobs in the tube. The payload is a Buffer object.
//
// peekBuried(function(err, jobid, payload) {});
Beanstalk.prototype.peekBuried = function(callback) {
    this.client.prototype.peek_buried(callback);
};

// Watch the named tube. Responds with the number of tubes currently watched by the client.
//
// watch(tube, function(err, numwatched) {});
Beanstalk.prototype.watch = function (tube, callback) {
    this.client.watch(tube, callback);
};

// Ignore the named tube. Responds with the number of tubes currently watched by the client.
//
// ignore(tube, function(err, numwatched) {});
Beanstalk.prototype.ignore = function(tube, callback) {
    this.client.ignore(tube, callback);
};

// Responds with an array containing the names of the tubes currently watched by the client.
//
// lisTubesWatched(function(err, tubelist) {});
Beanstalk.prototype.lisTubesWatched = function(callback) {
    this.client.list_tubes_watched(callback);
};

// Reserve a job. Responds with the id and the job data. The payload is a Buffer object.
//
// reserve(function(err, jobid, payload) {});
Beanstalk.prototype.reserve = function(callback) {
    this.client.reserve(callback);
};

// Reserve a job, waiting the specified number of seconds before timing out. err contains the string "TIMED_OUT" if
// the specified time elapsed before a job became available. Payload is a buffer.
//
// reserveWithTimeout(seconds, function(err, jobid, payload) {});
Beanstalk.prototype.reserveWithTimeout = function(seconds, callback) {
    this.client.reserve_with_timeout(seconds, callback);
};

// Inform the server that the client is still processing a job, thus requesting more time to work on it.
//
// touch(jobid, function(err) {});
Beanstalk.prototype.touch = function(jobjId, callback) {
    this.client.touch(jobjId, callback);
};

// Delete the specified job. Responds with null if successful, a string error otherwise. This is the only method
// not named identically to its beanstalk counterpart, because delete is a reserved word in Javascript.
//
// destroy(jobid, function(err) {});
Beanstalk.prototype.destroy = function(jobId, callback) {
    this.client.destroy(jobId, callback);
};

// Release the specified job and assign it the given priority and delay (in seconds). Responds with null
// if successful, a string error otherwise.
//
// release(jobid, priority, delay, function(err) {});
Beanstalk.prototype.release = function(jobId, priority, delay, callback) {
    this.client.release(jobId, priority, delay, callback);
};

// Bury the specified job and assign it the given priority. Responds with null if successful, a string error otherwise.
//
// bury(jobid, priority, function(err) {});
Beanstalk.prototype.bury = function(jobId, priority, callback) {
    this.client.bury(jobId, priority, callback);
};

// Kick at most maxToKick delayed and buried jobs back into the active queue. Responds with the number of jobs kicked.
//
// kick(maxToKick, function(err, numkicked) {});
Beanstalk.prototype.kick = function(maxToKick, callback) {
    this.client.kick(maxToKick, callback);
};

// Kick the specified job id. Responds with NOT_FOUND if the job was not found. Supported in beanstalkd versions >= 1.6.
//
// kickJob(jobID, function(err) {});
Beanstalk.prototype.kickJob = function(jobId, callback) {
    this.client.kick_job(jobId, callback);
};

// Peek at the data for the specified job. Payload is a Buffer object.
//
// peek(id, function(err, jobid, payload) {});
Beanstalk.prototype.peek = function(jobId, callback) {
    this.client.peek(jobId, callback);
};

// Pause the named tube for the given number of seconds. No new jobs may be reserved from the tube while it is paused.
//
// pauseTube(tubename, delay, function(err) {});
Beanstalk.prototype.pauseTube = function(tubeName, delay, callback) {
    this.client.pause_tube(tubeName, delay, callback);
};

// List all the existing tubes. Responds with an array of tube names.
//
// list_tubes(function(err, tubenames) {});
Beanstalk.prototype.listTubes = function(callback) {
    this.client.list_tubes(callback);
};

// Request statistics for the specified job. Responds with a hash containing information about the job.
// See the beanstalkd documentation for a complete list of stats.
//
// statsJob(jobid, function(err, response) {});
Beanstalk.prototype.statsJob = function(jobId, callback) {
    this.client.stats_job(jobId, callback);
};

// Request statistics for the specified tube. Responds with a hash containing information about the tube.
// See the beanstalkd documentation for a complete list of stats.
//
// statsTube(tubename, function(err, response) {});
Beanstalk.prototype.statsTube = function(tubeName, callback) {
    this.client.stats_tube(tubeName, callback);
};

// Request statistics for the beanstalkd server. Responds with a hash containing information about the server.
// See the beanstalkd documentation for a complete list of stats.
//
// stats(function(err, response) {});
Beanstalk.prototype.stats = function(callback) {
    this.client.stats(callback);
};

module.exports.Beanstalk =  Beanstalk;
module.exports.client = client;
