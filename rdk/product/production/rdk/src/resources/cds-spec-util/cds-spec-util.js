'use strict';

var _ = require('lodash');
var cdsAgenda = require('../../subsystems/cds/cds-subsystem-agenda');
var cds = require('../../subsystems/cds/cds-subsystem');

sinon.stub(cdsAgenda, 'init');

cds.getAgenda = function() {
    return {
        init: function() {},
        agenda: {
            jobs: function(match, callback) {
                return callback(null, null);
            },
            create: function() {},
            cancel: function(match, callback) {
                return callback(null, null);
            }
        }
    };
};
cds.getAgendaJobProcessorName = function() {
    return 'agendaJobProcessorName';
};

var logger = {
    trace: function() {},
    debug: function() {},
    info: function() {},
    warn: function() {},
    error: function() {},
    fatal: function() {}
};

module.exports.mockReqResUtil = function() {

    var res = {
        status: function() {
            return this;
        },
        rdkSend: function() {
            return this;
        },
        send: function() {
            return this;
        },
        end: function() {
            return this;
        }
    };

    function createReqWithParam(map, body) {
        map = map || {};
        var req = {
            param: (function param(map, name, defaultValue) {
                if (_.has(map, name)) {
                    return map[name] !== null ? String(map[name]) : null;
                }
                if (defaultValue !== undefined && defaultValue !== null) {
                    String(defaultValue);
                }
                return defaultValue;
            }).bind(null, map),

            query: map,
            logger: logger,
            audit: {},
            app: {
                config: {
                    rpcConfig: {
                        context: 'HMP UI CONTEXT',
                        siteHash: '9E7A'
                    },
                    vistaSites: {}
                }
            },
            session: {
                user: {
                    site: '9E7A'
                }
            }
        };
        if (body) {
            req.body = body;
        }
        return req;
    }

    return {
        createRequestWithParam: createReqWithParam,
        response: res
    };

}();

//Creates a mock appReference that is needed when initializing some of our resources...
module.exports.createAppReference = function() {
    var appReference = {
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
        logger: logger,
        subsystems: {
            cds: cds
        }
    };
    cds.getSubsystemConfig(appReference, appReference.logger);
    return appReference;
};

//Creates a mock MongoDB with the collection functions provided.
module.exports.createMockDb = function(collectionFunctions) {

    collectionFunctions = collectionFunctions || {};
    var db = {
        collection: function(callback) {
            return collectionFunctions;
        },
        open: function(callback) {
            callback();
        }
    };

    return db;
};
