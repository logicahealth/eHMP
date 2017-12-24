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
var idUtil = require(global.VX_UTILS + 'patient-identifier-utils');
var moment = require('moment');

//--------------------------------------------------------------------------------------------------------
// This is the a client used to retrieve identifiers for a patient either from MVI or a combination of
// pt-select operational data and a locally cached instance of MVI information at a VistA site.
//
// Authors:  Mike Risher, Will McVay, Jon Vega, Les Westberg
//--------------------------------------------------------------------------------------------------------
function MviClient(log, metrics, config, jdsClient) {
    if (!(this instanceof MviClient)) {
        return new MviClient(log, metrics, config, jdsClient);
    }

    this.log = log;
    this.metrics = metrics;
    this.jds = jdsClient;
    this.mviConfig = config.mvi;
    this.rootConfig = config;
    this.clientMap = {};
}

MviClient.prototype.childInstance = function(log) {
    var self = this;
    var newInstance = new MviClient(log, self.metrics, self.rootConfig, self.jds.childInstance(log));
    // clientMap is an object, so this will copy-by-reference and use the same clientMap
    newInstance.clientMap = self.clientMap;

    return newInstance;
};

//--------------------------------------------------------------------------------------------------------
// Perform a lookup either on the MVI or via VistA and pt-select to determine the set of identifiers
// that should be used for syncing this patient.
//
// patientIdentifier: The identifier to use to do the original search.  If this is an ICN, then a call
//                    will be made to the MVI.  If this is a PID then it will be made to the appropriate
//                    VistA system via RPC as well as retrieved from pt-select.
// demographics: This is an object of patient's demographics, only used if patientIdentifier is an EDIPI only
//               patient and get correspondingIds MVI call returns with not found error. In that case, the demographics will
//               be used in attended search MVI call to retrieve patient's identifier and demographcs based on the input, if attended
//               search result contains same patient's identifier and demographics, it will then return patient's patientIdentifier, otherwise
//               it will return with error.
// callback: This is the callback and it will have the following signature:
//             function(error, mviResponse) where:
//                  error: is the error that occurred or null if there was no error.
//                  mviResponse: is a structure that looks as follows:
//                       {
//                           ids: <patientIdentifiers>
//                       }
//                  where <patientIdentifiers> is an array of patientIdentifier
//--------------------------------------------------------------------------------------------------------
MviClient.prototype.lookupWithDemographics = function(patientIdentifier, demographics, callback) {
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
        self.log.debug('MviClient.lookupWithDemographics: icn or edipi was received (Query MVI).  patientIdentifier: %j, demographics: %j', patientIdentifier, demographics);
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
        var correspondingIdPath = self.mviConfig.path || self.mviConfig.correspondingId || '/mvi/correspondingIds';
        url = util.format('%s://%s:%s%s?%s',
            self.mviConfig.protocol,
            self.mviConfig.host,
            self.mviConfig.port,
            correspondingIdPath,
            theQueryString);
        self.log.debug('MviClient.lookupWithDemographics: Lookup for patient: %s => %s', patientIdentifier.value, url);

        var options = {
            url: url,
            timeout: self.mviConfig.timeout,
            forever: true,
            agentOptions: {maxSockets: self.rootConfig.handlerMaxSockets || 5}
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
                self.log.error('MviClient.lookupWithDemographics: Unable to access MVI endpoint: %s; error: %j', url, error);

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
                self.log.debug('MviClient.lookupWithDemographics(): unable to retrieve patient, probably unable to connect to MVI: Status Code: %s', response.statusCode);
                return callback(errorUtil.createFatal('Error retrieving patient: ' + inspect(patientIdentifier), 204));
            }

            var data;
            try {
                data = JSON.parse(body);
            } catch (parseError) {
                // Could not parse response - probably would work at a different time
                self.log.error('MviClient.lookupWithDemographics(): Status Code: %s', response.statusCode);
                self.log.error('MviClient.lookupWithDemographics(): Unable to parse JSON: %s', body);
                return callback(errorUtil.createFatal('Unable to parse JSON', 500));
            }

            self.log.debug('MviClient.lookupWithDemographics(): Got results for patient: %s', inspect(patientIdentifier));
            self.log.trace('MviClient.lookupWithDemographics(): Got results for patient: %s; Result: %j', inspect(patientIdentifier), data);
            //self.log.trace(inspect(data));

            self._parseRealMVIResponseWithDemographics(patientIdentifier, demographics, data, process, callback);
        });

        return;
    }

    if (patientIdentifier.type === 'pid') {
        self.log.debug('MviClient.lookupWithDemographics: pid received.  Query VistA MVI RPC');
        var hashDfn = patientIdentifier.value.split(';');
        self.log.debug('MviClient.lookupWithDemographics: query VistA ' + hashDfn[0] + ' for patient ' + hashDfn[1]);

        var siteHash = hashDfn[0];
        var vistaClient = self._getVistaClient(siteHash);

        if (_.isUndefined(vistaClient) || _.isNull(vistaClient)) {
            self.log.debug('MviClient.lookupWithDemographics: PID provided and VistA instance is unknown');
            return setTimeout(callback, 0, errorUtil.createFatal('Unknown source instance.  Cannot query VistA MVI RPC', 400));
        }

        // var rpcConfig = _.clone(siteConfig);
        var stationNumber = self._getStationNumber(siteHash);
        if (!stationNumber) {
            self.log.error('MviClient.lookupWithDemographics: mvi-client.lookup no station number found for ' + siteHash);
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
                self.log.error('MviClient.lookupWithDemographics: Error returned by getCorrespondingIds RPC call. Error: %j', error);
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
                        self.log.debug('MviClient.lookupWithDemographics: ICN not found in VistA MVI corresponding Ids. Checking demographics in JDS for ICN.');
                        self._retrieveIcnFromJdsDemographics(patientIdentifier, function(er, icn) {
                            if (er) { //An error other than 400 'demographics not on file'
                                self.log.error('MviClient.lookupWithDemographics: Error received from JDS when trying to look demographics to get ICN. Error %j', er);
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

// A Wrapper of lookupWithDemographics function with demographics set to null.
MviClient.prototype.lookup = function(patientIdentifier, callback) {
    return this.lookupWithDemographics(patientIdentifier, null, callback);
};

MviClient.prototype._clearVistaClientCache = function() {
    // delete each item to preserve the reference across child instances
    _.each(this.clientMap, function(element, id) {
        delete this.clientMap[id];
    });
};

MviClient.prototype._getVistaClient = function(siteHash) {
    this.log.debug('MviClient._getVistaClient: MviClient._getVistaClient(%s)', siteHash);
    var client = this.clientMap[siteHash];

    if (!_.isUndefined(client) && !_.isNull(client)) {
        return client.childInstance(this.log);
    }

    var siteConfig = this.rootConfig;
    if (_.isUndefined(siteConfig) || _.isNull(siteConfig)) {
        return;
    }

    var vistaClient = new VistaClient(this.log, this.metrics, siteConfig);
    this.clientMap[siteHash] = vistaClient;

    return vistaClient.childInstance(this.log);
};

MviClient.prototype._parseRealMVIResponse = function(queryPatientIdentifier, rawData, process, callback) {
    return this._parseRealMVIResponseWithDemographics(queryPatientIdentifier, null, rawData, process, callback);
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
MviClient.prototype._parseRealMVIResponseWithDemographics = function(queryPatientIdentifier, demographics, rawData, process, callback) {
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
        data = rawData.PRPA_IN201310UV02;
        responseCode = data.controlActProcess.queryAck.queryResponseCode.code || 'ER';
    } catch (e) {
        self.log.error(e);
        responseCode = 'ER';
    }
    var idList = [];

    switch (responseCode) {
        case 'OK':
            try {
                var mviPatientIds = [];
                var mviPatient = data.controlActProcess.subject.registrationEvent.subject1.patient;
                if (_.isArray(mviPatient.id)) {
                    mviPatientIds = mviPatient.id;
                } else if (!_.isUndefined(mviPatient.id)) {
                    mviPatientIds.push(mviPatient.id);
                }
                idList = _.pluck(mviPatientIds, 'extension');
                var mviResponse = self._makePatientIdentifiersMVIResponse(queryPatientIdentifier, idList, process);
                if (mviResponse) {
                    return callback(null, mviResponse);
                } else {
                    return callback(util.format('No IDs found for %j', queryPatientIdentifier));
                }
            } catch (e) {
                self.log.error('MviClient._parseRealMVIResponseWithDemographics: Error parsing results from local or global MVI.  Exception: %s', e);
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
            self.log.debug('MviClient._parseRealMVIResponseWithDemographics: demographics is (%j) and patient identifier is (%j)', demographics, queryPatientIdentifier);
            if (self._needToVerifyEDIPIOnlyDemographics(demographics, queryPatientIdentifier)) { // if we have a demographics and it is an edipi
                return self.verifyEDIPIOnlyDemograpics(demographics, queryPatientIdentifier, callback);
            }
            else {
                return callback('MVI could not find patient');
            }
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

MviClient.prototype._retrieveIcnFromJdsDemographics = function(patientIdentifier, callback) {
    var self = this;
    var pid = patientIdentifier.value;
    self.log.debug('MviClient._retrieveIcnFromJdsDemographics: Entering method.');
    self.jds.getPtDemographicsByPid(pid, function(error, response, result) {
        var errorMessage;
        if (error) {
            errorMessage = util.format('MviClient._retrieveIcnFromJdsDemographics: got error from JDS when requesting patient demographics for %s; error: %j', pid, error);
            self.log.error(errorMessage);
            return callback(errorMessage);
        } else if (!response || (response.statusCode !== 200 && response.statusCode !== 400)) {
            errorMessage = util.format('MviClient._retrieveIcnFromJdsDemographics: unexpected response from JDS when requesting patient demographics for %s; error: %j, response: %s', pid, error, (response) ? response.statusCode : response);
            self.log.error(errorMessage);
            return callback(errorMessage);
        } else if (response.statusCode === 400) {
            // "Patient Demographics not on File" - a normal situation
            self.log.debug('MviClient._retrieveIcnFromJdsDemographics: No demographics found for %s in JDS.', pid);
            return callback();
        }

        if (!result || !result.data || _.isEmpty(result.data.items)) {
            self.log.debug('MviClient._retrieveIcnFromJdsDemographics: Result from JDS was empty.');
            return callback();
        }

        var demographics = _.first(result.data.items);

        var icn = demographics.icn;

        self.log.debug('MviClient._retrieveIcnFromJdsDemographics: Found icn %s in demographics for pid %s', icn, pid);
        callback(null, icn);
    });
};

MviClient.prototype._needToVerifyEDIPIOnlyDemographics = function(demographics, patientIdentifier) {
    return demographics && patientIdentifier && patientIdentifier.value && idUtil.isDod(patientIdentifier.value);
};

MviClient.prototype.verifyEDIPIOnlyDemograpics = function (demographics, patientIdentifier, callback) {
    var self = this;
    var verified;
    this.attendedSearch(demographics, function (err, mviResults){
        if (!err && _.isArray(mviResults) && !_.isEmpty(mviResults) ) {
            verified = _.find(mviResults, function(mviResult){
                if (mviResult.patientIdentifier.type === 'edipi' &&
                    'DOD;' + mviResult.patientIdentifier.value === patientIdentifier.value) {
                    return (mviResult.demographics.givenNames === demographics.givenNames &&
                            mviResult.demographics.familyName === demographics.familyName);
                }
                return false;
            });
            if (verified) {
                return callback(null, {ids: [patientIdentifier], skipResyncCheck: true});
            }
            else {
                self.log.warn('MviClient.verifyEDIPIOnlyDemograpics: Could not find matching id %j with demographics %j in %j', patientIdentifier, demographics, mviResults);
            }
        }
        return callback('MVI could not find patient');
    });
};
//--------------------------------------------------------------------------------------------------------
// Perform a MVI 1305 attended search on the MVI to determine the set of patient's identifiers as well demographics associated
//
// demographics: This is an object of patient's demographics, givenNames, familyName and ssn are required fields.
// callback: This is the callback and it will have the following signature:
//             function(error, mviResponse) where:
//                  error: is the error that occurred or null if there was no error.
//                  mviResponse: is a structure that looks as follows:
//                       [
//                          {
//                           id: patientIdentifier
//                           demographics: patientDemgraphics
//                          },
//                          .....
//                       ]
//--------------------------------------------------------------------------------------------------------
MviClient.prototype.attendedSearch = function(demographics, callback) {
    var self = this;
    var processId = global.process.pid;

    self.log.debug('MviClient.attendedSearch: demographics is %j', demographics);
    if (_.isEmpty(self.mviConfig)) {
        return setTimeout(callback, 0, errorUtil.createFatal('No value passed for mvi configuration'));
    }
    if (!_isValidDemographicsForAttendedSearch(demographics)) {
        self.log.warn('MviClient.attendedSearch: invalid demograhics information');
        return setTimeout(callback, 0, errorUtil.createFatal('Invalid patient demographics information!'));
    }
    var attendedSearchPath = self.mviConfig.attendedSearch || '/mvi/attendedSearch';
    var mviAttendedSearchUrl = util.format('%s://%s:%s%s',
            self.mviConfig.protocol,
            self.mviConfig.host,
            self.mviConfig.port,
            attendedSearchPath);

    self.log.debug('MviClient.attendedSearch: url is %s', mviAttendedSearchUrl);

    // Convert demographics to 1305 post body format.
    var postFields = _getMviAttendedSearchRequiredFields();
    if (_isValidBirthDateForAttendedSearch(demographics)) {
        postFields.push('birthDate');
    }
    var pickArgArray =[demographics].concat(postFields);
    var postBody = _.pick.apply(_, pickArgArray);
    postBody.firstName = postBody.givenNames;
    postBody.lastName = postBody.familyName;
    delete postBody.givenNames;
    delete postBody.familyName;

    self.log.debug('MviClient.attendedSearch: postBody %j', postBody);

    var options = {
        url: mviAttendedSearchUrl,
        json: postBody,
        timeout: self.mviConfig.timeout,
        forever: true,
        agentOptions: {maxSockets: self.rootConfig.handlerMaxSockets || 5}
    };

    self.metrics.warn('Global MVI attendedSearch Request', {
        'demographics': demographics,
        'process': processId,
        'timer': 'start'
    });

    request.post(options, function(error, response, body){
        self.metrics.warn('Global MVI attended search Request', {
            'demographics': demographics,
            'process': processId,
            'timer': 'stop'
        });
        if (error || response.statusCode === 500) {
            self.log.error('mvi-client.attendedSearch: Unable to access MVI endpoint: %s; error: %j', mviAttendedSearchUrl, error);

            // This might work at a different time
            return callback(errorUtil.createTransient((error || body || 'Unknown Error'), 500));
        }

        // Bad Request - this will never return results
        if (response.statusCode === 400) {
            return callback(errorUtil.createFatal(body, 400));
        }

        // Not found - this will probably never return results
        if (response.statusCode === 404) {
            return callback(errorUtil.createFatal('Patient not found: ' + inspect(demographics), 404));
        }

        // Not found - this will probably never return results
        if (response.statusCode === 204) {
            self.log.debug('MviClient.attendedSearch(): unable to retrieve patient, probably unable to connect to MVI: Status Code: %s', response.statusCode);
            return callback(errorUtil.createFatal('Error retrieving patient: ' + inspect(demographics), 204));
        }
        var data = body;
        if (!_.isObject(body)) {
            try {
                data = JSON.parse(body);
            } catch (parseError) {
                // Could not parse response - probably would work at a different time
                self.log.error('MviClient.attendedSearch(): Status Code: %s', response.statusCode);
                self.log.error('MviClient.attendedSearch(): Unable to parse JSON: %j, error :(%s)', body, parseError);
                return callback(errorUtil.createFatal('Unable to parse JSON', 500));
            }
        }
        self.log.debug('MviClient.attendedSearch(): Got results for patient: %s; Result: %j', inspect(demographics), data);

        return self._parseMVIAttendedSearchResponse(demographics, data, processId, callback);
    });
    return;
};

function _getMviAttendedSearchRequiredFields () {
    return ['familyName', 'givenNames', 'ssn'];
}

// verify if demographics passed in is in a valid format.
function _isValidDemographicsForAttendedSearch(demographics) {
    // required: fullName
    if (_.isEmpty(demographics)) {
        return false;
    }
    var isValid = false;
    isValid = _.every(_getMviAttendedSearchRequiredFields(), function(fieldName){
        if (_.isEmpty(demographics[fieldName])) {
            return false;
        }
        return true;
    });
    return isValid;
}
// verify if the birthDate is valid and in the right format.
function _isValidBirthDateForAttendedSearch (birthDate) {
    // Check to see if birthdate is in valid format
    if (_.isEmpty(birthDate)){
        return false;
    }
    return moment(birthDate, 'YYYYMMDD').isValid();
}

MviClient.prototype._parseMVIAttendedSearchResponse = function(demographics, rawData, processId, callback) {
    var self = this;
    var actionName = 'attended search';
    self.metrics.debug('Parsing MVI Response', {
        'subsystem': 'MVI',
        'action': actionName,
        'demographics': demographics,
        'process': processId
    });
    var responseCode;
    var data = null;
    try {
        data = rawData.PRPA_IN201306UV02;
        responseCode = data.controlActProcess.queryAck.queryResponseCode.code || 'ER';
    } catch (e) {
        self.log.error('Mvi-Client._parseMVIAttendedSearchResponse: invalid response format, error: %j', e);
        responseCode = 'ER';
    }

    switch (responseCode) {
        case 'OK':
            try {
                if (_.isEmpty(data.controlActProcess) || _.isEmpty(data.controlActProcess.subject)) {
                    return callback(util.format('No results found for %j', demographics));
                }
                // make sure it is an array object
                var mviAttendedSearchResults = data.controlActProcess.subject;
                if (!_.isArray(mviAttendedSearchResults)) {
                    mviAttendedSearchResults = [mviAttendedSearchResults];
                }
                var mviResponse = self._makeAttendedSearchMVIResponse(mviAttendedSearchResults, processId);
                if (mviResponse) {
                    return callback(null, mviResponse);
                } else {
                    return callback(util.format('No results found for %j', demographics));
                }
            } catch (e) {
                self.log.error('MviClient._parseMVIAttendedSearchResponse: Error parsing results from local or global MVI.  Exception: %s', e);
                self._stopMetricWithError(actionName, demographics, processId);
                return callback('No patient identifiers found in JSON structure');
            }
            break;
        case 'ER':
            self._stopMetricWithError(actionName, demographics, processId);
            return callback('MVI response in unknown structure');
        case 'NF':
            self._stopMetricWithError(actionName, demographics, processId);
            return callback('MVI could not find patient');
        case 'QE':
            self._stopMetricWithError(actionName, demographics, processId);
            return callback('MVI returns too many records, please refine your search!');
        case 'AE':
            self._stopMetricWithError(actionName, demographics, processId);
            return callback('MVI Application or System Error, was unable to fulfill request');
        default:
            self._stopMetricWithError(actionName, demographics, processId);
            return callback('MVI gave unknown response code ' + responseCode);
    }
};

MviClient.prototype._makeAttendedSearchMVIResponse = function (attendedSearchResults) {
    var self = this;
    if (!_.isArray(attendedSearchResults) || _.isEmpty(attendedSearchResults)) {
        self.log.warn('Invalid attendedSearchResults, expecting an non-empty array object!');
        return [];
    }
    var mviResponse = [];
    _.each(attendedSearchResults, function(eachRecord) {
        if (!self._isValidAttendedSearchResult(eachRecord)) {
            self.log.warn('MviClient._makeAttendedSearchMVIResponse, invalid format of result %j, ignore!', eachRecord);
            return;
        }
        var patientInfo = eachRecord.registrationEvent.subject1.patient;
        var patientIdentifier = self._createPatientIdentifierBasedOnMvi(patientInfo.id.extension);
        if (patientIdentifier) {
            var indivRecord = {};
            indivRecord.patientIdentifier = patientIdentifier;
            var demographics = self._createDemographicsBasedOnMvi(patientInfo.patientPerson);
            if (!_.isEmpty(demographics)) {
                indivRecord.demographics = demographics;
                mviResponse.push(indivRecord);
            }
            else {
                self.log.warn('MviClient._makeAttendedSearchMVIResponse, empty demographics based on %j, ignore!', eachRecord.patientPerson);
            }
        }
    });
    self.log.debug('Mvi-Client._makeAttendedSearchMVIResponse: mviResponse %j', mviResponse);
    return mviResponse;
};

// Check to see if each attendedSearch result is a valid format.
MviClient.prototype._isValidAttendedSearchResult = function (searchResult) {
    var self = this;
    if (!searchResult || !searchResult.registrationEvent || !searchResult.registrationEvent.subject1 || !searchResult.registrationEvent.subject1.patient) {
        self.log.warn('MviClient._isValidAttendedSearchResult: Missing registrationEvent or registrationEvent.subject1, registrationEvent.subject1.patient fields');
        return false;
    }
    var patientInfo = searchResult.registrationEvent.subject1.patient;
    if (!patientInfo.id || !patientInfo.id.extension) { // missing id & extension information.
        self.log.warn('MviClient._isValidAttendedSearchResult: Missing id or id.extension under subject1');
        return false;
    }
    if (!patientInfo.patientPerson) {
        self.log.warn('MviClient._isValidAttendedSearchResult: Missing patientPersion under subject1');
        return false;
    }
    return true;
};

// This function take the HL7 1306 response and convert into patient demographics information.
MviClient.prototype._createDemographicsBasedOnMvi = function(patientPerson) {
    var self = this;
    if (_.isEmpty(patientPerson)) {
        self.log.warn('Mvi-Client._createDemographicsBasedOnMvi: input %s is not valid', patientPerson);
        return {};
    }
    var demographics = {};
    var nameComp = patientPerson.name;
    if (!_.isEmpty(nameComp) && !_.isEmpty(nameComp.use) && nameComp.use === 'L'){
        demographics.givenNames = nameComp.given;
        demographics.familyName = nameComp.family;
    }
    var ssnInfo = patientPerson.asOtherIDs;
    if (!_.isEmpty(ssnInfo) && !_.isEmpty(ssnInfo.classCode) && ssnInfo.classCode === 'SSN'){
        if (!_.isEmpty(ssnInfo.id) && !_.isEmpty(ssnInfo.id.extension)) {
            demographics.ssn = ssnInfo.id.extension;
        }
    }
    var birthDate = patientPerson.birthTime;
    if (!_.isEmpty(birthDate) && !_.isEmpty(birthDate.value)) {
        demographics.birthDate = birthDate.value;
    }
    var genderInfo = patientPerson.administrativeGenderCode;
    if (!_.isEmpty(genderInfo) && !_.isEmpty(genderInfo.code)) {
        demographics.genderCode = genderInfo.code;
    }
    var addrInfo = patientPerson.addr;
    if (!_.isEmpty(addrInfo)) {
        demographics.address = [{
            use: addrInfo.use || '',
            line1: addrInfo.streetAddressLine || '',
            city: addrInfo.city || '',
            state: addrInfo.state || '',
            zip: addrInfo.postalCode || ''
        }];
    }
    var telecomInfo = patientPerson.telecom;
    if (!_.isEmpty(telecomInfo)) {
        demographics.telecom = [{
            use: telecomInfo.use || '',
            value: telecomInfo.value || ''
        }];
    }
    return demographics;
};
// This function take HL7 1306 response and convert to patientIdentifier
MviClient.prototype._createPatientIdentifierBasedOnMvi = function (mviId) {
    var self = this;
    if (!_.isString(mviId) || mviId.length === 0) {
        self.log.warn('mvi-client._createPatientIdentifierBasedOnMvi: input %s must be a non-empty string', mviId);
        return undefined;
    }
    var idParts = mviId.split('^'); // split based on ^, will return array at least with length of 1
    if (idParts[0] === '-1') {
        self.log.warn('mvi-client._createPatientIdentifierBasedOnMvi: Unknown id %s', mviId);
        return undefined;
    }
    if (idParts.length < 4) {
        self.log.warn('mvi-client._createPatientIdentifierBasedOnMvi: Need at least 4 parts to decide id type!, id: %s', mviId);
        return undefined;
    }
    if (idParts[1] === 'NI') { // national identifier like EDIPI or ICN
        if (idParts[3] === 'USVHA') {
            return idUtil.create('icn', idParts[0]);
        }
        if (idParts[3] === 'USDOD') {
            return idUtil.create('edipi', idParts[0]);
        }
    }
    if (idParts[1] === 'PI' && idParts.length > 4) { // This is local patient identifier
        if (idParts[2] === '742V1') { //vhicid
            var vhicId = idUtil.create('vhicid', idParts[0]);
            if (idParts[4] === 'A') {
                vhicId.active = true;
            }
            return vhicId;
        }
        if (idParts[3] === 'USVHA') {
            if (idParts[4] === 'A') {
                var siteHash = self.getSitehash(idParts[2]);
                if (siteHash) {
                    return idUtil.create('pid', siteHash + ';' + idParts[0]);
                }
                self.log.warn('mvi-client._createPatientIdentifierBasedOnMvi: No site hash found in Entry: %s for stationNumber: %s.  ID will be skipped.', mviId, idParts[2]);
                return undefined;
            }
            else {
                self.log.warn('mvi-client._createPatientIdentifierBasedOnMvi: From MVI: Entry: %s contains \'Inactive\' DFN.  ID is being skipped.', mviId);
                return undefined;
            }
        }
    }
    self.log.warn('MviClient._makePatientIdentifiersMVIResponse():  From MVI: Found unknown id type for Entry: %s.  ID is being skipped.' + mviId);
    return undefined;
};

MviClient.prototype._stopMetricWithError = function (actionName, demographics, processId) {
    this.metrics.debug('MVI processing error', {
        'subsystem': 'MVI',
        'action': actionName,
        'demographics': demographics,
        'process': processId,
        'timer': 'stop'
    });
};

module.exports = MviClient;
