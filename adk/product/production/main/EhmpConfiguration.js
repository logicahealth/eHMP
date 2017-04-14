define([
    'backbone',
    'api/UrlBuilder'
], function(
    Backbone,
    UrlBuilder
) {
    'use strict';

    var EhmpConfigurationModel = Backbone.Model.extend({
        url: function() {
            return UrlBuilder.buildUrl('ehmp-config');
        },
        defaults: {},
        parse: function(response) {
            return response.data || {};
        }
    });

    var EhmpConfiguration = (function() {
        var singleInstance;

        function init() {
            return new EhmpConfigurationModel();
        }

        return {
            instance: function() {
                if (!singleInstance) {
                    singleInstance = init();
                }
                return singleInstance;
            }
        };
    })();

    return EhmpConfiguration;
});