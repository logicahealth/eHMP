'use strict';

var _ = require('lodash');

var rdk = require('../../core/rdk');
var db = rdk.utils.pooledJbpmDatabase;

function getSubsystemConfig(app) {
    return {
        healthcheck: app.subsystems.jbpm.getHealthcheck(app)
    };
}
module.exports.getSubsystemConfig = getSubsystemConfig;

function doQuery(dbConfig, query, callback) {
    db.doQuery(null, dbConfig, query, callback);
}
module.exports.doQuery = doQuery;

function doQueryWithParams(dbConfig, query, queryParameters, callback, maxRowsParam) {
    db.doQueryWithParams(null, dbConfig, query, queryParameters, callback, (maxRowsParam || 1000000));
}
module.exports.doQueryWithParams = doQueryWithParams;

function validate(typeJson, instanceJson, appConfig, cb, errors) {
    var abort = false;
    if (!appConfig || !appConfig.jbpm || !appConfig.jbpm.activityDatabase || !_.isObject(appConfig.jbpm.activityDatabase)) {
        if (errors) {
            errors.push('bad app configuration for pcmm validation');
        }
        abort = true;
    }
    if (!typeJson || !typeJson.fields || !typeJson.table || !_.isArray(typeJson.fields) || (typeJson.fields.length < 1)) {
        if (errors) {
            errors.push('bad type for pcmm validation');
        }
        abort = true;
    }
    if (!instanceJson || !_.isObject(instanceJson)) {
        if (errors) {
            errors.push('bad instance for pcmm validation');
        }
        abort = true;
    }
    if (abort) {
        return cb(true);
    }

    var fieldParameters = _.map(typeJson.fields, function(field) {
        return field.inDatabase;
    });

    var query = 'SELECT ' + JSON.stringify(fieldParameters).replace(/(\[|\]|"|')/g, '') + ' FROM ' + typeJson.table + ' WHERE ' + typeJson.fields[0].inDatabase + ' = \'' + _.get(instanceJson, typeJson.fields[0].inJson) + '\'';

    var success = false;
    doQuery(appConfig.jbpm.activityDatabase, query, function(err, rows) {
        if (err) {
            if (errors) {
                errors.push(err);
            }
            cb(false, false);
            return;
        }
        if (!rows || !_.isArray(rows)) {
            if (errors) {
                errors.push('bad rows response (but no error code)');
            }
            cb(false, false);
            return;
        }

        success = _.some(rows, function(row) {
            if (typeJson.fields.length === 1) {
                return true;
            }

            for (var i = 1; i < typeJson.fields.length; i++) {
                if (_.trim(_.get(row, typeJson.fields[i].inDatabase)) !== _.trim(_.get(instanceJson, typeJson.fields[i].inJson))) {
                    return false;
                }
            }

            return true;
        });

        cb(false, success);
    });
}
module.exports.validate = validate;
