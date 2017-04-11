'use strict';

var _ = require('lodash');
var express = require('express');
var rdk = require('../rdk');
var rdkJwt = require('./rdk-jwt');

module.exports.registerExternalApiDocumentation = registerExternalApiDocumentation;
module.exports.useStaticDocumentation = useStaticDocumentation;

function registerExternalApiDocumentation(app) {
    _.each(app.config.externalApiDocumentation, function(entry) {
        rdk.apiBlueprint.registerExternalUrlOnPrefix(entry.baseUrl, entry.prefix);

        var options = {
            uri: entry.indexUrl,
            json: true,
            logger: app.logger
        };
        rdk.utils.http.get(options, function(error, response, body) {
            if (error) {
                app.logger.error({
                    error: error,
                    url: entry.indexUrl
                }, 'Unable to load index of external markdown');
                return;
            }
            _.each(body.data, function(url) {
                if (!_.contains(url, '://')) {
                    url = _.trimRight(entry.baseUrl, '/') + '/' + _.trimLeft(url, '/');
                }
                var mountpoint = url.substring(entry.baseUrl.length);
                mountpoint = _.trimRight(entry.prefix, '/') + '/' + _.trimLeft(mountpoint, '/');
                rdk.apiBlueprint.registerResource(mountpoint, url);
            });
        });
    });
}

function useStaticDocumentation(app) {
    rdkJwt.updatePublicRoutes(app, {
        bypassCsrf: true,
        rel: 'vha.read',
        path: new RegExp('^' + app.config.rootPath + '/docs($|/.*)')
    });
    app.appRouter.use('/docs/', express.static(__dirname + '/../../../docs'));
}
