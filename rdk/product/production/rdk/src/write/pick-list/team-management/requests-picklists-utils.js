'use strict';

var _ = require('lodash');

function getSiteAbbreviation(vistaSitesConfig, stationNumber) {
    return vistaSitesConfig[getSiteCode(vistaSitesConfig, stationNumber)].abbreviation;
}
module.exports.getSiteAbbreviation = getSiteAbbreviation;

function getSiteCode(vistaSitesConfig, stationNumber) {
    var answer;
    var siteCodes = _.keys(vistaSitesConfig)
    for (var i = 0; i < siteCodes.length; i++) {
        //RDK config files still list division but not station number, so look this up by division for now.
        if (vistaSitesConfig[siteCodes[i]].division === stationNumber) {
            answer = siteCodes[i];
            break;
        }
    }
    return answer;
}
module.exports.getSiteCode = getSiteCode;
