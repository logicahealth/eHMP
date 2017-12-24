define(['underscore', 'backbone'], function(_, Backbone) {
   'use strict';

   var Model = Backbone.Model.extend({
       parse: function(data) {
           data.value = data.id;
           data.label = data.id;
           return data;
       }
   });

   return Backbone.Collection.extend({
       fetchOptions: {
           resourceTitle: 'ehmp-versions-list',
           cache: true,
           pageable: false
       },

       model: Model,

       parse: function(response) {
           return _.get(response, 'data.versions');
       },

       fetchCollection: function fetchCollection(options) {
           return ADK.ResourceService.fetchCollection(_.extend({}, this.fetchOptions, options), this);
       }
   });
});