define([
    'backbone',
    'marionette',
    'underscore',
    'app/applets/problems/writeback/workflowUtils',
    'app/applets/problems/writeback/AddEditProblems',
    'hbs!app/applets/problems/modalView/footerTemplate'
], function(Backbone, Marionette, _, WorkflowUtil, AddEditProblemsView, FooterTemplate) {
    'use strict';

    var problemChannel = ADK.Messaging.getChannel('problems');
    var tooltipConfig = {};

    return Backbone.Marionette.ItemView.extend({
        events: {
            'click #deleteBtn': 'deleteProblem',
            'click #editBtn': 'editProblem'
        },
        initialize: function(){
            var siteCode = ADK.UserService.getUserSession().get('site'),
                pidSiteCode = this.model.get('pid') ? this.model.get('pid').split(';')[0] : '';

            if(siteCode === pidSiteCode){
                this.model.set('siteCodeMatches', true);
            } else {
                this.model.set('siteCodeMatches', false);
            }
        },
        deleteProblem : function(event){
            problemChannel.command('openProblemDelete', 'problem_delete', this.model);
        },
        editProblem: function(){
            ADK.UI.Modal.hide();
            WorkflowUtil.startEditProblemsWorkflow(AddEditProblemsView, this.model);
        },
        template: FooterTemplate,
        behaviors: {
            //see Bootstrap documentation for options
            Tooltip: tooltipConfig || {}
        }
    });

});
