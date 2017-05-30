define([
    'underscore'
], function(_) {
    'use strict';

    return {
        formatAdministeredDateTime: function(administeredDateTime) {
            return ADK.utils.formatDate(administeredDateTime).replace(/00\//g,"");
        },
        createStandardizedName: function(codes) {
            var results = _.filter(codes, function(code) {
                if (code.system) {
                    return code.system.indexOf('urn:oid:2.16.840.1.113883.12.292') !== -1;
                }
            });
            return _.get(_.last(results), 'display', '');
        }
    };
});