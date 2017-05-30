define([
    'underscore',
    'api/Messaging',
    'main/overrides/function'
], function(
    _,
    Messaging,
    FunctionOverrides
) {
    "use strict";

    var getErrorCallback = function getErrorCallback(key) {
        return function(error, args) {
            var errorMessage = _.get(this, '_uniqueId', '') + ' ' + error.name + ' when "' + key + '" method is called. (' + _.get(this, 'cid', '') + ') ';
            console.error(errorMessage, error);
            Messaging.trigger('register:execution:error', {
                _type: 'uncaught',
                message: errorMessage.trim(),
                details: {
                    // Removing till there is a better solution to reduce argument size
                    // methodArguments: args,
                    error: {
                        message: _.get(error, 'message'),
                        stackTrace: _.get(error, 'stack')
                    }
                }
            });
        };
    };

    var functionsToWrapInTryCatch = {
        'constructor': {
            onError: getErrorCallback('constructor'),
            omitKeys: ['Model', 'Collection'] // Model/Collection.prototype.clone calls `this.constructor`, which barfs
        },
        'triggerMethod': {
            onError: getErrorCallback('triggerMethod')
        },
        'listenTo': {
            getArguments: function(object, event, callback) {
                if (_.isFunction(callback)) {
                    callback.onError = getErrorCallback('listenTo');
                    callback.call = callback.try;
                } else if (_.isObject(event)) {
                    _.each(event, function(callback, eventString) {
                        if (!_.isFunction(callback)) return;
                        callback.onError = getErrorCallback('listenTo');
                        callback.call = callback.try;
                    });
                }
            }
        },
        'parse': {
            onError: getErrorCallback('parse')
        }
    };
    return {
        getErrorCallback: getErrorCallback,
        functionsToWrapInTryCatch: functionsToWrapInTryCatch
    };
});
