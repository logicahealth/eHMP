'use strict';
//------------------------------------------------------------------------------
// This is a set of utility functions that can be used to operate on patient
// identifiers.
//------------------------------------------------------------------------------

var _ = require('underscore');
var nullUtil = require(global.VX_UTILS + 'null-utils');

var validators = {
    icn: isIcn,
    dfn: isPid,
    pid: isPid,
    dod: isDod,
    das: isDas,
    vler: isVler,
    edipi: isEdipi
};

var validatorsWithConfig = {
    hdr: isHdr
};

var validFormats = ['icn', 'dfn', 'pid', 'dod', 'das', 'vler', 'edipi'];
var validFormatsWithConfig = ['hdr'];

//-------------------------------------------------------------------------------
// This creates an instance of patientIdentifier from the given information.
//
// type: The type of patientIdentifier.   Currently this can be 'icn' or 'pid'.
// value: The identifier value.
// returns: An instance of patientIdentifier containing the type and value.
//--------------------------------------------------------------------------------
function create(type, value) {
    return {
        type: type,
        value: value
    };
}

//--------------------------------------------------------------------------------
// This checks to see if the given value is an ID that is formatted correctly for
// the specified type.   If it is formatted correctly, then true is returned.
//
// types: An array of types that should be considered.  The list can contain one
//        or more of of: [icn, dfn, pid, dod, das, vler, hdr].
// value: The identifier being validated.
// config: The worker-config settings.
// returns: True if it is valid for one of the types.
//---------------------------------------------------------------------------------
function isIdFormatValid(types, value, config) {
    if (_.isEmpty(types)) {
        types = [];
    }

    if (!_.isArray(types)) {
        types = [types];
    }

    if (_.isEmpty(value)) {
        return false;
    }

    // Note that since some of the formats require the config - we are going to fail all
    // validation unless we get this object.
    //----------------------------------------------------------------------------------
    if (_.isEmpty(config)) {
        return false;
    }

    return _.some(types, function(type) {
        if (_.contains(validFormats, type)) {
            return validators[type](value);
        }

        if (_.contains(validFormatsWithConfig, type)) {
            return validatorsWithConfig[type](value, config);
        }

        return false;
    });
}

//-------------------------------------------------------------------
// Verifies that the identifier is an ICN.
//
// id: This is a string that is an identifier.  This checks this id
//     to see if it represents an ICN.
// returns: True if this identifier is an ICN.  False if it is not.
//-------------------------------------------------------------------
function isIcn(id) {
    return !_.isEmpty(id) && /^[0-9a-zA-Z]+$/.test(id);
}

//-------------------------------------------------------------------
// Verifies that the identifier is an EDIPI.
//
// id: This is a string that is an identifier.  This checks this id
//     to see if it represents an EDIPI.
// returns: True if this identifier is an EDIPI.  False if it is not.
//-------------------------------------------------------------------
function isEdipi(id) {
    return !_.isEmpty(id) && /^[0-9]+$/.test(id);
}

//-------------------------------------------------------------------
// Verifies that this is a pid for a VistA site.
//
// pid: The patient identifier to be checked.  It will be in the form
//      of <site>;<local-identifier>.
// returns: True if this pid is truly a pid.  False if it is not.
//-------------------------------------------------------------------
function isPid(pid) {
    return !_.isEmpty(pid) && /([0-9a-fA-F]{3,}|(DOD)|(VLER)|(HDR));[0-9V]+$/.test(pid);
}

//-------------------------------------------------------------------
// True if this is a pid that is for a Vista Direct site.
//
// pid: The patient identifier to be checked.  It will be in the form
//      of <site>;<local-identifier>.
// config: The worker-config settings.
// returns: True if this pid is for a VistA site that is directly
//          connected to VX-Sync.  False if it is not.
//-------------------------------------------------------------------
function isVistaDirect(pid, config) {
    if ((_.isEmpty(config)) || (_.isEmpty(config.vistaSites))) {
        return false;
    }
    if (isPid(pid)) {
        var site = extractSiteFromPid(pid);
        if ((!_.isEmpty(site)) && (_.isObject(config.vistaSites[site]))) {
            return true;
        }
    }

    return false;           // If we got here - then it is not valid.
}

//-------------------------------------------------------------------
// True if this is a pid that is for a DOD site.
//
// pid: The patient identifier to be checked.  It will be in the form
//      of <site>;<local-identifier>.
// returns: True if this pid is for a DOD site.  False if it is not.
//-------------------------------------------------------------------
function isDod(pid) {
    return !_.isEmpty(pid) && /^DOD;[0-9a-zA-Z]+$/.test(pid);
}

