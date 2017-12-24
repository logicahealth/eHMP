'use strict';

var xformer = require(global.VX_HANDLERS + 'jmeadows-xform-domain-vpr/v2_3_0/jmeadows-progressNote-xformer');

function dodDischargeSummaryToVPR(logger, dodDischargeSummary, edipi){
    //Uses the same transformation as Progress Note
    return xformer(logger, dodDischargeSummary, edipi);
}

module.exports = dodDischargeSummaryToVPR;