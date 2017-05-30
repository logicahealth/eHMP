(function(root, factory) {
    "use strict";
    if (typeof define === 'function' && define.amd) {
        // AMD format (for use in app/r.js)
        define(function() {
            return factory();
        });
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS/Node format (for use in Gruntfile)
        module.exports = factory();
    } else {
        // this follows common pattern, though this is expected to never get hit
        root.ResourceManifest = factory();
    }
}(this, function() {
    "use strict";
    return {
        resources: [{
            id: 'writeback'
        }, {
            id: 'picklist'
        }, {
            id: 'fetch'
        }]
    };
}));