//------------------------------------------------------------------------
// Returns true if HDR is in pub/sub mode.
//
// config: The worker-config settings.
// returns: True if HDR is configured in PUB/SUB mode.  False if it is not
//-------------------------------------------------------------------------
function isHdrPubSubMode(config) {
    if ((!_.isEmpty(config)) && (!_.isEmpty(config.hdr)) && (_.isString(config.hdr.operationMode)) && (config.hdr.operationMode.toLowerCase() === 'pub/sub')) {
        return true;
    }
    return false;
}

//-------------------------------------------------------------------
// True if this is a pid that is for an HDR site and the system is
// configured as HDR Req/Response mode.
//
// pid: The patient identifier to be checked.  It will be in the form
//      of <site>;<local-identifier>.
// config: The worker-config settings.
// returns: True if this pid is for a VistA site that is accessed
//          through HDR connected to VX-Sync as a secondary site.
//          False if it is not.
//-------------------------------------------------------------------
function isSecondaryHdr(pid, config) {
    if ((_.isEmpty(config)) || (_.isEmpty(config.hdr))) {
        return false;
    }
    if (!isHdrPubSubMode(config)) {
        return !_.isEmpty(pid) && /^HDR;[0-9a-zA-Z]+$/.test(pid);
    }

    return false;           // If we got here - we are not an HDR secondary pid.
}

//-------------------------------------------------------------------
// True if this is a pid that is for an HDR site that is configured
// in PUB/SUB mode and the site is set up as HDR.
//
// pid: The patient identifier to be checked.  It will be in the form
//      of <site>;<local-identifier>.
// config: The worker-config settings.
// returns: True if this pid is for a VistA site that is accessed
//          through HDR connected to VX-Sync in PUB/SUB mode.
//          False if it is not.
//-------------------------------------------------------------------
function isVistaHdr(pid, config) {
    if ((_.isEmpty(config)) || (_.isEmpty(config.hdr)) || (_.isEmpty(config.hdr.hdrSites))) {
        return false;
    }
    if ((isHdrPubSubMode(config)) && (isPid(pid))) {
        var site = extractSiteFromPid(pid);
        if ((!_.isEmpty(site)) && (_.isObject(config.hdr.hdrSites[site]))) {
            return true;
        }
    }

    return false;           // If we got here - we are not an HDR secondary pid.
}

//-------------------------------------------------------------------
// Verifies that the identifier is an HDR identifier.   This one
// checks both the styles of HDR identifier.  If it is valid under
// either style and as long as the style matches the mode that HDR
// is configured, it will return true.
//
// id: This is a string that is an identifier.  This checks this id
//     to see if it represents an ICN.
// config: The worker-config settings.
// returns: True if this identifier is an HDR identifier.  False if
//          it is not.
//-------------------------------------------------------------------
function isHdr(pid, config) {
    return (isSecondaryHdr(pid, config) || isVistaHdr(pid, config));
}

//-------------------------------------------------------------------
// True if this is a pid that is for DAS (PGD) site.
//
// pid: The patient identifier to be checked.  It will be in the form
//      of <site>;<local-identifier>.
// returns: True if this pid is for a DAS site.  False if it is not.
//-------------------------------------------------------------------
function isDas(pid) {
    return !_.isEmpty(pid) && /^DAS;[0-9a-zA-Z]+$/.test(pid);
}

//-------------------------------------------------------------------
// True if this is a pid that is for VLER site.
//
// pid: The patient identifier to be checked.  It will be in the form
//      of <site>;<local-identifier>.
// returns: True if this pid is for a VLER site.  False if it is not.
//-------------------------------------------------------------------
function isVler(pid) {
    return !_.isEmpty(pid) && /^VLER;[0-9a-zA-Z]+$/.test(pid);
}

//-------------------------------------------------------------------
// True if this is a pid that is for a secondary site.  A secondary
// site is classified as any site that is not a VistA site and is
// configured in a request/response mode.
//
// pid: The patient identifier to be checked.  It will be in the form
//      of <site>;<local-identifier>.
// config: The worker-config settings.
// returns: True if this pid is for a secondary site (Site connected
//          in (Request/Response) mode.  False if it is not.
//-------------------------------------------------------------------
function isSecondarySite(pid, config) {
    return (isDod(pid) || (isSecondaryHdr(pid, config)) || (isDas(pid)) || (isVler(pid)));
}

//---------------------------------------------------------------------------
// Return the patientIdentifier(s) from the list that is one of the types
// that is given.
//
// patientIdentifiers: An array of patientIdentifier objects to be searched.
// types: A type or an array of types to search for.
// returns: An array of patientIdentifier objects that match one of the types
//          specified.
//----------------------------------------------------------------------------
function extractIdsOfTypes(patientIdentifiers, types) {
    if (_.isEmpty(types)) {
        types = [];
    }

    if (!_.isArray(types)) {
        types = [types];
    }

    return _.filter(patientIdentifiers, function(patientIdentifier) {
        return _.contains(types, patientIdentifier.type);
    });
}

