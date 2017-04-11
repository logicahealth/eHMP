'use strict';

var fs = require('fs');
var fspath = require('path');
var _ = require('lodash');
var appfactory = require('../core/app-factory');

var registerRegex = /^app\.register\('([^']+)', [^']+'([^']+)'\);/gm;

module.exports = loadResources;
module.exports.buildDescription = buildDescription;

/**
 * Load resources defined in server files.
 * @param {Object} app - The app. If not provided a mock app is created.
 * @param {string[]} [serverFiles] - An array of server file names in `bin` to register resources from.
 *   Default value is all .js files in `bin`.
 * @returns {Object} Each property of the return value has the resource's file path as its key and
 *   the result of calling getResourceConfig() as its value, which is an array of resource
 *   configurations.
 */
function loadResources(app, serverFiles) {
    var resources = {};
    if (!app) {
        app = mockApp();
    }
    if (!serverFiles) {
        serverFiles = loadServerFiles();
    }
    _.each(serverFiles, function(fileName) {
        var serverFilePath = fspath.resolve(__dirname, fspath.join('../../bin', fileName));
        var content = fs.readFileSync(serverFilePath, {encoding: 'utf8'});
        var registration;
        while ((registration = registerRegex.exec(content)) !== null) {
            var mountpoint = registration[1];
            var filePath = registration[2];
            addResource(app, resources, filePath, mountpoint);
        }
    });
    return resources;
}

function mockApp() {
    return {
        config: {
            cdsMongoServer: {
                host: 'foo',
                port: '42'
            },
            cdsInvocationServer: {
                host: 'bar',
                port: '47'
            }
        },
        logger: {
            trace: function() {},
            debug: function() {},
            info: function() {},
            warn: function() {},
            error: function() {}
        }
    };
}

function loadServerFiles() {
    var serverFiles = fs.readdirSync('bin');
    return _.filter(serverFiles, function(fileName) {
        return _.endsWith(fileName, '.js');
    });
}

function addResource(app, resources, filePath, mountpoint) {
    filePath = fspath.resolve(__dirname, fspath.join('../../' + filePath));
    var resourceModule = require(filePath);
    if (!resourceModule.getResourceConfig) {
        return;
    }
    var resourceConfigs = _.cloneDeep(resourceModule.getResourceConfig(app));
    _.each(resourceConfigs, function(resource) {
        appfactory._processConfigItem(resource, mountpoint);
    });
    resources[filePath] = resourceConfigs;
}

function buildDescription(resource, resourceConfigs, filePath, method) {
    var description = filePath.replace(/.*\/src\//, '') + '.js';
    if (resourceConfigs.length > 1) {
        if (method) {
            description += ' ' + method;
        }
        var base = findBasePath(_.pluck(resourceConfigs, 'path'));
        if (resource.path.length > base.length) {
            description += ' at path ' + resource.path.substring(base.length);
        }
    }
    return description;
}

function findBasePath(paths) {
    paths = paths.sort();
    var first = _.first(paths);
    var last = _.last(paths);
    var i = 0;
    while(i < first.length && first.charAt(i) === last.charAt(i)) {
        i++;
    }
    return first.substring(0, i);
}
