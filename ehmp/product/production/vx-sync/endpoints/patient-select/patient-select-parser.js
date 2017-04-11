'use strict';

var _ = require('lodash');

/**
 * Full Name^Family Name^Given Name(s)^Display Name^Gender Code^Gender Name^SSN^Last4^Last5^Date of birth^Sensitive^LocalId^PID^ICN^Summary
 *
 * @param logger The logger
 * @param fields an array of items to populate the entry with.
 */
function createEntry(logger, fields) {
    var obj = {
        fullName: fields[0],
        familyName: fields[1],
        givenNames: fields[2],
        displayName: fields[3],
        genderCode: fields[4],
        genderName: fields[5],
        ssn: fields[6],
        last4: fields[7],
        last5: fields[8],
        birthDate: fields[9],
        sensitive: getBooleanValue(fields[10]),
        localId: fields[11],
        pid: fields[12],
        icn: fields[13],
        summary: fields[14]
    };

    logger.debug({obj: obj});
    return obj;
}

function getBooleanValue(value) {
    if (_.isBoolean(value)) {
        return Boolean(value);
    }
    else if (_.isString(value)) {
        if (value.toLowerCase() === 'true') {
            return true;
        }
        if (value.toLowerCase() === 'false') {
            return false;
        }
        else {
            throw new Error("String '" + value + "' was not a boolean value");
        }
    }
    else {
        throw new Error("Was not a boolean value it is a: " + typeof value);
    }
}

/**
 * Takes the return string from the RPC 'HMP PATIENT SELECT' and parses out the data.<br/><br/>
 *
 * Example of the RPC Data that is returned:<br/>
 * <pre>
 * Returns a list of patient data, one line per patient, in format:<br/>
 * Full Name^Family Name^Given Name(s)^Display Name^Gender Code^Gender Name^SSN^Last4^Last5^Date of birth^Sensitive^LocalId^PID^ICN^Summary<br/>
 * Or returns -1^Error message if error<br/>
 * If no patients found, returns empy list
 * </pre>
 * END Example of the RPC Data that is returned:<br/>
 *
 * @param logger The logger
 * @param rpcData The string to parse
 */
module.exports.parse = function(logger, rpcData) {
    logger.info({rpcData: rpcData});

    var retValue = [];
    var lines = rpcData.split('\r\n');
    lines = _.filter(lines, Boolean);

    //Check to see if an error occurred.
    if (lines.length === 1 && lines[0].split('^').length === 2 && lines[0].split('^')[0] === '-1') {
        throw new Error(lines[0].split('^')[1]);
    }

    var FIELD_LENGTH_EXPECTED = 15;

    var obj = null;

    _.each(lines, function(line) {
        var fields = line.split('^');

        if (fields.length >= FIELD_LENGTH_EXPECTED) {
        	obj = createEntry(logger, fields);
        }
        else {
        	logger.error('The RPC "HMP PATIENT SELECT" returned data but we couldn\'t understand it: ' + line);
        	obj = null;
        }

        if (obj) {
            retValue.push(obj);
        }
    });

	//console.log(JSON.stringify(retValue, null, 2));
    logger.info({retValue: retValue});
    return retValue;
};
