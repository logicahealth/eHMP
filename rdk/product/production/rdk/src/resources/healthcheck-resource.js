'use strict';

var _ = require('lodash');
var async = require('async');
var moment = require('moment');

var healthCheckRegistry = {};
var resultRegistry = {};

function registerItem(item, name, type, logger) {
    if (!item.healthcheck && !item.subsystems) {
        logger.warn('no healthcheck defined for ' + type + ' named ' + name);
        return;
    }
    var healthcheck = item.healthcheck || {};
    if (!item.subsystems && !healthcheck.check) {
        logger.warn('health check has no check function or subsystem dependencies: ' + name);
    }

    var registeredCheck = {
        name: name,
        type: type
    };

    if (healthcheck.check) {
        registeredCheck.check = healthcheck.check;
    }

    if (healthcheck.interval) {
        registeredCheck.interval = healthcheck.interval;
        //this bit starts up the regular background check of the healthcheck
        setInterval(performHealthCheck, registeredCheck.interval, registeredCheck, logger);
    }

    if (item.subsystems) {
        registeredCheck.subsystems = item.subsystems;
    }

    var registeredCheckResult = {
        healthy: false,
        type: registeredCheck.type
    };

    if (registeredCheck.subsystems) {
        var dependencies = {};
        _.each(item.subsystems, function(dependency) {
            dependencies[dependency] = false;
        });
        registeredCheckResult.subsystems = dependencies;
    }

    healthCheckRegistry[name] = registeredCheck;
    resultRegistry[name] = registeredCheckResult;

    if (healthcheck.check) {
        performHealthCheck(registeredCheck, logger);
    } else {
        registeredCheckResult.healthy = true;
    }
}

function registerResource(configItem, logger) {
    var title = configItem.title;
    registerItem(configItem, title, 'resource', logger);
    logger.info('registered resource: ' + title);
}

function registerSubsystem(subsytemConfig, subsystemName, logger) {
    registerItem(subsytemConfig, subsystemName, 'subsystem', logger);
    logger.info('registered subsystem: ' + subsystemName);
}

function executeAll(logger, callback, timeout) {
    var healthy = true;
    timeout = timeout || 1000;
    async.each(healthCheckRegistry, function (registeredCheck, cb) {
        reportHealth(registeredCheck, logger, timeout, cb);
    }, function () {
        // do this after all checks to allow time for dependency checks
        _.each(healthCheckRegistry, function (registeredCheck) {
            checkDependencyHealth(registeredCheck, logger);
            if (!resultRegistry[registeredCheck.name].healthy) {
                healthy = false;
            }
        });
        resultRegistry.isHealthy = healthy;
        callback(healthy);
    });
}

function reportHealth(registeredCheck, logger, timeout, callback) {
    var checkHealth;
    if (registeredCheck.check) {
        if (registeredCheck.interval) {
            var registeredResult = resultRegistry[registeredCheck.name];
            checkHealth = async.asyncify(function (cb) { cb(null, registeredResult.healthy); });
        } else {
            checkHealth = async.timeout(performHealthCheck.bind(null, registeredCheck, logger), timeout);
        }
    } else {
        checkHealth = async.asyncify(function (cb) { cb(null, true); });
    }

    checkHealth(function (err, healthy) {
        if (_.get(err, 'code') === 'ETIMEDOUT') {
            healthy = resultRegistry[registeredCheck.name].healthy;
        }
        callback(null, healthy);
    });
}

function performHealthCheck(registeredCheck, logger, callback) {
    var registeredResult = resultRegistry[registeredCheck.name];
    if (!registeredResult) {
        return;
    }

    logger.info('checking: ' + registeredCheck.name);

    registeredResult.startedAt = moment().utc();
    delete registeredResult.millisTaken;

    registeredCheck.check(function (healthy) {
        registeredResult.healthy = healthy;

        registeredResult.millisTaken = moment().utc().diff(registeredResult.startedAt);

        if (callback) {
            callback(null, healthy);
        }
    });
}

