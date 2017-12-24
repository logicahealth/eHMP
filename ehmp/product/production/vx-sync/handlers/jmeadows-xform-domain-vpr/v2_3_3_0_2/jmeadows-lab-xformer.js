'use strict';
var _ = require('underscore');
var moment = require('moment');
var uidUtils = require(global.VX_UTILS + 'uid-utils');
var xformUtils = require(global.VX_UTILS + 'xform-utils');


function dodLabToVPR(logger, dodLab, edipi) {
    var vprLab = {};

    vprLab.codes = xformUtils.transformCodes(dodLab.codes);

    vprLab.facilityCode = 'DOD';
    vprLab.facilityName = dodLab.site.moniker;

    var accession = dodLab.accession || '';
    vprLab.localId = accession;


    var dodTestTypeToVPR = {
        CHEM: 'CH',
        MICRO: 'MI',
        AP: 'AP'
    };

    vprLab.labType = dodTestTypeToVPR[dodLab.testType];

    vprLab.categoryCode = 'urn:va:lab-category:' + vprLab.labType;

    var labTypeToCategoryName = {
        CH: 'Laboratory',
        AP: 'Pathology',
        MI: 'Microbiology'
    };

    vprLab.categoryName = labTypeToCategoryName[vprLab.labType] || '';

    //FUTURETODO: figure out timezone adjustments...
    if (dodLab.orderDate) {
        vprLab.observed = moment(dodLab.orderDate, 'x').format('YYYYMMDDHHmmss');
    }

    vprLab.resulted = moment(dodLab.resultDate, 'x').format('YYYYMMDDHHmmss');

    vprLab.specimen = dodLab.specimen;
    vprLab.orderId = dodLab.orderId;
    vprLab.comment = dodLab.comment;
    vprLab.units = dodLab.units;

    vprLab.result = dodLab.result;
    vprLab.summary = dodLab.testName || null;

    vprLab.kind = vprLab.categoryName;
    vprLab.displayName = dodLab.testName;

    if (dodLab.referenceRange) {
        // Not sure this REGEX is very well designed, but it is an exact copy from eHMP
        var referenceRange = /\(*(\d*\.*\d*)\s*-\s*(\d*\.*\d*)\)*/.exec(dodLab.referenceRange);
        if (referenceRange) {
            vprLab.low = referenceRange[1] || null;
            vprLab.high = referenceRange[2] || null;
        }
    }

    if (isChemLab(dodLab)) {
        vprLab.organizerType = 'organizerType';
        vprLab.typeName = dodLab.testName;

        var code = _.findWhere(dodLab.codes, {
            system: 'DOD_NCID'
        });

        if (_.isEmpty(code.code)) {
            logger.error('v2_3_3_0_2/jmeadows-lab-xformer.dodLabToVPR() transforming ChemLab for edipi: %s, but DOD_NCID code is empty. ' +
                    'This implies that there is a possibility that multiple events for this patient may end up having the same UID and that ' +
                    'one may overwrite the others.\n %j', edipi, dodLab);
        }

        if (dodLab.cdrEventId) {
            // Multiple ChemLabs can have the same cdrEventId, so it is
            // necessary to use the code value to make it unique.
            vprLab.uid = uidUtils.getUidForDomain('lab', 'DOD', edipi, dodLab.cdrEventId) + '_' + code.code;
        } else {
            vprLab.uid = generateCustomLabUid(dodLab, vprLab, edipi);
        }
    } else { //AP or MI
        vprLab.organizerType = 'accession';
        vprLab.typeName = null;

        if (dodLab.cdrEventId) {
            vprLab.uid = uidUtils.getUidForDomain('lab', 'DOD', edipi, dodLab.cdrEventId);
        } else {
            vprLab.uid = generateCustomLabUid(dodLab, vprLab, edipi);
        }
    }

    vprLab.pid = 'DOD;' + edipi;

    vprLab.statusName = dodLab.resultStatus || 'completed';
    vprLab.statusCode = 'urn:va:lab-status:' + vprLab.statusName;

    vprLab.sensitive = dodLab.sensitive;

    vprLab.interpretationCode = '';
    vprLab.interpretationName = '';
    if (dodLab.interpretation && !_.isEmpty(dodLab.interpretation)) {
        var dodHiLoFlagToHl7Abnormal = {
            'critical low': {
                code: 'urn:hl7:observation-interpretation:LL',
                name: 'Low alert'
            },
            'lower than normal': {
                code: 'urn:hl7:observation-interpretation:L',
                name: 'Low'
            },
            'critical high': {
                code: 'urn:hl7:observation-interpretation:HH',
                name: 'High alert'
            },
            'higher than normal': {
                code: 'urn:hl7:observation-interpretation:H',
                name: 'High'
            }
        };

        var hl7Abnormal = dodHiLoFlagToHl7Abnormal[dodLab.interpretation.toLowerCase()] || {
            code: '',
            name: ''
        };

        vprLab.interpretationCode = hl7Abnormal.code;
        vprLab.interpretationName = hl7Abnormal.name;
    }

    if (!isChemLab(dodLab)) {
        var results = [{}];
        if (vprLab.labType === 'AP') {
            results[0].localTitle = 'PATHOLOGY REPORT';
            results[0].summary = 'PATHOLOGY REPORT';
        } else if (vprLab.labType === 'MI') {
            results[0].localTitle = 'MICROBIOLOGY REPORT';
            results[0].summary = 'MICROBIOLOGY REPORT';
        }
        results[0].resultUid = vprLab.uid.replace('lab', 'document');
        results[0].uid = vprLab.uid;
        vprLab.results = results;
        return [vprLab, getVPRDocument(vprLab, edipi)];
    } else {
        return vprLab;
    }
}

