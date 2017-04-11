define([
    "backbone",
    "marionette",
    "underscore",
    "hbs!app/applets/lab_results_grid/details/labDetailsTemplate",
    "hbs!app/applets/lab_results_grid/details/panelDetailsTemplate",
    "hbs!app/applets/lab_results_grid/details/panelDetailsTableTemplate",
    "app/applets/lab_results_grid/details/itemViewForPanelExtendedRow"
], function(Backbone, Marionette, _, labDetailsTemplate, panelDetailsTemplate, panelDetailsTableTemplate, singleLabResultView) {
    'use strict';

    var currentModel, currentCollection, panelTableView;

    var PanelTableView = Backbone.Marionette.CompositeView.extend({
        template: panelDetailsTableTemplate,
        childView: singleLabResultView,
        childViewContainer: "tbody",
        initialize: function(options) {
            this.childViewOptions = {
                isFullscreen: options.isFullscreen
            };
            // This is where I will need to send out the collection to the modal view
            // console.log('Collection: ', this.collection);
        }
    });

    return Backbone.Marionette.LayoutView.extend({

        initialize: function(options) {
            currentModel = options.model;
            currentCollection = options.collection;
            currentModel.collection = currentModel.attributes.labs;
            var isFullscreen = options.model.get('isFullscreen') || false;

            if (currentModel.attributes.type === 'panel') {
                this.panelTableView = new PanelTableView({
                    collection: currentModel.attributes.labs,
                    gridCollection: options.collection,
                    isFullscreen: isFullscreen
                });
            }
        },
        getTemplate: function() {
            if (currentModel.attributes.type === 'panel') {
                return panelDetailsTemplate;
            } else {
                return labDetailsTemplate;
            }
        },
        regions: function(options) {
            if (options.model.attributes.type === 'panel') {
                return {
                    labsListRegion: ".lab-results-table-container"
                };
            } else {

            }
        },
        onRender: function() {
            if (currentModel.attributes.type === 'panel') {
                this.labsListRegion.show(this.panelTableView);
            }
        }
    });
});