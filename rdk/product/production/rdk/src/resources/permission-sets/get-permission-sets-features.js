'use strict';

var rdk = require('../../core/rdk');
var pjdsUtil = rdk.utils.pjdsUtil;
var RdkError = rdk.utils.RdkError;

var getList = function(req, res) {
    pjdsUtil.getPermissionSetFeatures(req, function(error, response) {
        if (error) {
            var rdkError = new RdkError({
                code: '202.500.1006',
                logger: req.logger,
                error: error
            });
            return res.status(rdkError.status).rdkSend(rdkError);
        }
        return res.status(rdk.httpstatus.ok).rdkSend(response);
    });
};

module.exports = getList;
