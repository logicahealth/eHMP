'use strict';

var _ = require('lodash');

/**
 * Get a list of resources available from the RDK configuration
 * @param {Object} req - the general express request
 * @param {Object} res - the general express response
 * @return {Array} - a list of Vista sites
 */
function listResource(req, res) {
    var vistaSites = _.clone(req.app.config.vistaSites || {});
    var result = {};
    result.data = {};
    result.data.items = [];
    _.each(vistaSites, function(vistaSiteInfo, vistaSite) {
        _.each(vistaSiteInfo.division, function(div) {
            div.division = div.id;
            result.data.items.push(_.extend(
                _.pick(div, ['name', 'division']),
                _.pick(vistaSiteInfo, ['stationNumber', 'production']),
                {siteCode: vistaSite}
            ));
        });
    });
    result.data.items = _.sortBy(result.data.items, 'name');
    return res.status(200).rdkSend(result);
}

module.exports.get = listResource;
