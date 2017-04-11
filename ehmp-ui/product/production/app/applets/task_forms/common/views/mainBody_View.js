define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/applets/task_forms/common/views/nameStatus_View',
    'app/applets/task_forms/common/views/domainDetails_View',
    'app/applets/task_forms/common/views/currentTasks_View',
    'app/applets/task_forms/common/views/activityHistory_View',
    'hbs!app/applets/task_forms/common/templates/mainBody_Template'
    ], function(Backbone, Marionette, _, Handlebars, NameStatusView, DomainDetailsView, CurrentTasksView, ActivityHistoryView, mainBodyTemplate) {
        'use strict';
        return Backbone.Marionette.LayoutView.extend({
            template: mainBodyTemplate,
            regions: {
                nameStatusRegion: '#nameStatusRegion',
                domainDetailsRegion: '#domainDetailsRegion',
                currentTasksRegion: '#currentTasksRegion',
                activityHistoryRegion: '#activityHistoryRegion'
            },
            initialize: function(){

                if(!_.isUndefined(this.model.get('gender'))){
                    if(this.model.get('gender') === 'M'){
                        this.model.set('fullGenderName', 'Male');    
                    }
                    else{
                        this.model.set('fullGenderName', 'Female');
                    }
                }

                this.nameStatusView = new NameStatusView({model: this.model});
                this.domainDetailsView = new DomainDetailsView({model: this.model});
                this.currentTasksView = new CurrentTasksView({model: this.model});
                this.activityHistoryView = new ActivityHistoryView({model: this.model});
            },
            onRender: function(){
                this.nameStatusRegion.show(this.nameStatusView);
                this.domainDetailsRegion.show(this.domainDetailsView);
                this.currentTasksRegion.show(this.currentTasksView);
                this.activityHistoryRegion.show(this.activityHistoryView);
            }
        });
});