function getVPRDocument(vprLab) {
    var vprDocument = {
        documentTypeName: 'Laboratory Report',
        author: '',
        authorDisplayName: '',
        status: vprLab.statusName,
        statusName: vprLab.statusName,
        facilityName: 'DOD',
        facilityCode: 'DOD',
        pid: vprLab.pid,
        uid: vprLab.uid.replace('lab', 'document')
    };
    if (vprLab.labType === 'AP') {
        vprDocument.localTitle = 'PATHOLOGY REPORT';
    } else if (vprLab.labType === 'MI') {
        vprDocument.localTitle = 'MICROBIOLOGY REPORT';
    }
    vprDocument.referenceDateTime = vprLab.observed || vprLab.resulted || '';

    if (vprLab.result) {
        vprDocument.text = [{
            content: vprLab.result,
            dateTime: vprDocument.referenceDateTime,
            status: 'completed',
            uid: vprDocument.uid,
            summary: 'DocumentText{uid=\'' + vprDocument.uid + '\'}'
        }];
    }

    return vprDocument;
}

function isChemLab(dodLab) {
    return dodLab.testType === 'CH' || dodLab.testType === 'CHEM';
}

// Generate DOD lab UID for labs without cdr event ids.
function generateCustomLabUid(dodLab, vprLab, edipi) {
    var modifiedLocalId = null;
    if (vprLab.observed) {
        modifiedLocalId = vprLab.observed;
    } else {
        modifiedLocalId = vprLab.resulted;
    }

    if (modifiedLocalId && vprLab.localId) {
        modifiedLocalId += '_';
    }
    if (vprLab.localId) {
        modifiedLocalId += vprLab.localId.replace(/[ \^]/g, '-');
    }
    var uidCode = '';
    var code = _.findWhere(dodLab.codes, {
        system: 'DOD_NCID'
    });
    if (code) {
        uidCode = code.code;
    }
    if (uidCode) {
        modifiedLocalId += '_' + uidCode;
    }

    return uidUtils.getUidForDomain('lab', 'DOD', edipi, modifiedLocalId);
}

module.exports = dodLabToVPR;