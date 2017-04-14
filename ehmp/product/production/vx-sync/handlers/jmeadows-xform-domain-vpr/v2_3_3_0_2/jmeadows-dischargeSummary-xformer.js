'use strict';

var xformer = require(global.VX_HANDLERS + 'jmeadows-xform-domain-vpr/v2_3_1/jmeadows-progressNote-xformer');

function dodDischargeSummaryToVPR(dodDischargeSummary, edipi){
    //Uses the same transformation as Progress Note
    return xformer(dodDischargeSummary, edipi);
}

module.exports = dodDischargeSummaryToVPR;