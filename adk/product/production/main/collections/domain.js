define([
    'backbone',
    "api/Enrichment",
], function(Backbone, Enrichment) {
    'use strict';
    var Domain = Backbone.Model.extend({
        parse: function(response) {
            Enrichment.addFacilityMoniker(response);
            return response;
        }
    });
    var DomainCollection = Backbone.Collection.extend({
        model: Domain
    });
    return DomainCollection;
});
