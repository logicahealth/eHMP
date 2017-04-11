'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');

function reportError(errorStr, logger, callback) {
    logger.error(errorStr);
    return callback(errorStr);
}

function getResourcePath(site, searchString) {
    var resourcePath = '/resource/write-pick-list?type=lab-order-orderable-items&labType=S.LAB' + '&site=' + site;
    if (_.isString(searchString)) {
        resourcePath += '&searchString=' + searchString;
    }
    return resourcePath;
}

module.exports.getOrderables = function(req, searchString, callback) {
    var config = req.app.config;

    var options = _.extend({}, config.pickListServer, {
        url: getResourcePath(req.session.user.site, searchString),
        logger: req.logger,
        json: true,
        headers: {
            cookie: req.headers.cookie // reuse caller's authentication when calling the pick-list server
        }
    });

    rdk.utils.http.get(options, function(error, response, body) {
        req.logger.debug('lab-orderables:: callback from get()');

        var errorStr;

        if (error) {
            return reportError('Error fetching lab orderables' + ' - ' + (error.message || error), req.logger, callback);
        }
        if (body.status !== rdk.httpstatus.ok) {
            return reportError('lab-orderables:: Error: ' + body.status, req.logger, callback);
        }
        if (body.data) {
            return callback(null, body.data);
        }
        return reportError('There was an error processing your request. The error has been logged.', req.logger, callback);
    });
};
