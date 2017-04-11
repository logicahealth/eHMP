'use strict';

var util = require('util');
var _ = require('underscore');
var request = require('request');
var querystring = require('querystring');
var inspect = require(global.VX_UTILS + 'inspect');
var errorUtil = require(global.VX_UTILS + 'error');
var idUtil = require(global.VX_UTILS + 'patient-identifier-utils');
var uuid = require('node-uuid');

var async = require('async');
var VistaClient = require(global.VX_SUBSYSTEMS + 'vista/vista-client');
var VxSyncForeverAgent = require(global.VX_UTILS + 'vxsync-forever-agent');

function MviClient(log, metrics, config, jdsClient) {
    if (!(this instanceof MviClient)) {
        return new MviClient(log, metrics, config);
    }

    this.log = log;
    this.metrics = metrics;
    this.jds = jdsClient;
    this.mviConfig = config.mvi;
    this.rootConfig = config;
    this.clientMap = {};
}

MviClient.prototype.lookup = function(patientIdentifier, callback) {
    var self = this,
        url;
    var process = uuid.v4();
    self.metrics.debug('Beginning CorrespondingId Lookup', {
        'subsystem': 'MVI',
        'action': 'correspondingId',
        'pid': patientIdentifier.value,
        'process': process,
        'timer': 'start'
    });

    if (_.isEmpty(self.mviConfig)) {
        return setTimeout(callback, 0, errorUtil.createFatal('No value passed for mvi configuration'));
    }

    if (_.isEmpty(patientIdentifier)) {
        return setTimeout(callback, 0, errorUtil.createFatal('No value passed for patientIdentifier'));
    }

    // If we have an ICN or EDIPI (via DOD;<edipi>) then we need to do a global MVI lookup.
    //--------------------------------------------------------------------------------------
    if ((patientIdentifier.type === 'icn') || (idUtil.isDod(patientIdentifier.value))) {
        self.log.debug('mvi-client.lookup: icn or edipi was received (Query MVI).  patientIdentifier: %j', patientIdentifier);

        var theQueryString = '';
        if (patientIdentifier.type === 'icn') {
            theQueryString = querystring.stringify({
                icn: patientIdentifier.value
            });
        } else if (idUtil.isDod(patientIdentifier.value)) {
            // Note that even though this an edipi - the Soap Handler is expecting  to get the DOD;<edipi> form for the value.
            //-----------------------------------------------------------------------------------------------------------------
            theQueryString = querystring.stringify({
                edipi: patientIdentifier.value
            });
        }
        url = util.format('%s://%s:%s%s?%s',
            self.mviConfig.protocol,
            self.mviConfig.host,
            self.mviConfig.port,
            self.mviConfig.path,
            theQueryString);
        self.log.debug('mvi-client.lookup: Lookup for patient: %s => %s', patientIdentifier.value, url);

        var options = {
            url: url,
            timeout: self.mviConfig.timeout,
            agentClass: VxSyncForeverAgent
        };

        request.get(options, function(error, response, body) {
            if (error || response.statusCode === 500) {
                self.log.error('mvi-client.lookup: Unable to access MVI endpoint: %s; error: %j', url, error);

                // This might work at a different time
                return callback(errorUtil.createTransient((error || body || 'Unknown Error'), 500));
            }

            // Bad Request - this will never return results
            if (response.statusCode === 400) {
                return callback(errorUtil.createFatal(body, 400));
            }

            // Not found - this will probably never return results
            if (response.statusCode === 404) {
                return callback(errorUtil.createFatal('Patient not found: ' + inspect(patientIdentifier), 404));
            }

            // Not found - this will probably never return results
            if (response.statusCode === 204) {
                self.log.debug('MviClient.lookup(): unable to retrieve patient, probably unable to connect to MVI: Status Code: %s', response.statusCode);
                return callback(errorUtil.createFatal('Error retrieving patient: ' + inspect(patientIdentifier), 204));
            }

            var data;
            try {
                data = JSON.parse(body);
            } catch (parseError) {
                // Could not parse response - probably would work at a different time
                self.log.error('MviClient.lookup(): Status Code: %s', response.statusCode);
                self.log.error('MviClient.lookup(): Unable to parse JSON: %s', body);
                return callback(errorUtil.createFatal('Unable to parse JSON', 500));
            }

            self.log.debug('MviClient.lookup(): Got results for patient: %s', inspect(patientIdentifier));
            self.log.trace('MviClient.lookup(): Got results for patient: %s; Result: %j', inspect(patientIdentifier), data);
            //self.log.trace(inspect(data));

            self._parseRealMVIResponse(patientIdentifier, data, process, callback);
        });

        return;
    }

    if (patientIdentifier.type === 'pid') {
        self.log.debug('MviClient.lookup: pid received.  Query VistA MVI RPC');
        var hashDfn = patientIdentifier.value.split(';');
        self.log.debug('MviClient.lookup: query VistA ' + hashDfn[0] + ' for patient ' + hashDfn[1]);

        var siteHash = hashDfn[0];
        var vistaClient = self._getVistaClient(siteHash);

        if(_.isUndefined(vistaClient) || _.isNull(vistaClient)) {
            self.log.debug('MviClient.lookup: PID provided and VistA instance is unknown');
            return setTimeout(callback, 0, errorUtil.createFatal('Unknown source instance.  Cannot query VistA MVI RPC', 400));
        }

        // var rpcConfig = _.clone(siteConfig);
        var stationNumber = self._getStationNumber(siteHash);
        if (!stationNumber) {
            self.log.error('MviClient.lookup: mvi-client.lookup no station number found for ' + siteHash);
            return setTimeout(callback, 0, 'No stationNumber for' + siteHash);
        }

        // var vista = new VistaClient(self.log, self.metrics, rpcConfig);
        vistaClient.getIds(hashDfn[0], hashDfn[1], stationNumber, function(error, result) {
            var patientIdentifiers = [patientIdentifier];

            if (result) {
                self._parseVistaMVIResponse(patientIdentifier, result, process, function(err, result) {
                    if (!err) {
                        patientIdentifiers = patientIdentifiers.concat(result.ids);
                        //filter duplicates
                        patientIdentifiers = _.uniq(patientIdentifiers, false, function(item) {
                            return item.value;
                        });
                    }
                    callback(null, {
                        ids: patientIdentifiers
                    });
                });
            } else {
                callback(null, {
                    ids: patientIdentifiers
                });
            }
        });
    }
};