//------------------------------------------------------------------------------
// This function checks to see if any of the patientIdentifiers are for the
// type(s) specified.
//
// patientIdentifiers: An array of patientIdentifier objects to be searched.
// types: A type or an array of types to search for.
// returns: True if there is at least one for any one of the type(s) specified.
//          False if not.
//------------------------------------------------------------------------------
function hasIdsOfTypes(patientIdentifiers, types) {
    if (_.isEmpty(types)) {
        types = [];
    }

    if (!_.isArray(types)) {
        types = [types];
    }

    return _.some(patientIdentifiers, function(id) {
        return _.contains(types, id.type);
    });
}

//------------------------------------------------------------------------------
// Return an array of patient identifiers where the pid is for the given site.
//
// patientIdentifiers: An array of patientIdentifier objects to be searched.
// site: The site for which identifiers are desired.
// returns: An array of patientIdentifier where each identifier is for the
//          specified site.
//------------------------------------------------------------------------------
function extractPidBySite(patientIdentifiers, site) {
    return  _.filter(patientIdentifiers, function(patientIdentifier) {
        if ((patientIdentifier) &&
            (patientIdentifier.type === 'pid') &&
            (new RegExp('^' + site).test(patientIdentifier.value))) {
            return true;
        }
        else {
            return false;
        }
    });
}

//----------------------------------------------------------------------------------
// This function takes a pid in the form of <site>;<local-identifier> and breaks
// it appart into its separate components.
//
// pid: The patient identifier to be checked.  It will be in the form
//      of <site>;<local-identifier>.
// returns: An object in the form of { site: <site>, dfn: <local-identifier> }.  If
//          the pid is empty, it will return an object with each component set to
//          null.  If the string does not contain a ';', it will be treated as an
//          identifier without a site - so site will be null.
//----------------------------------------------------------------------------------
function extractPiecesFromPid(pid) {
    if (_.isEmpty(pid)) {
        return {
            site: null,
            dfn: null
        };
    }

    var delimiter = ';';

    if (!_.contains(pid, delimiter)) {
        return {
            site: null,
            dfn: pid
        };
    }

    var pieces = pid.split(delimiter);

    return {
        site: _.isEmpty(pieces[0]) ? null : pieces[0],
        dfn: _.isEmpty(pieces[1]) ? null : pieces[1],
    };
}

//----------------------------------------------------------------------------------
// This function takes a pid in the form of <site>;<local-identifier> and extracts
// the local-identifier and returns it.
//
// pid: The patient identifier to be checked.  It will be in the form
//      of <site>;<local-identifier>.
// returns: The local-identifier part of the pid.
//----------------------------------------------------------------------------------
function extractDfnFromPid(pid) {
    return extractPiecesFromPid(pid).dfn;
}

//----------------------------------------------------------------------------------
// This function takes a pid in the form of <site>;<local-identifier> and extracts
// the icn.  Note that this is only valid for VLER, DAS, and HDR(configured as secondary)
// and PGD sites.  This is because the ICN is the local-identifier for these sites.
//
// pid: The patient identifier to be checked.  It will be in the form
//      of <site>;<local-identifier>.
// config: The worker-config settings.
// returns: The local-identifier part of the pid.
//----------------------------------------------------------------------------------
function extractIcnFromPid(pid, config) {
    if (isVler(pid) || isSecondaryHdr(pid, config) || isDas(pid)) {
        return extractPiecesFromPid(pid).dfn;
    }
    return null;            // If we got here - there is no ICN in this pid.
}

//----------------------------------------------------------------------------------
// This function takes a pid in the form of <site>;<local-identifier> and extracts
// the site and returns it.
//
// pid: The patient identifier to be checked.  It will be in the form
//      of <site>;<local-identifier>.
// returns: The site part of the pid.
//----------------------------------------------------------------------------------
function extractSiteFromPid(pid) {
    return extractPiecesFromPid(pid).site;
}

//----------------------------------------------------------------------------------
// This function extracts the pid from the job object.
//
// job: The job containing a pid.
// returns: The pid.
//----------------------------------------------------------------------------------
function extractPidFromJob(job) {
    var pid = '';
    if ((job) &&
        (job.patientIdentifier) &&
        (job.patientIdentifier.type === 'pid') &&
        (job.patientIdentifier.value)) {
        pid = job.patientIdentifier.value;
    }
    return pid;
}

