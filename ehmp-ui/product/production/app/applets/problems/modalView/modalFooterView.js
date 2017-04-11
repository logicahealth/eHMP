define([
    'backbone',
    'marionette',
    'underscore',
    'hbs!app/applets/problems/modalView/footerTemplate'
], function(Backbone, Marionette, _, FooterTemplate) {
    'use strict';

    var problemChannel = ADK.Messaging.getChannel('problems');

    return Backbone.Marionette.ItemView.extend({
        events: {
            'click #deleteBtn': 'deleteProblem',
            'click #editBtn': 'editProblem'
        },
        deleteProblem : function(event){
            problemChannel.command('openProblemDelete', 'problem_delete', this.model);
        },
        editProblem: function(){
            problemChannel.command('editProblem', this.model);
        },

        template: FooterTemplate

    });

});
