'use strict';

var _ = require('lodash');
var uriBuilder = require('../uri-builder');
var MetricsData = require('./metrics-data');

/*
    Used to record performance metrics for all http(s) incoming and outgoing calls.
    Metrics should be initialized during nodejs instance start up.  Functions are used to wrap app.config because config
    may be reloaded (see app-factory.reloadConfig).
 */
module.exports = {
    initialize: function(app) {
        serviceHosts = [
            {
                host: function () {
                    return _.get(app, 'config.jdsServer.baseUrl');
                }, name: 'jds'
            },
            {
                host: function () {
                    return _.get(app, 'config.solrServer.baseUrl');
                }, name: 'solr'
            },
            {
                host: function () {
                    return _.get(app, 'config.mvi.baseUrl');
                }, name: 'mvi'
            },
            {
                host: function () {
                    return _.get(app, 'config.jbpm.baseUrl');
                }, name: 'jbpm'
            },
            {
                host: function () {
                    return _.get(app, 'config.generalPurposeJdsServer.host');
                }, name: 'pjds'
            }
        ];

        vistaSites = app.config.vistaSites;


        appLogger = app.logger;

        if (this.memoryUsageTimerId !== 0) {
            clearInterval(this.memoryUsageTimerId);
        }
        this.memoryUsageTimerId = setInterval(logProcessInfo.bind(null, app), 5 * 60 * 1000);
    },

    //id used to clear timer in tests only
    memoryUsageTimerId : 0,

    handleFinish: function(metricData, reqLogger) {
        if (isInvalidMetricData(metricData)) {
            return;
        }
        metricData.successfulOperation();
        handleCompleted(metricData, reqLogger);
    },

    handleError : function(metricData, reqLogger) {
        if (isInvalidMetricData(metricData)) {
            return;
        }
        metricData.failedOperation();
        handleCompleted(metricData, reqLogger);
    },

    handleOutgoingStart: function(config, logger) {
        return handleStart('outgoing', config, logger);
    },

    handleIncomingStart : function(req, logger) {
        return handleStart('incoming', req, logger);
    }
};
var vistaSites = null;
var serviceHosts = null;
var appLogger = null;

var defaultLogger = (function() {
    var wrap = function(logger) {
        return function(/*args*/) {
            var args = Array.prototype.slice.call(arguments);
            if(_.isObject(args[0])) {
                args.unshift('%j');
            }
            return logger.apply(null, args);
        };
    };
    return {
        trace: wrap(console.log),
        debug: wrap(console.log),
        info: wrap(console.info),
        warn: wrap(console.warn),
        error: wrap(console.error),
        fatal: wrap(console.fatal)
    };
})();

function logProcessInfo(app) {
    app.logger.info({memoryUsage: process.memoryUsage()});
}

function handleStart(type, config, reqLogger) {
    var logger = reqLogger || appLogger || defaultLogger;
    var metricData = new MetricsData(type, config);

    if(metricData.isType('outgoing')) {
        var url = config.baseUrl || config.url || config.uri;
        if (!url) {
            logger.info({metrics: config}, 'metrics: no host defined');
        } else {
            if (config.baseUrl && (config.url || config.uri)) {
                url = uriBuilder.fromUri(config.baseUrl)
                    .path(config.url || config.uri)
                    .build();
            }
            var hostName = findHostNameByIP(url);
            metricData.addHost(url, hostName);
        }
    }

    return metricData;
}

//Could possible use less code using _.flatten and concat function but not really any easier to understand.
function findHostNameByIP(url) {
    var findHostPredicate = function(host) {
        var hostString = _.result(host, 'host');
        return _.size(hostString) > 1 && _.contains(url, hostString);
    };

    var hostName = _.result(_.find(serviceHosts, findHostPredicate), 'name');

    if (_.isUndefined(hostName)) {
        hostName = _.result(_.find(vistaSites, findHostPredicate), 'name');
    }

    if (_.isUndefined(hostName)) {
        hostName = 'UNKNOWN';
    }

    return hostName;
}

function isInvalidMetricData(metricData) {
    return !metricData ||  !(metricData instanceof MetricsData);
}

function handleCompleted(metricData, reqLogger) {
    var logger = reqLogger || appLogger || defaultLogger;

    metricData.calcElapsedTime();

    logger.info({metrics: metricData});
}
