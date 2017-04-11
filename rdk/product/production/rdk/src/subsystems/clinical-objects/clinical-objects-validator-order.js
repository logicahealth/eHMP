'use strict';
var _ = require('lodash');

// validate clinical order objects

module.exports.validateModel = validateModel;

function validateModel(errorMessages, model, appConfig, callback) {
    if (!_.isObject(model)) {
        errorMessages.push('model is not an object');
        return;
    }
    if (model.domain !== 'ehmp-order' && model.domain !== 'ehmp-activity') {
        errorMessages.push('Order Clinical Object has the wrong domain');
    } else {
        var subDomain = model.subDomain || 'invalid';
        if (!_.includes(['laboratory', 'consult'], subDomain.toLowerCase())) {
            errorMessages.push('Invalid SubDomain');
        }

        if (model.ehmpState === 'draft') {
            if (!_.isEmpty(model.referenceId)) {
                errorMessages.push('Draft Order should not have a referenceId');
            }
            if (model.subDomain === 'laboratory') {
                if (!_.isEmpty(model.data)) {
                    if (_.isEmpty(model.data.labTestText)) {
                        errorMessages.push('Missing Lab Text');
                    }
                }
            }
        } else if (model.ehmpState === 'active') {
            if (_.isEmpty(model.referenceId)) {
                errorMessages.push('Active Order should have a referenceId');
            }
        }

    }

    callback(errorMessages);
}
