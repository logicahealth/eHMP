'use strict';

var _ = require('lodash');
var rpcUtil = require('./../utils/rpc-util');

function createNewClinic(logger, fields) {
    var newClinic = {
        ien: fields[0],
        name: fields[1]
    };

    logger.debug({newClinic: newClinic});
    return newClinic;
}


/**
 * Takes the return string from the RPC 'ORQQPL SRVC SRCH' and parses out the data.<br/><br/>
 *
 * Each element is as follows:<br/>
 * 1. IEN<br/>
 * 2. name <br/>
 *
 * Example of the RPC Data that is returned:<br/>
 * <pre>
 * 64^AUDIOLOGY
 * 195^CARDIOLOGY
 * 137^COMP AND PEN
 * 246^CWT CLINIC
 * 228^DENTAL
 * 62^DERMATOLOGY
 * 285^DIABETIC
 * 191^DIABETIC TELERET READER LOCAL
 * 193^DIABETIC TELERET READER REMOTE
 * 190^DIABETIC TELERETINAL IMAGER
 * 426^EMERGENCY ROOM
 * 133^EMPLOYEE HEALTH
 * 422^ENDOCRINE
 * 23^GENERAL MEDICINE
 * 298^GENERAL SURGERY
 * 935^GYNECOLOGIST CLINIC
 * 229^HEMATOLOGY
 * 128^MAMMOGRAM
 * 17^MENTAL HEALTH
 * 438^MENTAL HEALTH GROUP THERAPY
 * 26^MENTAL HYGIENE-OPC
 * 430^NEUROLOGY
 * 432^NEUROSURGERY
 * 114^NUCLEAR MEDICINE
 * 234^OBSERVATION
 * 437^OPHTHALMOLOGY
 * 433^PHYSICAL THERAPY
 * 127^PLASTIC SURGERY
 * 233^PODIATRY
 * 32^PRIMARY CARE
 * 435^PRIMARY CARE TELEPHONE
 * 427^REHAB MEDICINE
 * 31^SOCIAL WORK
 * 431^SPEECH PATHOLOGY
 * 239^SURGICAL CLINIC
 * 441^TESTCLINIC001
 * 442^TESTCLINIC002
 * 443^TESTCLINIC003
 * 444^TESTCLINIC004
 * 445^TESTCLINIC005
 * 446^TESTCLINIC006
 * 447^TESTCLINIC007
 * 448^TESTCLINIC008
 * 449^TESTCLINIC009
 * </pre>
 *
 * @param logger The logger
 * @param rpcData The String from the RPC that you want parsed
 * @returns {Array}
 */
module.exports.parse = function(logger, rpcData) {

    logger.info({rpcData: rpcData});

    var retValue = [];
    var lines = rpcData.split('\r\n');
    lines = rpcUtil.removeEmptyValues(lines);

    var FIELD_LENGTH_EXPECTED = 2;

    _.each(lines, function(line) {
        var newClinic;
        var fields = line.split('^');
        if (fields.length === FIELD_LENGTH_EXPECTED) {
            newClinic = createNewClinic(logger, fields);
            retValue.push(newClinic);
        }
        else {
            throw new Error('The RPC returned data but we couldn\'t understand it: ' + rpcData);
        }
    });

    logger.info({retValue: retValue});
    return retValue;
};
