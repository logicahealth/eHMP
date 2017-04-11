'use strict';

var _ = require('lodash');
var authentication = require('../../../core/rdk').utils.authentication;

module.exports.getSiteAbbreviation = function(vistaSitesConfig, stationNumber) {
    return vistaSitesConfig[this.getSiteCode(vistaSitesConfig, stationNumber)].abbreviation;
};

module.exports.getSiteCode = function(vistaSitesConfig, stationNumber) {
    return authentication.getSiteCode(vistaSitesConfig, stationNumber);
};
