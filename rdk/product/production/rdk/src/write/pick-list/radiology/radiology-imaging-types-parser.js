'use strict';

var _ = require('lodash');
var rpcUtil = require('./../utils/rpc-util');

/**
 * 6^ANGIO/NEURO/INTERVENTIONAL^ANI^37
 * The information comes from the "Imaging Type" file [^RA(79.2; #79.2]
 * The "6" is the IEN to the file, so:
 * ^RA(79.2,6,0)="ANGIO/NEURO/INTERVENTIONAL^^ANI^N^^152"
 * "ANGIO/NEURO/INTERVENTIONAL" is the "Type of Imaging"
 * "ANI" is the "Abbreviation"
 * 37 is the IEN for the "Display Group" file
 *
 * @param logger The logger
 * @param fields an array of items to populate the entry with.
 */
function createEntry(logger, fields) {
    var obj = {
        ien: fields[0],
        typeOfImaging: fields[1],
        abbreviation: fields[2],
        ienDisplayGroup: fields[3]
    };

    logger.debug({obj: obj});
    return obj;
}

/**
 * Takes the return string from the RPC 'ORWDRA32 IMTYPSEL' and parses out the data.<br/><br/>
 *
 * Example of the RPC Data that is returned:<br/>
 * <pre>
 * 6^ANGIO/NEURO/INTERVENTIONAL^ANI^37
 * 5^CT SCAN^CT^35
 * 9^MAMMOGRAPHY^MAM^42
 * 4^MAGNETIC RESONANCE IMAGING^MRI^36
 * 2^NUCLEAR MEDICINE^NM^39
 * 1^GENERAL RADIOLOGY^RAD^9
 * 3^ULTRASOUND^US^40
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
    lines = rpcUtil.removeEmptyValues(lines);

	var FIELD_LENGTH_EXPECTED = 4;

    var obj = null;

    _.each(lines, function(line) {
        var fields = line.split('^');
        if (fields.length === FIELD_LENGTH_EXPECTED) {
        	obj = createEntry(logger, fields);
        }
        else {
        	logger.error('The RPC "ORWDRA32 IMTYPSEL" returned data but we couldn\'t understand it: ' + line);
        }

        if (obj) {
            retValue.push(obj);
        }
    });

	//console.log(JSON.stringify(retValue, null, 2));
    logger.info({retValue: retValue});
    return retValue;
};
