'use strict';

var rdk = require('../../core/rdk');
var httpUtil = rdk.utils.http;
var _ = require('lodash');

function reportError(errorStr, logger, callback) {
    logger.error(errorStr);
    return callback(errorStr);
}

function getResourcePath(site, searchString) {
    //TODO:  Note that this is a placeholder ONLY and will be modified
    //       when true RAD type pick-list resource becomes available.
    var resourcePath = '/resource/write-pick-list?type=lab-order-orderable-items&labType=S.LAB' + '&site=' + site;
    if (_.isString(searchString)) {
        resourcePath += '&searchString=' + searchString;
    }
    return resourcePath;
}
module.exports.getOrderables = function(req, searchString, callback) {

    //    var config = req.app.config;
    //
    //    // TODO: Get with rdk-pick-list-server's ip/port from the config file
    //    config.picklistServer = {
    //        // 'baseUrl': 'http://IP             '
    //        'baseUrl': 'http://localhost:7777'
    //    };
    //    //
    //
    //    var user = req.session.user;
    //
    //    var options = _.extend({}, config.picklistServer, {
    //        url: getResourcePath(user.accessCode, user.verifyCode, user.site, searchString),
    //        logger: req.logger,
    //        json: true
    //    });
    //
    //    rdk.utils.http.get(options, function(error, response, body) {
    //        var errorStr;
    //
    //        req.logger.debug('rad-orderables:: callback from get()');
    //
    //        if (error) {
    //            return reportError('Error fetching rad orderables' + ' - ' + (error.message || error), req.logger, callback);
    //        }
    //        if (body.status !== rdk.httpstatus.ok) {
    //            return reportError('rad-orderables:: Error: ' + body.status, req.logger, callback);
    //        }
    //        if (body.data) {
    //            return callback(null, body.data);
    //        }
    //        return reportError('There was an error processing your request. The error has been logged.', req.logger, callback);
    //    });
    return callback(null, []); // TODO: Returning empty set until rads domain gets implemented.

};
