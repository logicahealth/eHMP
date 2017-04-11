define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'hbs!app/applets/task_forms/activities/order.lab/templates/activityDetails_Template'
    ], function(Backbone, Marionette, _, Handlebars, LabDetailsTemplate) {
        'use strict';
        return Backbone.Marionette.ItemView.extend({
            template: LabDetailsTemplate,
            collectionEvents: {
                'fetch:success': 'collectionSuccess'
            },
            labDetailsEvents: {
                'read:success': 'labDetailSuccess'
            },
            initialize: function(){
                this.activityInstanceCollection = new Backbone.Collection();
                this.bindEntityEvents(this.activityInstanceCollection, this.collectionEvents);

                var params = {};

                if(_.has(this.model.get('clinicalObject'), 'data')){
                    _.extend(params, {
                        'orderId': this.model.get('clinicalObject').data.localId,
                        'uid': this.model.get('clinicalObject').data.uid
                    });
                }
                this.labDetailsModel = new ADK.UIResources.Writeback.Orders.Detail(params);
                this.bindEntityEvents(this.labDetailsModel, this.labDetailsEvents);
            },
            collectionSuccess: function(){
                if(this.activityInstanceCollection.length > 0){
                    this.model.set('notificationDate', this.activityInstanceCollection.at(0).get('notificationDate'));
                    this.render();
                }
            },
            labDetailSuccess: function(){
                if(!_.isUndefined(this.labDetailsModel.get('detail'))){
                    this.model.set('detail', this.labDetailsModel.get('detail'));
                    this.render();
                }
            },
            onBeforeShow: function(){
                this.labDetailsModel.execute();

                var fetchOptions = {
                    resourceTitle: 'activity-instance-byid',
                    criteria: {
                        deploymentId: this.model.get('deploymentId'),
                        processInstanceId: this.model.get('processId')
                    },
                    fetchType: 'POST'
                };
                ADK.PatientRecordService.fetchCollection(fetchOptions, this.activityInstanceCollection);
            },
            onDestroy: function(){
                this.unbindEntityEvents(this.activityInstanceCollection, this.collectionEvents);
                this.unbindEntityEvents(this.labDetailModel, this.labDetailEvents);
            },
            templateHelpers: {
                breaklines: function(text){
                    text = Handlebars.Utils.escapeExpression(text);
                    text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
                    return new Handlebars.SafeString(text);
                }
            }
        });
    });