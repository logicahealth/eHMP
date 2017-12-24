define([
    'backbone',
    'marionette',
    'underscore',
    'hbs!app/applets/permission_sets/templates/details-template'
], function(Backbone, Marionette, _, template) {
    'use strict';


    /**
     * Permission Sets Modal Details View.
     * Feature: 1285
     *
     * Original Specification: https://wiki.vistacore.us/x/o4igAQ
     */
    return Backbone.Marionette.LayoutView.extend({
        template: template,

        modelEvents: {
           'change': 'render'
        },
    
        serializeModel: function() {
            return {
                label: this.model.display('label'),
                status: this.model.display('status'),
                category: this.model.display('category'),
                introduced: this.model.display('introduced'),
                deprecated: this.model.display('deprecated'),
                nationalAccess: this.model.display('nationalAccess'),
                createdOn: this.model.display('createdOn'),
                createdBy: this.model.display('authorName'),
                editedOn: this.model.display('editedOn'),
                editedBy: this.model.display('lastUpdatedName'),
                description: this.model.display('description'),
                notes: this.model.display('note'),
                examples: this.model.display('example'),
                permissions: this.model.display('permissions')
            };
        }
    });
});