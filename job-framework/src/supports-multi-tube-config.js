'use strict';

var _ = require('underscore');

//---------------------------------------------------------------------------------------------
// This is used to determine if a beanstalk tube is configured to support multiple tubes.
// Used by both the vxsync framework publisher and worker objects.
//---------------------------------------------------------------------------------------------

module.exports = function(logger, beanstalkJobTypeConfig) {
    if (_.isUndefined(beanstalkJobTypeConfig.tubeDetails) || _.isEmpty(beanstalkJobTypeConfig.tubeDetails)) {
        return false;
    }

    var invalid = _.reject(beanstalkJobTypeConfig.tubeDetails, function(detail, index) {
        var valid = true;

        if (_.isUndefined(detail.priority) || _.isUndefined(detail.priority.startValue) || _.isUndefined(detail.priority.endValue)) {
            logger.warn('Publisher.findTubeIndexByPriority(): Invalid tube priority configuration for tube %s. priority.startValue and priority.endValue are required.', index);
            valid = false;
        } else if (!_.isNumber(detail.priority.startValue) || !_.isNumber(detail.priority.endValue) ) {
            logger.warn('Publisher.findTubeIndexByPriority(): Invalid tube priority configuration for tube %s. priority.startValue and priority.endValue must be numbers.', index);
            valid = false;
        } else if (detail.priority.startValue < 1 || detail.priority.startValue > 100 || detail.priority.endValue < 1 || detail.priority.endValue > 100) {
            logger.warn('Publisher.findTubeIndexByPriority(): Invalid tube priority configuration for tube %s. priority.startValue and priority.endValue values must be between 1 and 100.', index);
            valid = false;
        } else if (detail.priority.endValue < detail.priority.startValue) {
            logger.warn('Publisher.findTubeIndexByPriority(): Invalid tube priority configuration for tube %s. priority.startValue must less than or equal to priority.endValue.', index);
            valid = false;
        } else if (_.isUndefined(detail.ratio) || !_.isNumber(detail.ratio) || detail.ratio % 1 !== 0 || detail.ratio < 1) {
            logger.warn('Publisher.findTubeIndexByPriority(): Invalid tube ratio configuration for tube %s. ratio must be a integer greater than zero.', index);
            valid = false;
        }

        return valid;
    });

    return _.isEmpty(invalid);
};
