'use strict';
var moment = require('moment');
var now = require('performance-now');

var Timer = function(params) {
    this.name = params.name || '';
    this.roundTo = Number(params.roundTo) || null;
    if (params.start) {
        this.start();
    }
    return this;
};

Timer.prototype.start = function() {
    if (!this.beginning) {
        this.beginning = now();
    }
    return this;
};

Timer.prototype.stop = function() {
    this.end = now();
    if (this.roundTo) {
        var pow = Math.pow(10, this.roundTo);
        this.elapsedMilliseconds = +(Math.round((this.end - this.beginning) * pow) / pow);
    } else {
        this.elapsedMilliseconds = this.end - this.beginning;
    }
    return this;
};

Timer.prototype.log = function(logger, params) {
    if (!this.end || params.stop) {
        this.stop();
    }

    var logObj = {
        'timerName': this.name,
        'start': this.beginning,
        'stop': this.end,
        'elapsedMilliseconds': this.elapsedMilliseconds
    };

    if (params.format) {
        logObj.start = moment(this.beginning).utc().format();
        logObj.stop = moment(this.end).utc().format();
    }

    logger.info(logObj, this.name + ' finished');

    return this;
};


module.exports = Timer;
