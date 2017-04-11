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

                var fetchOptions = {
                    type: 'GET',
                    resourceTitle: 'authentication-list',
                    cache: true,
                    viewModel: {
                        parse: function(response) {
                            return {
                                facilityID: response.division,
                                vistaName: response.name
                            };
                        }
                    }
                };

                var facilityId = this.model.get('facilityRequestDivisionId');
                var facilitiesCollection = ADK.ResourceService.fetchCollection(fetchOptions);
                this.listenToOnce(facilitiesCollection, 'sync', function(collection, response) {
                    if (response.status === 200) {
                        if(!_.isUndefined(facilityId)){
                            var facility = collection.findWhere({facilityID: facilityId});

                            if(!_.isUndefined(facility)){
                                this.model.set('createdAtFacilityName', facility.get('vistaName'));
                                this.render();
                            }
                        }
                    }
                });
            }
        });
    });