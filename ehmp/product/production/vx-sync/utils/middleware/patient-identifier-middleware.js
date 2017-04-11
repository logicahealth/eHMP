'use strict';

require('../../env-setup');

var _ = require('underscore');
var format = require('util').format;

var inspect = require('../inspect');
var idUtil = require('../patient-identifier-utils');
var logUtil = require('../log');

var IDENTIFIER_QS_TYPES = idUtil.validFormats;

function PatientIdentifierAPI(setLog, setConfig, jdsClient, mviClient) {
    if (!(this instanceof PatientIdentifierAPI)) {
        return new PatientIdentifierAPI(setLog, setConfig, jdsClient, mviClient);
    }
    this.jdsClient = jdsClient;
    this.mviClient = mviClient;
    this.log = logUtil.getAsChild('patient-identifier-util', setLog);
    this.config = setConfig;

    this.validatePatientIdentifier = validatePatientIdentifier.bind(this);
    this.getJPID = getJPID.bind(this);
    this.createJPID = createJPID.bind(this);
    this.resolveJPID = resolveJPID.bind(this);
}

/**
 * Middleware to validate the patient identifier in the query string
 */
var validatePatientIdentifier = function(req, res, next) {
    var self = this;
    self.log.debug('patient-identifier-middleware.validatePatientIdentifier(): Entered method');

    var idList = _.filter(IDENTIFIER_QS_TYPES, function(type) {
        return !_.isUndefined(req.param(type));
    });

    self.log.debug('patient-identifier-middleware.validatePatientIdentifier(): Identifier parameters found: %j', idList);

    if (idList.length > 1) {
        return res.status(400).send('Please limit your request to one patient identifier.');
    }

    if (idList.length === 0) {
        return res.status(400).send('Please provide one valid patient identifier.');
    }

    var idType = _.first(idList);
    var idValue = req.param(idType);

    if (idValue.length < 1) {
        return res.status(400).send(format('No value was given for the query parameter %s', idType));
    }

    if (!idUtil.isIdFormatValid(idType, idValue, self.config)) {
        return res.status(400).send(format('The value "%s" for patient id type "%s" was not in a valid format', idValue, idType));
    }

    if (!idUtil.isIcn(idValue) && !idUtil.isPid(idValue) && !idUtil.isEdipi(idValue)) {
        return res.status(400).send(format('The value "%s" for patient id type "%s" was not an accepted type. Accepted types are ICN, PID, and EDIPI', idValue, idType));
    }

    req.patientIdentifier = idUtil.create(idType, idValue);

    self.log.debug('patient-identifier-middleware.validatePatientIdentifier(): Generated patientIdentifier object: %j', req.patientIdentifier);

    next();
};

/**
 * Middleware to retrieve the JPID
 */
var getJPID = function(req, res, next) {
    var self = this;
    self.log.debug('patient-identifier-middleware.getJPID() - Entered method.');
    var jdsIdentifierRequest = {
        'patientIdentifier': req.patientIdentifier
    };
    self.jdsClient.getPatientIdentifier(jdsIdentifierRequest, function(error, response, result) {
        var idValue = req.patientIdentifier.value;
        if (response.statusCode === 404) {
            self.log.debug('patient-identifier-middleware.getJPID(): jpid not found');
            req.jpid = false;
            next();
        } else if (error || response.statusCode !== 200) {
            self.log.debug('patient-identifier-middleware.getJPID(): statusCode: %s; Error retrieving JPID for patient identifier: %s; response: %j', response.statusCode, idValue, response);
            res.status(response.statusCode).json(result);
        } else {
            self.log.debug('patient-identifier-middleware.getJPID(): JPID found: ', result);
            req.jpid = result.jpid;
            req.identifiers = result.patientIdentifiers;

            next();
        }
    });
};

