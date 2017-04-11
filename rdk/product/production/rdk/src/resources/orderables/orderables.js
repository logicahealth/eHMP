'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');

function reportError(errorStr, logger, callback) {
    logger.error(errorStr);
    return callback(errorStr);
}

function getResourcePath(site, searchString) {
	var resourcePath = 'resource/write-pick-list/orderables/?site=' + site;
    if (_.isString(searchString)) {
        resourcePath += '&searchString=' + searchString;
    }
    return resourcePath;
}

module.exports.getOrderables = function(req, res) {
    var searchString = req.param('searchString');
    fetchOrderables(req, searchString, function(error, result) {
        if (error) {
            var notFoundMessage = 'Error retrieving orderables.';
            req.logger.error(notFoundMessage);
            return res.status(rdk.httpstatus.not_found).rdkSend(notFoundMessage);
        }
		var formattedOrderables = formatOrderables(result, req.session.user.site);

        return res.status(rdk.httpstatus.ok).rdkSend(formattedOrderables);
    });
};

function formatOrderables(orderables, site) {

	var items = [];

	_.each(orderables, function(orderable) {

		if(orderable.typeOfOrderable === 'lab') {
			var item = {};
			item.uid = orderable.ien;
			item.type = 'vista-orderable';
			item.domain = 'ehmp-order';
			item.subDomain = 'laboratory';
			item['facility-enterprise'] = site;
			item.state = 'active';
			item.name = orderable.synonym;

			items.push(item);

		} else if(orderable.typeOfOrderable === 'entr') {

            delete orderable.typeOfOrderable;
			items.push(orderable);

		}

	});

	return items;

}

function fetchOrderables(req, searchString, callback) {

    var config = req.app.config;
    var options = _.extend({}, config.pickListServer, {
        url: getResourcePath(req.session.user.site, searchString),
        logger: req.logger,
        json: true,
        headers: {
            authorization: req.headers.authorization,
            cookie: req.headers.cookie // reuse caller's authentication when calling the pick-list server
        }
    });

    rdk.utils.http.get(options, function(error, response, body) {
        req.logger.debug('orderables:: callback from get()');

        if (error) {
            return reportError('Error fetching orderables' + ' - ' + (error.message || error), req.logger, callback);
        }
        if (body.status !== rdk.httpstatus.ok) {
            return reportError('orderables:: Error: ' + body.status, req.logger, callback);
        }
        if (body.data) {
            return callback(null, body.data);
        }
        return reportError('There was an error processing your request. The error has been logged.', req.logger, callback);
    });
}
