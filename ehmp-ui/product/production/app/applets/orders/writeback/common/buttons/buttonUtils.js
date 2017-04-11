define([
], function() {
    'use strict';

    var disable = function(button) {
        button.attr('disabled', 'true');
    };

    var enable = function(button) {
        button.removeAttr('disabled');
    };

    return {
        disable: disable,
        enable: enable
    };
});
