'use strict';
var _ = require('lodash');
var bunyan = require('bunyan');
var Timer = require('../../utils/timer/timer');

//bunyan log level for info https://github.com/trentm/node-bunyan#levels
var LOG_LEVELS_LIST = [bunyan.INFO, bunyan.DEBUG, bunyan.TRACE];

var RdkRequestTimers = function (logger) {
    this.logger = logger;
    this.list = [];
    return this;
};

RdkRequestTimers.prototype.start = function (timerName, params) {
    if (!timerName) {
        return false;
    }
    var logLevel = this.logger.level();
    if (_.indexOf(LOG_LEVELS_LIST, logLevel) < 0) {
        return false;
    }
    var options = {
        name: timerName
    };
    if (_.has(params, 'roundTo')) {
        _.set(options, 'roundTo', params.roundTo);
    }
    if (_.has(params, 'format')) {
        _.set(options, 'format', params.format);
    }
    if (_.has(params, 'info')) {
        _.set(options, 'info', params.info);
    }
    if (_.has(params, 'log.start')) {
        _.set(options, 'logger', this.logger);
    }
    var timer = new Timer(options);
    timer.start(options);
    this.list.push(timer);
    return timer;
};

RdkRequestTimers.prototype.stop = function (timerName, params) {
    if (!timerName) {
        return false;
    }
    var logLevel = this.logger.level();
    if (_.indexOf(LOG_LEVELS_LIST, logLevel) < 0) {
        return false;
    }
    var timer = _.find(this.list, 'name', timerName);
    if (!timer) {
        return false;
    }
    if (timer.logged) {
        return false;
    }
    var options = {
        stop: true
    };
    if (_.has(params, 'format')) {
        _.set(options, 'format', params.format);
    }
    if (_.has(params, 'info')) {
        _.set(options, 'info', params.info);
    }
    if (_.has(params, 'log.stop')) {
        _.set(options, 'logger', this.logger);
        timer.stop(options);
    }
    timer.log(this.logger, options);
    return timer;
};

module.exports = RdkRequestTimers;