var resolveJPID = function(req, res, next) {
    var self = this;
    self.log.debug('patient-identifier-middleware.resolveJPID(): entering funciton');
    var patientIdentifier = req.patientIdentifier;
    self.log.debug('patient-identifier-middleware.resolveJPID(): looking up JPID in JDS for this patient: %s', inspect(patientIdentifier));

    self.getJPID(req, res, function() {
        self.log.debug('patient-identifier-middleware.resolveJPID(): Call to getJPID for %s finished.', inspect(patientIdentifier));
        if (!req.jpid && patientIdentifier.type === 'pid') {
            self.log.debug('patient-identifier-middleware.resolveJPID(): No JPID found for this PID: %s. Now trying to look up JPID via ICN on VistA.', inspect(patientIdentifier));
            self.log.debug('patient-identifier-middleware.resolveJPID(): Calling mvi-client.lookup to get corresponding ids from VistA for pid %s', inspect(patientIdentifier));

            self.mviClient.lookup(patientIdentifier, function(error, result) {
                self.log.debug('patient-identifier-middleware.resolveJPID(): Call to mviClient.lookup for pid %s complete.', inspect(patientIdentifier));
                if (error) {
                    self.log.error('patient-identifier-middleware.resolveJPID(): Problem encountered when attempting to get corresponding ids from VistA for %s.', inspect(patientIdentifier));
                    return res.status(400 /*use some kind of network error code?*/ ).json(error);
                } else if (!result){
                     self.log.error('patient-identifier-middleware.resolveJPID(): No identifiers found on VistA for %s.', inspect(patientIdentifier));
                     return next();
                }

                var foundIcnIdentifier = _.first(idUtil.extractIdsOfTypes(result.ids, 'icn'));
                if (!foundIcnIdentifier) {
                    self.log.warn('patient-identifier-middleware.resolveJPID(): No ICN found on VistA for %s.', inspect(patientIdentifier));
                    return next();
                }

                self.log.debug('patient-identifier-middleware.resolveJPID(): found corresponding ICN %s on VistA for %s ', inspect(foundIcnIdentifier), inspect(patientIdentifier));
                var tempReq = {
                    patientIdentifier: foundIcnIdentifier
                };

                self.log.debug('patient-identifier-middleware.resolveJPID(): Now making 2nd call to getJPID with this identifier: %s', inspect(foundIcnIdentifier));
                self.getJPID(tempReq, res, function() {
                    if (!tempReq.jpid) {
                        self.log.debug('patient-identifier-middleware.resolveJPID(): No JPID found in 2nd call to getJPID for %s using ICN %s', inspect(patientIdentifier), inspect(foundIcnIdentifier));
                        return next();
                    } else {
                        self.log.debug('patient-identifier-middleware.resolveJPID(): JPID has been found in 2nd call to getJPID for %s using ICN %s', inspect(patientIdentifier), inspect(foundIcnIdentifier));
                    }

                    req.jpid = tempReq.jpid;
                    req.identifiers = tempReq.identifiers;
                    if (!_.contains(patientIdentifier.value, req.identifiers)) {
                        req.identifiers.push(patientIdentifier.value);
                    }

                    self.log.debug('patient-identifier-middleware.resolveJPID(): Now attempting to re-associate pid %s to corresponding ids in JDS.', inspect(patientIdentifier));
                    self.jdsClient.storePatientIdentifier({
                        'jpid': req.jpid,
                        'patientIdentifiers': req.identifiers
                    }, function(error, response) {
                        if (error) {
                            self.log.error('patient-identifier-middleware.resolveJPID(): Error encountered when re-associating pid %s to corresponding ids in JDS. Error: %s, response: %s', inspect(patientIdentifier), inspect(error), inspect(response));
                        }
                        self.log.debug('patient-identifier-middleware.resolveJPID(): Completed re-associating pid %s to corresponding ids in JDS.', inspect(patientIdentifier));
                        next();
                    });
                });
            });
        } else {
            next();
        }
    });
};

/**
 * Middleware to create a JPID
 */
var createJPID = function(req, res, next) {
    var self = this;
    self.log.debug('patient-identifier-middleware.createJPID(): Entered method');

    if (req.jpid !== false) {
        return next();
    }

    var jdsStoreRequest = {
        'patientIdentifiers': [
            req.patientIdentifier.value
        ]
    };

    self.jdsClient.storePatientIdentifier(jdsStoreRequest, function(error, response) {
        if (error) {
            self.log.debug(error, response);
        }
        self.log.debug('patient-identifier-middleware.createJPID(): JPID Generated:');
        self.getJPID(req, res, next);
    });
};

module.exports = PatientIdentifierAPI;
PatientIdentifierAPI._tests = {
    '_validatePatientIdentifier': validatePatientIdentifier,
    '_getJPID': getJPID,
    '_resolveJPID': resolveJPID,
    '_createJPID': createJPID
};
