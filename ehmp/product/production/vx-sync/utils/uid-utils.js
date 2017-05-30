'use strict';
var _ = require('underscore');
var domains = require('./domain');

var domainToUidTemplates = {};
var operationalDomainToUidTemplates = {};

//Generate domain uid templates from domain list
_.each(domains.getDomainList(), function (domainName) {
	return (domainToUidTemplates[domainName] = 'urn:va:' + domainName + ':');
});

_.each(domains.getOperationalDomainList(), function (domainName) {
	return (operationalDomainToUidTemplates[domainName] = 'urn:va:' + domainName + ':');
});

function getUidForDomain(domain, systemId, localPatientId, localId) {
	if (_.isUndefined(domainToUidTemplates[domain])) {
		return null;
	}
	return domainToUidTemplates[domain] + systemId + ':' + localPatientId + ':' + localId;
}

function getUidForOperationalDomain(domain, systemId, localId) {
	if (_.isUndefined(operationalDomainToUidTemplates[domain])) {
		return null;
	}
	if (domain === 'pt-select') {
		return operationalDomainToUidTemplates[domain] + systemId + ':' + localId + ':' + localId;
	}
	return operationalDomainToUidTemplates[domain] + systemId + ':' + localId;
}

function extractPiecesFromUID(uid, delimiter) {
	delimiter = delimiter || ':';
	var parts = uid.split(delimiter);
	var info = {};
	switch (parts.length) {
		case 6:
			info.localId = parts[5];
		/* falls through */
		case 5:
			info.patient = parts[4];
		/* falls through */
		case 4:
			info.site = parts[3];
		/* falls through */
		case 3:
			info.domain = parts[2];
		/* falls through */
		case 2:
			info.organization = parts[1];
		/* falls through */
		case 1:
			info.prefix = parts[0];
	}
	return info;
}

function extractDomainFromUID(uid, delimiter) {
	return extractPiecesFromUID(uid, delimiter).domain;
}

function extractSiteFromUID(uid, delimiter) {
	return extractPiecesFromUID(uid, delimiter).site;
}

function extractPatientFromUID(uid, delimiter) {
	return extractPiecesFromUID(uid, delimiter).patient;
}

function extractLocalIdFromUID(uid, delimiter) {
	return extractPiecesFromUID(uid, delimiter).localId;
}

//----------------------------------------------------------------------------------------------
//  This utility extracts the pid from a uid.
//
// uid: The uid to check
// delimiter: The delimiter to use in the check
// returns the pid
//-----------------------------------------------------------------------------------------------
function extractPidFromUID(uid, delimiter) {
	if (isValidUid(uid, delimiter)) {
		var site = extractSiteFromUID(uid, delimiter);
		var patientId = extractPatientFromUID(uid, delimiter);
		return site + ';' + patientId;
	}

	return null;
}

function extractSiteHash(uid, delimiter) {
	delimiter = delimiter || ':';
	var parts = uid.split(':');
	var info = '';
	if (_.isArray(parts) && parts.length >= 4) {
		info = parts[3];
	}

	return info;
}

//--------------------------------------------------------------------------------
// Returns true if the uid is valid.  False if it is not.
//
// uid: the UID to verify.
// delimiter: (Optional - delimiter to use if it is not ':'
// returns: true if the UID is valid and false if it is not.
//-------------------------------------------------------------------------------
function isValidUid(uid, delimiter) {
	if (!uid) {
		return false;
	}
	var uidParts = extractPiecesFromUID(uid, delimiter);
	var missingField = _.find(['patient', 'site', 'domain', 'organization', 'prefix'], function (field) {
		return _.isUndefined(uidParts[field]);
	});

	if (missingField) {
		return false;
	}
	return true;
}

/**
 Utility function to check to see if uid is a valid format.
 At least need five parts: prefix, organization, domain, site, patient.
 return callback with (error, uidParts) argument.
 if there is an error, then error will be the detailed error message, uidParts will be undefined.
 if uid is valid, then error will be undefined, and uidParts will be
 filled with right information.
 **/
function isValidUidFormat(uid, callback) {
	if (_.isUndefined(uid)) {
		return callback('uid is undefined');
	}
	var uidParts = extractPiecesFromUID(uid);
	var missingField = _.find(['patient', 'site', 'domain', 'organization', 'prefix'], function (field) {
		return _.isUndefined(uidParts[field]);
	});
	if (missingField) {
		return callback('Missing field: ' + missingField);
	}
	return callback(undefined, uidParts);
}

module.exports.getUidForDomain = getUidForDomain;
module.exports.getUidForOperationalDomain = getUidForOperationalDomain;
module.exports.extractPiecesFromUID = extractPiecesFromUID;
module.exports.extractDomainFromUID = extractDomainFromUID;
module.exports.extractSiteFromUID = extractSiteFromUID;
module.exports.extractPatientFromUID = extractPatientFromUID;
module.exports.extractLocalIdFromUID = extractLocalIdFromUID;
module.exports.extractPidFromUID = extractPidFromUID;
module.exports.extractSiteHash = extractSiteHash;
module.exports.isValidUidFormat = isValidUidFormat;
module.exports.isValidUid = isValidUid;