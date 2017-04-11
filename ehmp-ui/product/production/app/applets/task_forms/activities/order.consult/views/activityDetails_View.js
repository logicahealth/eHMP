define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/applets/task_forms/activities/order.consult/views/currentAppointment_View',
    'app/applets/task_forms/activities/order.consult/views/associatedNotes_View',
    'app/applets/task_forms/activities/order.consult/views/prerequisites_View',
    'app/applets/task_forms/activities/order.consult/views/request_View',
    'hbs!app/applets/task_forms/activities/order.consult/templates/activityDetails_Template'
    ], function(Backbone, Marionette, _, Handlebars, CurrentAppointmentView, AssociatedNotesView, PrequisitesView, RequestView, ConsultDetailsTemplate) {
        'use strict';
        return Backbone.Marionette.LayoutView.extend({
            template: ConsultDetailsTemplate,
            regions: {
                currentAppointmentRegion: '#currentAppointmentRegion',
                associatedNotesRegion: '#associatedNotesRegion',
                requestRegion: '#requestRegion',
                prerequisitesRegion: '#prerequisitesRegion'
            },
            initialize: function(options){
                this.currentAppointmentsView = new CurrentAppointmentView({model: this.model});
                this.associatedNotesView = new AssociatedNotesView({model: this.model});
                this.prerequisitesView = new PrequisitesView({model: this.model});
                this.requestView = new RequestView({model: this.model});
            },
            onRender: function(){
                this.currentAppointmentRegion.show(this.currentAppointmentsView);
                this.associatedNotesRegion.show(this.associatedNotesView);
                this.prerequisitesRegion.show(this.prerequisitesView);
                this.requestRegion.show(this.requestView);
            }
        });
    });