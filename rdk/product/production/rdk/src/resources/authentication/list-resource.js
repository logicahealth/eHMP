'use strict';

var _ = require('lodash');

function listResource(req, res) {
    var vistaSites = _.clone(req.app.config.vistaSites || {});
    var result = {};
    result.data = {};
    result.data.items = [];
    _.each(vistaSites, function(vistaSiteInfo, vistaSite) {
        result.data.items.push(_.extend(
            _.pick(vistaSiteInfo, ['name', 'division']),
            {siteCode: vistaSite}
        ));
    });
    result.data.items = _.sortBy(result.data.items, 'name');
    return res.status(200).rdkSend(result);
}

module.exports.get = listResource;
