define([
    'backbone',
    'marionette',
    'underscore',
    'hbs!app/applets/individual_permissions/templates/details-template'
], function(Backbone, Marionette, _, template) {
    'use strict';

    /**
     * Individual Permission Details View.
     * Feature: 1285
     *
     * Original Specification: https://wiki.vistacore.us/x/o4igAQ
     */
    return Backbone.Marionette.LayoutView.extend({
        template: template,

        initialize: function initialize() {
            var sharedModel = this.getOption('sharedModel');
            var permissionSets = sharedModel.get('permissionSets');

            this.listenTo(permissionSets, 'put:success:assign', this.render);
        },

        /**
         * Extracts the data from the permission sets that this modal needs to display.
         * @param {String} uid The uid of the permission being displayed
         * @return {{sets: string, categories: (*|string)}}
         */
        extractSetData: function extractSetData(uid) {
            var sharedModel = this.getOption('sharedModel');
            var permissionSets = sharedModel.get('permissionSets');
            var relatedSets = permissionSets.findContaining(uid);
            var relatedLabels = [];
            var relatedCategories = {};

            _.each(relatedSets, function findLabels(model) {
                relatedLabels.push(model.get('label'));
                _.each(model.get('sub-sets'), function findCategories(categoryName) {
                    relatedCategories[categoryName] = true;
                });
            });

            return {
                sets: relatedLabels.join(', '),
                categories: _.keys(relatedCategories).join(', ')
            };
        },

        serializeModel: function serializeModel(model) {
            var setData = this.extractSetData(model.id);

            return {
                label: model.display('label'),
                status: model.display('status'),
                category: setData.categories,
                introduced: model.display('introduced'),
                starts: model.display('starts'),
                ends: model.display('ends'),
                deprecated: model.display('deprecated'),
                createdOn: model.display('createdOn'),
                nationalAccess: model.display('nationalAccess'),
                description: model.display('description'),
                notes: model.display('createdBy'),
                example: model.display('example'),
                permissionSets: setData.sets
            };
        }
    });
});