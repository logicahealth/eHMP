'use strict';

var _ = require('lodash');
var async = require('async');
var http = require('http');
var url = require('url');

module.exports.registerOuterceptors = registerOuterceptors;
module.exports.registerPathOuterceptors = registerPathOuterceptors;
module.exports.createOuterceptorHandler = createOuterceptorHandler;
module.exports.registerDefaultOuterceptors = registerDefaultOuterceptors;

function registerOuterceptors(app) {
    app.outerceptors = {
        emulateJdsResponse: require('../../outerceptors/emulate-jds-response'),
        asu: require('../../outerceptors/asu'),
        whitelistJson: require('../../outerceptors/whitelist-json'),
        validateResponseFormat: require('../../outerceptors/validate-response-format')
    };
}

function createOuterceptorHandler(app) {
    var _send = app.response.send;
    app.response.send = function(body) {
        var self = this;
        if (self.headersSent) {
            return app.logger.error({
                send: arguments
            }, 'Tried to send to a response that was already sent; aborting.');
        }
        if (self._ranOuterceptors) {
            return _send.call(self, body);
        }
        self._ranOuterceptors = true;
        //body = 'foo';
        if (arguments.length === 2) {
            // res.send(body, status) backwards compat
            if (typeof arguments[0] !== 'number' && typeof arguments[1] === 'number') {
                app.logger.warn('res.send(body, status): Use res.status(status).send(body) instead');
                self.statusCode = arguments[1];
            } else {
                app.logger.warn('res.send(status, body): Use res.status(status).send(body) instead');
                self.statusCode = arguments[0];
                body = arguments[1];
            }
        }
        // disambiguate res.send(status) and res.send(status, num)
        if (typeof body === 'number' && arguments.length === 1) {
            // res.send(status) will set status message as text string
            if (!self.get('Content-Type')) {
                self.type('txt');
            }
            app.logger.warn('res.send(status): Use res.status(status).end() instead');
            self.statusCode = body;
            body = http.STATUS_CODES[body];
        }

        var defaultOuterceptors = self.app.outerceptorPathRegistry._default || [];
        var path = _.get(self.req, '_resourceConfigItem.path') || url.parse(self.req.originalUrl).pathname;
        var pathOuterceptors = self.app.outerceptorPathRegistry[path] || [];

        var bootstrapOuterceptor = [

            function(callback) {
                callback(null, self.req, self, body);
            }
        ];
        var outerceptors = bootstrapOuterceptor.concat(defaultOuterceptors).concat(pathOuterceptors);
        async.waterfall(outerceptors,
            function(err, req, res, body) {
                if (self._headerSent) {
                    return 'Response already sent';
                }
                if (err) {
                    if (_.isString(err)) {
                        err = {
                            message: err
                        };
                    }
                    err.status = 406;
                    self.status(406);
                    return _send.call(self, err);
                }
                return _send.call(self, body);
            }
        );
    };
}

function registerDefaultOuterceptors(app) {
    var defaultOuterceptors = ['whitelistJson', 'validateResponseFormat'];

    registerPathOuterceptors(app, {
        name: '_default',
        path: '_default',
        outerceptors: defaultOuterceptors
    });
}

function registerPathOuterceptors(app, configItem) {
    app.outerceptorPathRegistry = app.outerceptorPathRegistry || {};
    _.each(configItem.outerceptors, function(outerceptorName) {
        if (!(outerceptorName in app.outerceptors)) {
            app.logger.warn('No outerceptor named %s exists in the app object. Unable to register outerceptor for resource %s', outerceptorName, configItem.name);
            return;
        }
        app.outerceptorPathRegistry[configItem.path] = app.outerceptorPathRegistry[configItem.path] || [];
        app.outerceptorPathRegistry[configItem.path].push(app.outerceptors[outerceptorName]);
    });
}
