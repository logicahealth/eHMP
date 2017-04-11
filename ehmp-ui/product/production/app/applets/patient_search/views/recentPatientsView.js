define([
    'backbone',
    'marionette',
    'handlebars',
    'hbs!app/applets/patient_search/templates/recentPatientList/recentPatientItemTemplate',
    'hbs!app/applets/patient_search/templates/recentPatientList/recentPatientContainerTemplate'
], function(Backbone, Marionette, Handlebars, recentPatientItemTemplate, recentPatientContainerTemplate) {
    "use strict";
    var RecentPatientItemView = Backbone.Marionette.ItemView.extend({
        template: recentPatientItemTemplate,
        tagName: 'li',
        events: {
            'click .recent-patient-item': 'onClickRecentPatientItem'
        },
        onClickRecentPatientItem: function() {
            this._parent.$el.find('.recent-patient-item').removeClass('active');
            this.$el.find('.recent-patient-item').addClass('active');
            ADK.PatientRecordService.setCurrentPatient(this.model);
        }
    });
    var AppletView = Backbone.Marionette.CompositeView.extend({
        template: recentPatientContainerTemplate,
        childView: RecentPatientItemView,
        childViewContainer: '.recent-patients-items',
        emptyView: Backbone.Marionette.ItemView.extend({
            template: _.template('<p class="left-padding-sm"> No recent patients found.</p>')
        }),
        initialize:function(){
            this.collection = ADK.PatientRecordService.getRecentPatients();
        },
        collectionEvents: {
            'sync': 'onSync'
        },
        onSync: function(){
            this.$el.find('.loading').addClass('hidden');
            this.$el.find('.recent-patients-items').removeClass('hidden');
        },
        onRender: function(){
            this.$el.children().addClass('background-color-no');
            
            // //Launch CCOW in IE
            // this.ccowSession = ADK.SessionStorage.getModel('ccow');            
            
            
            // if ("ActiveXObject" in window) {                
            //     var ccowTriggered = _.isUndefined(this.ccowSession.get('state')) || this.ccowSession.get('state') === 'initial';
            //     //console.log('ccowTriggered', ccowTriggered);
            //     if (ccowTriggered) {
            //         ADK.Messaging.trigger('ccow:init');   
            //     }
            // }
            
        }
    });
    return AppletView;
});