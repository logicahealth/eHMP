define(['api/Messaging'], function(Messaging) {
    "use strict";

    var loadedResources = {};
    var ResourceBuilder = {
        build: function() {
            if (_.isUndefined(this.id) || _.isUndefined(this.resources)) return;
            var resource = loadedResources[this.id] = {};
            _.each(this.resources, function(val, key) {
                resource[key] = val;
            });
        }
    };
    Messaging.reply('UIResources', function() {
        return loadedResources;
    });

    return ResourceBuilder;
});