function checkDependencyHealth(registeredCheck, logger) {
    if (registeredCheck.subsystems) {
        var dependenciesHealthy = true;
        var registeredResult = resultRegistry[registeredCheck.name];

        _.each(registeredCheck.subsystems, function (dependency) {
            if (healthCheckRegistry[dependency]) {
                registeredResult.subsystems[dependency] = resultRegistry[dependency].healthy;
                if (!resultRegistry[dependency].healthy) {
                    dependenciesHealthy = false;
                }
            } else {
                logger.warn('health check ' + registeredCheck.name + ' has unknown dependency ' + dependency);
            }
        });

        registeredResult.healthy = registeredResult.healthy && dependenciesHealthy;
    }
}

var healthcheckInterceptors = {
    authentication: false,
    operationalDataCheck: false,
    synchronize: false
};

module.exports.getResourceConfig = function() {
    return [{
        name: 'healthcheck-healthy',
        path: 'healthy',
        interceptors: healthcheckInterceptors,
        requiredPermissions: [],
        isPatientCentric: false,
        bypassCsrf: true,
        permitResponseFormat: true,
        get: function(req, res) {
            executeAll(req.logger, function (isHealthy) {
                req.logger.info('received request for health check, value ' + isHealthy);

                if (req.param.e && isHealthy) {
                    return res.status(500).rdkSend();
                } else if (req.param.e && !isHealthy) {
                    return res.status(500).rdkSend();
                }
                return res.rdkSend(isHealthy);
            });
        }
    }, {
        name: 'healthcheck-detail-html',
        path: 'detail/html',
        interceptors: healthcheckInterceptors,
        requiredPermissions: [],
        isPatientCentric: false,
        bypassCsrf: true,
        get: function(req, res) {
            executeAll(req.logger, function (isHealthy) {
                _.set(req, '_resourceConfigItem.permitResponseFormat', true);
                res.send(createHtmlViewOfHealthCheck(req.logger, isHealthy));
            });
        }
    }, {
        name: 'healthcheck-checks',
        path: 'checks',
        interceptors: healthcheckInterceptors,
        requiredPermissions: [],
        isPatientCentric: false,
        bypassCsrf: true,
        get: function(req, res) {
            res.rdkSend(healthCheckRegistry);
        }
    }, {
        name: 'healthcheck-detail',
        path: 'detail',
        interceptors: healthcheckInterceptors,
        requiredPermissions: [],
        isPatientCentric: false,
        bypassCsrf: true,
        get: function(req, res) {
            executeAll(req.logger, function () {
                res.rdkSend(resultRegistry);
            });
        }
    }, {
        name: 'healthcheck-noupdate',
        path: 'noupdate',
        interceptors: healthcheckInterceptors,
        requiredPermissions: [],
        isPatientCentric: false,
        bypassCsrf: true,
        get: function(req, res) {
            res.rdkSend(resultRegistry);
        }
    }];
};

