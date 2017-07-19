'use strict';

var _ = require('underscore');

function HandlerRegistry() {
    if (!(this instanceof HandlerRegistry)) {
        return new HandlerRegistry();
    }

    this.handlers = {};
}

HandlerRegistry.prototype.get = function(job) {
    return _.has(job, 'type') ? this.handlers[job.type] : undefined;
};

/*
Variadic Method:
    function(vistaId, logger, config, environment, jobType, handler)
    function(logger, config, environment, jobType, handler)
*/
HandlerRegistry.prototype.register = function(vistaId, logger, config, environment, jobType, handler) {
    if(arguments.length === 5) {
        logger = arguments[0];
        config = arguments[1];
        environment = arguments[2];
        jobType = arguments[3];
        handler = arguments[4];

        this.handlers[jobType] = _.partial(handler, _, config, environment);

        return;
    }

    this.handlers[jobType] = _.partial(handler, vistaId, _, config, environment);
};

module.exports = HandlerRegistry;