MviClient.prototype._clearVistaClientCache = function() {
    this.clientMap = {};
};

MviClient.prototype._getVistaClient = function(siteHash) {
    this.log.debug('MviClient._getVistaClient: MviClient._getVistaClient(%s)', siteHash);
    var client = this.clientMap[siteHash];

    if(!_.isUndefined(client) && !_.isNull(client)) {
        return client;
    }

    var siteConfig = this.rootConfig;
    if (_.isUndefined(siteConfig) || _.isNull(siteConfig)) {
        return;
    }

    var vistaClient = new VistaClient(this.log, this.metrics, siteConfig);
    this.clientMap[siteHash] = vistaClient;

    return vistaClient;
};

MviClient.prototype._parseRealMVIResponse = function(queryPatientIdentifier, rawData, process, callback) {
    var self = this;
    self.metrics.trace('Parsing MVI Response', {
        'subsystem': 'MVI',
        'action': 'correspondingId',
        'pid': queryPatientIdentifier.value,
        'process': process
    });
    var responseCode;
    var data = null;
    try {
        data = rawData['PRPA_IN201310UV02'];
        responseCode = data.controlActProcess.queryAck.queryResponseCode.code || 'ER';
    } catch (e) {
        self.log.error(e);
        responseCode = 'ER';
    }
    var idList = [];

    switch (responseCode) {
        case 'OK':
            try {
                var mviPatientIds = data.controlActProcess.subject.registrationEvent.subject1.patient.id || [];
                idList = _.pluck(mviPatientIds, 'extension');
                self._makePatientIdentifiers(queryPatientIdentifier, idList, process, callback);
            } catch (e) {
                self.log.error('MviClient._parseRealMVIResponse: Error parsing results from local or global MVI.  Exception: %j', e);
                self.metrics.debug('MVI processing error', {
                    'subsystem': 'MVI',
                    'action': 'correspondingId',
                    'pid': queryPatientIdentifier.value,
                    'process': process,
                    'timer': 'stop'
                });
                callback('No patient identifiers found in JSON structure');
            }
            break;
        case 'ER':
            self.metrics.debug('MVI processing error', {
                'subsystem': 'MVI',
                'action': 'correspondingId',
                'pid': queryPatientIdentifier.value,
                'process': process,
                'timer': 'stop'
            });
            callback('MVI response in unknown structure');
            break;
        case 'NF':
            self.metrics.debug('MVI processing error', {
                'subsystem': 'MVI',
                'action': 'correspondingId',
                'pid': queryPatientIdentifier.value,
                'process': process,
                'timer': 'stop'
            });
            callback('MVI could not find patient');
            break;
        case 'AE':
            self.metrics.debug('MVI processing error', {
                'subsystem': 'MVI',
                'action': 'correspondingId',
                'pid': queryPatientIdentifier.value,
                'process': process,
                'timer': 'stop'
            });
            callback('MVI was unable to fulfill request');
            break;
        default:
            self.metrics.debug('MVI processing error', {
                'subsystem': 'MVI',
                'action': 'correspondingId',
                'pid': queryPatientIdentifier.value,
                'process': process,
                'timer': 'stop'
            });
            callback('MVI gave unknown response code ' + responseCode);
    }
};

