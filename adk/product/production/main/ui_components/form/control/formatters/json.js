define([], function() {
    "use strict";

    return {
        fromRaw: function(rawData, model) {
            return JSON.stringify(rawData);
        },
        toRaw: function(formattedData, model) {
            return JSON.parse(formattedData);
        }
    };
});