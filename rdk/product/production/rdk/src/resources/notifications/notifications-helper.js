'use strict';

var rdk = require('../../core/rdk');
var nullchecker = rdk.utils.nullchecker;
var _ = require('lodash');
var async = require('async');

function getIdsArray(id, req, callback) {
    var responseObject = {
        array: []
    };
    var jdsPath = '/vpr/jpid/' + id;
    var config = req.app.config;
    var options = _.extend({}, config.jdsServer, {
        url: jdsPath,
        logger: req.logger,
        json: true
    });
    rdk.utils.http.get(options, function(error, response, obj) {
        if (obj.error) {
            responseObject.array.push(id);
        } else {
            responseObject.array = obj.patientIdentifiers;
        }
        callback(responseObject);
    });

}

function getNamesFromPids(pidToNameMap, req, cb) {
    //http://IP             /vpr/9E7A;3,9E7A;8,9E7A;253/find/patient
    //http://IP             /vpr/9E7A;100013/find/patient?filter=in(pid,["9E7A;100013"])
    //http://IP             /data/index/pt-select-pid?range=9E7A;3,9E7A;8
    var jdsUrlStringLimit = _.get(req, 'app.config.jdsServer.urlLengthLimit') || 120;
    var jdsServer = req.app.config.jdsServer;
    var preSegmentUrl = '/data/index/pt-select-pid?range=';
    var maxSegmentLength = jdsUrlStringLimit - (jdsServer.baseUrl.length + preSegmentUrl.length);

    var urlSegments = [];
    var curUrlSegment = '';

    //break the ICNs into appropriately sized, comma-delimited chunks for JDS querying
    _.each(pidToNameMap, function(map) {
        var pid = map.patientId;
        if (nullchecker.isNotNullish(pid)) {
            var segmentLength = pid.length;

            if ((curUrlSegment.length + segmentLength + 1) > maxSegmentLength) {
                urlSegments.push(curUrlSegment);
                curUrlSegment = pid;

            } else {
                if (curUrlSegment.length === 0) {
                    curUrlSegment = pid;
                } else {
                    curUrlSegment += ',' + pid;
                }
            }
        }
    });

    if (curUrlSegment.length !== 0) {
        urlSegments.push(curUrlSegment);
    }

    var asyncJobs = [];

    _.forEach(urlSegments, function(segment, index) {
        asyncJobs.push(function(callback) {
            //do jds call
            var jdsPath = preSegmentUrl + segment;

            var options = _.extend({}, jdsServer, {
                url: jdsPath,
                logger: req.logger,
                json: true
            });

            rdk.utils.http.get(options,
                function(err, response, data) {
                    if (!nullchecker.isNullish(err)) {
                        return callback(err);
                    }

                    return callback(null, data);
                }
            );
        });
    });

    async.parallelLimit(asyncJobs, 5, function(err, results) {
        // results is now equal to: [{icnToNameMapChunk}, {icnToNameMapChunk} ...]
        if (err) {
            return cb(pidToNameMap);
        } else {
            // smash results back into a map
            var newMap = [];
            _.forEach(results, function(result) {
                if (result.hasOwnProperty('data') && result.data.hasOwnProperty('items')) {
                    _.forEach(result.data.items, function(item) {
                        if (item.hasOwnProperty('pid') && item.hasOwnProperty('displayName') && item.hasOwnProperty('last4')) {
                            newMap.push({
                                'patientId': item.pid,
                                'patientName': item.displayName,
                                'last4OfSSN': item.last4
                            });
                        }
                    });
                }
            });
            return cb(newMap);
        }
    });
}

module.exports.getIdsArray = getIdsArray;
module.exports.getNamesFromPids = getNamesFromPids;
