'use strict';

var _ = require('lodash');
var url = require('url');
var request = require('request');
var nullUtil = require(global.VX_UTILS + 'null-utils');


function saveToJDS(log, config, key, value, cb) {

    var postdata = _.merge({}, { "_id": key}, value);

    var endpoint = url.format({
        protocol: config.jds.protocol,
        host: config.jds.host + ":" + config.jds.port,
        pathname: config.jds.jdsSaveURI
    });

    var options = {
        url: endpoint,
        body: postdata,
        method: 'POST',
        json: true
    };

    request(options, function (error, response) {
        if ((_.isNull(error) || _.isUndefined(error)) && response.statusCode == 200) {
            log.debug('saveToJDS: Success');
            log.debug('saveToJDS: response: %s', response);
            log.debug('saveToJDS: saved: %s ', postdata);
            cb(null, response);
        }
        else {
            log.error('saveToJDS: failed to save to JDS: %s ', postdata);
            cb(error, null);
        }
    });
}

function getFromJDS(log, config, key, cb) {
    var endpoint = url.format({
        protocol: config.jds.protocol,
        host: config.jds.host + ":" + config.jds.port,
        pathname: config.jds.jdsGetURI + "/" + key
    });

    var options = {
        url: endpoint,
        method: 'GET'
    };

    request(options, function (error, response) {
        if ((_.isNull(error) || _.isUndefined(error)) && response.statusCode == 200) {
            log.debug('getFromJDS: Success');
            log.debug("getFromJDS: response: %s", response);
        }
        else {
            log.error('getFromJDS: failed to GET from JDS');
        }
        cb(error, response);
    });
}

function isIcn(pid) {
    if (nullUtil.isNotNullish(pid) && S(pid).contains(';')) {
        return false;
    }

    if (nullUtil.isNotNullish(pid)) {
        return true;
    } else {
        return false;
    }
}

var blacklist = {
    patients: []
};
var patientsSynced = {
    patients: []
};

/**
 * Retrieves JSON from JDS containing the blacklist last saved to JDS.
 *
 * @param log The logger.
 * @param config used to retrieve the URI
 * @param callback function with 2 parameters, the first will be null if no errors occurred.  The 2nd will contain the
 * json returned from the server.
 */
function getBlackListFromJDS(log, config, callback) {
    getFromJDS(log, config, "osyncblacklist", function(error, response) {
        log.debug('response in blacklist .....' +  JSON.stringify(response));

        if (error) {
            log.error('An error occurred retrieving blacklist: ' + error + ', response contained: ' + JSON.stringify(response));
            return callback(error);
        }

        if (response.statusCode !== 200) {
            log.error('An ' + response.statusCode + ' error occurred retrieving blacklist: ' + error + ', body contained: ' + response.body);
            return callback('response status code ' + response.statusCode);
        }

        var json = JSON.parse(response.body);
        if (nullUtil.isNullish(json) || nullUtil.isNullish(json.patients)) {
            json = JSON.parse('{"_id": "get blacklist", "patients": []}');
        }

        blacklist = json;
        callback(null, json);
    });
}

module.exports.saveToJDS = saveToJDS;
module.exports.getFromJDS = getFromJDS;
module.exports.isIcn = isIcn;
module.exports.getBlackListFromJDS = getBlackListFromJDS;
module.exports.blacklist = blacklist;
module.exports.patientsSynced = patientsSynced;
