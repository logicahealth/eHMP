define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'hbs!app/applets/task_forms/activities/order.lab/templates/activityDetailsFooter_Template'
    ], function(Backbone, Marionette, _, Handlebars, footerTemplate) {
        'use strict';

        var ConsultFooterView = Backbone.Marionette.ItemView.extend({
            template: footerTemplate,
            templateHelpers: function(){
                return {
                    showDelete: function(){
                        if(!_.isUndefined(this.state) && _.isEqual(this.state.toUpperCase(), 'UNRELEASED')){
                            return true;
                        }
                        return false;
                    },
                    showDiscontinue: function(){
                        if(!_.isUndefined(this.state) && _.isEqual(this.state.toUpperCase(), 'RELEASED') && !_.isUndefined(this.substate) && _.isEqual(this.substate.trim().toUpperCase(), 'PENDING COLLECTION')){
                            return true;
                        }
                        return false;
                    }
                };
            },
            events: {
                'click #activityDetailDiscontinue': function(e){
                    this.triggerEndSignal();
                },
                'click #activityDetailDelete': function(e){
                    this.triggerEndSignal();
                },
                'click #activityDetailClose': function(e){
                    ADK.UI.Modal.hide();
                }
            },
            triggerEndSignal: function(){
                var contextViewType = ADK.WorkspaceContextRepository.currentContextId;
                var params = {
                    clinicalObjectUid: this.model.get('clinicalObjectUID')
                };

                if(contextViewType === 'staff'){
                    ADK.PatientRecordService.setCurrentPatient(this.model.get('pid'), {
                        confirmationOptions: {
                            reconfirm: false
                        },
                        staffnavAction: {
                            channel: 'orders',
                            event: 'show:lab-sign',
                            data: params
                        }
                    });
                } else {
                    ADK.Messaging.getChannel('orders').trigger('show:lab-sign', params);
                }
            }
        });
        return ConsultFooterView;
});