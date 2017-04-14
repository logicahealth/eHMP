'use strict';

//-----------------------------------------------------------------------------------
//  This module contains utilities for manipulating the worker-config.json structure.
//
// Author: Les Westberg
//------------------------------------------------------------------------------------

var _ = require('underscore');

//------------------------------------------------------------------------------------
// This function creates a node containing the vistA sites set up so they are keyed
// by stationNumber rather than by siteHash.
//
// config: The worker config file.
// returns The worker config file that has been changed.
//-----------------------------------------------------------------------------------
function createVistaSitesByStationCombined(config) {
    if (!_.isObject(config)) {
        return config;
    }

    var vistaSitesByStationCombined = {};

    // First pick up the vistaSites items.
    //------------------------------------
    if (_.isObject(config.vistaSites)) {
        _.each(config.vistaSites, function(vistaSite, siteHash) {
            if ((_.isObject(vistaSite)) && (vistaSite.stationNumber)) {
                vistaSite.siteHash = siteHash;
                vistaSitesByStationCombined[String(vistaSite.stationNumber)] = vistaSite;
            }
        });
    }

    // Next pick up the HDR sites items
    //----------------------------------
    if ((_.isObject(config.hdr)) && (_.isObject(config.hdr.hdrSites))) {
        _.each(config.hdr.hdrSites, function(hdrSite, siteHash) {
            if ((_.isObject(hdrSite)) && (hdrSite.stationNumber)) {
                hdrSite.siteHash = siteHash;
                vistaSitesByStationCombined[String(hdrSite.stationNumber)] = hdrSite;
            }
        });
    }

    config.vistaSitesByStationCombined = vistaSitesByStationCombined;
    return config;
}

module.exports.createVistaSitesByStationCombined = createVistaSitesByStationCombined;