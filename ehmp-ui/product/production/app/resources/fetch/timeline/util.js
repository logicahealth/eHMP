define([
    'underscore'
], function (_) {
    'use strict';

    return {
        getEnteredBy: function (response) {
            var kind = _.get(response, 'displayType', '').toLowerCase();
            if (kind === 'visit' && !_.isEmpty(response.createdByName)) {
                return response.createdByName;
            } else if (kind === 'consult' && !_.isEmpty(response.providerName)) {
                return response.providerName;
            } else if (response.providers) {
                var provider = _.find(response.providers, function (provider) {
                    if (!_.isEmpty(provider.providerName)) {
                        return true;
                    }
                });

                if (!_.isUndefined(provider)) {
                    return provider.providerName;
                }
            } else {
                if (!_.isUndefined(response.primaryProvider)) {
                    return response.primaryProvider.providerName;
                } else if (!_.isEmpty(response.secondaryProvider)) {
                    return response.secondaryProvider.toUpperCase();
                } else if (!_.isEmpty(response.providerName)) {
                    return response.providerName.toUpperCase();
                }
            }
            return undefined;
        },
        getDisplayType: function (response) {
            if (_.get(response, 'kind', '').toLowerCase() === 'visit') {
                var type = _.get(response, 'uid', '').split(/\:/)[2];
                if (type === 'appointment') {
                    return 'Appointment';
                }
                return 'Visit';
            }
            return response.kind;
        }
    };
});