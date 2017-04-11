'use strict';

var util = require('util');
var _ = require('underscore');
var request = require('request');
var querystring = require('querystring');
var inspect = require(global.VX_UTILS + 'inspect');
var errorUtil = require(global.VX_UTILS + 'error');
var idUtil = require(global.VX_UTILS + 'patient-identifier-utils');
var uuid = require('node-uuid');

var VistaClient = require(global.VX_SUBSYSTEMS + 'vista/vista-client');
var VxSyncForeverAgent = require(global.VX_UTILS + 'vxsync-forever-agent');
var idUtil = require(global.VX_UTILS + 'patient-identifier-utils');

//--------------------------------------------------------------------------------------------------------
// This is the a client used to retrieve identifiers for a patient either from MVI or a combination of
// pt-select operational data and a locally cached instance of MVI information at a VistA site.
//
// Authors:  Mike Risher, Will McVay, Jon Vega, Les Westberg
//--------------------------------------------------------------------------------------------------------
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

//--------------------------------------------------------------------------------------------------------
// Perform a lookup either on the MVI or via VistA and pt-select to determine the set of identifiers
// that should be used for syncing this patient.
//
// patientIdentifier: The identifier to use to do the original search.  If this is an ICN, then a call
//                    will be made to the MVI.  If this is a PID then it will be made to the appropriate
//                    VistA system via RPC as well as retrieved from pt-select.
// callback: This is the callback and it will have the following signature:
//             function(error, mviResponse) where:
//                  error: is the error that occurred or null if there was no error.
//                  mviResponse: is a structure that looks as follows:
//                       {
//                           ids: <patientIdentifiers>
//                       }
//                  where <patientIdentifiers> is an array of patientIdentifier
//--------------------------------------------------------------------------------------------------------
MviClient.prototype.lookup = function(patientIdentifier, callback) {
    var self = this,
        url;
    var process = uuid.v4();

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

        self.metrics.warn('Global MVI getCorrespondingIds Request', {
            'patientIdentifier': patientIdentifier,
            'process': global.process.pid,
            'timer': 'start'
        });

        request.get(options, function(error, response, body) {
            self.metrics.warn('Global MVI getCorrespondingIds Request', {
                'patientIdentifier': patientIdentifier,
                'process': global.process.pid,
                'timer': 'stop'
            });
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

        if (_.isUndefined(vistaClient) || _.isNull(vistaClient)) {
            self.log.debug('MviClient.lookup: PID provided and VistA instance is unknown');
            return setTimeout(callback, 0, errorUtil.createFatal('Unknown source instance.  Cannot query VistA MVI RPC', 400));
        }

        // var rpcConfig = _.clone(siteConfig);
        var stationNumber = self._getStationNumber(siteHash);
        if (!stationNumber) {
            self.log.error('MviClient.lookup: mvi-client.lookup no station number found for ' + siteHash);
            return setTimeout(callback, 0, 'No stationNumber for' + siteHash);
        }

        self.metrics.warn('Local MVI getCorrespondingIds Request', {
            'patientIdentifier': patientIdentifier,
            'process': global.process.pid,
            'timer': 'start'
        });

        // var vista = new VistaClient(self.log, self.metrics, rpcConfig);
        vistaClient.getIds(hashDfn[0], hashDfn[1], stationNumber, function(error, result) {
            self.metrics.warn('Local MVI getCorrespondingIds Request', {
                'patientIdentifier': patientIdentifier,
                'process': global.process.pid,
                'timer': 'stop'
            });
            var patientIdentifiers = [patientIdentifier];

            if (error) {
                self.log.error('MviClient.lookup: Error returned by getCorrespondingIds RPC call. Error: %j', error);
                return callback(errorUtil.createTransient('Error returned by getCorrespondingIds RPC call', error));
            }

            if (result) {
                self._parseVistaMVIResponse(patientIdentifier, result, process, function(err, result) {
                    if (err) {
                        //No IDs were found: this does not necessarily mean that the patient does not exist, so we keep the queryPatientIdentifier.
                        return callback(null, {
                            ids: patientIdentifiers
                        });
                    }

                    patientIdentifiers = patientIdentifiers.concat(result.ids);
                    //filter duplicates
                    patientIdentifiers = _.uniq(patientIdentifiers, false, function(item) {
                        return item.value;
                    });

                    if (!idUtil.hasIdsOfTypes(patientIdentifiers, 'icn')) {
                        self.log.debug('MviClient.lookup: ICN not found in VistA MVI corresponding Ids. Checking demographics in JDS for ICN.');
                        self._retreiveIcnFromJdsDemographics(patientIdentifier, function(er, icn) {
                            if (er) { //An error other than 400 'demographics not on file'
                                self.log.error('MviClient.lookup: Error received from JDS when trying to look demographics to get ICN. Error %j', er);
                                return callback(errorUtil.createTransient(er));
                            }

                            if (icn) {
                                patientIdentifiers.push(idUtil.create('icn', icn));
                            }

                            return callback(null, {
                                ids: patientIdentifiers
                            });
                        });
                    } else {
                        return callback(null, {
                            ids: patientIdentifiers
                        });
                    }
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

    if (!_.isUndefined(client) && !_.isNull(client)) {
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


//---------------------------------------------------------------------------------------------------------------
// This method takes the response from MVI and extracts out the list of identifiers in the response.  Passes
// that list to a routine to be parsed so that the real set of identifiers can be created.  It then returns that
// response via the callback.
//
// queryPatientIdentifier:  The identifier that was used to query MVI.
// rawData: The raw MVI response that was received.
// process: The process ID for this process.
// callback: This is the callback and it will have the following signature:
//             function(error, mviResponse) where:
//                  error: is the error that occurred or null if there was no error.
//                  mviResponse: is a structure that looks as follows:
//                       {
//                           ids: <patientIdentifiers>
//                       }
//                  where <patientIdentifiers> is an array of patientIdentifier
//---------------------------------------------------------------------------------------------------------------
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
                var mviResponse = self._makePatientIdentifiersMVIResponse(queryPatientIdentifier, idList, process);
                if (mviResponse) {
                    return callback(null, mviResponse);
                } else {
                    return callback(util.format('No IDs found for %j', queryPatientIdentifier));
                }
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

//---------------------------------------------------------------------------------------------------------------
// This method takes the response from VistA and extracts out the list of identifiers in the response.  Passes
// that list to a routine to be parsed so that the real set of identifiers can be created.  It then returns that
// response via the callback.
//
// queryPatientIdentifier:  The identifier that was used to query MVI.
// data: The raw MVI response that was received.
// process: The process ID for this process.
// callback: This is the callback and it will have the following signature:
//             function(error, mviResponse) where:
//                  error: is the error that occurred or null if there was no error.
//                  mviResponse: is a structure that looks as follows:
//                       {
//                           ids: <patientIdentifiers>
//                       }
//                  where <patientIdentifiers> is an array of patientIdentifier
//---------------------------------------------------------------------------------------------------------------
MviClient.prototype._parseVistaMVIResponse = function(queryPatientIdentifier, data, process, callback) {
    var self = this;
    self.metrics.trace('Parsing MVI Response', {
        'subsystem': 'MVI',
        'action': 'correspondingId',
        'pid': queryPatientIdentifier.value,
        'process': process
    });
    var idLines = (_.isString(data) && !_.isEmpty(data)) ? data.split('\r\n') : [];
    self.log.debug('MviClient._parseVistaMVIResponse: idLines: ' + idLines);
    var mviResponse = self._makePatientIdentifiersVistaResponse(queryPatientIdentifier, idLines, process);
    if (mviResponse) {
        return callback(null, mviResponse);
    } else {
        //No IDs were found: this does not necessarily mean that the patient does not exist, so we keep the queryPatientIdentifier.
        return callback(util.format('No IDs found for %j', queryPatientIdentifier));
    }
};

//----------------------------------------------------------------------------------------------------------------
// This method takes the response from the VistA RPC call and parses the response to create a set
// patientIdentifiers that are considered active for this patient.  The response is returned.
//
// queryPatientIdentifier:  The identifier that was used to query MVI.
// idStrings:  This is an array of IDs in the original form tokenized string form that came from the VistA RPC.
// process: The process ID for this process.
// returns: An object that is structured as follows:
//                       {
//                           ids: <patientIdentifiers>
//                       }
//                  where <patientIdentifiers> is an array of patientIdentifier
//----------------------------------------------------------------------------------------------------------------
MviClient.prototype._makePatientIdentifiersVistaResponse = function(queryPatientIdentifier, idStrings, process) {
    var self = this;
    var idList = [];

    if (_.isArray(idStrings) && idStrings.length > 0) {
        self.log.debug('MviClient._makePatientIdentifiers: MVI List IDs' + util.inspect(idStrings));
        _.every(idStrings, function(mviID) {
            var siteHash;
            var idParts = mviID.split('^');
            if ((idParts.length > 0) && (idParts[0] === '-1' || idParts.length <= 1)) { //incorrect query format or unknown id
                return true;
            }

            // ICN
            //----
            if ((idParts.length > 2) && (idParts[1] === 'NI') && (idParts[2] === 'USVHA')) {
                self.log.debug('mvi-client._makePatientIdentifiersVistaResponse(): From Vista RPC: Entry: %s contains ICN.', mviID);
                idList.push(idUtil.create('icn', idParts[0]));

            // EDIPI
            //------
            } else if ((idParts.length > 2) && (idParts[1] === 'NI') && (idParts[2] === 'USDOD')) {
                self.log.debug('mvi-client._makePatientIdentifiersVistaResponse(): From Vista RPC: Entry: %s contains EDIPI.', mviID);
                idList.push(idUtil.create('edipi', idParts[0]));

            // VHIC ID
            //--------
            } else if ((idParts.length > 4) && (idParts[1] === 'PI') && (idParts[3] === '742V1')) {
                self.log.debug('mvi-client._makePatientIdentifiersVistaResponse(): From Vista RPC: Entry: %s contains VHIC ID.', mviID);
                var vhicidPatientIdentifier = idUtil.create('vhicid', idParts[0]);
                if (idParts[4] === 'A') {
                    vhicidPatientIdentifier.active = true;
                }
                idList.push(vhicidPatientIdentifier);

            // VistA Site DFN that is active
            //-------------------------------
            } else if ((idParts.length > 4) && (idParts[1] === 'PI') && (idParts[2] === 'USVHA') && (idParts[4] === 'A')) {
                self.log.debug('mvi-client._makePatientIdentifiersVistaResponse(): From Vista RPC: Entry: %s contains \'Active\' DFN.', mviID);
                siteHash = self.getSitehash(idParts[3]);
                if (siteHash) {
                    idList.push(idUtil.create('pid', siteHash + ';' + idParts[0]));
                } else {
                    self.log.warn('mvi-client._makePatientIdentifiersVistaResponse(): No site hash found in Entry: %s for stationNumber: %s.  ID will be skipped.', mviID, idParts[3]);
                }

            // VistA Site DFN that is NOT active
            //-----------------------------------
            } else if ((idParts.length > 4) && (idParts[1] === 'PI') && (idParts[2] === 'USVHA') && (idParts[4] !== 'A')) {
                self.log.debug('mvi-client._makePatientIdentifiersVistaResponse(): From Vista RPC: Entry: %s contains \'Inactive\' DFN.  ID is being skipped.', mviID);

            // Unknown ID Type
            //----------------
            } else {
                self.log.warn('MviClient._makePatientIdentifiersVistaResponse():  From Vista RPC: Found unknown id type for Entry: %s.  ID is being skipped.' + mviID);
            }

            return true;
        });

        var mviResponse = self._cleanupAndPrepareResponse(queryPatientIdentifier, idList);
        self.log.debug('MviClient._makePatientIdentifiersVistaResponse: MVI Returning: ' + util.inspect(idList));
        self.metrics.debug('Returning correspondingIds', {
            'subsystem': 'MVI',
            'action': 'correspondingId',
            'pid': queryPatientIdentifier.value,
            'process': process,
            'timer': 'stop'
        });
        return mviResponse;

    } else {
        self.log.warn('MviClient._makePatientIdentifiersVistaResponse(): No IDs in response list for %j', queryPatientIdentifier);
        self.metrics.debug('Returning correspondingIds', {
            'subsystem': 'MVI',
            'action': 'correspondingId',
            'pid': queryPatientIdentifier.value,
            'process': process,
            'timer': 'stop'
        });
        return null;
    }
};

//----------------------------------------------------------------------------------------------------------------
// This method takes the response from the MVI and parses the response to create a set
// patientIdentifiers that are considered active for this patient.  The response is returned.
//
// queryPatientIdentifier:  The identifier that was used to query MVI.
// idStrings:  This is an array of IDs in the original form tokenized string form that came from the VistA RPC.
// process: The process ID for this process.
// returns: An object that is structured as follows:
//                       {
//                           ids: <patientIdentifiers>
//                       }
//                  where <patientIdentifiers> is an array of patientIdentifier
//----------------------------------------------------------------------------------------------------------------
MviClient.prototype._makePatientIdentifiersMVIResponse = function(queryPatientIdentifier, idStrings, process) {
    var self = this;
    var idList = [];

    if (_.isArray(idStrings) && idStrings.length > 0) {
        self.log.debug('MVI List IDs' + util.inspect(idStrings));
        _.every(idStrings, function(mviID) {
            var siteHash;
            var idParts = mviID.split('^');
            if ((idParts.length > 0) && (idParts[0] === '-1' || idParts.length <= 1)) { //incorrect query format or unknown id
                return true;
            }

            // ICN
            //----
            if ((idParts.length > 3) && (idParts[1] === 'NI') && (idParts[3] === 'USVHA')) {
                self.log.debug('mvi-client._makePatientIdentifiersMVIResponse: From MVI: Entry: %s contains ICN.', mviID);
                idList.push(idUtil.create('icn', idParts[0]));

            // EDIPI
            //------
            } else if ((idParts.length > 3) && (idParts[1] === 'NI') && (idParts[3] === 'USDOD')) {
                self.log.debug('mvi-client._makePatientIdentifiersMVIResponse: From MVI: Entry: %s contains EDIPI.', mviID);
                idList.push(idUtil.create('edipi', idParts[0]));

            // VHIC ID
            //--------
            } else if ((idParts.length > 4) && (idParts[1] === 'PI') && (idParts[2] === '742V1')) {
                self.log.debug('mvi-client._makePatientIdentifiers(): From Vista RPC: Entry: %s contains VHIC ID.', mviID);
                var vhicidPatientIdentifier = idUtil.create('vhicid', idParts[0]);
                if (idParts[4] === 'A') {
                    vhicidPatientIdentifier.active = true;
                }
                idList.push(vhicidPatientIdentifier);

            // VistA Site DFN that is active
            //-------------------------------
            } else if ((idParts.length > 4) && (idParts[1] === 'PI') && (idParts[3] === 'USVHA') && (idParts[4] === 'A')) {
                self.log.debug('mvi-client._makePatientIdentifiersMVIResponse: From MVI: Entry: %s contains \'Active\' DFN.', mviID);
                siteHash = self.getSitehash(idParts[2]);
                if (siteHash) {
                    idList.push(idUtil.create('pid', siteHash + ';' + idParts[0]));
                } else {
                    self.log.warn('mvi-client._makePatientIdentifiersMVIResponse: No site hash found in Entry: %s for stationNumber: %s.  ID will be skipped.', mviID, idParts[2]);
                }

            // VistA Site DFN that is NOT active
            //-----------------------------------
            } else if ((idParts.length > 4) && (idParts[1] === 'PI') && (idParts[3] === 'USVHA') && (idParts[4] !== 'A')) {
                self.log.debug('mvi-client._makePatientIdentifiersMVIResponse: From MVI: Entry: %s contains \'Inactive\' DFN.  ID is being skipped.', mviID);

            // Unknown ID Type
            //----------------
            } else {
                self.log.warn('MviClient._makePatientIdentifiersMVIResponse():  From MVI: Found unknown id type for Entry: %s.  ID is being skipped.' + mviID);
            }


            return true;
        });

        var mviResponse = self._cleanupAndPrepareResponse(queryPatientIdentifier, idList);
        self.log.debug('MviClient._makePatientIdentifiersMVIResponse: MVI Returning: ' + util.inspect(idList));
        self.metrics.debug('Returning correspondingIds', {
            'subsystem': 'MVI',
            'action': 'correspondingId',
            'pid': queryPatientIdentifier.value,
            'process': process,
            'timer': 'stop'
        });
        return mviResponse;

    } else {
        self.log.warn('MviClient._makePatientIdentifiersMVIResponse(): No IDs in response list for %j', queryPatientIdentifier);
        self.metrics.debug('Returning correspondingIds', {
            'subsystem': 'MVI',
            'action': 'correspondingId',
            'pid': queryPatientIdentifier.value,
            'process': process,
            'timer': 'stop'
        });
        return null;
    }
};

//---------------------------------------------------------------------------------------------------------------------------
// After the set of patientIdentifiers have been created based on the MVI or VistA responses, the list should be cleaned up
// and formatted for returning.  This method does that work.
//
// patientIdentifiers: an array of patientIdenfier objects.
//---------------------------------------------------------------------------------------------------------------------------
MviClient.prototype._cleanupAndPrepareResponse = function(queryPatientIdentifier, patientIdentifiers) {
    var self = this;
    var response = null;

    // Remove any patientIdentifiers where there was no actual identifier.
    //---------------------------------------------------------------------
    patientIdentifiers = _.filter(patientIdentifiers, function(id) {
        return !_.isUndefined(id.value);
    });

    // Do we have anything to return?
    //-------------------------------
    if (patientIdentifiers.length > 0) {
        self.log.debug('MviClient._cleanupAndPrepareResponse(): Returning %j: ' + patientIdentifiers);
        response = {
            ids: patientIdentifiers
        };
    } else {
        self.log.warn('MviClient._cleanupAndPrepareResponse(): No IDs found for %j: ', queryPatientIdentifier);
    }

    return response;
};

//--------------------------------------------------------------------------------------------
// Retrieve the stationNumber for the specified site.
//
// siteHash: The site hash code for the site.
// returns: The stationNumber from config for that site.
//--------------------------------------------------------------------------------------------
MviClient.prototype._getStationNumber = function(siteHash) {
    var self = this;
    if (!self.rootConfig.vistaSites[siteHash]) {
        return null;
    }
    return self.rootConfig.vistaSites[siteHash].stationNumber;
};

//--------------------------------------------------------------------------------------------
// Retrieve the siteHash for this stationNumber.  It is obtained by checking
// the config list that is keyed by station number.
//
// stationNumber:  The stationNumber to use as the key.
// returns: The siteHash associated to that station number or undefined if it did not exist.
//--------------------------------------------------------------------------------------------
MviClient.prototype.getSitehash = function(stationNumber) {
    var self = this;
    var siteHash;
    var site = self.rootConfig.vistaSitesByStationCombined[String(stationNumber)];
    if (_.isObject(site)) {
        siteHash = site.siteHash;
    }
    return siteHash;
};

MviClient.prototype._retreiveIcnFromJdsDemographics = function(patientIdentifier, callback) {
    var self = this;
    var pid = patientIdentifier.value;
    self.log.debug('MviClient._retreiveIcnFromJdsDemographics: Entering method.');
    self.jds.getPtDemographicsByPid(pid, function(error, response, result) {
        var errorMessage;
        if (error) {
            errorMessage = util.format('MviClient._retreiveIcnFromJdsDemographics: got error from JDS when requesting patient demographics for %s; error: %j', pid, error);
            self.log.error(errorMessage);
            return callback(errorMessage);
        } else if (!response || (response.statusCode !== 200 && response.statusCode !== 400)) {
            errorMessage = util.format('MviClient._retreiveIcnFromJdsDemographics: unexpected response from JDS when requesting patient demographics for %s; error: %j, response: %s', pid, error, (response) ? response.statusCode : response);
            self.log.error(errorMessage);
            return callback(errorMessage);
        } else if (response.statusCode === 400) {
            // "Patient Demographics not on File" - a normal situation
            self.log.debug('MviClient._retreiveIcnFromJdsDemographics: No demographics found for %s in JDS.', pid);
            return callback();
        }

        if (!result || !result.data || _.isEmpty(result.data.items)) {
            self.log.debug('MviClient._retreiveIcnFromJdsDemographics: Result from JDS was empty.');
            return callback();
        }

        var demographics = _.first(result.data.items);

        var icn = demographics.icn;

        self.log.debug('MviClient._retreiveIcnFromJdsDemographics: Found icn %s in demographics for pid %s', icn, pid);
        callback(null, icn);
    });
};

module.exports = MviClient;