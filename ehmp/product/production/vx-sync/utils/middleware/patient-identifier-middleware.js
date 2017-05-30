'use strict';

require('../../env-setup');

var _ = require('underscore');
var format = require('util').format;

var inspect = require('../inspect');
var idUtil = require('../patient-identifier-utils');
var logUtil = require('../log');
var val = require(global.VX_UTILS + 'object-utils').getProperty;

var IDENTIFIER_QS_TYPES = idUtil.validFormats;

function PatientIdentifierAPI(setLog, setConfig, jdsClient, mviClient) {
    if (!(this instanceof PatientIdentifierAPI)) {
        return new PatientIdentifierAPI(setLog, setConfig, jdsClient, mviClient);
    }
    this.jdsClient = jdsClient;
    this.mviClient = mviClient;
    this.log = setLog;
    this.config = setConfig;

    this.verifyPatientExists = verifyPatientExists.bind(this);
    this.validatePatientIdentifier = validatePatientIdentifier.bind(this);
    this.getJPID = getJPID.bind(this);
    this.createJPID = createJPID.bind(this);
    this.resolveJPID = resolveJPID.bind(this);
}

/**
 * Middleware to verify that patient exists in JDS
 */
var verifyPatientExists = function(req, res, next) {
    if (_.isUndefined(req.patientIdentifier) || !idUtil.isPid(req.patientIdentifier.value)) {
        return next();
    }

    var self = this;

    self.jdsClient.getOperationalDataPtSelectByPid(req.patientIdentifier.value, function(error, result, body) {
        if (error) {
            self.log.error('patient-identifier-middleware.verifyPatientExists(): Error checking if patient exits in JDS: ', error);
            return res.status(400).send('Unable to check if patient exists in Jds.');
        }

        if (!body || !body.data || _.isUndefined(body.data.totalItems)) {
            self.log.error('patient-identifier-middleware.verifyPatientExists(): Jds returned with an unknown format for patient: ', req.patientIdentifier.value);
            return res.status(400).send('Unable to check if patient exists in Jds.');
        }

        if (body.data.totalItems === 0) {
            return res.status(400).send('Patient does not exist in Jds.');
        }

        next();
    });
};

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
        return res.status(400).send(format('No value was given for the query parameter'));
    }

    if (!idUtil.isIdFormatValid(idType, idValue, self.config)) {
        return res.status(400).send(format('The value for patient id type was not in a valid format'));
    }

    if (!idUtil.isIcn(idValue) && !idUtil.isPid(idValue) && !idUtil.isEdipi(idValue)) {
        return res.status(400).send(format('The value for patient id type was not an accepted type. Accepted types are ICN, PID, and EDIPI'));
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
        var statusCode = response ? response.statusCode: null;
        if (statusCode === 404) {
            self.log.debug('patient-identifier-middleware.getJPID(): jpid not found');
            req.jpid = false;
            next();
        } else if (error || statusCode !== 200) {
            var errorMessage = format('patient-identifier-middleware.getJPID(): statusCode: %s; Error retrieving JPID for patient identifier: %s; Error: %s Response: %s', statusCode, idValue, inspect(error), inspect(response));
            self.log.error(errorMessage);
            res.status(statusCode || 500).json(result);
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
    var errorMessage;
    self.log.debug('patient-identifier-middleware.resolveJPID(): entering function');
    var patientIdentifier = req.patientIdentifier;
    self.log.debug('patient-identifier-middleware.resolveJPID(): looking up JPID in JDS for this patient: %s', inspect(patientIdentifier));

    self.getJPID(req, res, function() {
        self.log.trace('patient-identifier-middleware.resolveJPID(): Call to getJPID for %s finished.', inspect(patientIdentifier));
        if (req.jpid) {
            self.log.debug('patient-identifier-middleware.resolveJPID(): jpid found in first call to getJPID. Continuing...');
            return next();
        }

        self.log.debug('patient-identifier-middleware.resolveJPID(): No JPID found for this PID: %s. Now trying to look up corresponding ids', inspect(patientIdentifier));
        var demographics = req.body ? req.body.demographics : null;
        self.mviClient.lookupWithDemographics(patientIdentifier, demographics, function(error, result) {
            self.log.trace('patient-identifier-middleware.resolveJPID(): corresponding ids lookup finished for %s', inspect(patientIdentifier));
            if (error) {
                errorMessage = format('patient-identifier-middleware.resolveJPID(): Problem encountered when attempting to get corresponding ids for %s. Error: %s', inspect(patientIdentifier), inspect(error));
                self.log.error(errorMessage);
                return res.status(400).json(errorMessage);
            } else if (!result || !result.ids) {
                self.log.debug('patient-identifier-middleware.resolveJPID(): No corresponding identifiers found for %s.', inspect(patientIdentifier));
                return self.createJPID(req, res, next);
            }

            var ids = _.pluck(result.ids, 'value');
            self.log.debug('patient-identifier-middleware.resolveJPID(): Checking if this patientIdentifier needs to be re-associated with corresponding ids via jpid in JDS: %s, ids: %s', inspect(patientIdentifier), ids);
            self.jdsClient.getJpidFromQuery(ids, function(error, response) {
                self.log.trace('patient-identifier-middleware.resolveJPID(): Call to jds jpid query endpoint finished for %s', inspect(patientIdentifier));
                if (error) {
                    errorMessage = format('patient-identifier-middleware.resolveJPID(): Problem encountered when calling jds jpid query endpoint for patientIdentifier: %s, ids: %s, error: %s', inspect(patientIdentifier), ids, inspect(error));
                    self.log.error(errorMessage);
                    return res.status(400).json(errorMessage);
                } else if (!response) {
                    errorMessage = format('patient-identifier-middleware.resolveJPID(): Null response from jds jpid query endpoint for patientIdentifier: %s, ids: %s', inspect(patientIdentifier), ids);
                    self.log.error(errorMessage);
                    return res.status(400).json(errorMessage);
                } else if (response.statusCode === 400 || response.statusCode === 200) {
                    //200 means no jpid for the corresponding ids list; 400 means there is a jpid conflict among the ids.
                    self.log.debug('patient-identifier-middleware.resolveJPID(): Got response %s from jds jpid query endpoint for %s. Continuing to createJPID.', response.statusCode, ids);
                    return self.createJPID(req, res, next);
                } else if (response.statusCode === 201) {
                    //201 means some ids in the list are associated to a jpid but others may not be.
                    self.log.debug('patient-identifier-middleware.resolveJPID(): Got response 201 from jds jpid query endpoint for %s. Now attempting to re-associate the patientIdentifier...', inspect(patientIdentifier));

                    var location = val(response, ['headers', 'location']);
                    var parsedJpid = (_.isString(location)) ? location.replace(/^\S+:\/\/([0-9]+\.){3}[0-9]+\:[0-9]+\/vpr\/jpid\//, '') : null;
                    self.log.trace('patient-identifier-middleware.resolveJPID(): jpid to which the patientIdentifier will be re-associated: %s', parsedJpid);

                    self.jdsClient.storePatientIdentifier({
                        jpid: parsedJpid,
                        patientIdentifiers: [req.patientIdentifier.value]
                    }, function(error, response) {
                        if (error) {
                            //Error
                            errorMessage = format('patient-identifier-middleware.resolveJPID(): Problem encountered when re-associating patientIdentifier %s to jpid %s, Error: %s', inspect(patientIdentifier), parsedJpid, inspect(error));
                            self.log.error(errorMessage);
                            return res.status(400).json(errorMessage);
                        } else if (!response) {
                            //Null response
                            errorMessage = format('patient-identifier-middleware.resolveJPID(): Null response received when re-associating patientIdentifier %s to jpid %s', inspect(patientIdentifier), parsedJpid);
                            self.log.error(errorMessage);
                            return res.status(400).json(errorMessage);
                        } else if (response.statusCode === 201) {
                            //Re-association successful
                            self.log.debug('patient-identifier-middleware.resolveJPID(): Id %s has been successfully re-associated.', inspect(patientIdentifier));
                            return self.getJPID(req, res, next);
                        } else if (response.statusCode === 400) {
                            //JPID Conlfict
                            self.log.debug('patient-identifier-middleware.resolveJPID(): Conflict when trying to re-associate id %s. Storing id individually.', inspect(patientIdentifier));
                            return self.createJPID(req, res, next);
                        } else {
                            //Unexpected response
                            errorMessage = format('patient-identifier-middleware.resolveJPID(): Unexpected response received when re-associating patientIdentifier %s to jpid %s, response.statusCode: %s', inspect(patientIdentifier), parsedJpid, response ? response.statusCode : null);
                            self.log.error(errorMessage);
                            return res.status(400).json(errorMessage);
                        }
                    });
                } else {
                    //Unexpected response
                    errorMessage = format('patient-identifier-middleware.resolveJPID(): Unexpected response from jds jpid query endpoint for patientIdentifier: %s, ids: %s, response.statusCode: %s', inspect(patientIdentifier), ids, response ? response.statusCode : null);
                    self.log.error(errorMessage);
                    return res.status(400).json(errorMessage);
                }
            });
        });
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
        var errorMessage;
        if (error) {
            errorMessage = format('patient-identifier-middleware.createJPID(): JDS returned error when storing patientIdentifier. Request: %s, Error: %s', inspect(jdsStoreRequest), inspect(error));
            self.log.error(errorMessage);
            return res.status(400).json(errorMessage);
        } else if (!response || response.statusCode !== 201){
            errorMessage = format('patient-identifier-middleware.createJPID(): JDS returned unexpected response when storing patientIdentifier. Request: %s, Response: %s', inspect(jdsStoreRequest), inspect(response ? response.body : null));
            self.log.error(errorMessage);
            return res.status(400).json(errorMessage);
        }

        self.log.debug('patient-identifier-middleware.createJPID(): JDS storePatientIdentifier successful.');
        self.getJPID(req, res, next);
    });
};

module.exports = PatientIdentifierAPI;
PatientIdentifierAPI._tests = {
    '_verifyPatientExists': verifyPatientExists,
    '_validatePatientIdentifier': validatePatientIdentifier,
    '_getJPID': getJPID,
    '_resolveJPID': resolveJPID,
    '_createJPID': createJPID
};