'use strict';

var _ = require('lodash');

module.exports = function(req, res, next) {
    req.logger.debug('subsystemCheckInterceptor invoked');
    var subsystems = _.get(req, '_resourceConfigItem.subsystems');
    if (_.isEmpty(subsystems)) {
        return next();
    }
    if (!_.isArray(subsystems)) {
        req.logger.warn('resource ' + req._resourceConfigItem.title + ' does not have a proper subsystems array');
        return next();
    }
    var missingSubsystem = _.find(subsystems, function(subsystem) {
        return !_.has(req.app.subsystems, subsystem);
    });
    if (missingSubsystem) {
        req.logger.info('The resource ' + req._resourceConfigItem.title + 'depends on the ' + missingSubsystem + ' subsystem, which is not currently deployed.');
        return res.status(503).rdkSend('This resource depends on the ' + missingSubsystem + ' subsystem, which is not currently deployed.');
    }
    next();
};
