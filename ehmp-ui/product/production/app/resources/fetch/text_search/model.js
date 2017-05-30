define([
    'underscore',
    'backbone',
    'moment',
    'app/resources/fetch/text_search/util'
], function(_, Backbone, moment, searchUtil) {
    'use strict';

    var TextSearchModel = Backbone.Model.extend({
        'idAttribute': 'uid',
        parse: function(response) {
            if (!_.isEmpty(response)) {
                return searchUtil.baseModelParse(response);
            }
        }
    });

    return TextSearchModel;
});