MviClient.prototype._parseVistaMVIResponse = function(queryPatientIdentifier, data, process, callback) {
    var self = this;
    self.metrics.trace('Parsing MVI Response', {
        'subsystem': 'MVI',
        'action': 'correspondingId',
        'pid': queryPatientIdentifier.value,
        'process': process
    });
    var idLines = data.split('\r\n') || [];
    self.log.debug('MviClient._parseVistaMVIResponse: idLines: ' + idLines);
    self._makePatientIdentifiers(queryPatientIdentifier, idLines, process, callback);
};

MviClient.prototype._makePatientIdentifiers = function(queryPatientIdentifier, idStrings, process, callback) {
    var self = this;
    var idList = [];

    if (_.isArray(idStrings) && idStrings.length > 0) {
        self.log.debug('MviClient._makePatientIdentifiers: MVI List IDs' + util.inspect(idStrings));
        async.every(idStrings, function(mviID, cb) {
            //ID^IDTYPE^AssigningAuthority^AssigningFacility^IDStatus
            var idParts = mviID.split('^');
            if (idParts[0] === '-1' || idParts.length <= 1) { //incorrect query format or unknown id
                return cb(true);
            }
            if (idParts[1] === 'NI' && (idParts[2] === 'USVHA' || idParts[3] === 'USVHA')) {
                self.log.debug('MviClient._makePatientIdentifiers: ' + mviID + ' is ICN');
                idList.push({
                    type: 'icn',
                    value: idParts[0]
                });
            } else if (idParts[1] === 'NI' && (idParts[2] === 'USDOD' || idParts[3] === 'USDOD')) {
                self.log.debug('MviClient._makePatientIdentifiers: ' + mviID + ' is EDIPI');
                idList.push({
                    type: 'edipi',
                    value: idParts[0]
                });
            } else if ((idParts[1] === 'PI') && ((idParts[2] === '742V1') || ((idParts.length >= 6) && (idParts[5] === '742V1')))) {
                idList.push({
                    type: 'vhicid',
                    value: idParts[0]
                });
            } else if (idParts[1] === 'PI' && idParts[3] === 'USVHA' && (idParts.length === 4 || idParts[2].length === 4)) {
                self.log.debug('MviClient._makePatientIdentifiers: ' + mviID + ' is DFN');

                var siteHash;
                if (idParts.length === 4) { // Global MVI tokens have 4 parts
                    siteHash = self._getSitehash(idParts[2]);
                    if (!siteHash) {
                        self.log.warn('MviClient._makePatientIdentifiers: No site hash found for station number ' + idParts[2]);
                        siteHash = '-1'; //temporary until new RPC is available
                    }
                } else if (idParts[2].length === 4) { // VistA MVI tokens are longer and use a 4 character site hash
                    siteHash = idParts[2];
                }
                if (siteHash !== '-1') {
                    idList.push({
                        type: 'pid',
                        value: siteHash + ';' + idParts[0]
                    });
                }
            } else {
                self.log.warn('MviClient._makePatientIdentifiers() found unknown id type: ' + mviID);
                return cb(true);
            }
            return cb(true);
        }, function() {
            idList = _.filter(idList, function(id) {
                return !_.isUndefined(id.value);
            });
            if (idList.length > 0) {
                self.log.debug('MviClient._makePatientIdentifiers: MVI Returning: ' + util.inspect(idList));
                self.metrics.debug('Returning correspondingIds', {
                    'subsystem': 'MVI',
                    'action': 'correspondingId',
                    'pid': queryPatientIdentifier.value,
                    'process': process,
                    'timer': 'stop'
                });
                return callback(null, {
                    ids: idList
                });
            } else {
                self.metrics.debug('Returning correspondingIds', {
                    'subsystem': 'MVI',
                    'action': 'correspondingId',
                    'pid': queryPatientIdentifier.value,
                    'process': process,
                    'timer': 'stop'
                });
                return callback('no ids found for' + inspect(queryPatientIdentifier));
            }
        });
    } else {
        self.metrics.debug('Returning correspondingIds', {
            'subsystem': 'MVI',
            'action': 'correspondingId',
            'pid': queryPatientIdentifier.value,
            'process': process,
            'timer': 'stop'
        });
        return callback('mvi-client._makePatientIdentifiers() No ids in list');
    }
};

MviClient.prototype._getStationNumber = function(siteHash) {
    var self = this;
    if(!self.rootConfig.vistaSites[siteHash]){
        return null;
    }
    return self.rootConfig.vistaSites[siteHash].stationNumber;
};

MviClient.prototype._getSitehash = function(stationNumber) {
    // utility predicate for findKey returns true when config station object's stationNumber matches search term
    function testStation(station) {
        return parseInt(station.stationNumber) === parseInt(stationNumber);
    }
    var self = this;
    return _.findKey(self.rootConfig.vistaSites, testStation) || _.findKey(self.rootConfig.hdr.hdrSites, testStation);
};

module.exports = MviClient;