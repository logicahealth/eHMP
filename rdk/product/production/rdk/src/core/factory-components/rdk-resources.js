'use strict';

var _ = require('lodash');
var fspath = require('path');

var rdk = require('../rdk');
var rdkJwt = require('./rdk-jwt');
var rdkInterceptors = require('./rdk-interceptors');
var rdkOuterceptors = require('./rdk-outerceptors');

module.exports.createResourceRegistry = createResourceRegistry;

module.exports._processResourceConfigItem = processResourceConfigItem;

function createResourceRegistry(app) {
    var ResourceRegistry = require('../resource-directory/resource-registry');
    app.resourceRegistry = new ResourceRegistry();
    app.register = registerResourceFamily.bind(null, app);
    app.register('/resourcedirectory', '../resource-directory/resource-directory-resource');
}

function registerResourceFamily(app, mountpoint, resourcePath) {
    app.logger.info('registering resource [mountpoint=%s][resourcePath=%s]', mountpoint, resourcePath);
    var resourceConfig = require(resourcePath).getResourceConfig(app);
    var msg;
    _.each(resourceConfig, function(configItem) {
        app.logger.info('registering resource [name=%s][mountpoint=%s][path=%s]',
            configItem.name, mountpoint, configItem.path);

        //requiredPermissions has to be defined in the resource configuration item as an array
        if (!_.isArray(_.result(configItem, 'requiredPermissions', null))) {
            msg = 'IMPROPERLY CONFIGURED RESOURCE [name=%s] requires a requiredPermissions array parameter.';
            console.error(msg, configItem.name);
            app.logger.error(msg, configItem.name);
            process.exit(1);
        }
        //isPatientCentric has to be defined in the resource confituration item as a boolean
        if (!_.isBoolean(_.result(configItem, 'isPatientCentric', null))) {
            msg = 'IMPROPERLY CONFIGURED RESOURCE [name=%s] requires an isPatientCentric boolean parameter.';
            console.error(msg, configItem.name);
            app.logger.error(msg, configItem.name);
            process.exit(1);
        }

        processResourceConfigItem(configItem, mountpoint);

        rdkJwt.updatePublicRoutes(app, configItem);
        logPepPermissions(app, configItem);

        addResourceConfigToRequest(app, configItem);
        rdkInterceptors.registerPathInterceptors(app, configItem);
        rdkOuterceptors.registerPathOuterceptors(app, configItem);
        mount(app, configItem);

        var registryItem = _.pick(configItem, 'title', 'path', 'parameters', 'description', 'rel');
        app.resourceRegistry.register(registryItem);

        rdk.health.registerResource(configItem, app.logger);
        if (!configItem.undocumented) {
            var path = mountpoint.length > 1 ? mountpoint : configItem.path;
            var markdownPath = configItem.apiBlueprintFile || resourcePath + '.md';
            if (_.startsWith(markdownPath, '.')) {
                markdownPath = fspath.resolve(__dirname, markdownPath);
            }
            rdk.apiBlueprint.registerResource(path, markdownPath);
        }
    });
}

function processResourceConfigItem(configItem, mountpoint) {
    configItem.title = configItem.name;
    configItem.mountpoint = mountpoint;
    if (_.isString(mountpoint)) {
        configItem.path = rdk.utils.uriBuilder.fromUri(mountpoint).path(configItem.path).build();
    } else {
        configItem.path = mountpoint;
    }
    //configItem.parameters = configItem.parameters || null;
    var crud = {
        post: 'vha.create',
        get: 'vha.read',
        put: 'vha.update',
        delete: 'vha.delete'
    };
    var method = _(configItem).pick(_.keys(crud)).keys().first();
    configItem.rel = crud[method];
}

function logPepPermissions(app, configItem) {
    if (configItem.requiredPermissions) {
        app.logger.info(configItem.title + ' requiredPermissions: [%s]', configItem.requiredPermissions);
        if (_.size(configItem.requiredPermissions) < 1) {
            app.logger.warn('%s has no permissions assigned to protect this endpoint', configItem.title);
        }
    }
}

function addResourceConfigToRequest(app, configItem) {
    app.appRouter.use(configItem.path, function(req, res, next) {
        //only if someone tried to turn pep off by interceptors.pep = false
        if (_.result(configItem, 'interceptors.pep', true) === false) {
            req.logger.warn('WARNING: %s SHOULD NOT ATTEMPT TO TURN OFF THE PEP. THE RESOURCE CONFIGURATION NEEDS TO BE FIXED.', configItem.path);
            configItem.interceptors.pep = true;
        }
        configItem.interceptors = _.defaults((configItem.interceptors || {}), rdkInterceptors.getDefaultInterceptors());
        req._resourceConfigItem = configItem;
        next();
    });
}

function mount(app, resourceConfiguration) {
    var mountpoint = resourceConfiguration.path;
    var resourceName = resourceConfiguration.title;

    var httpMethods = _.pick(resourceConfiguration, 'get', 'post', 'put', 'delete', 'use');
    _.each(httpMethods, function(mountFunction, methodName) {
        app.logger.info('mounting resource [resourceName=%s][mountpoint=%s][action=%s]', resourceName, mountpoint, methodName);
        app.appRouter[methodName](mountpoint, mountFunction);
    });
}