//----------------------------------------------------------------------------------------
// This method returns true if the Patient Identifier represents an identifier at a
// secondary site.
//
// patientIdentifier: The patient identifier for a patient.
// config: The worker-config settings.
// returns: True if this pid is for a secondary site.  False if it is not.
//----------------------------------------------------------------------------------------
function isSecondarySitePid(patientIdentifier, config) {
    if (!patientIdentifier) {
        return false;
    }

    if (patientIdentifier.type !== 'pid') {
        return false;
    }

    return (isSecondarySite(patientIdentifier.value, config));
}

//----------------------------------------------------------------------------------------
// This method returns true if the Patient Identifier represents an identifier at a
// Vista site that is HDR Pub/Sub connected.
//
// patientIdentifier: The patient identifier for a patient.
//----------------------------------------------------------------------------------------
function isVistaHdrSitePid(patientIdentifier, config) {
    if (!patientIdentifier) {
        return false;
    }

    if (patientIdentifier.type !== 'pid') {
        return false;
    }

    return (isVistaHdr(patientIdentifier.value, config));
}

//----------------------------------------------------------------------------------------
// This method returns true if the Patient Identifier represents an identifier at a
// Vista site that is direct connected.
//
// patientIdentifier: The patient identifier for a patient.
//----------------------------------------------------------------------------------------
function isVistaDirectSitePid(patientIdentifier, config) {
    if (!patientIdentifier) {
        return false;
    }

    if (patientIdentifier.type !== 'pid') {
        return false;
    }

    return (isVistaDirect(patientIdentifier.value, config));
}

/**
 * Returns true if the ien or dfn matches any of the entries in arr
 *
 * @param siteId The ien you want to see if it exists.
 * @param icn The patient's id you want to see if it matches anything in arr[i].patient.icn.
 * @param dfn The dfn you want to see if it matches anything in arr[i].patient.dfn.
 * @param arr The array to search through.
 * @returns {boolean} true if the ien or dfn matches any of the entries in arr.
 */
function patientExistsIn(log, siteId, icn, dfn, arr) {
    for (var i=0; i<arr.length; i++) {
        if (arr[i].siteId !== siteId) {
            continue;
        }

        if (nullUtil.isNotNullish(icn) && nullUtil.isNotNullish(arr[i].patient.icn) && arr[i].patient.icn === icn) {
            return true;
        }
        else if (nullUtil.isNotNullish(dfn) && nullUtil.isNotNullish(arr[i].patient.dfn) && arr[i].patient.dfn === dfn) {
            return true;
        }
    }
    return false;
}

//----------------------------------------------------------------------------------------
// This method returns true if the site hash passed in is a
// Vista HDR Site defined in the config.
//
// siteId: The siteId for a VistA site.
// return true if siteId is in hdrSites defined in config file.
//----------------------------------------------------------------------------------------
function isVistaHdrSite(siteId, config) {
    if (!siteId || !config) {
        return false;
    }
    if (config.hdr && config.hdr.hdrSites && _.isObject(config.hdr.hdrSites[siteId])) {
        return true;
    }
    return false;
}

module.exports.create = create;
module.exports.isIdFormatValid = isIdFormatValid;
module.exports.isIcn = isIcn;
module.exports.isEdipi = isEdipi;
module.exports.isPid = isPid;
module.exports.isVistaDirect = isVistaDirect;
module.exports.isDod = isDod;
module.exports.isHdrPubSubMode = isHdrPubSubMode;
module.exports.isVistaHdr = isVistaHdr;
module.exports.isSecondaryHdr = isSecondaryHdr;
module.exports.isHdr = isHdr;
module.exports.isDas = isDas;
module.exports.isVler = isVler;
module.exports.isSecondarySite = isSecondarySite;
module.exports.extractIdsOfTypes = extractIdsOfTypes;
module.exports.hasIdsOfTypes = hasIdsOfTypes;
module.exports.extractPiecesFromPid = extractPiecesFromPid;
module.exports.extractSiteFromPid = extractSiteFromPid;
module.exports.extractDfnFromPid = extractDfnFromPid;
module.exports.extractIcnFromPid = extractIcnFromPid;
module.exports.extractPidFromJob = extractPidFromJob;
module.exports.extractPidBySite = extractPidBySite;
module.exports.isSecondarySitePid = isSecondarySitePid;
module.exports.isVistaDirectSitePid = isVistaDirectSitePid;
module.exports.isVistaHdrSitePid = isVistaHdrSitePid;
module.exports.validFormats = _.clone(validFormats);
module.exports.patientExistsIn = patientExistsIn;
module.exports.isVistaHdrSite = isVistaHdrSite;
