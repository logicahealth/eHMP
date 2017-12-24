'use strict';

var vistaConfig = require('../../../core/rdk').utils.vistaConfig;
var _ = require('lodash');

module.exports.getSiteAbbreviation = function(vistaSitesConfig, stationNumber) {
    if (_.isUndefined(vistaSitesConfig[this.getSiteCode(vistaSitesConfig, stationNumber)])) {
        return stationNumber;
    }
    return vistaSitesConfig[this.getSiteCode(vistaSitesConfig, stationNumber)].abbreviation;
};

module.exports.getSiteCode = function(vistaSitesConfig, stationNumber) {
    return vistaConfig.getSiteCode(vistaSitesConfig, stationNumber);
};