function createHtmlViewOfHealthCheck(logger, result) {
    var redicon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAY' +
        'AAABWdVznAAAAdUlEQVQoz2P4jwQuL5r1f1Os//9F1lpgDGKDxJABA4j4/OzJ/81xAf' +
        '/nGythxSA5kBq4BnyKkTWBNYCsJKQYhkFqGUDuRBY8VF/y//Pzp2AMYiPLgdQygDyHL' +
        'AhSCAMgNrIcSC3pGkh2EsmeJjlYyYo4UpIGAAlPckAzjFgSAAAAAElFTkSuQmCC';
    var greenicon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMC' +
        'AYAAABWdVznAAAAU0lEQVQoz2NgQAIam01LgPgUEH+FYhC7hAEdAAXlgfgkEP/HgUFy' +
        '8sga8CmGa0J2xn8icQkD1J3EajjFAPUcsRq+kqWBZCeR5mmSg5WsiCMlaQAAmUvzxXV' +
        'dlqcAAAAASUVORK5CYII=';
    var spinnericon = 'data:image/gif;base64,R0lGODlhEAAQALMAAP8A/7CxtXBxdX1' +
        '+gpaXm6OkqMnKzry + womLj7y9womKjwAAAAAAAAAAAAAAAAAAACH / C05FVFNDQV' +
        'BFMi4wAwEAAAAh + QQBCgAAACwAAAAAEAAQAAAESBDICUqhmFqbZwjVBhAE9n3hSJb' +
        'eSa1sm5HUcXQTggC2jeu63q0D3PlwAB3FYMgMBhgmk / J8LqUAgQBQhV6z2q0VF94i' +
        'J9pOBAAh + QQBCgALACwAAAAAEAAQAAAES3DJuUKgmFqb5znVthQF9h1JOJKl96UT2' +
        '7oZSRlGNxHEguM6Hu + X6wh7QN2CRxEIMggExumkKKLSCfU5GCyu0Sm36w3ryF7lpN' +
        'uJAAAh + QQBCgALACwAAAAAEAAQAAAESHDJuc6hmFqbpzHVtgQB9n3hSJbeSa1sm5G' +
        'UIHRTUSy2jeu63q0D3PlwCx1lMMgQCBgmk / J8LqULBGJRhV6z2q0VF94iJ9pOBAAh' +
        ' + QQBCgALACwAAAAAEAAQAAAESHDJuYyhmFqbpxDVthwH9n3hSJbeSa1sm5HUMHRTE' +
        'Cy2jeu63q0D3PlwCx0FgcgUChgmk / J8LqULAmFRhV6z2q0VF94iJ9pOBAAh + QQB' +
        'CgALACwAAAAAEAAQAAAESHDJuYSgmFqb5xjVthgG9n3hSJbeSa1sm5EUgnTTcSy2jeu' +
        '63q0D3PlwCx2FQMgEAhgmk / J8LqWLQmFRhV6z2q0VF94iJ9pOBAAh + QQBCgALAC' +
        'wAAAAAEAAQAAAESHDJucagmFqbJ0LVtggC9n3hSJbeSa1sm5EUQXSTYSy2jeu63q0D3' +
        'PlwCx2lUMgcDhgmk / J8LqWLQGBRhV6z2q0VF94iJ9pOBAAh + QQBCgALACwAAAAA' +
        'EAAQAAAESHDJuRCimFqbJyHVtgwD9n3hSJbeSa1sm5FUUXSTICy2jeu63q0D3PlwCx0' +
        'lEMgYDBgmk / J8LqWLw2FRhV6z2q0VF94iJ9pOBAAh + QQBCgALACwAAAAAEAAQAA' +
        'AESHDJuQihmFqbZynVtiAI9n3hSJbeSa1sm5FUEHTTMCy2jeu63q0D3PlwCx3lcMgIB' +
        'Bgmk / J8LqULg2FRhV6z2q0VF94iJ9pOBAA7';

    var output = '<html><body>';
    if (result) {
        output = output + 'healthy <img src="' + greenicon + '" /> ';
    } else {
        output = output + 'not healthy <img src="' + redicon + '" /> ';
    }
    output = output + '<table border="1"><tr><td>name</td><td>health</td><td>dependencies</td></tr>';

    _.each(healthCheckRegistry, function (registeredCheck) {
        var result = resultRegistry[registeredCheck.name];
        output = output + '<tr><td>' + registeredCheck.name + '</td><td>';
        if (result.healthy) {
            output = output + '<img src="' + greenicon + '" alt="healthy" /> ';
        } else {
            output = output + '<img src="' + redicon + '" alt="unhealty" /> ';
        }
        var elapsed;
        if (!_.isUndefined(result.millisTaken)) {
            elapsed = result.millisTaken;
        } else if (result.startedAt) {
            elapsed = moment().utc().diff(result.startedAt);
            output = output + '<img src="' + spinnericon + '" alt="checking health" /> ';
        }
        if (!_.isUndefined(elapsed)) {
            var ago = moment().utc().diff(result.startedAt, 's');
            output = output + '(took ' + (elapsed / 1000).toFixed(1) + 's, ' + ago + 's ago)';
        }
        output = output + '</td><td>';

        var dependencies = resultRegistry[registeredCheck.name].subsystems;

        if (dependencies) {
            _.each(dependencies, function(dependency, key) {
                if (dependency) {
                    output = output + key + '<img src="' + greenicon + '" alt="healthy" /> ';
                } else {
                    output = output + key + '<img src="' + redicon + '" alt="unhealty" /> ';
                }
            });
        }

        output = output + '</td></tr>';
    });

    output = output + ' </table></body></html>';
    return output;
}

module.exports.registerSubsystem = registerSubsystem;
module.exports.registerResource = registerResource;
module.exports.executeAll = executeAll;
module.exports._healthCheckRegistry = healthCheckRegistry;
module.exports._resultRegistry = resultRegistry;
