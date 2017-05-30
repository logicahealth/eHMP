'use strict';

var _ = require('underscore');

function HandlerRegistry(environment) {
    if (!(this instanceof HandlerRegistry)) {
        return new HandlerRegistry();
    }

    this.handlers = {};
    this.environment = environment;
}

HandlerRegistry.prototype.get = function(job) {
    return _.has(job, 'type') ? this.handlers[job.type] : undefined;
};

/*
Variadic Method:
    function(vistaId, config, jobType, handler)
    function(config, jobType, handler)
*/
HandlerRegistry.prototype.register = function(vistaId, config, jobType, handler) {
    if(arguments.length === 3) {
        config = arguments[0];
        jobType = arguments[1];
        handler = arguments[2];

        this.handlers[jobType] = _.partial(handler, _, config, _);

        return;
    }

    this.handlers[jobType] = _.partial(handler, vistaId, _, config, _);
};

module.exports = HandlerRegistry;