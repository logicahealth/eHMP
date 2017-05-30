define([
    'app/resources/fetch/document/parser'
], function(Parser) {
    'use strict';
    var Model = Backbone.Model.extend({
        parse: Parser
    });

    return Model;
});