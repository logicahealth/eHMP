'use strict';
var _ = require('lodash');
var moment = require('moment');
var now = require('performance-now');

/**
 * Timer Constructor
 * @param {Object} params - parameters to use
 * @param {String} params.name
 * @param {Number} [params.roundTo] - optional number of decimials to round milliseconds to
 * @param {boolean} [params.start] - start the timer
 * @param {boolean|Object} [params.format] - boolean to trigger formatting
 * @param {Object} [params.info] - additional information to log
 * @return {Timer}
 */
var Timer = function(params) {
    this.logged = false;
    this.name = params.name || '';
    this.roundTo = Number(params.roundTo) || null;
    if (_.has(params, 'start')) {
        this.start();
    }
    if (_.has(params, 'format')) {
        this.format = params.format;
    }
    if (_.has(params, 'info')) {
        this.setInformation(params.info);
    }
    return this;
};

/**
 * Start the Timer
 * @param {Object} params - parameters to use
 * @param {boolean|Object} [params.format] - boolean to trigger formatting
 * @param {Object} [params.info] - additional information to log
 * @param {Object} [params.logger] - logger to log the start
 * @return {Timer}
 */
Timer.prototype.start = function(params) {
    if (!this.beginning) {
        this.beginning = now();
    }
    if (_.has(params, 'format')) {
        this.format = params.format;
    }
    if (_.has(params, 'info')) {
        this.setInformation(params.info);
    }
    if (_.has(params, 'logger')) {
        params.logger.info(this.beginning, 'Timer: starting ' + this.name);
    }
    return this;
};

/**
 * Stop the Timer
 * @param {Object} params - parameters to use
 * @param {Object} [params.info] - additional information to log
 * @param {Object} [params.logger] - logger to log the stop
 * @return {Timer}
 */
Timer.prototype.stop = function(params) {
    this.end = now();
    if (this.roundTo) {
        var pow = Math.pow(10, this.roundTo);
        this.elapsedMilliseconds = +(Math.round((this.end - this.beginning) * pow) / pow);
    } else {
        this.elapsedMilliseconds = this.end - this.beginning;
    }
    if (_.has(params, 'info')) {
        this.setInformation(params.info);
    }
    if (_.has(params, 'logger')) {
        params.logger.info(this.end, 'Timer: stopping ' + this.name);
    }
    return this;
};

/**
 * log the Timer information and metrics
 * @param {Object} params - parameters to use
 * @param {boolean} [params.stop] - boolean to intentionally stop the timer before logging
 * @param {Object} [params.info] - additional information to log
 * @param {Object} [params.logger] - logger to log the stop
 * @return {Timer}
 */
Timer.prototype.log = function(logger, params) {
    if (!this.end || params.stop) {
        this.stop();
    }

    var logObj = {
        'name': this.name,
        'start': this.beginning,
        'stop': this.end,
        'elapsedMilliseconds': this.elapsedMilliseconds
    };

    var info = _.get(params, 'info', this.info);
    if (info) {
        _.set(logObj, 'info', info);
    }

    if (_.has(params, 'format') || this.format) {
        this.format = _.get(params, 'format', this.format);
        logObj.start = moment(this.beginning).utc().format();
        logObj.stop = moment(this.end).utc().format();
    }

    logger.info(logObj, 'Timer: finished ' + this.name);
    this.logged = true;

    return this;
};

/**
 * Set Timer information and metrics
 * @param {Object} information
 * @return {Timer}
 */
Timer.prototype.setInformation = function(information) {
    var info = _.extend(_.get(this, 'info'), information);
    _.set(this, 'info', info);
    return this;
};


module.exports = Timer;
