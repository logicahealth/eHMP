'use strict';

var _ = require('lodash');

module.exports.registerInterceptors = registerInterceptors;
module.exports.getDefaultInterceptors = getDefaultInterceptors;
module.exports.registerPathInterceptors = registerPathInterceptors;

module.exports._sortWhitelistedInterceptors = sortWhitelistedInterceptors;
module.exports._warnIfInterceptorNotFound = warnIfInterceptorNotFound;

function registerInterceptors(app) {
    /* This is an array of objects with one value instead of one object
     with an array of values so that the order of the interceptors can
     be preserved.
     */
    app.interceptors = [{
        fhirPid: require('../../interceptors/fhir-pid')
    }, {
        audit: require('../../interceptors/audit/audit')
    }, {
        ensureMethodOverridden: require('../../interceptors/ensure-method-overridden')
    }, {
        validatePid: require('../../interceptors/validate-pid')
    }, {
        assignRequestSite: require('../../interceptors/assign-request-site')
    }, {
        synchronize: require('../../interceptors/synchronize')
    }, {
        convertPid: require('../../interceptors/convert-pid')
    }, {
        metrics: require('../../interceptors/metrics')
    }, {
        operationalDataCheck: require('../../interceptors/operational-data-check')
    }, {
        authentication: require('../../interceptors/authentication/authentication')
    }, {
        pep: require('../../interceptors/authorization/pep')
    }, {
        subsystemCheck: require('../../interceptors/subsystem-check-interceptor')
    }, {
        validateRequestParameters: require('../../interceptors/validate-request-parameters')
    }, {
        jdsFilter: require('../../interceptors/jds-filter-interceptor')
    }];
}

function getDefaultInterceptors() {
    return {
        audit: true,
        authentication: true,
        validatePid: true,
        assignRequestSite: true,
        synchronize: true,
        convertPid: true,
        pep: true,
        metrics: true,
        subsystemCheck: true,
        operationalDataCheck: true,
        validateRequestParameters: true
    };
}

function registerPathInterceptors(app, configItem) {
    var httpMethods = _.pick(configItem, 'get', 'post', 'put', 'delete');
    _.each(httpMethods, function(chaff, httpMethod) {
        var pathInterceptors = _.defaults((configItem.interceptors || {}), getDefaultInterceptors());
        var pathInterceptorsWhitelisted = _.keys(_.pick(pathInterceptors, _.identity));
        var pathInterceptorsWhitelistedSorted = sortWhitelistedInterceptors(app, pathInterceptorsWhitelisted);
        warnIfInterceptorNotFound(app, configItem, pathInterceptorsWhitelisted);

        _.each(pathInterceptorsWhitelistedSorted, function(interceptorName) {
            registerPathInterceptor(app, configItem, httpMethod, interceptorName);
        });
    });
}

/**
 * @param {object} app
 * @param {array} whitelistedInterceptors
 * @returns {array} of {interceptorName: function} in the order of app.interceptors
 */
function sortWhitelistedInterceptors(app, whitelistedInterceptors) {
    var pathInterceptorsWhitelistedSorted = _.filter(app.interceptors,
        function(orderedInterceptorObject) {
            var interceptorExists = _.any(orderedInterceptorObject, function(value, key) {
                return _.contains(whitelistedInterceptors, key);
            });
            return interceptorExists;
        }
    );
    return pathInterceptorsWhitelistedSorted;
}

function warnIfInterceptorNotFound(app, configItem, interceptorNames) {
    var appInterceptorNames = _.flatten(_.map(app.interceptors, function(interceptorObject) {
        return _.keys(interceptorObject);
    }));
    var unknownInterceptors = _.difference(interceptorNames, appInterceptorNames);
    if (unknownInterceptors.length) {
        app.logger.warn({
            unknownInterceptors: unknownInterceptors
        }, 'Unknown interceptors configured in %s', configItem.name);
    }
}

function registerPathInterceptor(app, configItem, httpMethod, interceptorObject) {
    app.logger.info('registering interceptor %s for %s %s ( resource name: %s )',
        _.keys(interceptorObject)[0],
        httpMethod.toUpperCase(),
        configItem.path,
        configItem.name);
    var interceptorHandler = _.first(_.values(interceptorObject));
    interceptorHandler.isInterceptor = true;
    app.appRouter[httpMethod](configItem.path, interceptorHandler);
}

