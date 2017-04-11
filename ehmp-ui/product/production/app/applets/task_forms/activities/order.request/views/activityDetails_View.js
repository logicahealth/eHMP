define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/applets/task_forms/activities/order.request/utils',
    'hbs!app/applets/task_forms/activities/order.request/templates/activityDetails_Template'
    ], function(Backbone, Marionette, _, Handlebars, Utils, RequestDetailsTemplate) {
        'use strict';

        return Backbone.Marionette.LayoutView.extend({
            template: RequestDetailsTemplate,
            initialize: function(){
                Utils.setRequest(this.model);

                var self = this;
                this.facilities = new ADK.UIResources.Picklist.Team_Management.Facilities();
                this.listenToOnce(this.facilities, 'read:success', function(collection, response) {
                    self.model.set('createdAtFacilityName', Utils.getCreatedAtFacilityName(self.model.get('facilityRequestDivisionId'), collection));
                    self.stopListening(this.collection, 'fetch:error');
                    self.render();
                });
                this.listenToOnce(this.facilities, 'read:error', function(){
                    self.stopListening(this.collection, 'fetch:success');
                });
                this.facilities.fetch();
            }
        });
    });