'use strict';

var _ = require('lodash');
var rdk = require('../core/rdk');
var nullchecker = rdk.utils.nullchecker;

module.exports.getSiteCode = function(vistaSitesConfig, division) {
    var siteHash;
    if (_.isUndefined(vistaSitesConfig) || _.isUndefined(division)) {
        return siteHash;
    }
    _.each(vistaSitesConfig, function(site, hash) {
        var id = _.find(site.division, {
            id: division.toString()
        });
        if (!_.isUndefined(id)) {
            siteHash = hash;
            return false;
        }
    });
    return siteHash;
};

/**
 *  Returns an array of division ids for the specified site
 *
 *  @param vistaSitesConfig (required): array of site config objects
 *  @param siteHash (optional): an available site hash (i.e. 'SITE')
 *  When no siteHash is provided, unique division ids from all sites are returned
 *  @return array of division ids
 */
module.exports.getSiteDivisions = function(vistaSitesConfig, siteHash) {
    var divisions = [];

    if (_.isUndefined(vistaSitesConfig)) {
        return divisions;
    }

    if (nullchecker.isNotNullish(siteHash)) {
        divisions = _.map(_.get(vistaSitesConfig, [siteHash, 'division']), 'id');
    } else {
        _.each(vistaSitesConfig, function(site, hash) {
            divisions = _.union(divisions, _.map(site.division, 'id'));
        });
    }

    return divisions;
};
